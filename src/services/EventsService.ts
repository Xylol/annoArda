import { CalendarSystem } from '../types'
import { AnnoArdaService } from './AnnoArdaService'

export interface MiddleEarthEvent {
  name: string
  date: string
  range: string
  era: string
  calendar: string
  description: string
  characters: string[]
  locations: string[]
  artifacts?: string[]
  type: string
}

class EventsServiceClass {
  private events: MiddleEarthEvent[] = []
  private loaded = false

  async loadEvents(): Promise<void> {
    if (this.loaded) return

    try {
      // Import JSON files directly - this bundles them with the app
      const [b1aEvents, at1Events, as1Events, a2Events, a3EarlyEvents, a3MiddleEvents, a3LateEvents, a4Events] = await Promise.all([
        import('../data/B1A-events.json'),
        import('../data/1AT-events.json'),
        import('../data/1AS-events.json'),
        import('../data/2A-events.json'),
        import('../data/3A-early.json'),
        import('../data/3A-middle.json'),
        import('../data/3A-late.json'),
        import('../data/4A-events.json')
      ])

      // Validate and combine all event data
      const allEvents: MiddleEarthEvent[] = []
      const eventSources = [
        { name: 'B1A', data: b1aEvents },
        { name: '1AT', data: at1Events },
        { name: '1AS', data: as1Events },
        { name: '2A', data: a2Events },
        { name: '3A-early', data: a3EarlyEvents },
        { name: '3A-middle', data: a3MiddleEvents },
        { name: '3A-late', data: a3LateEvents },
        { name: '4A', data: a4Events }
      ]

      for (const source of eventSources) {
        if (Array.isArray(source.data?.default)) {
          allEvents.push(...source.data.default)
        } else {
          console.error(`Failed to load ${source.name} events: invalid data format`)
        }
      }

      // Sort events by AA time
      this.events = allEvents.sort((a, b) => {
        const aaA = this.getEventAA(a)
        const aaB = this.getEventAA(b)
        return aaA - aaB
      })

      this.loaded = true
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  private getEventAA(event: MiddleEarthEvent): number {
    try {
      const parts = event.date.split('-')
      if (parts.length < 2) {
        console.error(`Malformed event date: "${event.date}" for event "${event.name}"`)
        return 0
      }

      const calendarSystem = this.parseCalendarSystem(event.date)
      const year = parseInt(parts[1])

      if (isNaN(year)) {
        console.error(`Invalid year in event date: "${event.date}" for event "${event.name}"`)
        return 0
      }

      return AnnoArdaService.toAA({
        year,
        calendar: calendarSystem
      })
    } catch (error) {
      console.error(`Failed to parse event date: "${event.date}" for event "${event.name}"`, error)
      return 0
    }
  }

  private parseCalendarSystem(dateStr: string): CalendarSystem {
    const prefix = dateStr.split('-')[0]
    switch (prefix) {
      case 'B1A': return CalendarSystem.B1A
      case '1AT': return CalendarSystem.AT1
      case '1AS': return CalendarSystem.AS1
      case '2A': return CalendarSystem.A2
      case '3A': return CalendarSystem.A3
      case '4A': return CalendarSystem.A4
      default: return CalendarSystem.A3
    }
  }

  private normalizeText(text: string): string {
    // Remove diacritics and convert to lowercase for search matching
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .toLowerCase()
  }

  searchEvents(query: string): MiddleEarthEvent[] {
    if (!query.trim()) return []

    const normalizedQuery = this.normalizeText(query)
    const terms = normalizedQuery.split(' ').filter(term => term.length > 0)

    return this.events.filter(event => {
      const searchableText = [
        event.name,
        event.description,
        ...event.characters,
        ...event.locations,
        ...(event.artifacts || [])
      ].join(' ')

      const normalizedSearchableText = this.normalizeText(searchableText)

      return terms.every(term => normalizedSearchableText.includes(term))
    })
  }

  getEventDate(event: MiddleEarthEvent): { year: number, calendar: CalendarSystem } {
    const parts = event.date.split('-')
    if (parts.length < 2) {
      console.error(`Malformed event date: "${event.date}" for event "${event.name}"`)
      return { year: 0, calendar: CalendarSystem.A3 }
    }

    const calendarSystem = this.parseCalendarSystem(event.date)
    const year = parseInt(parts[1])

    if (isNaN(year)) {
      console.error(`Invalid year in event date: "${event.date}" for event "${event.name}"`)
      return { year: 0, calendar: calendarSystem }
    }

    return { year, calendar: calendarSystem }
  }
}

export const EventsService = new EventsServiceClass()