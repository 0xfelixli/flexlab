import { describe, it, expect, beforeEach } from 'bun:test'
import { useUiStore } from './uiStore'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ interceptEnabled: false, repeaterTabs: [], activeRepeaterId: null })
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

describe('repeater tabs', () => {
  beforeEach(() => {
    useUiStore.setState({ interceptEnabled: false, repeaterTabs: [], activeRepeaterId: null })
  })

  it('openRepeaterTab adds a tab and sets it active', () => {
    useUiStore.getState().openRepeaterTab('dup-1', 'GET /api')
    const { repeaterTabs, activeRepeaterId } = useUiStore.getState()
    expect(repeaterTabs).toHaveLength(1)
    expect(repeaterTabs[0].flowId).toBe('dup-1')
    expect(repeaterTabs[0].label).toBe('GET /api')
    expect(activeRepeaterId).toBe('dup-1')
  })

  it('openRepeaterTab focuses existing tab instead of duplicating', () => {
    useUiStore.getState().openRepeaterTab('dup-1', 'GET /api')
    useUiStore.getState().openRepeaterTab('dup-1', 'GET /api')
    expect(useUiStore.getState().repeaterTabs).toHaveLength(1)
  })

  it('closeRepeaterTab removes the tab', () => {
    useUiStore.getState().openRepeaterTab('dup-1', 'GET /api')
    useUiStore.getState().closeRepeaterTab('dup-1')
    expect(useUiStore.getState().repeaterTabs).toHaveLength(0)
    expect(useUiStore.getState().activeRepeaterId).toBeNull()
  })
})
