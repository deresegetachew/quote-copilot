import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import {
  catchError,
  mergeMap,
  Observable,
  retry,
  throwError,
  timer,
} from 'rxjs';
import { EventInboxRepositoryPort } from '../ports/eventInboxRepository.port';
import { Reflector } from '@nestjs/core';
import { EVENT_INBOX_META_KEY } from '../constant';
import { EventInboxAggregate } from '../../domain/entities/eventInboxAggregate';
import { get } from 'lodash';
import { EventLockedException } from '../exceptions';

@Injectable()
export class EventInboxInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventInboxInterceptor.name);

  constructor(
    private readonly eventInboxRepository: EventInboxRepositoryPort,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const eventMeta = this.reflector.get<{
      eventName: string;
      eventIDPath: string;
      retryCount: number;
    }>(EVENT_INBOX_META_KEY, context.getHandler());

    if (!eventMeta) {
      return next.handle();
    }

    const [event] = context.getArgs();
    const { eventName, eventIDPath, retryCount } = eventMeta;
    const eventID = get(event, eventIDPath, null);

    const evtAgg = EventInboxAggregate.createNew(eventName, event, eventID);

    const existing = await this.eventInboxRepository.findByMessageId(
      evtAgg.getMessageId(),
    );

    if (existing) {
      switch (existing.getStatus()) {
        case 'processing':
          throw new EventLockedException(eventID);
        case 'completed':
          return next.handle(); // Skip or return empty?
        case 'failed':
          // allow retry, update status below
          break;
      }
    }

    await this.eventInboxRepository.save(evtAgg);

    return next.handle().pipe(
      retry({
        count: retryCount,
        delay: (error, retryAttempt) => {
          if (error instanceof EventLockedException) {
            throw error;
          }
          this.logger.warn(
            `Retrying event ${evtAgg.getMessageId()} (${retryAttempt + 1}/${retryCount}) due to: ${error.message}`,
          );
          return timer(500);
        },
      }),
      mergeMap(async (result) => {
        evtAgg.markAsCompleted();
        await retryAsync(() => this.eventInboxRepository.save(evtAgg)).catch(
          (err) => {
            this.logger.error(
              `Failed to mark an event ${evtAgg.getMessageId()} as completed. Error: ${err.message}`,
              err,
            );
          },
        );
        return result;
      }),
      catchError(async (err) => {
        evtAgg.markAsFailed();
        await retryAsync(() => this.eventInboxRepository.save(evtAgg)).catch(
          (error) => {
            this.logger.error(
              `Failed to mark an event ${evtAgg.getMessageId()} as failed. Error: ${error.message}`,
              error,
            );
            return throwError(() => err);
          },
        );
      }),
    );
  }
}

async function retryAsync<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 300,
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}
