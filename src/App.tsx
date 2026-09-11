import { useState, useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { DesignSystemLayout } from './design-system/DesignSystemLayout'
import { SharedConnectorsDemo } from './components/organisms/SharedConnectorsDemo'
import { BaristaProvider } from './state/BaristaContext'

// 'sharing' is an ISOLATED review route (#/sharing-demo) for the connector
// sharing-model comparison. It does not touch the production connectors flow.
type Page = 'home' | 'ds' | 'sharing'

function getPage(): Page {
  const hash = window.location.hash
  if (hash.startsWith('#/design-system')) return 'ds'
  if (hash.startsWith('#/sharing-demo')) return 'sharing'
  return 'home'
}

function App() {
  const [page, setPage] = useState<Page>(getPage)

  useEffect(() => {
    const handleHash = () => setPage(getPage())
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  if (page === 'ds') return <DesignSystemLayout />
  if (page === 'sharing') return <SharedConnectorsDemo />
  return (
    <BaristaProvider>
      <HomePage />
    </BaristaProvider>
  )
}

export default App
