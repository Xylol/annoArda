// Setup file for Vitest
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Suppress deprecated ReactDOMTestUtils.act warning
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ReactDOMTestUtils.act is deprecated')
    ) {
      return
    }
    return originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})