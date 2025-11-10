import React, { useState, useEffect, useCallback } from 'react'
import { CalendarSystem, CalendarDate } from './types'
import { AnnoArdaService } from './services/AnnoArdaService'
import { getCalendarModule } from './calendars'
import { EventsService, MiddleEarthEvent } from './services/EventsService'
import { AGE_BOUNDARIES } from './constants/ages'
import './App.css'

interface CalculationState {
  startYear: string
  startMonth: string
  startDay: string
  startCalendar: CalendarSystem
  startEventName: string
  endYear: string
  endMonth: string
  endDay: string
  endCalendar: CalendarSystem
  endEventName: string
  results: CalculationResult | null
  errors: string[]
}

interface CalculationResult {
  startDate: CalendarDate
  endDate: CalendarDate
  startFormatted: string
  endFormatted: string
  startAA: number
  endAA: number
  duration: {
    years: number
    months: number
    days: number
    totalDays: number
    description: string
  }
  conversions: {
    start: ConversionResult[]
    end: ConversionResult[]
  }
  valianYears?: number
  showValianYears: boolean
}

interface ConversionResult {
  calendar: CalendarSystem
  date: CalendarDate
  formatted: string
  aaYear: number
}

interface EventInputProps {
  title: string
  titleColor: string
  year: string
  month: string
  day: string
  calendar: CalendarSystem
  selectedEventName: string
  onYearChange: (value: string) => void
  onMonthChange: (value: string) => void
  onDayChange: (value: string) => void
  onCalendarChange: (value: CalendarSystem) => void
  onSelectedEventNameChange: (value: string) => void
  searchResultsSide: 'left' | 'right'
  idPrefix: string
}

function EventInput({ title, titleColor, year, month, day, calendar, selectedEventName, onYearChange, onMonthChange, onDayChange, onCalendarChange, onSelectedEventNameChange, searchResultsSide, idPrefix }: EventInputProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MiddleEarthEvent[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [tooltip, setTooltip] = useState<{ show: boolean, content: string, x: number, y: number, width?: number }>({ 
    show: false, content: '', x: 0, y: 0 
  })

  useEffect(() => {
    EventsService.loadEvents()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showResults && !target.closest('.search-results') && !target.closest('.search-input')) {
        setShowResults(false)
        setSelectedIndex(-1)
        setHoveredIndex(-1)
        setTooltip({ show: false, content: '', x: 0, y: 0 })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showResults])

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = EventsService.searchEvents(searchQuery)
      setSearchResults(results)
      setShowResults(true)
      setSelectedIndex(-1)
      setHoveredIndex(-1)
      setTooltip({ show: false, content: '', x: 0, y: 0 })
    } else {
      setSearchResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      setHoveredIndex(-1)
      setTooltip({ show: false, content: '', x: 0, y: 0 })
    }
  }, [searchQuery])

  const showTooltipForIndex = (index: number, sourceType: 'keyboard' | 'mouse' = 'keyboard') => {
    if (index >= 0 && index < searchResults.length) {
      const event = searchResults[index]
      const selectedElement = document.querySelector(`[data-result-index="${index}"]`)
      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect()
        const resultsContainer = document.querySelector('.search-results') as HTMLElement
        const containerRect = resultsContainer?.getBoundingClientRect()
        
        // For mouse, only show if text is truncated
        if (sourceType === 'mouse') {
          const descriptionElement = selectedElement.querySelector('.description-text') as HTMLElement
          const isTextTruncated = descriptionElement && descriptionElement.scrollWidth > descriptionElement.clientWidth
          if (!isTextTruncated) return
        }
        
        setTooltip({
          show: true,
          content: event.description,
          x: searchResultsSide === 'right' ? rect.left - 10 : rect.right + 10,
          y: containerRect ? containerRect.top : rect.top,
          width: containerRect ? containerRect.width : 320
        })
      }
    } else {
      setTooltip({ show: false, content: '', x: 0, y: 0 })
    }
  }

  const scrollToIndex = (index: number) => {
    setTimeout(() => {
      if (index >= 0) {
        const selectedElement = document.querySelector(`[data-result-index="${index}"]`)
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    }, 0)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : prev
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : -1
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'PageDown':
        event.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = Math.min(prev + 10, searchResults.length - 1)
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'PageUp':
        event.preventDefault()
        setSelectedIndex(prev => {
          const newIndex = Math.max(prev - 10, -1)
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'Home':
        event.preventDefault()
        setSelectedIndex(() => {
          const newIndex = searchResults.length > 0 ? 0 : -1
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'End':
        event.preventDefault()
        setSelectedIndex(() => {
          const newIndex = searchResults.length > 0 ? searchResults.length - 1 : -1
          showTooltipForIndex(newIndex)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleEventSelect(searchResults[selectedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        if (tooltip.show) {
          setTooltip({ show: false, content: '', x: 0, y: 0 })
        } else {
          setShowResults(false)
          setSelectedIndex(-1)
          setHoveredIndex(-1)
        }
        break
    }
  }

  const handleEventSelect = (event: MiddleEarthEvent) => {
    const { year: eventYear, calendar: eventCalendar } = EventsService.getEventDate(event)
    onYearChange(eventYear.toString())
    onCalendarChange(eventCalendar)
    onSelectedEventNameChange(event.name)

    // Parse month and day from date if available (format: 3A-2018-03-25)
    const dateParts = event.date.split('-')
    if (dateParts.length >= 3) {
      const month = parseInt(dateParts[2])
      onMonthChange(month.toString())
    } else {
      onMonthChange('')
    }

    if (dateParts.length >= 4) {
      const day = parseInt(dateParts[3])
      onDayChange(day.toString())
    } else {
      onDayChange('')
    }

    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(-1)
    setHoveredIndex(-1)
    setTooltip({ show: false, content: '', x: 0, y: 0 })
  }

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    showTooltipForIndex(index, 'mouse')
  }

  const handleMouseLeave = () => {
    setHoveredIndex(-1)
    setTooltip({ show: false, content: '', x: 0, y: 0 })
  }

  const handleYearInput = (value: string, onChange: (value: string) => void, calendar: CalendarSystem) => {
    // Only allow digits and empty string
    if (value === '' || /^\d+$/.test(value)) {
      // If there's a value, check if it's within the valid range for this calendar
      if (value !== '') {
        const numValue = parseInt(value)
        const boundaries = AGE_BOUNDARIES[calendar]
        if (boundaries && numValue >= boundaries.first && numValue <= boundaries.last) {
          onChange(value)
        } else if (boundaries && numValue < boundaries.first) {
          // Allow partial typing for valid ranges (e.g., typing "30" when going to "3019")
          const valueStr = value
          const boundaryStr = boundaries.first.toString()
          if (boundaryStr.startsWith(valueStr) || numValue < boundaries.last) {
            onChange(value)
          }
        }
      } else {
        onChange(value)
      }
    }
  }

  const handleMonthInput = (value: string, onChange: (value: string) => void) => {
    // Only allow digits, empty string, and values 1-12
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 12)) {
      onChange(value)
    }
  }

  const handleDayInput = (value: string, onChange: (value: string) => void, month?: string) => {
    // Only allow digits, empty string, and values 1-31 (or month-specific max)
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value)
      let maxDay = 31
      
      if (month && month !== '') {
        const monthNum = parseInt(month)
        if (monthNum >= 1 && monthNum <= 12) {
          const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
          maxDay = daysInMonth[monthNum - 1]
        }
      }
      
      if (value === '' || (numValue >= 1 && numValue <= maxDay)) {
        onChange(value)
      }
    }
  }

  const handleLetterInput = (value: string, onChange: (value: string) => void) => {
    // Only allow basic letters (a-zA-Z) and spaces in frontend
    if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
      onChange(value)
    }
  }
  const inputStyle = {
    padding: 'var(--input-padding)',
    border: '1px solid var(--border-input)',
    borderRadius: 'var(--radius-small)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 'var(--font-base)',
    height: 'var(--input-height)',
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{
      padding: 'var(--event-box-padding)',
      backgroundColor: 'var(--bg-event-box)',
      borderRadius: 'var(--radius-medium)',
      border: '1px solid var(--border-event-box)',
      position: 'relative',
      flex: '0 0 var(--event-box-width)',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ marginBottom: '1rem', color: titleColor }}>{title}</h3>

      {/* Selected Event Display */}
      {selectedEventName && (
        <div style={{
          marginBottom: '1rem',
          padding: 'var(--input-padding)',
          backgroundColor: 'var(--bg-input)',
          borderRadius: 'var(--radius-small)',
          border: '2px solid var(--text-accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            color: 'var(--text-accent)',
            fontSize: 'var(--font-base)',
            fontWeight: 'bold',
            wordBreak: 'break-word',
            flex: 1
          }}>
            {selectedEventName}
          </div>
          <button
            onClick={() => onSelectedEventNameChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--font-base)',
              padding: '0.25rem',
              lineHeight: 1,
              flexShrink: 0
            }}
            title="Clear selection"
            aria-label="Clear selected event"
          >
            ×
          </button>
        </div>
      )}

      {/* Search Bar */}
      <label htmlFor={`${idPrefix}-search`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>Search:</label>
      <input
        id={`${idPrefix}-search`}
        type="text"
        value={searchQuery}
        onChange={(e) => handleLetterInput(e.target.value, setSearchQuery)}
        onKeyDown={handleKeyDown}
        placeholder="ring sauron, fingolfin, orome quendi..."
        className="search-input"
        style={{
          ...inputStyle,
          width: 'var(--input-width)',
          marginBottom: '1rem'
        }}
      />
      
      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="search-results" style={{
          position: 'absolute',
          top: '-10rem',
          height: '40vh',
          maxHeight: '30rem',
          ...(searchResultsSide === 'left' ? { right: 'calc(100% + var(--gap-between-boxes))' } : { left: 'calc(100% + var(--gap-between-boxes))' }),
          width: 'calc(50vw - 4rem)',
          backgroundColor: 'var(--bg-search-results)',
          border: '1px solid var(--border-input)',
          borderRadius: 'var(--radius-medium)',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.5)'
        }}>
          <div style={{
            padding: 'var(--input-padding)',
            borderBottom: '1px solid var(--border-main)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-small)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Select Event ({searchResults.length} found)
          </div>
          {searchResults.map((event, index) => (
            <div
              key={index}
              data-result-index={index}
              onClick={() => handleEventSelect(event)}
              style={{
                padding: 'var(--input-padding)',
                borderBottom: index < searchResults.length - 1 ? '1px solid var(--border-main)' : 'none',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#3a3a4a' : (index === hoveredIndex ? 'var(--bg-event-box)' : 'var(--bg-search-results)')
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <div style={{ color: 'var(--text-accent)', fontSize: 'var(--font-base)', fontWeight: 'bold' }}>
                {event.name}
              </div>
              <div className="description-text" style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-small)',
                marginTop: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {event.date} • {event.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div style={{
          position: 'fixed',
          ...(searchResultsSide === 'right'
            ? { right: `calc(100vw - ${tooltip.x}px)` }
            : { left: tooltip.x }),
          top: tooltip.y,
          width: tooltip.width || 'var(--event-box-width)',
          maxWidth: '90vw',
          backgroundColor: 'var(--bg-tooltip)',
          color: 'var(--text-primary)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-large)',
          border: '2px solid var(--border-tooltip)',
          boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.4)',
          zIndex: 1001,
          fontSize: 'var(--font-medium)',
          lineHeight: '1.6',
          pointerEvents: 'none',
          fontWeight: '400'
        }}>
          {tooltip.content}
        </div>
      )}

      {/* Manual Entry Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--field-vertical-gap)' }}>
        <div>
          <label htmlFor={`${idPrefix}-calendar`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>Calendar:</label>
          <select
            id={`${idPrefix}-calendar`}
            value={calendar}
            onChange={(e) => onCalendarChange(e.target.value as CalendarSystem)}
            style={{
              ...inputStyle,
              width: 'var(--input-width)',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace'
            }}
          >
            <option value={CalendarSystem.B1A}>B1A&nbsp;-&nbsp;Before First Age</option>
            <option value={CalendarSystem.AT1}>1AT&nbsp;-&nbsp;First Age Trees</option>
            <option value={CalendarSystem.AS1}>1AS&nbsp;-&nbsp;First Age Sun</option>
            <option value={CalendarSystem.A2}>2A&nbsp;&nbsp;-&nbsp;Second Age</option>
            <option value={CalendarSystem.A3}>3A&nbsp;&nbsp;-&nbsp;Third Age</option>
            <option value={CalendarSystem.A4}>4A&nbsp;&nbsp;-&nbsp;Fourth Age</option>
            <option value={CalendarSystem.AA}>AA&nbsp;&nbsp;-&nbsp;Anno Arda</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-year`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>Year:</label>
          <input
            id={`${idPrefix}-year`}
            type="text"
            value={year}
            onChange={(e) => handleYearInput(e.target.value, onYearChange, calendar)}
            style={{
              ...inputStyle,
              width: 'var(--input-width)'
            }}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-month`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>Month:</label>
          <input
            id={`${idPrefix}-month`}
            type="text"
            value={month}
            onChange={(e) => handleMonthInput(e.target.value, onMonthChange)}
            style={{
              ...inputStyle,
              width: 'var(--input-width)'
            }}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-day`} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>Day:</label>
          <input
            id={`${idPrefix}-day`}
            type="text"
            value={day}
            onChange={(e) => handleDayInput(e.target.value, onDayChange, month)}
            style={{
              ...inputStyle,
              width: 'var(--input-width)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [state, setState] = useState<CalculationState>({
    startYear: '',
    startMonth: '',
    startDay: '',
    startCalendar: CalendarSystem.A3,
    startEventName: '',
    endYear: '',
    endMonth: '',
    endDay: '',
    endCalendar: CalendarSystem.A3,
    endEventName: '',
    results: null,
    errors: []
  })

  const calculateDetailedDuration = useCallback((totalDays: number) => {
    const absDays = Math.abs(totalDays)
    
    // Use consistent 365-day years and 30-day months for display
    const years = Math.floor(absDays / 365)
    const remainingDaysAfterYears = absDays % 365
    const months = Math.floor(remainingDaysAfterYears / 30)
    const days = remainingDaysAfterYears % 30
    
    return { years, months, days }
  }, [])

  const formatDurationDescription = useCallback((years: number, months: number, days: number, isNegative: boolean, startDate: CalendarDate, endDate: CalendarDate) => {
    const totalMonths = years * 12 + months
    const totalDays = years * 365 + months * 30 + days
    const parts: string[] = []

    // Determine precision based on input dates
    const startHasMonth = startDate.month !== undefined
    const startHasDay = startDate.day !== undefined
    const endHasMonth = endDate.month !== undefined
    const endHasDay = endDate.day !== undefined
    
    // Show precision based on what both dates have
    const showMonths = startHasMonth && endHasMonth
    const showDays = startHasDay && endHasDay && showMonths

    // If less than a month (30 days) and showing days, only show days
    if (totalDays < 30 && showDays) {
      parts.push(`${totalDays} day${totalDays !== 1 ? 's' : ''}`)
    } else {
      // Always show years if present
      if (years > 0) {
        parts.push(`${years} year${years !== 1 ? 's' : ''}`)
      }
      
      // Show months only if both dates have month precision
      if (showMonths && years < 12 && months > 0) {
        parts.push(`${months} month${months !== 1 ? 's' : ''}`)
      }
      
      // Show days only if both dates have day precision
      if (showDays && totalMonths < 31 && days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`)
      }
    }

    // Handle zero duration
    if (parts.length === 0) {
      if (showDays) {
        parts.push('0 days')
      } else if (showMonths) {
        parts.push('0 months')
      } else {
        parts.push('0 years')
      }
    }

    const description = parts.join(', ')
    return `${isNegative ? '-' : ''}${description}`
  }, [])

  const validateDateWithDetails = useCallback((date: CalendarDate, _module: any, dateType: string) => {
    const boundaries = AGE_BOUNDARIES[date.calendar]
    if (!boundaries) {
      return { error: `${dateType} calendar system is not supported` }
    }

    // Check year range
    if (date.year < boundaries.first || date.year > boundaries.last) {
      return { error: `${dateType} year ${date.year} is invalid. ${date.calendar} years must be between ${boundaries.first} and ${boundaries.last}` }
    }

    // Check month if provided
    if (date.month !== undefined) {
      if (date.month < 1 || date.month > 12) {
        return { error: `${dateType} month ${date.month} is invalid. Month must be between 1 and 12` }
      }
    }

    // Check day if provided
    if (date.day !== undefined) {
      if (date.day < 1 || date.day > 31) {
        return { error: `${dateType} day ${date.day} is invalid. Day must be between 1 and 31` }
      }
      
      // More specific day validation based on month
      if (date.month !== undefined) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        const maxDay = daysInMonth[date.month - 1]
        if (date.day > maxDay) {
          return { error: `${dateType} day ${date.day} is invalid. Month ${date.month} has only ${maxDay} days` }
        }
      }
    }

    return { error: null }
  }, [])

  const calculateResults = useCallback(() => {
    try {
      // Validate start date
      const startYear = parseInt(state.startYear)
      if (!startYear || !Number.isInteger(startYear)) {
        setState(prev => ({ ...prev, errors: ['Please enter a valid start year'] }))
        return
      }

      // Validate end date
      const endYear = parseInt(state.endYear)
      if (!endYear || !Number.isInteger(endYear)) {
        setState(prev => ({ ...prev, errors: ['Please enter a valid end year'] }))
        return
      }

      const startDate: CalendarDate = {
        year: startYear,
        month: state.startMonth ? parseInt(state.startMonth) : undefined,
        day: state.startDay ? parseInt(state.startDay) : undefined,
        calendar: state.startCalendar
      }

      const endDate: CalendarDate = {
        year: endYear,
        month: state.endMonth ? parseInt(state.endMonth) : undefined,
        day: state.endDay ? parseInt(state.endDay) : undefined,
        calendar: state.endCalendar
      }

      // Validate dates with specific error messages
      const startModule = getCalendarModule(state.startCalendar)
      const endModule = getCalendarModule(state.endCalendar)

      const startValidation = validateDateWithDetails(startDate, startModule, 'Start')
      if (startValidation.error) {
        setState(prev => ({ ...prev, errors: [startValidation.error] }))
        return
      }

      const endValidation = validateDateWithDetails(endDate, endModule, 'End')
      if (endValidation.error) {
        setState(prev => ({ ...prev, errors: [endValidation.error] }))
        return
      }

      // Convert to AA and calculate duration in days
      const startAA = AnnoArdaService.toAA(startDate)
      const endAA = AnnoArdaService.toAA(endDate)
      const totalDays = AnnoArdaService.calculateDurationInDays(startDate, endDate)
      const detailedDuration = calculateDetailedDuration(totalDays)
      const isNegative = totalDays < 0
      
      // Check if we should show Valian years
      const showValianYears = AnnoArdaService.isValianCalendar(startDate.calendar) ||
                             AnnoArdaService.isValianCalendar(endDate.calendar) ||
                             AnnoArdaService.spansValianEra(startDate, endDate)

      const valianYears = showValianYears
        ? AnnoArdaService.getDurationInValianYears(startDate, endDate)
        : undefined

      const result: CalculationResult = {
        startDate,
        endDate,
        startFormatted: startModule.formatDate(startDate),
        endFormatted: endModule.formatDate(endDate),
        startAA,
        endAA,
        duration: {
          years: detailedDuration.years,
          months: detailedDuration.months,
          days: detailedDuration.days,
          totalDays: Math.abs(totalDays),
          description: formatDurationDescription(detailedDuration.years, detailedDuration.months, detailedDuration.days, isNegative, startDate, endDate)
        },
        conversions: {
          start: [],
          end: []
        },
        valianYears,
        showValianYears
      }

      setState(prev => ({ ...prev, results: result, errors: [] }))
    } catch (error) {
      setState(prev => ({ ...prev, errors: ['Calculation failed: ' + (error as Error).message] }))
    }
  }, [state.startYear, state.startMonth, state.startDay, state.startCalendar, 
      state.endYear, state.endMonth, state.endDay, state.endCalendar, validateDateWithDetails, 
      calculateDetailedDuration, formatDurationDescription])

  useEffect(() => {
    // Auto-calculate whenever inputs change
    if (state.startYear && state.endYear) {
      calculateResults()
    } else {
      // Clear results if either year is empty
      setState(prev => ({ ...prev, results: null, errors: [] }))
    }
  }, [calculateResults, state.startYear, state.endYear])
  
  return (
    <div style={{ padding: '2rem', maxWidth: 'min(87.5rem, 95vw)', margin: '0 auto', backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '100%',
          height: '20vh',
          minHeight: '200px',
          maxHeight: '300px',
          marginBottom: '2rem',
          backgroundImage: `url(${import.meta.env.BASE_URL}anno-arda-v00.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 'var(--radius-medium)'
        }} />
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Estimate Time Between Middle-earth Events
        </p>
      </header>

      <main>
        <div style={{
          backgroundColor: 'var(--bg-main-container)',
          padding: 'var(--main-container-padding)',
          borderRadius: 'var(--radius-medium)',
          boxShadow: '0 0.125rem 0.625rem rgba(0,0,0,0.3)',
          border: '1px solid var(--border-main)',
          maxWidth: 'var(--main-container-width)',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-between-boxes)', justifyContent: 'center', alignItems: 'flex-start' }}>
            <EventInput
              title="Start"
              titleColor="#3a9d6a"
              year={state.startYear}
              month={state.startMonth}
              day={state.startDay}
              calendar={state.startCalendar}
              selectedEventName={state.startEventName}
              onYearChange={(value) => setState(prev => ({ ...prev, startYear: value }))}
              onMonthChange={(value) => setState(prev => ({ ...prev, startMonth: value }))}
              onDayChange={(value) => setState(prev => ({ ...prev, startDay: value }))}
              onCalendarChange={(value) => setState(prev => ({ ...prev, startCalendar: value }))}
              onSelectedEventNameChange={(value) => setState(prev => ({ ...prev, startEventName: value }))}
              searchResultsSide="right"
              idPrefix="start"
            />

            <EventInput
              title="End"
              titleColor="#3a9d6a"
              year={state.endYear}
              month={state.endMonth}
              day={state.endDay}
              calendar={state.endCalendar}
              selectedEventName={state.endEventName}
              onYearChange={(value) => setState(prev => ({ ...prev, endYear: value }))}
              onMonthChange={(value) => setState(prev => ({ ...prev, endMonth: value }))}
              onDayChange={(value) => setState(prev => ({ ...prev, endDay: value }))}
              onCalendarChange={(value) => setState(prev => ({ ...prev, endCalendar: value }))}
              onSelectedEventNameChange={(value) => setState(prev => ({ ...prev, endEventName: value }))}
              searchResultsSide="left"
              idPrefix="end"
            />
          </div>
          
          {state.errors.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--main-container-padding)', marginBottom: 'var(--main-container-padding)' }}>
              <div style={{
                backgroundColor: 'var(--bg-error-box)',
                color: 'var(--text-error)',
                padding: 'var(--main-container-padding)',
                borderRadius: 'var(--radius-small)',
                border: '1px solid var(--border-error)',
                width: 'var(--duration-width)',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                {state.errors.map((error, index) => (
                  <p key={index} style={{ margin: 0 }}>{error}</p>
                ))}
              </div>
            </div>
          )}

          {state.results && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--main-container-padding)' }}>
              {/* Duration Summary */}
              <div style={{
                backgroundColor: 'var(--bg-duration-box)',
                padding: '2rem',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--border-duration)',
                width: 'var(--duration-width)',
                maxWidth: '100%',
                boxSizing: 'border-box',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: 'var(--font-xxlarge)', margin: '0 0 1rem 0', color: 'var(--text-info)' }}>Duration</h3>
                <div style={{ fontSize: 'var(--font-huge)', fontWeight: 'bold', color: 'var(--text-info)', marginBottom: '0.5rem' }}>
                  {state.results.duration.description}
                </div>

                {/* Show Valian years if applicable */}
                {state.results.showValianYears && state.results.valianYears !== undefined && (
                  <div style={{ marginTop: '1rem', fontSize: 'var(--font-xlarge)', color: 'var(--text-valian)', fontStyle: 'italic' }}>
                    {state.results.valianYears.toFixed(1)} Valian years
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', fontSize: 'var(--font-large)', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {state.results.startFormatted} → {state.results.endFormatted}
                </div>
                <div style={{ marginTop: '1rem', fontSize: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
                  ({AnnoArdaService.formatAA(state.results.startAA)} → {AnnoArdaService.formatAA(state.results.endAA)})
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      
      <footer style={{
        textAlign: 'center',
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border-main)',
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-base)',
        lineHeight: '1.6'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0.5rem 0' }}>
            Event data sourced from{' '}
            <a
              href="https://www.ardapedia.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-info)',
                textDecoration: 'none',
                borderBottom: '1px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--text-info)'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              Ardapedia
            </a>
            {' '}• Licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--text-info)',
                textDecoration: 'none',
                borderBottom: '1px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--text-info)'}
              onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              CC BY-SA 3.0
            </a>
          </p>
        </div>
        <div style={{ fontSize: 'var(--font-small)', color: 'var(--text-tertiary)' }}>
          <p style={{ margin: '0.25rem 0' }}>
            Built with admiration and respect for J.R.R. Tolkien's Middle-earth chronology
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App