const isValidISO8601 = require('../validation/dateValidation')
const { test, expect } = require('jest')

test('should validate valid ISO8601 date strings', () => {
    expect(isValidISO8601('2000-02-29')).toBe(true)
    expect(isValidISO8601('2024-03-09')).toBe(true)
})

test('should fail to validate invalid ISO8601 date strings', () => {
    expect(isValidISO8601('2001-02-29')).toBe(false)
    expect(isValidISO8601('200-10-10')).toBe(false)
})