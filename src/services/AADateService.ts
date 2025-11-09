import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'

export const AADateService: CalendarModule = {
  info: {
    name: 'Anno Arda',
    shortName: 'AA',
    description: 'Universal timeline from the beginning of Arda',
    system: CalendarSystem.AA,
    hasMonths: false,
    hasDays: false,
    weekDays: 7,
    yearLength: 365
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.AA) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < 1) return false
    if (date.month !== undefined || date.day !== undefined) return false
    return true
  },

  formatDate(date: CalendarDate): string {
    if (!this.validateDate(date)) return 'Invalid Date'
    return AnnoArdaService.formatAA(date.year)
  },

  toAA(date: CalendarDate): number {
    if (!this.validateDate(date)) {
      throw new Error('Invalid AA date')
    }
    return date.year
  },

  fromAA(aaYear: number): CalendarDate {
    return { year: aaYear, calendar: CalendarSystem.AA }
  },

  calculateDifference(start: CalendarDate, end: CalendarDate): DateCalculationResult {
    if (!this.validateDate(start) || !this.validateDate(end)) {
      throw new Error('Invalid dates for calculation')
    }
    
    const yearDiff = end.year - start.year
    const totalDays = yearDiff * 365
    
    return {
      years: yearDiff,
      totalDays,
      description: `${yearDiff} Anno Arda years`
    }
  }
}