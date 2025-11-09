import type { AgeBoundaries, AgeTransitions } from '../types'
import { CalendarSystem } from '../types'

export const VALIAN_TO_SOLAR_RATIO = 9.582

export const AGE_BOUNDARIES: AgeBoundaries = {
  [CalendarSystem.B1A]: { first: 1, last: 3500 },
  [CalendarSystem.AT1]: { first: 1, last: 1500 },
  [CalendarSystem.AS1]: { first: 1, last: 590 },
  [CalendarSystem.A2]: { first: 1, last: 3441 },
  [CalendarSystem.A3]: { first: 1, last: 3021 },
  [CalendarSystem.A4]: { first: 1, last: 220 },
  [CalendarSystem.AA]: { first: 1, last: 99999 }
}

export const AGE_TRANSITIONS: AgeTransitions = {
  'B1A_to_1AT': 0,
  '1AT_to_1AS': 0,
  '1AS_to_2A': 0,
  '2A_to_3A': 0,
  '3A_to_4A': 0
}

export const AA_YEAR_ONE_EVENT = "The Valar come to Arda"