import './App.css'
import AuthenticationForm from './components/AuthenticationForm'
import SymbolDetailView from './components/SymbolDetailView'
import UserMenu from './components/UserMenu'

function App() {
  return (
    <div>
      <p className='font-bold text-2xl'>Hello Dashboard</p>
      <AuthenticationForm />
      <UserMenu />
      <SymbolDetailView />
    </div>
  )
}

export default App