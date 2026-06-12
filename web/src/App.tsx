import { useState } from 'react'
import AuthenticationForm from './components/AuthenticationForm'
import Navbar from './components/Navbar'
import SymbolDetailView from './components/SymbolDetailView'
import SymbolsDashboard from './components/SymbolsDashboard'
import { Dialog, DialogContent } from './components/ui/dialog'
import { TooltipProvider } from './components/ui/tooltip'
import { apiService } from './services/apiService'
import { SymbolPollingProvider } from './context/SymbolPollingContext'
import UserMenu from './components/UserMenu'
import ConnectionStatus from './components/ConnectionStatus'
import { Toaster } from './components/ui/sonner'
import { Stopwatch } from './components/Stopwatch'
import DebouncedSearch from './components/DebouncedSearch'
import SymbolWatch from './components/SymbolWatch'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isTokenValid())
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [watchedSymbols, setWatchedSymbols] = useState<string[]>([])

  apiService.onUnauthorized = () => {
    window.location.reload();
  };

  const addToWatch = (name: string) => {
    setWatchedSymbols(prev => prev.includes(name) ? prev : [...prev, name])
  }

  const removeFromWatch = (name: string) => {
    setWatchedSymbols(prev => prev.filter(exists => exists !== name))
  }
  return (
    <TooltipProvider>
      <div>
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center w-screen h-screen">
            <AuthenticationForm onSuccess={() => setIsAuthenticated(true)} />
          </div>
        ) : (
          <div className="flex flex-col h-screen">
            <SymbolPollingProvider>
              <Navbar />
              <main className="flex-1 flex flex-col min-[1060px]:flex-row gap-4 w-full px-4 pt-4">
                <aside className="flex flex-col gap-4 w-full min-[1060px]:w-80 min-[1060px]:shrink-0">
                  <Stopwatch />
                  <SymbolWatch watchedSymbols={watchedSymbols} removeFromWatch={removeFromWatch} />
                  <DebouncedSearch />
                  <ConnectionStatus />
                  <UserMenu />
                </aside>
                <div className="flex-1 min-w-0">
                  <SymbolsDashboard removeFromWatch={removeFromWatch} addToWatch={addToWatch} watchedSymbols={watchedSymbols} onSymbolClick={(name) => setSelectedSymbol(name)} />
                </div>

                <Dialog open={!!selectedSymbol} onOpenChange={(open) => !open && setSelectedSymbol(null)}>
                  <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedSymbol && <SymbolDetailView name={selectedSymbol} />}
                  </DialogContent>
                </Dialog>
              </main>
            </SymbolPollingProvider>
          </div>
        )}
      </div>
      <Toaster />
    </TooltipProvider>
  )
}

export default App