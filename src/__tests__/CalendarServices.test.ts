import { describe, it, expect } from 'vitest'
import { CalendarSystem } from '../types'
import { B1ADateService } from '../services/B1ADateService'
import { AT1DateService } from '../services/AT1DateService'
import { AS1DateService } from '../services/AS1DateService'
import { A2DateService } from '../services/A2DateService'
import { A3DateService } from '../services/A3DateService'
import { AADateService } from '../services/AADateService'

describe('Calendar Services', () => {
  describe('B1A Date Service', () => {
    it('should validate B1A dates correctly', () => {
      expect(B1ADateService.validateDate({ year: 1, calendar: CalendarSystem.B1A })).toBe(true)
      expect(B1ADateService.validateDate({ year: 1500, calendar: CalendarSystem.B1A })).toBe(true)
      expect(B1ADateService.validateDate({ year: 3500, calendar: CalendarSystem.B1A })).toBe(true)
      expect(B1ADateService.validateDate({ year: 3501, calendar: CalendarSystem.B1A })).toBe(false) // Outside range
      expect(B1ADateService.validateDate({ year: 1000, month: 3, calendar: CalendarSystem.B1A })).toBe(false) // No months
    })

    it('should format B1A dates correctly', () => {
      const date = { year: 1500, calendar: CalendarSystem.B1A }
      const formatted = B1ADateService.formatDate(date)
      expect(formatted).toMatch(/B1A-\d{4}/)
    })
  })

  describe('1AT Date Service', () => {
    it('should validate 1AT dates correctly', () => {
      expect(AT1DateService.validateDate({ year: 1, calendar: CalendarSystem.AT1 })).toBe(true)
      expect(AT1DateService.validateDate({ year: 1500, calendar: CalendarSystem.AT1 })).toBe(true)
      expect(AT1DateService.validateDate({ year: 1501, calendar: CalendarSystem.AT1 })).toBe(false) // Outside range
      expect(AT1DateService.validateDate({ year: 1000, month: 3, calendar: CalendarSystem.AT1 })).toBe(false) // No months
    })

    it('should format 1AT dates correctly', () => {
      const date = { year: 1050, calendar: CalendarSystem.AT1 }
      const formatted = AT1DateService.formatDate(date)
      expect(formatted).toBe('1AT-1050')
    })
  })

  describe('1AS Date Service', () => {
    it('should validate 1AS dates correctly', () => {
      expect(AS1DateService.validateDate({ year: 1, calendar: CalendarSystem.AS1 })).toBe(true)
      expect(AS1DateService.validateDate({ year: 590, calendar: CalendarSystem.AS1 })).toBe(true)
      expect(AS1DateService.validateDate({ year: 591, calendar: CalendarSystem.AS1 })).toBe(false) // Outside range
      expect(AS1DateService.validateDate({ year: 100, month: 3, calendar: CalendarSystem.AS1 })).toBe(true) // Has months
      expect(AS1DateService.validateDate({ year: 100, month: 13, calendar: CalendarSystem.AS1 })).toBe(false) // Invalid month
    })

    it('should format 1AS dates correctly', () => {
      const dateWithYear = { year: 465, calendar: CalendarSystem.AS1 }
      expect(AS1DateService.formatDate(dateWithYear)).toBe('1AS-0465')

      const dateWithMonth = { year: 465, month: 3, calendar: CalendarSystem.AS1 }
      expect(AS1DateService.formatDate(dateWithMonth)).toBe('1AS-0465-03')

      const dateWithDay = { year: 465, month: 3, day: 25, calendar: CalendarSystem.AS1 }
      expect(AS1DateService.formatDate(dateWithDay)).toBe('1AS-0465-03-25')
    })

    it('should validate all months have 30 days', () => {
      // 1AS uses Elvish calendar: all 12 months have exactly 30 days
      // Leap years add special intercalary days outside the month system
      const day30 = { year: 4, month: 2, day: 30, calendar: CalendarSystem.AS1 }
      const day31 = { year: 4, month: 2, day: 31, calendar: CalendarSystem.AS1 }

      expect(AS1DateService.validateDate(day30)).toBe(true)
      expect(AS1DateService.validateDate(day31)).toBe(false)
    })

    it('should calculate year difference correctly', () => {
      const startDate = { year: 100, calendar: CalendarSystem.AS1 }
      const endDate = { year: 200, calendar: CalendarSystem.AS1 }
      const result = AS1DateService.calculateDifference(startDate, endDate)

      expect(result.years).toBe(100)
      expect(result.totalDays).toBe(36500)
    })

    it('should convert to AA and back correctly', () => {
      const original = { year: 465, calendar: CalendarSystem.AS1 }
      const aaYear = AS1DateService.toAA(original)
      const converted = AS1DateService.fromAA(aaYear)

      expect(converted.year).toBe(original.year)
      expect(converted.calendar).toBe(CalendarSystem.AS1)
    })
  })

  describe('3A Date Service', () => {
    it('should validate 3A dates correctly', () => {
      expect(A3DateService.validateDate({ year: 1, calendar: CalendarSystem.A3 })).toBe(true)
      expect(A3DateService.validateDate({ year: 3021, calendar: CalendarSystem.A3 })).toBe(true)
      expect(A3DateService.validateDate({ year: 3022, calendar: CalendarSystem.A3 })).toBe(false) // Outside range
    })

    it('should format 3A dates correctly', () => {
      const dateWithYear = { year: 1420, calendar: CalendarSystem.A3 }
      expect(A3DateService.formatDate(dateWithYear)).toBe('3A-1420')

      const dateWithDay = { year: 3019, month: 3, day: 25, calendar: CalendarSystem.A3 }
      expect(A3DateService.formatDate(dateWithDay)).toBe('3A-3019-03-25')
    })
  })

  describe('AA Date Service', () => {
    it('should validate AA dates correctly', () => {
      expect(AADateService.validateDate({ year: 1, calendar: CalendarSystem.AA })).toBe(true)
      expect(AADateService.validateDate({ year: 50000, calendar: CalendarSystem.AA })).toBe(true)
      expect(AADateService.validateDate({ year: 0, calendar: CalendarSystem.AA })).toBe(false) // No year 0
      expect(AADateService.validateDate({ year: 1000, month: 3, calendar: CalendarSystem.AA })).toBe(false) // No months
    })

    it('should format AA dates correctly', () => {
      const date = { year: 15420, calendar: CalendarSystem.AA }
      const formatted = AADateService.formatDate(date)
      expect(formatted).toBe('AA 15420')
    })
  })

  describe('Month Progression Tests - Shire Reckoning (30-day months)', () => {
    it('should correctly add days within same month', () => {
      const startDate = { year: 3019, month: 9, day: 20, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 9, day: 25, calendar: CalendarSystem.A3 }

      expect(A3DateService.validateDate(startDate)).toBe(true)
      expect(A3DateService.validateDate(endDate)).toBe(true)
    })

    it('should calculate days within same month', () => {
      const startDate = { year: 3019, month: 9, day: 20, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 9, day: 25, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(5)
    })

    it('should correctly handle month boundary crossing', () => {
      const startDate = { year: 3019, month: 3, day: 25, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 4, day: 5, calendar: CalendarSystem.A3 }

      expect(A3DateService.validateDate(startDate)).toBe(true)
      expect(A3DateService.validateDate(endDate)).toBe(true)
    })

    it('should validate that all regular months have 30 days', () => {
      for (let month = 1; month <= 12; month++) {
        const lastDayOfMonth = { year: 3019, month, day: 30, calendar: CalendarSystem.A3 }
        expect(A3DateService.validateDate(lastDayOfMonth)).toBe(true)
      }
    })

    it('should reject day 31 for all months in Shire Reckoning', () => {
      for (let month = 1; month <= 12; month++) {
        const invalidDay = { year: 3019, month, day: 31, calendar: CalendarSystem.A3 }
        expect(A3DateService.validateDate(invalidDay)).toBe(false)
      }
    })

    it('should handle year boundary crossing', () => {
      const endOfYear = { year: 3018, month: 12, day: 30, calendar: CalendarSystem.A3 }
      const startOfNextYear = { year: 3019, month: 1, day: 1, calendar: CalendarSystem.A3 }

      expect(A3DateService.validateDate(endOfYear)).toBe(true)
      expect(A3DateService.validateDate(startOfNextYear)).toBe(true)
    })
  })

  describe('Special Days in Time Span Calculations - Shire Reckoning', () => {
    it('should calculate 15 days from Month 12 Day 20 crossing year boundary', () => {
      const startDate = { year: 3018, month: 12, day: 20, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 1, day: 3, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(15)
    })

    it('should calculate 15 days from Month 3 Day 20 in a normal month without special days', () => {
      const startDate = { year: 3019, month: 3, day: 20, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 4, day: 5, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(15)
    })

    it('should include 2 Yule days when crossing from December to January', () => {
      const startDate = { year: 3018, month: 12, day: 29, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 1, day: 2, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(5)
    })

    it('should include Lithe days when crossing from June to July', () => {
      const startDate = { year: 3019, month: 6, day: 29, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 7, day: 2, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(6)
    })

    it('should include Overlithe in leap years when crossing June to July', () => {
      const leapYear = 3020
      const startDate = { year: leapYear, month: 6, day: 29, calendar: CalendarSystem.A3 }
      const endDate = { year: leapYear, month: 7, day: 2, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(7)
    })

    it('should handle time span crossing multiple special day periods', () => {
      const startDate = { year: 3018, month: 12, day: 20, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 7, day: 10, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(205)
    })

    it('should not include special days when span does not cross them', () => {
      const startDate = { year: 3019, month: 3, day: 15, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 5, day: 20, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(65)
    })

    it('should correctly count days in a full year including all special days', () => {
      const startDate = { year: 3019, month: 1, day: 1, calendar: CalendarSystem.A3 }
      const endDate = { year: 3019, month: 12, day: 30, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(362)
    })

    it('should count exactly 365 days in a complete Shire year', () => {
      const startDate = { year: 3019, month: 1, day: 1, calendar: CalendarSystem.A3 }
      const endDate = { year: 3020, month: 1, day: 1, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(365)
    })

    it('should count exactly 366 days in a Shire leap year', () => {
      const startDate = { year: 3020, month: 1, day: 1, calendar: CalendarSystem.A3 }
      const endDate = { year: 3021, month: 1, day: 1, calendar: CalendarSystem.A3 }

      const result = A3DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(366)
    })
  })

  describe('Special Days in Time Span Calculations - Kings\' Reckoning (2A)', () => {
    it('should calculate days within same month', () => {
      const startDate = { year: 1000, month: 3, day: 10, calendar: CalendarSystem.A2 }
      const endDate = { year: 1000, month: 3, day: 20, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(10)
    })

    it('should include loëndë when crossing midyear', () => {
      const startDate = { year: 1001, month: 6, day: 25, calendar: CalendarSystem.A2 }
      const endDate = { year: 1001, month: 7, day: 5, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(11)
    })

    it('should include 2 enderi in leap years', () => {
      const startDate = { year: 1004, month: 6, day: 25, calendar: CalendarSystem.A2 }
      const endDate = { year: 1004, month: 7, day: 5, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(12)
    })

    it('should include 3 enderi in millennial years', () => {
      const startDate = { year: 1000, month: 6, day: 25, calendar: CalendarSystem.A2 }
      const endDate = { year: 1000, month: 7, day: 5, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(13)
    })

    it('should include yestarë and mettarë when crossing year boundary', () => {
      const startDate = { year: 1001, month: 12, day: 25, calendar: CalendarSystem.A2 }
      const endDate = { year: 1002, month: 1, day: 5, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(12)
    })

    it('should count exactly 363 days in a regular year', () => {
      const startDate = { year: 1001, month: 1, day: 1, calendar: CalendarSystem.A2 }
      const endDate = { year: 1002, month: 1, day: 1, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(363)
    })

    it('should count exactly 364 days in a leap year', () => {
      const startDate = { year: 1004, month: 1, day: 1, calendar: CalendarSystem.A2 }
      const endDate = { year: 1005, month: 1, day: 1, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(364)
    })

    it('should count exactly 365 days in a millennial year', () => {
      const startDate = { year: 2000, month: 1, day: 1, calendar: CalendarSystem.A2 }
      const endDate = { year: 2001, month: 1, day: 1, calendar: CalendarSystem.A2 }

      const result = A2DateService.calculateDifference(startDate, endDate)

      expect(result.totalDays).toBe(365)
    })
  })

  describe('Cross-Calendar Conversion Tests', () => {
    it('should maintain consistency in Valian year calculations', () => {
      const b1aDate = { year: 1000, calendar: CalendarSystem.B1A }
      const at1Date = { year: 1000, calendar: CalendarSystem.AT1 }

      const b1aAA = B1ADateService.toAA(b1aDate)
      const at1AA = AT1DateService.toAA(at1Date)

      expect(at1AA).toBeGreaterThan(b1aAA)
    })

    it('should handle significant historical dates correctly', () => {
      const valinorCreation = { year: 1, calendar: CalendarSystem.B1A }
      const treesBloom = { year: 1, calendar: CalendarSystem.AT1 }
      const firstSunrise = { year: 1, calendar: CalendarSystem.AS1 }
      const ringDestroyed = { year: 3019, calendar: CalendarSystem.A3 }

      const dates = [valinorCreation, treesBloom, firstSunrise, ringDestroyed]
      const aaYears = dates.map(date => {
        const service = getServiceForCalendar(date.calendar)
        return service.toAA(date)
      })

      for (let i = 1; i < aaYears.length; i++) {
        expect(aaYears[i]).toBeGreaterThan(aaYears[i - 1])
      }
    })
  })
})

function getServiceForCalendar(calendar: CalendarSystem) {
  switch (calendar) {
    case CalendarSystem.B1A: return B1ADateService
    case CalendarSystem.AT1: return AT1DateService
    case CalendarSystem.AS1: return AS1DateService
    case CalendarSystem.A2: return A2DateService
    case CalendarSystem.A3: return A3DateService
    case CalendarSystem.AA: return AADateService
    default: throw new Error(`No service for calendar ${calendar}`)
  }
}