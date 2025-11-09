import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'
import { AGE_BOUNDARIES } from '../constants/ages'

export const AS1DateService: CalendarModule = {
  info: {
    name: 'First Age - Years of the Sun',
    shortName: '1AS',
    description: 'Solar years after the first sunrise',
    system: CalendarSystem.AS1,
    hasMonths: true,
    hasDays: true,
    weekDays: 7,
    monthsPerYear: 12,
    yearLength: 365
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.AS1) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < AGE_BOUNDARIES[CalendarSystem.AS1].first || date.year > AGE_BOUNDARIES[CalendarSystem.AS1].last) return false
    
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
    
    let formatted = `1AS-${date.year.toString().padStart(4, '0')}`
    
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
      throw new Error('Invalid 1AS date')
    }
    return AnnoArdaService.toAA(date)
  },

  fromAA(aaYear: number): CalendarDate {
    return AnnoArdaService.fromAA(aaYear, CalendarSystem.AS1)
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
  // First Age Years of the Sun: All 12 months have exactly 30 days
  // Special intercalary days (enderi, yestare, mettare) are outside the month system
  // This follows the Elvish calendar pattern used in Rivendell
  return 30
}