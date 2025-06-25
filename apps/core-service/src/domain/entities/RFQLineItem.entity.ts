import { ID } from '@common';

export class RFQLineItemEntity {
  private _description: string | null;
  private _unit: string | null;
  private _notes: string[] | null;

  constructor(
    private readonly id: ID,
    private _code: string,
    private _quantity: number,
  ) {}

  getStorageId(): ID {
    return this.id;
  }

  get code(): string {
    return this._code;
  }

  set code(code: string) {
    this._code = code;
  }

  get description(): string | null {
    return this._description;
  }

  set description(description: string | null) {
    this._description = description;
  }

  get quantity(): number {
    return this._quantity;
  }

  set quantity(quantity: number) {
    this._quantity = quantity;
  }

  get unit(): string | null {
    return this._unit;
  }

  set unit(unit: string | null) {
    this._unit = unit;
  }

  get notes(): string[] | null {
    return this._notes;
  }

  addNote(note: string | null): void {
    if (!note) return;
    if (!this._notes) {
      this._notes = [note];
    }
    this._notes.push(note);
  }
}
