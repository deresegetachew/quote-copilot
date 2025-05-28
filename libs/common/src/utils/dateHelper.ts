import { DateTime } from 'luxon';

// this class is used to standardize our date usage
// it relies on luxon library and always returns dates in UTC formatted as ISO 8601
export class DateHelper {
  static getNowAsString(): string {
    return new DateTime.utc().toISO();
  }

  static getNowAsDate(): Date {
    return DateTime.utc().toJSDate();
  }

  static isBeforeNow(date: string): boolean {
    return DateTime.fromISO(date, { zone: 'utc' }) < DateTime.utc();
  }

  static isAfterNow(date: string): boolean {
    return DateTime.fromISO(date, { zone: 'utc' }) > DateTime.utc();
  }

  static toUTCDateTime(date: string): DateTime {
    return DateTime.fromISO(date, { zone: 'utc' });
  }

  static fromDateToUTC(date: Date): DateTime {
    return DateTime.fromJSDate(date).toUTC();
  }
}
