import { useState } from 'react'
import './App.css'
import AuthenticationForm from './components/AuthenticationForm'
import Navbar from './components/Navbar'
import SymbolDetailView from './components/SymbolDetailView'
import SymbolsDashboard from './components/SymbolsDashboard'
import { Dialog, DialogContent } from './components/ui/dialog'
import { TooltipProvider } from './components/ui/tooltip'
import { apiService } from './services/apiService'
import { SymbolPollingProvider } from './context/SymbolPollingContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isTokenValid())
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  apiService.onUnauthorized = () => {
    window.location.reload();
  };
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
              <main className="flex-1 flex items-center justify-center w-full px-4">

                <SymbolsDashboard onSymbolClick={() => setIsDialogOpen(true)} />

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="sm:max-w-3xl">
                    <SymbolDetailView />
                  </DialogContent>
                </Dialog>
              </main>
            </SymbolPollingProvider>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default App