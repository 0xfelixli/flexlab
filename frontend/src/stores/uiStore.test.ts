import { describe, it, expect, beforeEach } from 'bun:test'
import { useUiStore } from './uiStore'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ interceptEnabled: false })
  })

  it('starts with intercept disabled', () => {
    expect(useUiStore.getState().interceptEnabled).toBe(false)
  })

  it('toggleIntercept flips the flag', () => {
    useUiStore.getState().toggleIntercept()
    expect(useUiStore.getState().interceptEnabled).toBe(true)
  })

  it('toggleIntercept toggles back', () => {
    useUiStore.setState({ interceptEnabled: true })
    useUiStore.getState().toggleIntercept()
    expect(useUiStore.getState().interceptEnabled).toBe(false)
  })
})
