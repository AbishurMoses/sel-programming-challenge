import './App.css'
import AuthenticationForm from './components/AuthenticationForm'
import Navbar from './components/Navbar'
import SymbolDetailView from './components/SymbolDetailView'
import SymbolsDashboard from './components/SymbolsDashboard'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  const isAuthenticated = true;
  return (
    <TooltipProvider>
      <div>
        {!isAuthenticated &&
          <div className="flex flex-col items-center justify-center w-screen h-screen">
            <AuthenticationForm />
          </div>
        }
        {isAuthenticated &&
          <div className="flex flex-col">
            <Navbar />
            <SymbolsDashboard />
            <SymbolDetailView />
          </div >
        }
      </div>
    </TooltipProvider>
  )
}

export default App