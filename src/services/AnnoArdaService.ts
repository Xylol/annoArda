import { CalendarSystem, type CalendarDate } from '../types'
import { AGE_BOUNDARIES, AGE_TRANSITIONS, VALIAN_TO_SOLAR_RATIO } from '../constants/ages'

export class AnnoArdaService {
  static toAA(date: CalendarDate): number {
    const { year, calendar } = date
    
    switch (calendar) {
      case CalendarSystem.B1A:
        return this.b1aToAA(year)
      case CalendarSystem.AT1:
        return this.at1ToAA(year)
      case CalendarSystem.AS1:
        return this.as1ToAA(year)
      case CalendarSystem.A2:
        return this.a2ToAA(year)
      case CalendarSystem.A3:
        return this.a3ToAA(year)
      case CalendarSystem.A4:
        return this.a4ToAA(year)
      case CalendarSystem.AA:
        return year
      default:
        throw new Error(`Calendar system ${calendar} not implemented`)
    }
  }

  static fromAA(aaYear: number, targetCalendar: CalendarSystem): CalendarDate {
    switch (targetCalendar) {
      case CalendarSystem.B1A:
        return this.aaToB1A(aaYear)
      case CalendarSystem.AT1:
        return this.aaToAT1(aaYear)
      case CalendarSystem.AS1:
        return this.aaToAS1(aaYear)
      case CalendarSystem.A2:
        return this.aaToA2(aaYear)
      case CalendarSystem.A3:
        return this.aaToA3(aaYear)
      case CalendarSystem.A4:
        return this.aaToA4(aaYear)
      case CalendarSystem.AA:
        return { year: aaYear, calendar: CalendarSystem.AA }
      default:
        throw new Error(`Calendar system ${targetCalendar} not implemented`)
    }
  }

  private static b1aToAA(year: number): number {
    // B1A year 1 = AA year 1 (Valar arrival)
    const valianYearsFromStart = year - 1
    return Math.round(valianYearsFromStart * VALIAN_TO_SOLAR_RATIO) + 1
  }

  private static at1ToAA(year: number): number {
    const b1aEndAA = this.b1aToAA(AGE_BOUNDARIES[CalendarSystem.B1A].last)
    const valianYearsInAT1 = year - 1 
    return b1aEndAA + Math.round(valianYearsInAT1 * VALIAN_TO_SOLAR_RATIO) + AGE_TRANSITIONS['B1A_to_1AT']
  }

  private static as1ToAA(year: number): number {
    const at1EndAA = this.at1ToAA(AGE_BOUNDARIES[CalendarSystem.AT1].last)
    return at1EndAA + year + AGE_TRANSITIONS['1AT_to_1AS']
  }

  private static a2ToAA(year: number): number {
    const as1EndAA = this.as1ToAA(AGE_BOUNDARIES[CalendarSystem.AS1].last)
    return as1EndAA + year + AGE_TRANSITIONS['1AS_to_2A']
  }

  private static a3ToAA(year: number): number {
    const a2EndAA = this.a2ToAA(AGE_BOUNDARIES[CalendarSystem.A2].last)
    return a2EndAA + year + AGE_TRANSITIONS['2A_to_3A']
  }

  private static a4ToAA(year: number): number {
    const a3EndAA = this.a3ToAA(AGE_BOUNDARIES[CalendarSystem.A3].last)
    return a3EndAA + year + AGE_TRANSITIONS['3A_to_4A']
  }

  private static aaToB1A(aaYear: number): CalendarDate {
    const solarYearsFromStart = aaYear - 1
    const valianYears = Math.round(solarYearsFromStart / VALIAN_TO_SOLAR_RATIO)
    const b1aYear = valianYears + 1
    return { year: b1aYear, calendar: CalendarSystem.B1A }
  }

  private static aaToAT1(aaYear: number): CalendarDate {
    const b1aEndAA = this.b1aToAA(AGE_BOUNDARIES[CalendarSystem.B1A].last)
    if (aaYear <= b1aEndAA) {
      throw new Error(`AA year ${aaYear} is before the First Age Trees period`)
    }
    const solarYearsInAT1 = aaYear - b1aEndAA - AGE_TRANSITIONS['B1A_to_1AT']
    const valianYears = Math.round(solarYearsInAT1 / VALIAN_TO_SOLAR_RATIO)
    return { year: valianYears + 1, calendar: CalendarSystem.AT1 }
  }

  private static aaToAS1(aaYear: number): CalendarDate {
    const at1EndAA = this.at1ToAA(AGE_BOUNDARIES[CalendarSystem.AT1].last)
    if (aaYear <= at1EndAA) {
      throw new Error(`AA year ${aaYear} is before the First Age Sun period`)
    }
    const solarYearsInAS1 = aaYear - at1EndAA - AGE_TRANSITIONS['1AT_to_1AS']
    return { year: solarYearsInAS1, calendar: CalendarSystem.AS1 }
  }

  private static aaToA2(aaYear: number): CalendarDate {
    const as1EndAA = this.as1ToAA(AGE_BOUNDARIES[CalendarSystem.AS1].last)
    if (aaYear <= as1EndAA) {
      throw new Error(`AA year ${aaYear} is before the Second Age`)
    }
    const solarYearsInA2 = aaYear - as1EndAA - AGE_TRANSITIONS['1AS_to_2A']
    return { year: solarYearsInA2, calendar: CalendarSystem.A2 }
  }

  private static aaToA3(aaYear: number): CalendarDate {
    const a2EndAA = this.a2ToAA(AGE_BOUNDARIES[CalendarSystem.A2].last)
    if (aaYear <= a2EndAA) {
      throw new Error(`AA year ${aaYear} is before the Third Age`)
    }
    const solarYearsInA3 = aaYear - a2EndAA - AGE_TRANSITIONS['2A_to_3A']
    return { year: solarYearsInA3, calendar: CalendarSystem.A3 }
  }

  private static aaToA4(aaYear: number): CalendarDate {
    const a3EndAA = this.a3ToAA(AGE_BOUNDARIES[CalendarSystem.A3].last)
    if (aaYear <= a3EndAA) {
      throw new Error(`AA year ${aaYear} is before the Fourth Age`)
    }
    const solarYearsInA4 = aaYear - a3EndAA - AGE_TRANSITIONS['3A_to_4A']
    return { year: solarYearsInA4, calendar: CalendarSystem.A4 }
  }

  static calculateDuration(startDate: CalendarDate, endDate: CalendarDate): number {
    const startAA = this.toAA(startDate)
    const endAA = this.toAA(endDate)
    return endAA - startAA
  }

  static calculateDurationInDays(startDate: CalendarDate, endDate: CalendarDate): number {
    // Convert to AA years first - use precise conversion without rounding
    const startAA = this.toAAPrecise(startDate)
    const endAA = this.toAAPrecise(endDate)

    // Calculate base duration in days (AA years * 365)
    let totalDays = (endAA - startAA) * 365

    // Add day-level precision if both dates have day information
    if (startDate.day !== undefined && endDate.day !== undefined &&
        startDate.month !== undefined && endDate.month !== undefined) {

      // Calculate day of year for start date
      const startDayOfYear = this.getDayOfYear(startDate.month, startDate.day)
      // Calculate day of year for end date
      const endDayOfYear = this.getDayOfYear(endDate.month, endDate.day)

      // Adjust total days with day-level precision
      totalDays = totalDays - startDayOfYear + endDayOfYear
    }

    return Math.round(totalDays)
  }

  private static toAAPrecise(date: CalendarDate): number {
    const { year, calendar } = date

    switch (calendar) {
      case CalendarSystem.B1A:
        return this.b1aToAAPrecise(year)
      case CalendarSystem.AT1:
        return this.at1ToAAPrecise(year)
      case CalendarSystem.AS1:
        return this.as1ToAAPrecise(year)
      case CalendarSystem.A2:
        return this.a2ToAAPrecise(year)
      case CalendarSystem.A3:
        return this.a3ToAAPrecise(year)
      case CalendarSystem.A4:
        return this.a4ToAAPrecise(year)
      case CalendarSystem.AA:
        return year
      default:
        throw new Error(`Calendar system ${calendar} not implemented`)
    }
  }

  private static b1aToAAPrecise(year: number): number {
    // Don't round - keep precision for day calculations
    const valianYearsFromStart = year - 1
    return valianYearsFromStart * VALIAN_TO_SOLAR_RATIO + 1
  }

  private static at1ToAAPrecise(year: number): number {
    const b1aEndAA = this.b1aToAAPrecise(AGE_BOUNDARIES[CalendarSystem.B1A].last)
    const valianYearsInAT1 = year - 1
    return b1aEndAA + valianYearsInAT1 * VALIAN_TO_SOLAR_RATIO + AGE_TRANSITIONS['B1A_to_1AT']
  }

  private static as1ToAAPrecise(year: number): number {
    const at1EndAA = this.at1ToAAPrecise(AGE_BOUNDARIES[CalendarSystem.AT1].last)
    return at1EndAA + year + AGE_TRANSITIONS['1AT_to_1AS']
  }

  private static a2ToAAPrecise(year: number): number {
    const as1EndAA = this.as1ToAAPrecise(AGE_BOUNDARIES[CalendarSystem.AS1].last)
    return as1EndAA + year + AGE_TRANSITIONS['1AS_to_2A']
  }

  private static a3ToAAPrecise(year: number): number {
    const a2EndAA = this.a2ToAAPrecise(AGE_BOUNDARIES[CalendarSystem.A2].last)
    return a2EndAA + year + AGE_TRANSITIONS['2A_to_3A']
  }

  private static a4ToAAPrecise(year: number): number {
    const a3EndAA = this.a3ToAAPrecise(AGE_BOUNDARIES[CalendarSystem.A3].last)
    return a3EndAA + year + AGE_TRANSITIONS['3A_to_4A']
  }

  private static getDayOfYear(month: number, day: number): number {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let dayOfYear = day
    
    for (let i = 0; i < month - 1; i++) {
      dayOfYear += daysInMonth[i]
    }
    
    return dayOfYear
  }

  static formatAA(aaYear: number): string {
    return `AA ${aaYear.toString().padStart(5, '0')}`
  }

  static isValianCalendar(calendar: CalendarSystem): boolean {
    return calendar === CalendarSystem.B1A || calendar === CalendarSystem.AT1
  }

  static getDurationInValianYears(startDate: CalendarDate, endDate: CalendarDate): number {
    // If both dates are in Valian calendars, calculate directly
    if (this.isValianCalendar(startDate.calendar) && this.isValianCalendar(endDate.calendar)) {
      const startAA = this.toAAPrecise(startDate)
      const endAA = this.toAAPrecise(endDate)
      const solarYearDuration = endAA - startAA
      return solarYearDuration / VALIAN_TO_SOLAR_RATIO
    }

    // For mixed or non-Valian calendars, convert solar year duration
    const duration = this.calculateDuration(startDate, endDate)
    return duration / VALIAN_TO_SOLAR_RATIO
  }

  static spansValianEra(startDate: CalendarDate, endDate: CalendarDate): boolean {
    const startAA = this.toAA(startDate)
    const endAA = this.toAA(endDate)
    const minAA = Math.min(startAA, endAA)
    const maxAA = Math.max(startAA, endAA)

    // Calculate where First Age Sun begins (end of Valian era)
    const valianEraEnd = this.at1ToAA(AGE_BOUNDARIES[CalendarSystem.AT1].last)

    // Spans Valian era if it starts before or during Valian era and extends beyond it
    return minAA <= valianEraEnd && maxAA > valianEraEnd
  }
}