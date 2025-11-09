import { CalendarSystem, type CalendarModule, type CalendarDate, type DateCalculationResult } from '../types'
import { AnnoArdaService } from './AnnoArdaService'
import { AGE_BOUNDARIES } from '../constants/ages'

export const A2DateService: CalendarModule = {
  info: {
    name: 'Second Age (Kings\' Reckoning)',
    shortName: '2A',
    description: 'Númenórean calendar of the Second Age',
    system: CalendarSystem.A2,
    hasMonths: true,
    hasDays: true,
    weekDays: 7,
    monthsPerYear: 12,
    yearLength: 365
  },

  validateDate(date: CalendarDate): boolean {
    if (date.calendar !== CalendarSystem.A2) return false
    if (!Number.isInteger(date.year)) return false
    if (date.year < AGE_BOUNDARIES[CalendarSystem.A2].first || date.year > AGE_BOUNDARIES[CalendarSystem.A2].last) return false
    
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
    
    let formatted = `2A-${date.year.toString().padStart(4, '0')}`
    
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
      throw new Error('Invalid 2A date')
    }
    return AnnoArdaService.toAA(date)
  },

  fromAA(aaYear: number): CalendarDate {
    return AnnoArdaService.fromAA(aaYear, CalendarSystem.A2)
  },

  calculateDifference(start: CalendarDate, end: CalendarDate): DateCalculationResult {
    if (!this.validateDate(start) || !this.validateDate(end)) {
      throw new Error('Invalid dates for calculation')
    }

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
  // Kings' Reckoning: months have 30 days each
  // Special days (yestarë, loëndë/enderi, mettarë) are outside months
  return 30
}

function isLeapYear(year: number): boolean {
  // Kings' Reckoning leap years: divisible by 4 but not 100
  // Millennial years (divisible by 1000) are special
  if (year % 1000 === 0) return true // 3 enderi
  if (year % 100 === 0) return false
  return year % 4 === 0
}

function getSpecialDaysBetween(startMonth: number, startYear: number, endMonth: number, endYear: number): number {
  // Kings' Reckoning special days:
  // - yestarë: before month 1 (beginning of year)
  // - loëndë: midyear (between month 6 and 7), or 2 enderi in leap years, or 3 enderi in millennial years
  // - mettarë: after month 12 (end of year)

  let specialDays = 0

  if (endYear > startYear) {
    // Count special days for crossing year boundary
    specialDays += 1 // yestarë at start of end year
    specialDays += 1 // mettarë at end of start year

    // Count Lithe/enderi in start year if we pass June
    if (startMonth <= 6) {
      if (startYear % 1000 === 0) {
        specialDays += 3 // 3 enderi in millennial years
      } else if (isLeapYear(startYear)) {
        specialDays += 2 // 2 enderi in leap years
      } else {
        specialDays += 1 // loëndë in regular years
      }
    }

    // Count full years in between
    for (let year = startYear + 1; year < endYear; year++) {
      specialDays += 2 // yestarë + mettarë
      if (year % 1000 === 0) {
        specialDays += 3
      } else if (isLeapYear(year)) {
        specialDays += 2
      } else {
        specialDays += 1
      }
    }

    // Count special days in end year
    if (endMonth >= 7) {
      if (endYear % 1000 === 0) {
        specialDays += 3
      } else if (isLeapYear(endYear)) {
        specialDays += 2
      } else {
        specialDays += 1
      }
    }
  } else if (endYear === startYear) {
    // Same year - check if we cross midyear
    if (startMonth <= 6 && endMonth >= 7) {
      if (startYear % 1000 === 0) {
        specialDays += 3
      } else if (isLeapYear(startYear)) {
        specialDays += 2
      } else {
        specialDays += 1
      }
    }
  }

  return specialDays
}

function calculateDaysBetween(start: CalendarDate, end: CalendarDate): number {
  if (start.month === undefined || start.day === undefined ||
      end.month === undefined || end.day === undefined) {
    return 0
  }

  let totalDays = 0

  if (start.year === end.year && start.month === end.month) {
    totalDays = end.day - start.day
  } else if (start.year === end.year) {
    totalDays += getDaysInMonth() - start.day
    for (let month = start.month + 1; month < end.month; month++) {
      totalDays += getDaysInMonth()
    }
    totalDays += end.day
    totalDays += getSpecialDaysBetween(start.month, start.year, end.month, end.year)
  } else {
    totalDays += getDaysInMonth() - start.day
    for (let month = start.month + 1; month <= 12; month++) {
      totalDays += getDaysInMonth()
    }
    for (let year = start.year + 1; year < end.year; year++) {
      totalDays += 360 // 12 months × 30 days
      if (year % 1000 === 0) {
        totalDays += 5 // yestarë + 3 enderi + mettarë
      } else if (isLeapYear(year)) {
        totalDays += 4 // yestarë + 2 enderi + mettarë
      } else {
        totalDays += 3 // yestarë + loëndë + mettarë
      }
    }
    for (let month = 1; month < end.month; month++) {
      totalDays += getDaysInMonth()
    }
    totalDays += end.day
    totalDays += getSpecialDaysBetween(start.month, start.year, end.month, end.year)
  }

  return totalDays
}