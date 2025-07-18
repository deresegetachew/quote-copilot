import DateTime from 'luxon';

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

  static toUTCDateTime(date: string | Date): DateTime {
    if (typeof date === 'string') {
      return DateTime.fromISO(date, { zone: 'utc' });
    }
    return DateTime.fromJSDate(date).toUTC();
  }

  static fromDateToUTC(date: Date): DateTime {
    return DateTime.fromJSDate(date).toUTC();
  }

  static addSecondsToDate(date: Date, seconds: number): Date {
    return DateTime.fromJSDate(date).plus({ seconds }).toJSDate();
  }
}
