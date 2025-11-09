import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'
import { AGE_BOUNDARIES } from '../constants/ages'

export const A3DateService: CalendarModule = {
  info: {
    name: 'Third Age',
    shortName: '3A',
    description: 'Solar years of the Third Age',
    system: CalendarSystem.A3,
    hasMonths: true,
    hasDays: true,
    weekDays: 7,
    monthsPerYear: 12,
    yearLength: 365
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.A3) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < AGE_BOUNDARIES[CalendarSystem.A3].first || date.year > AGE_BOUNDARIES[CalendarSystem.A3].last) return false
    
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
    
    let formatted = `3A-${date.year.toString().padStart(4, '0')}`
    
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
      throw new Error('Invalid 3A date')
    }
    return AnnoArdaService.toAA(date)
  },

  fromAA(aaYear: number): CalendarDate {
    return AnnoArdaService.fromAA(aaYear, CalendarSystem.A3)
  },

  calculateDifference(start: CalendarDate, end: CalendarDate): DateCalculationResult {
    if (!this.validateDate(start) || !this.validateDate(end)) {
      throw new Error('Invalid dates for calculation')
    }

    // If either date is missing month/day info, fall back to simple year calculation
    if (start.month === undefined || start.day === undefined ||
        end.month === undefined || end.day === undefined) {
      const yearDiff = end.year - start.year
      const totalDays = yearDiff * 365
      return {
        years: yearDiff,
        totalDays,
        description: `${yearDiff} solar years`
      }
    }

    // Calculate day-by-day difference including special days
    const totalDays = calculateDaysBetween(start, end)
    const years = Math.floor(totalDays / 365)
    const remainingDays = totalDays % 365

    return {
      years,
      days: remainingDays,
      totalDays,
      description: `${totalDays} days (${years} years, ${remainingDays} days)`
    }
  }
}

function getDaysInMonth(): number {
  // Shire Reckoning: All 12 months have exactly 30 days
  // The 5 special days (Yule, Lithe) are intercalated outside the month system
  return 30
}

function isLeapYear(year: number): boolean {
  // Standard leap year rules
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function getSpecialDaysBetweenMonths(startMonth: number, startYear: number, endMonth: number, endYear: number): number {
  // Shire Reckoning special days:
  // - 2 Yule: between month 12 and month 1
  // - 3 Lithe days: between month 6 and month 7 (1 Lithe + Midyear's Day + 1 Lithe)
  // - 4 Lithe days in leap years (adds Overlithe)

  let specialDays = 0

  // If crossing years, we need to check each year boundary
  if (endYear > startYear) {
    // Count Yule days for crossing from Dec to Jan (only once)
    specialDays += 2 // 2 Yule between years

    // Count Lithe in start year if we pass June
    if (startMonth <= 6) {
      specialDays += isLeapYear(startYear) ? 4 : 3 // Lithe days in start year
    }

    // Count full years in between
    for (let year = startYear + 1; year < endYear; year++) {
      specialDays += 5 // Base special days per year
      if (isLeapYear(year)) {
        specialDays += 1 // Overlithe
      }
    }

    // Count special days in the end year
    if (endMonth >= 7) {
      specialDays += isLeapYear(endYear) ? 4 : 3 // Lithe days in end year
    }
  } else if (endYear === startYear) {
    // Same year - check if we cross the Lithe period
    if (startMonth <= 6 && endMonth >= 7) {
      specialDays += isLeapYear(startYear) ? 4 : 3 // Lithe days
    }
  }

  return specialDays
}

function calculateDaysBetween(start: CalendarDate, end: CalendarDate): number {
  // Ensure both dates have month and day
  if (start.month === undefined || start.day === undefined ||
      end.month === undefined || end.day === undefined) {
    return 0
  }

  let totalDays = 0

  if (start.year === end.year && start.month === end.month) {
    // Same month and year - count difference (not including start day)
    totalDays = end.day - start.day
  } else if (start.year === end.year) {
    // Same year, different months
    // Days remaining in start month (not including start day)
    totalDays += getDaysInMonth() - start.day

    // Full months in between
    for (let month = start.month + 1; month < end.month; month++) {
      totalDays += getDaysInMonth()
    }

    // Days in end month (including end day)
    totalDays += end.day

    // Add special days if crossing June->July
    totalDays += getSpecialDaysBetweenMonths(start.month, start.year, end.month, end.year)
  } else {
    // Different years
    // Days remaining in start month (not including start day)
    totalDays += getDaysInMonth() - start.day

    // Remaining months in start year
    for (let month = start.month + 1; month <= 12; month++) {
      totalDays += getDaysInMonth()
    }

    // Full years in between
    for (let year = start.year + 1; year < end.year; year++) {
      totalDays += 360 // 12 months × 30 days
      totalDays += isLeapYear(year) ? 6 : 5 // Special days
    }

    // Months in end year up to (but not including) end month
    for (let month = 1; month < end.month; month++) {
      totalDays += getDaysInMonth()
    }

    // Days in end month (including end day)
    totalDays += end.day

    // Add special days for crossing year and mid-year boundaries
    totalDays += getSpecialDaysBetweenMonths(start.month, start.year, end.month, end.year)
  }

  return totalDays
}