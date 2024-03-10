import isValidISO8601 from '../src/validation/dateValidation'
import { validateColorString } from '../src/validation/taskValidations'

describe('date validation tests', () => {
    test('should validate valid ISO8601 date strings', () => {
        expect(isValidISO8601('2000-02-29')).toBe(true)
        expect(isValidISO8601('2024-03-09')).toBe(true)
    })
    
    test('should fail to validate invalid ISO8601 date strings', () => {
        expect(isValidISO8601('2001-02-29')).toBe(false)
        expect(isValidISO8601('200-10-10')).toBe(false)
    })
})

describe('color validation tests', () => {
    test('should validate valid color strings', () => {
        expect(validateColorString('00000000')).toBe(true)
        expect(validateColorString('AFAFAFAF')).toBe(true)
        expect(validateColorString('ABCDEF01')).toBe(true)
        expect(validateColorString('10FEDCBA')).toBe(true)
    })
    test('should fail to validate invalid color strings', () => {
        expect(validateColorString('123456')).toBe(false)
        expect(validateColorString('1234567')).toBe(false)
        expect(validateColorString('123456789')).toBe(false)
        expect(validateColorString('')).toBe(false)
        expect(validateColorString(undefined)).toBe(false)
        expect(validateColorString('G2345678')).toBe(false)
        expect(validateColorString('1234567G')).toBe(false)
    })
})
