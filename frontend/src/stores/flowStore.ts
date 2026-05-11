import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { toFlowDetail } from '../api/transform'
import { fetchFlows } from '../api/flows'
import { createWsConnection } from '../api/ws'
import type { FlowDetail } from '../types/flow'
import type { WsEvent } from '../api/ws'

/** Pure function — apply a WebSocket event to the flows map. */
export function applyWsEvent(
  flows: Map<string, FlowDetail>,
  event: WsEvent,
): Map<string, FlowDetail> {
  switch (event.type) {
    case 'flows/add':
    case 'flows/update': {
      const next = new Map(flows)
      next.set(event.flow.id, toFlowDetail(event.flow))
      return next
    }
    case 'flows/reset':
      return new Map()
  }
}

interface FlowState {
  flows: Map<string, FlowDetail>
  selectedId: string | null
  selectFlow: (id: string | null) => void
  setFlows: (flows: FlowDetail[]) => void
  handleWsEvent: (event: WsEvent) => void
  /** Connect WebSocket + fetch initial flows. Returns cleanup fn. */
  init: () => () => void
}

export const useFlowStore = create<FlowState>()(
  subscribeWithSelector((set, get) => ({
    flows: new Map(),
    selectedId: null,

    selectFlow: (id) => set({ selectedId: id }),

    setFlows: (list) =>
      set({ flows: new Map(list.map((f) => [f.id, f])) }),

    handleWsEvent: (event) => {
      set((state) => ({ flows: applyWsEvent(state.flows, event) }))
      if (event.type === 'flows/reset') {
        fetchFlows()
          .then((mitmFlows) => get().setFlows(mitmFlows.map(toFlowDetail)))
          .catch(() => {/* mitmproxy not running yet — ignore */})
      }
    },

    init: () => {
      fetchFlows()
        .then((mitmFlows) => get().setFlows(mitmFlows.map(toFlowDetail)))
        .catch(() => {/* mitmproxy not running yet — ignore */})

      return createWsConnection(get().handleWsEvent)
    },
  })),
)
