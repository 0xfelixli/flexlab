import { create } from 'zustand'
import { setIntercept } from '../api/flows'

interface UiState {
  interceptEnabled: boolean
  toggleIntercept: () => void
}

export const useUiStore = create<UiState>()((set, get) => ({
  interceptEnabled: false,

  toggleIntercept: () => {
    const next = !get().interceptEnabled
    set({ interceptEnabled: next })
    setIntercept(next ? '~all' : '').catch(() => {
      // Revert if API call fails
      set({ interceptEnabled: !next })
    })
  },
}))
