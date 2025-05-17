import { DateTime } from 'luxon';

// this class is used to standardize our date usage
// it relies on luxon library and always returns dates in UTC formatted as ISO 8601
export class DateHelper {
  static getNow(): string {
    return new DateTime.utc().toISO();
  }

  static isBeforeNow(date: string): boolean {
    return DateTime.fromISO(date, { zone: 'utc' }) < DateTime.utc();
  }

  static isAfterNow(date: string): boolean {
    return DateTime.fromISO(date, { zone: 'utc' }) > DateTime.utc();
  }
}
