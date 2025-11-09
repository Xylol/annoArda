export enum CalendarSystem {
  B1A = 'B1A',
  AT1 = '1AT', 
  AS1 = '1AS',
  A2 = '2A',
  A3 = '3A',
  A4 = '4A',
  AA = 'AA',
  SHIRE_RECKONING = 'shireReckoning',
  KINGS_RECKONING = 'kingsReckoning',
  STEWARDS_RECKONING = 'stewardsReckoning',
  IMLADRIS_RECKONING = 'imladrisReckoning',
}

export interface CalendarDate {
  year: number
  month?: number
  day?: number
  calendar: CalendarSystem
}

export interface CalendarInfo {
  name: string
  shortName: string
  description: string
  system: CalendarSystem
  hasMonths: boolean
  hasDays: boolean
  weekDays: number
  monthsPerYear?: number
  daysPerMonth?: number[]
  yearLength?: number
}

export interface DateCalculationResult {
  years: number
  months?: number
  days?: number
  totalDays: number
  description: string
}

export interface CalendarModule {
  info: CalendarInfo
  validateDate: (date: CalendarDate) => boolean
  formatDate: (date: CalendarDate) => string
  toAA: (date: CalendarDate) => number
  fromAA: (aaYear: number) => CalendarDate
  calculateDifference: (start: CalendarDate, end: CalendarDate) => DateCalculationResult
}

export interface AgeConstants {
  first: number
  last: number
}

export interface AgeBoundaries {
  [CalendarSystem.B1A]: AgeConstants
  [CalendarSystem.AT1]: AgeConstants  
  [CalendarSystem.AS1]: AgeConstants
  [CalendarSystem.A2]: AgeConstants
  [CalendarSystem.A3]: AgeConstants
  [CalendarSystem.A4]: AgeConstants
  [CalendarSystem.AA]: AgeConstants
  [CalendarSystem.SHIRE_RECKONING]?: AgeConstants
  [CalendarSystem.KINGS_RECKONING]?: AgeConstants
  [CalendarSystem.STEWARDS_RECKONING]?: AgeConstants
  [CalendarSystem.IMLADRIS_RECKONING]?: AgeConstants
}

export interface AgeTransitions {
  'B1A_to_1AT': number
  '1AT_to_1AS': number
  '1AS_to_2A': number
  '2A_to_3A': number
  '3A_to_4A': number
}