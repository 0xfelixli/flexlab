import { useEffect } from 'react'
import { AppShell } from './components/Layout/AppShell'
import { FlowList } from './components/FlowList/FlowList'
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
      detailPanel={
        <div className="flex items-center justify-center h-full text-gray-600 text-xs">
          Detail Panel — coming soon
        </div>
      }
    />
  )
}
