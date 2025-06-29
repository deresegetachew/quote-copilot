import { ID } from '../valueObjects';

export abstract class TAggregateRoot {
  private readonly id: ID;

  // NOTE:
  // Domain events are internal to the domain model and are not persisted in the database.
  // They are used to trigger side effects and enforce business rules within the same bounded context.
  //
  // Domain events should not be used to communicate across bounded contexts.
  // Instead, integration events — which are side effects of domain events — are responsible for cross-context communication.
  //
  // Integration events are not part of the aggregate root and should be published by the application layer (e.g., via a message broker),
  // typically in response to domain events.
  private domainEvents: any[] = [];

  constructor(id: ID) {
    this.id = id;
  }

  protected clearDomainEvents(): void {
    this.domainEvents = [];
  }

  protected addDomainEvent(event: any): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): any[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  public getStorageId(): ID {
    return this.id;
  }

  protected abstract validate(): void;

  public build(): this {
    this.validate();
    return this;
  }
}
