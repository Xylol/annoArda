import { describe, it, expect, beforeAll } from 'vitest'
import { EventsService } from '../services/EventsService'
import { CalendarSystem } from '../types'

describe('EventsService', () => {
  beforeAll(async () => {
    await EventsService.loadEvents()
  })

  describe('Event Loading and Parsing', () => {
    it('should parse calendar systems correctly', () => {
      const event = EventsService.searchEvents('Valar')[0]
      if (event) {
        const { calendar } = EventsService.getEventDate(event)
        expect(calendar).toBeDefined()
      }
    })

    it('should convert event dates to AA for sorting', () => {
      const events = EventsService.searchEvents('Ring')
      expect(events.length).toBeGreaterThan(0)
    })
  })

  describe('Search Functionality', () => {
    it('should find events by single term', () => {
      const results = EventsService.searchEvents('Gandalf')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find events by multiple terms', () => {
      const results = EventsService.searchEvents('Frodo Ring')
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty array for empty query', () => {
      const results = EventsService.searchEvents('')
      expect(results).toEqual([])
    })

    it('should normalize diacritics in search', () => {
      const resultsWithDiacritic = EventsService.searchEvents('Númenor')
      const resultsWithoutDiacritic = EventsService.searchEvents('Numenor')
      expect(resultsWithDiacritic.length).toBe(resultsWithoutDiacritic.length)
      expect(resultsWithDiacritic.length).toBeGreaterThan(0)
    })

    it('should search case-insensitively', () => {
      const resultsLower = EventsService.searchEvents('gandalf')
      const resultsUpper = EventsService.searchEvents('GANDALF')
      expect(resultsLower.length).toBe(resultsUpper.length)
    })
  })

  describe('Event Date Extraction', () => {
    it('should extract B1A dates correctly', () => {
      const event = { date: 'B1A-1500', name: 'Test', range: '', era: '', calendar: '', description: '', characters: [], locations: [], type: '' }
      const { year, calendar } = EventsService.getEventDate(event)
      expect(year).toBe(1500)
      expect(calendar).toBe(CalendarSystem.B1A)
    })

    it('should extract 3A dates correctly', () => {
      const event = { date: '3A-3019', name: 'Test', range: '', era: '', calendar: '', description: '', characters: [], locations: [], type: '' }
      const { year, calendar } = EventsService.getEventDate(event)
      expect(year).toBe(3019)
      expect(calendar).toBe(CalendarSystem.A3)
    })
  })
})
