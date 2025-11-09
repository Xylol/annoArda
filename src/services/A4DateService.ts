import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'
import { AGE_BOUNDARIES } from '../constants/ages'

export const A4DateService: CalendarModule = {
  info: {
    name: 'Fourth Age',
    shortName: '4A',
    description: 'Solar years of the Fourth Age',
    system: CalendarSystem.A4,
    hasMonths: true,
    hasDays: true,
    weekDays: 7,
    monthsPerYear: 12,
    yearLength: 365
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.A4) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < AGE_BOUNDARIES[CalendarSystem.A4].first || date.year > AGE_BOUNDARIES[CalendarSystem.A4].last) return false

    if (date.month !== undefined) {
      if (date.month < 1 || date.month > 12) return false
    }
    
    if (date.day !== undefined && date.month !== undefined) {
      const daysInMonth = getDaysInMonth()
      if (date.day < 1 || date.day > daysInMonth) return false
    }
    
    return true
  },

  formatDate(date: CalendarDate): string {
    if (!this.validateDate(date)) return 'Invalid Date'
    
    let formatted = `4A-${date.year.toString().padStart(4, '0')}`
    
    if (date.month !== undefined) {
      formatted += `-${date.month.toString().padStart(2, '0')}`
      
      if (date.day !== undefined) {
        formatted += `-${date.day.toString().padStart(2, '0')}`
      }
    }
    
    return formatted
  },

  toAA(date: CalendarDate): number {
    if (!this.validateDate(date)) {
      throw new Error('Invalid 4A date')
    }
    return AnnoArdaService.toAA(date)
  },

  fromAA(aaYear: number): CalendarDate {
    return AnnoArdaService.fromAA(aaYear, CalendarSystem.A4)
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
      description: `${yearDiff} solar years`
    }
  }
}

function getDaysInMonth(): number {
  // New Reckoning (Fourth Age): All 12 months have exactly 30 days
  // Special intercalary days (tuilérë, yáviérë, enderi) are outside the month system
  // Based on Stewards' Reckoning structure from Gondor
  return 30
}