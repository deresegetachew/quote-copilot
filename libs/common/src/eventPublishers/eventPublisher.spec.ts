import { ClientProxy } from '@nestjs/microservices';
import { EventPublisher } from './eventPublisher';
import { createMock } from '@golevelup/ts-jest';
import { IntegrationEvent } from '../events/integrationEvents.type';
import { PublishEventException } from './publishEvent.exception';
import { of, throwError } from 'rxjs';

describe('EventPublisher', () => {
  const clientProxyMock = createMock<ClientProxy>();

  const testEvt = createMock<IntegrationEvent>({
    id: 'test-id',
    evtTopic: 'test-topic',
    source: 'test-source',
    data: { key: 'value' },
    timestamp: '2023-10-01T00:00:00Z',
    validateEvt: jest.fn(),
  });

  it('should publish an event', async () => {
    // Arrange
    const eventPublisher = new EventPublisher(clientProxyMock);

    const publishSpy = jest.spyOn(eventPublisher, 'publish');

    //   Act
    eventPublisher.publish(testEvt);

    // Assert
    expect(publishSpy).toHaveBeenCalledWith(testEvt);
  });

  it('should handle errors when publishing an event', async () => {
    // Arrange
    const eventPublisher = new EventPublisher(clientProxyMock);

    const error = new Error('Publish failed');
    jest
      .spyOn(clientProxyMock, 'send')
      .mockReturnValue(throwError(() => error));

    jest
      .spyOn(clientProxyMock, 'emit')
      .mockReturnValue(throwError(() => error));

    // Act & Assert
    await expect(
      eventPublisher.publish(testEvt, {
        rpc: true,
        retryCount: 0,
        reqTimeOut: 100,
      }),
    ).rejects.toThrow(PublishEventException);

    await expect(
      eventPublisher.publish(testEvt, {
        rpc: false,
        retryCount: 0,
        reqTimeOut: 100,
      }),
    ).rejects.toThrow(PublishEventException);
  });

  it('should validate event payload before publishing', () => {
    // Arrange
    const eventPublisher = new EventPublisher(clientProxyMock);
    const validateSpy = jest.spyOn(testEvt, 'validateEvt');

    // Act
    eventPublisher.publish(testEvt);

    // Assert
    expect(validateSpy).toHaveBeenCalled();
  });

  it('should return a promise if request is RPC ', async () => {
    // Arrange
    const eventPublisher = new EventPublisher(clientProxyMock);
    const response = { success: true };
    jest.spyOn(clientProxyMock, 'send').mockReturnValue(of(response));

    // Act
    const result = await eventPublisher.publish(testEvt, { rpc: true });

    // Assert
    expect(result).toEqual(response);
  });

  it('should emit events without waiting for a response', async () => {
    // Arrange
    const eventPublisher = new EventPublisher(clientProxyMock);

    jest.spyOn(clientProxyMock, 'emit').mockReturnValue(of(undefined));

    // Act
    const result = await eventPublisher.publish(testEvt, { rpc: false });

    // Assert
    expect(result).toBeUndefined();
  });
});
