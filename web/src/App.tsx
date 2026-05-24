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
          <div className="flex flex-col h-screen">
            <Navbar />
            <main className="flex-1 flex items-center justify-center w-full bg-blue-200">
              <SymbolsDashboard />
              {/* <SymbolDetailView /> */}
            </main>
          </div >
        }
      </div>
    </TooltipProvider>
  )
}

export default App