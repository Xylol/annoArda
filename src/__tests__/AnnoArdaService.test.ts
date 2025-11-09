import { describe, it, expect } from 'vitest'
import { CalendarSystem } from '../types'
import { AnnoArdaService } from '../services/AnnoArdaService'

describe('AnnoArdaService', () => {
  describe('Calendar Conversion Accuracy', () => {
    it('should convert B1A year 1 (Valar arrival) to AA year 1', () => {
      const date = { year: 1, calendar: CalendarSystem.B1A }
      const aaYear = AnnoArdaService.toAA(date)
      expect(aaYear).toBe(1)
    })

    it('should convert 1AT year 1 (Two Trees bloom) correctly', () => {
      const date = { year: 1, calendar: CalendarSystem.AT1 }
      const aaYear = AnnoArdaService.toAA(date)
      expect(aaYear).toBeGreaterThan(1)
    })

    it('should handle Valian to Solar year conversions', () => {
      const b1aDate = { year: -100, calendar: CalendarSystem.B1A }
      const at1Date = { year: 100, calendar: CalendarSystem.AT1 }
      
      const b1aAA = AnnoArdaService.toAA(b1aDate)
      const at1AA = AnnoArdaService.toAA(at1Date)
      
      // 1AT year should be much later than B1A year due to Valian year conversion
      expect(at1AA).toBeGreaterThan(b1aAA)
    })

    it('should handle transition from 1AT to 1AS correctly', () => {
      const lastTreesYear = { year: 1500, calendar: CalendarSystem.AT1 }
      const firstSunYear = { year: 1, calendar: CalendarSystem.AS1 }
      
      const treesAA = AnnoArdaService.toAA(lastTreesYear)
      const sunAA = AnnoArdaService.toAA(firstSunYear)
      
      // Should be continuous transition
      expect(sunAA).toBeGreaterThan(treesAA)
    })

    it('should handle Third Age dates correctly', () => {
      const ringDestroyed = { year: 3019, calendar: CalendarSystem.A3 }
      const aaYear = AnnoArdaService.toAA(ringDestroyed)
      
      expect(aaYear).toBeGreaterThan(1000)
      expect(typeof aaYear).toBe('number')
    })
  })

  describe('Round-trip Conversions', () => {
    it('should maintain accuracy in B1A round-trip conversion', () => {
      const originalYear = -1500
      const original = { year: originalYear, calendar: CalendarSystem.B1A }
      
      const aaYear = AnnoArdaService.toAA(original)
      const converted = AnnoArdaService.fromAA(aaYear, CalendarSystem.B1A)
      
      expect(Math.abs(converted.year - originalYear)).toBeLessThanOrEqual(1)
    })

    it('should maintain accuracy in 3A round-trip conversion', () => {
      const originalYear = 1420
      const original = { year: originalYear, calendar: CalendarSystem.A3 }
      
      const aaYear = AnnoArdaService.toAA(original)
      const converted = AnnoArdaService.fromAA(aaYear, CalendarSystem.A3)
      
      expect(converted.year).toBe(originalYear)
    })

    it('should handle AA to all calendars conversion', () => {
      const aaYear = 15000 // Mid Third Age approximately
      
      const calendars = [
        CalendarSystem.AS1,
        CalendarSystem.A2,
        CalendarSystem.A3,
        CalendarSystem.A4
      ]
      
      for (const calendar of calendars) {
        try {
          const converted = AnnoArdaService.fromAA(aaYear, calendar)
          expect(converted.calendar).toBe(calendar)
          expect(typeof converted.year).toBe('number')
        } catch (error) {
          // Some conversions may not be possible for certain AA years
          expect(error).toBeInstanceOf(Error)
        }
      }
    })
  })

  describe('Age Boundary Handling', () => {
    it('should handle age transitions correctly', () => {
      const endOf3A = { year: 3021, calendar: CalendarSystem.A3 }
      const startOf4A = { year: 1, calendar: CalendarSystem.A4 }

      const end3A_AA = AnnoArdaService.toAA(endOf3A)
      const start4A_AA = AnnoArdaService.toAA(startOf4A)

      // Should be continuous or have the expected gap
      expect(start4A_AA).toBeGreaterThanOrEqual(end3A_AA)
    })

    it('should handle B1A to 1AT transition at boundary', () => {
      const lastB1A = { year: 3500, calendar: CalendarSystem.B1A }
      const first1AT = { year: 1, calendar: CalendarSystem.AT1 }

      const lastB1A_AA = AnnoArdaService.toAA(lastB1A)
      const first1AT_AA = AnnoArdaService.toAA(first1AT)

      expect(first1AT_AA).toBeGreaterThanOrEqual(lastB1A_AA)
    })

    it('should handle 1AT to 1AS transition at boundary', () => {
      const last1AT = { year: 1500, calendar: CalendarSystem.AT1 }
      const first1AS = { year: 1, calendar: CalendarSystem.AS1 }

      const last1AT_AA = AnnoArdaService.toAA(last1AT)
      const first1AS_AA = AnnoArdaService.toAA(first1AS)

      expect(first1AS_AA).toBeGreaterThan(last1AT_AA)
    })

    it('should handle 1AS to 2A transition at boundary', () => {
      const last1AS = { year: 590, calendar: CalendarSystem.AS1 }
      const first2A = { year: 1, calendar: CalendarSystem.A2 }

      const last1AS_AA = AnnoArdaService.toAA(last1AS)
      const first2A_AA = AnnoArdaService.toAA(first2A)

      expect(first2A_AA).toBeGreaterThan(last1AS_AA)
    })

    it('should handle 2A to 3A transition at boundary', () => {
      const last2A = { year: 3441, calendar: CalendarSystem.A2 }
      const first3A = { year: 1, calendar: CalendarSystem.A3 }

      const last2A_AA = AnnoArdaService.toAA(last2A)
      const first3A_AA = AnnoArdaService.toAA(first3A)

      expect(first3A_AA).toBeGreaterThan(last2A_AA)
    })

    it('should maintain age progression order in AA', () => {
      const b1a = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.B1A })
      const at1 = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.AT1 })
      const as1 = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.AS1 })
      const a2 = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.A2 })
      const a3 = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.A3 })
      const a4 = AnnoArdaService.toAA({ year: 1, calendar: CalendarSystem.A4 })

      expect(at1).toBeGreaterThan(b1a)
      expect(as1).toBeGreaterThan(at1)
      expect(a2).toBeGreaterThan(as1)
      expect(a3).toBeGreaterThan(a2)
      expect(a4).toBeGreaterThan(a3)
    })

    it('should calculate duration between different ages', () => {
      const startDate = { year: 1, calendar: CalendarSystem.AS1 }
      const endDate = { year: 1420, calendar: CalendarSystem.A3 }

      const duration = AnnoArdaService.calculateDuration(startDate, endDate)

      expect(duration).toBeGreaterThan(0)
      expect(typeof duration).toBe('number')
    })

    it('should calculate duration within same age', () => {
      const startDate = { year: 1000, calendar: CalendarSystem.A3 }
      const endDate = { year: 2000, calendar: CalendarSystem.A3 }

      const duration = AnnoArdaService.calculateDuration(startDate, endDate)

      expect(duration).toBe(1000)
    })

    it('should reverse convert AA back to original calendar', () => {
      const original = { year: 2000, calendar: CalendarSystem.A2 }
      const aaYear = AnnoArdaService.toAA(original)
      const reversed = AnnoArdaService.fromAA(aaYear, CalendarSystem.A2)

      expect(reversed.year).toBe(original.year)
      expect(reversed.calendar).toBe(original.calendar)
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid calendar system', () => {
      expect(() => {
        AnnoArdaService.toAA({ year: 1000, calendar: 'INVALID' as CalendarSystem })
      }).toThrow()
    })

    it('should throw error when converting to calendar before its era', () => {
      const veryEarlyAA = 100 // Early in timeline

      expect(() => {
        AnnoArdaService.fromAA(veryEarlyAA, CalendarSystem.A3)
      }).toThrow()
    })
  })

  describe('Cross-Era Duration Calculations', () => {
    describe('B1A to Solar Year Eras', () => {
      it('should calculate duration from B1A to 3A correctly', () => {
        // Valar arrival to Ring destruction
        const startDate = { year: 1, calendar: CalendarSystem.B1A }
        const endDate = { year: 3019, calendar: CalendarSystem.A3 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')

        // Verify it's a very long duration (entire history)
        expect(duration).toBeGreaterThan(10000)
      })

      it('should calculate duration from B1A to 2A correctly', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.B1A }
        const endDate = { year: 1000, calendar: CalendarSystem.A2 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })

      it('should calculate duration from B1A to 1AS correctly', () => {
        const startDate = { year: 1500, calendar: CalendarSystem.B1A }
        const endDate = { year: 100, calendar: CalendarSystem.AS1 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })
    })

    describe('1AT to Solar Year Eras', () => {
      it('should calculate duration from 1AT to 3A correctly', () => {
        // Two Trees era to Third Age
        const startDate = { year: 100, calendar: CalendarSystem.AT1 }
        const endDate = { year: 3019, calendar: CalendarSystem.A3 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })

      it('should calculate duration from 1AT to 2A correctly', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.AT1 }
        const endDate = { year: 1000, calendar: CalendarSystem.A2 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })

      it('should calculate duration from 1AT to 1AS correctly', () => {
        const startDate = { year: 1400, calendar: CalendarSystem.AT1 }
        const endDate = { year: 100, calendar: CalendarSystem.AS1 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })
    })

    describe('1AS to Later Solar Year Eras', () => {
      it('should calculate duration from 1AS to 2A correctly', () => {
        const startDate = { year: 590, calendar: CalendarSystem.AS1 }
        const endDate = { year: 1, calendar: CalendarSystem.A2 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThanOrEqual(0)
        expect(typeof duration).toBe('number')
      })

      it('should calculate duration from 1AS to 3A correctly', () => {
        const startDate = { year: 1, calendar: CalendarSystem.AS1 }
        const endDate = { year: 3019, calendar: CalendarSystem.A3 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        // Should be approximately 590 + 3441 + 3019 = 7050 years
        expect(duration).toBeGreaterThan(7000)
      })
    })

    describe('2A to Later Eras', () => {
      it('should calculate duration from 2A to 3A correctly', () => {
        const startDate = { year: 3441, calendar: CalendarSystem.A2 }
        const endDate = { year: 1, calendar: CalendarSystem.A3 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThanOrEqual(0)
        expect(typeof duration).toBe('number')
      })

      it('should calculate duration from 2A to 4A correctly', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.A2 }
        const endDate = { year: 100, calendar: CalendarSystem.A4 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')
      })
    })

    describe('Negative Durations (End Before Start)', () => {
      it('should return negative duration when end is before start (same era)', () => {
        const startDate = { year: 3019, calendar: CalendarSystem.A3 }
        const endDate = { year: 1000, calendar: CalendarSystem.A3 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeLessThan(0)
        expect(duration).toBe(-2019)
      })

      it('should return negative duration when end is before start (different eras)', () => {
        const startDate = { year: 3019, calendar: CalendarSystem.A3 }
        const endDate = { year: 1000, calendar: CalendarSystem.A2 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeLessThan(0)
      })

      it('should return negative duration from Solar to Valian era', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.A3 }
        const endDate = { year: 100, calendar: CalendarSystem.B1A }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeLessThan(0)
      })
    })

    describe('Duration with Month/Day Precision Across Eras', () => {
      it('should calculate duration with day precision from 1AS to 3A', () => {
        const startDate = { year: 465, month: 3, day: 25, calendar: CalendarSystem.AS1 }
        const endDate = { year: 3019, month: 3, day: 25, calendar: CalendarSystem.A3 }

        const durationInDays = AnnoArdaService.calculateDurationInDays(startDate, endDate)

        expect(durationInDays).toBeGreaterThan(0)
        expect(typeof durationInDays).toBe('number')

        // Should be close to (590 - 465 + 3441 + 3019) * 365
        // = 6585 * 365 = 2,403,525 days
        expect(durationInDays).toBeGreaterThan(2400000)
      })

      it('should calculate duration with day precision from 2A to 3A', () => {
        const startDate = { year: 3441, month: 12, day: 31, calendar: CalendarSystem.A2 }
        const endDate = { year: 1, month: 1, day: 1, calendar: CalendarSystem.A3 }

        const durationInDays = AnnoArdaService.calculateDurationInDays(startDate, endDate)

        // Should be very small (just crossing the boundary)
        expect(durationInDays).toBeGreaterThanOrEqual(0)
        expect(durationInDays).toBeLessThan(365)
      })

      it('should handle year-only precision when one date lacks months', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.B1A }
        const endDate = { year: 3019, month: 3, day: 25, calendar: CalendarSystem.A3 }

        const durationInDays = AnnoArdaService.calculateDurationInDays(startDate, endDate)

        expect(durationInDays).toBeGreaterThan(0)
        expect(typeof durationInDays).toBe('number')
      })
    })

    describe('Valian Year Duration Conversions', () => {
      it('should account for Valian to Solar ratio in B1A durations', () => {
        // 100 Valian years should equal approximately 958.2 solar years
        const startDate = { year: 1000, calendar: CalendarSystem.B1A }
        const endDate = { year: 1100, calendar: CalendarSystem.B1A }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        // Duration should be in solar years (AA years are solar)
        expect(duration).toBeGreaterThan(900)
        expect(duration).toBeLessThan(1000)
        // Should be close to 100 * 9.582 = 958.2
        expect(Math.abs(duration - 958)).toBeLessThan(5)
      })

      it('should account for Valian to Solar ratio in 1AT durations', () => {
        // 100 Valian years should equal approximately 958.2 solar years
        const startDate = { year: 1000, calendar: CalendarSystem.AT1 }
        const endDate = { year: 1100, calendar: CalendarSystem.AT1 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        // Duration should be in solar years
        expect(duration).toBeGreaterThan(900)
        expect(duration).toBeLessThan(1000)
        expect(Math.abs(duration - 958)).toBeLessThan(5)
      })

      it('should handle mixed Valian and Solar year spans correctly', () => {
        // From middle of B1A to middle of 2A
        const startDate = { year: 2000, calendar: CalendarSystem.B1A }
        const endDate = { year: 2000, calendar: CalendarSystem.A2 }

        const duration = AnnoArdaService.calculateDuration(startDate, endDate)

        expect(duration).toBeGreaterThan(0)
        expect(typeof duration).toBe('number')

        // Verify the duration accounts for all intermediate eras
        // B1A years 2000-3500 + 1AT years 1-1500 + 1AS years 1-590 + 2A years 1-2000
        const b1aPart = (3500 - 2000) * 9.582
        const at1Part = 1500 * 9.582
        const as1Part = 590
        const a2Part = 2000
        const expectedDuration = b1aPart + at1Part + as1Part + a2Part

        // Should be close to expected (allowing for rounding)
        expect(Math.abs(duration - expectedDuration)).toBeLessThan(100)
      })

      it('should calculate day-level durations correctly for Valian years', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.B1A }
        const endDate = { year: 1001, calendar: CalendarSystem.B1A }

        const durationInDays = AnnoArdaService.calculateDurationInDays(startDate, endDate)

        // 1 Valian year ≈ 9.582 solar years ≈ 3,497.43 days
        expect(durationInDays).toBeGreaterThan(3400)
        expect(durationInDays).toBeLessThan(3600)
      })
    })

    describe('Cross-Era Round Trip Accuracy', () => {
      it('should maintain accuracy when converting between Valian and Solar eras', () => {
        const b1aDate = { year: 1500, calendar: CalendarSystem.B1A }
        const a3Date = { year: 1420, calendar: CalendarSystem.A3 }

        // Convert both to AA
        const b1aAA = AnnoArdaService.toAA(b1aDate)
        const a3AA = AnnoArdaService.toAA(a3Date)

        // Calculate duration
        const duration = AnnoArdaService.calculateDuration(b1aDate, a3Date)

        // Duration should equal the difference in AA years
        expect(duration).toBe(a3AA - b1aAA)
      })

      it('should provide consistent results regardless of direction', () => {
        const startDate = { year: 1000, calendar: CalendarSystem.B1A }
        const endDate = { year: 1000, calendar: CalendarSystem.A2 }

        const forwardDuration = AnnoArdaService.calculateDuration(startDate, endDate)
        const reverseDuration = AnnoArdaService.calculateDuration(endDate, startDate)

        expect(forwardDuration).toBe(-reverseDuration)
      })
    })
  })
})