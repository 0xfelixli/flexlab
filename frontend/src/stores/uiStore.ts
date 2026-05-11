import { create } from 'zustand'
import { setIntercept } from '../api/flows'

export interface RepeaterTab {
  flowId: string  // duplicate flow id
  label: string   // e.g. "GET /api/users"
}

interface UiState {
  interceptEnabled: boolean
  repeaterTabs: RepeaterTab[]
  activeRepeaterId: string | null
  toggleIntercept: () => void
  openRepeaterTab: (flowId: string, label: string) => void
  closeRepeaterTab: (flowId: string) => void
  setActiveRepeater: (flowId: string | null) => void
}

export const useUiStore = create<UiState>()((set, get) => ({
  interceptEnabled: false,
  repeaterTabs: [],
  activeRepeaterId: null,

  toggleIntercept: () => {
    const next = !get().interceptEnabled
    set({ interceptEnabled: next })
    setIntercept(next ? '~all' : '').catch(() => {
      set({ interceptEnabled: !next })
    })
  },

  openRepeaterTab: (flowId, label) => {
    const exists = get().repeaterTabs.some((t) => t.flowId === flowId)
    if (!exists) {
      set((s) => ({ repeaterTabs: [...s.repeaterTabs, { flowId, label }] }))
    }
    set({ activeRepeaterId: flowId })
  },

  closeRepeaterTab: (flowId) => {
    const tabs = get().repeaterTabs.filter((t) => t.flowId !== flowId)
    const activeId = get().activeRepeaterId === flowId
      ? (tabs[tabs.length - 1]?.flowId ?? null)
      : get().activeRepeaterId
    set({ repeaterTabs: tabs, activeRepeaterId: activeId })
  },

  setActiveRepeater: (flowId) => set({ activeRepeaterId: flowId ?? null }),
}))
