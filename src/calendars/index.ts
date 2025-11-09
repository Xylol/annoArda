import { CalendarModule, CalendarSystem } from '../types'

import { B1ADateService } from '../services/B1ADateService'
import { AT1DateService } from '../services/AT1DateService'
import { AS1DateService } from '../services/AS1DateService'
import { A2DateService } from '../services/A2DateService'
import { A3DateService } from '../services/A3DateService'
import { A4DateService } from '../services/A4DateService'
import { AADateService } from '../services/AADateService'

const calendarModules: Record<CalendarSystem, CalendarModule> = {
  [CalendarSystem.B1A]: B1ADateService,
  [CalendarSystem.AT1]: AT1DateService,
  [CalendarSystem.AS1]: AS1DateService,
  [CalendarSystem.A2]: A2DateService,
  [CalendarSystem.A3]: A3DateService,
  [CalendarSystem.A4]: A4DateService,
  [CalendarSystem.AA]: AADateService,
  
  // Placeholder for sub-calendar systems
  [CalendarSystem.SHIRE_RECKONING]: A3DateService, // Temporary
  [CalendarSystem.KINGS_RECKONING]: A2DateService, // Temporary
  [CalendarSystem.STEWARDS_RECKONING]: A3DateService, // Temporary
  [CalendarSystem.IMLADRIS_RECKONING]: AT1DateService, // Temporary
}

/**
 * Get a calendar module by its system type
 */
export function getCalendarModule(system: CalendarSystem): CalendarModule {
  const module = calendarModules[system]
  if (!module) {
    throw new Error(`Calendar system ${system} not found`)
  }
  return module
}

/**
 * Get all available calendar systems
 */
export function getAvailableCalendars(): CalendarSystem[] {
  return Object.keys(calendarModules) as CalendarSystem[]
}

/**
 * Get calendar info for all systems
 */
export function getAllCalendarInfo() {
  return Object.entries(calendarModules)
    .filter(([systemKey]) => {
      // Only include implemented calendar systems
      return isCalendarImplemented(systemKey as CalendarSystem)
    })
    .map(([systemKey, module]) => {
      // Destructure to avoid system property conflict
      const { system: _unused, ...infoWithoutSystem } = module.info
      return {
        system: systemKey as CalendarSystem,
        ...infoWithoutSystem
      }
    })
}

/**
 * Check if a calendar system is implemented
 */
export function isCalendarImplemented(system: CalendarSystem): boolean {
  return calendarModules[system] !== undefined
}

// Export calendar modules for direct access if needed
export {
  B1ADateService,
  AT1DateService,
  AS1DateService,
  A2DateService,
  A3DateService,
  A4DateService,
  AADateService,
}

// Export default registry
export default calendarModules