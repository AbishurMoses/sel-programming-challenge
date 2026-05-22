import './App.css'
import AuthenticationForm from './components/AuthenticationForm'
import SymbolDetailView from './components/SymbolDetailView'
import SymbolsDashboard  from './components/SymbolsDashboard'
import UserMenu from './components/UserMenu'

function App() {
  return (
    <div className="flex flex-col">
      <AuthenticationForm />
      <UserMenu />
      <SymbolDetailView />
      <SymbolsDashboard />
    </div>
  )
}

export default App