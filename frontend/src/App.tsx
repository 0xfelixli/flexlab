import { useEffect } from 'react'
import { AppShell } from './components/Layout/AppShell'
import { FlowList } from './components/FlowList/FlowList'
import { DetailPanel } from './components/FlowDetail/DetailPanel'
import { useFlowStore } from './stores/flowStore'
import { clearFlows } from './api/flows'

export default function App() {
  const init = useFlowStore((s) => s.init)

  useEffect(() => {
    return init()
  }, [init])

  const handleClear = async () => {
    await clearFlows()
    useFlowStore.getState().setFlows([])
  }

  return (
    <AppShell
      onClear={handleClear}
      listPanel={<FlowList />}
      detailPanel={<DetailPanel />}
    />
  )
}
