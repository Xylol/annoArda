import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'
import { AGE_BOUNDARIES } from '../constants/ages'

export const B1ADateService: CalendarModule = {
  info: {
    name: 'Before First Age',
    shortName: 'B1A',
    description: 'Valian Years before the blooming of the Two Trees',
    system: CalendarSystem.B1A,
    hasMonths: false,
    hasDays: false,
    weekDays: 5,
    yearLength: undefined
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.B1A) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < AGE_BOUNDARIES[CalendarSystem.B1A].first || date.year > AGE_BOUNDARIES[CalendarSystem.B1A].last) return false
    if (date.month !== undefined || date.day !== undefined) return false
    return true
  },

  formatDate(date: CalendarDate): string {
    if (!this.validateDate(date)) return 'Invalid Date'
    return `B1A-${date.year.toString().padStart(4, '0')}`
  },

  toAA(date: CalendarDate): number {
    if (!this.validateDate(date)) {
      throw new Error('Invalid B1A date')
    }
    return AnnoArdaService.toAA(date)
  },

  fromAA(aaYear: number): CalendarDate {
    return AnnoArdaService.fromAA(aaYear, CalendarSystem.B1A)
  },

  calculateDifference(start: CalendarDate, end: CalendarDate): DateCalculationResult {
    if (!this.validateDate(start) || !this.validateDate(end)) {
      throw new Error('Invalid dates for calculation')
    }
    
    const yearDiff = end.year - start.year
    const totalDays = Math.round(yearDiff * 365.25 * 9.582)
    
    return {
      years: yearDiff,
      totalDays,
      description: `${yearDiff} Valian years (approximately ${Math.round(yearDiff * 9.582)} solar years)`
    }
  }
}