import { DateTime } from 'luxon'

export default function isValidISO8601(date: string) {
    return !!date && DateTime.fromISO(date).isValid
}