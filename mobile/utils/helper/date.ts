import {format, parseISO, isValid, fromUnixTime} from 'date-fns';

export const DateLayout = {
    Day: 'yyyy-MMM-dd',
    DayNumeric: 'yyyy-MM-dd',
    DayHm: 'yyyy-MMM-dd HH:mm',
    ShortHm: 'HH:mm',
} as const;

type DateLayout = (typeof DateLayout)[keyof typeof DateLayout];

export function formatDate(date?: Date | string | number, layout: DateLayout = DateLayout.Day): string {
    if (!date) {
        return '';
    }

    let parsedDate: Date;

    if (typeof date === 'number') {
        // Handle various numeric formats
        if (date < 1e12) {
            // Assume seconds if less than 1e12 (September 2001)
            parsedDate = fromUnixTime(date);
        } else if (date < 1e15) {
            // Assume milliseconds if less than 1e15 (March 2255)
            parsedDate = new Date(date);
        } else {
            // Assume microseconds or nanoseconds
            parsedDate = new Date(date / 1000);
        }
    } else if (typeof date === 'string') {
        // Try parsing as ISO string first
        parsedDate = parseISO(date);

        // If invalid, try creating a new Date object
        if (!isValid(parsedDate)) {
            parsedDate = new Date(date);
        }
    } else {
        parsedDate = date;
    }

    if (!isValid(parsedDate)) {
        return 'Invalid Date';
    }

    return format(parsedDate, layout);
}
