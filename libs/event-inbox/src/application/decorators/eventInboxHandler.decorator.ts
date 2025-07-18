import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { EventInboxInterceptor } from '../interceptors/eventInboxInterceptor';
import { EVENT_INBOX_META_KEY } from '../constant';
import { EventPattern } from '@nestjs/microservices';

export function EventInboxHandler(
  eventName: string,
  eventIDPath: string,
  retryCount: number = 3,
): MethodDecorator {
  return applyDecorators(
    EventPattern(eventName),
    SetMetadata(EVENT_INBOX_META_KEY, { eventName, eventIDPath, retryCount }),
    UseInterceptors(EventInboxInterceptor),
  );
}
