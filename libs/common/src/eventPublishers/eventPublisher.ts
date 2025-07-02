import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { INTEGRATION_EVENT_CLIENT } from '../constants';
import { IntegrationEvent } from '../events/integrationEvents.type';
import { timeout, retry, catchError } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { PublishEventException } from './publishEvent.exception';

type TPublishOptions = {
  rpc?: boolean;
  validate?: boolean;
  reqTimeOut?: number;
  retryCount?: number;
  traceContext?: Record<string, any>; // TODO: introduce traceContext in the future
};

@Injectable()
export class EventPublisher {
  private readonly logger;
  constructor(
    @Inject(INTEGRATION_EVENT_CLIENT) private readonly clientProxy: ClientProxy,
  ) {
    this.logger = new Logger(EventPublisher.name);
  }

  public async publish<TResponse>(
    evt: IntegrationEvent,
    options?: TPublishOptions,
  ): Promise<TResponse | void> {
    this.logger.debug(
      `Publishing event from:${evt.source} to topic:${evt.evtTopic} with ID:${evt.id} and timestamp:${evt.timestamp}`,
      evt,
    );
    // Set default options if not provided
    const {
      rpc = true, // Default to RPC if not specified
      validate = true,
      reqTimeOut = 5000,
      retryCount = 3,
      traceContext = {},
    } = options || {};

    // Validate payload if necessary
    if (validate) {
      evt.validateEvt();
    }

    if (rpc) {
      const obs$ = this.clientProxy.send<TResponse>(evt.evtTopic, evt.data);

      //  RPC Case -  wait for a response

      return await lastValueFrom<TResponse>(
        obs$.pipe(
          timeout(reqTimeOut), // Apply timeout and abort signal
          retry(retryCount), // Retry logic
          catchError((err) => {
            throw new PublishEventException(
              `RPC_ERROR:: rpc request from:${evt.source} to topic:${evt.evtTopic} with ID:${evt.id} to topic: ${evt.evtTopic} with payload: ${JSON.stringify(evt.data)}`,
              err,
            );
          }),
        ),
      );
    }

    // For emit (fire-and-forget)
    const obsEmit$ = this.clientProxy.emit(evt.evtTopic, evt.data);

    return await lastValueFrom(
      obsEmit$.pipe(
        timeout(reqTimeOut),
        retry(retryCount),
        catchError((err) => {
          throw new PublishEventException(
            `EVENT_ERROR:: emitting event from:${evt.source} to topic:${evt.evtTopic} with ID:${evt.id}`,
            err,
          );
        }),
      ),
    );
  }
}
