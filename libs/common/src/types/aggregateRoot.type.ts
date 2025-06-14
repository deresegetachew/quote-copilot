import { ID } from '../valueObjects';

export abstract class TAggregateRoot {
  private readonly id: ID;
  private domainEvents: any[] = [];

  constructor(id: ID) {
    this.id = id;
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
}
