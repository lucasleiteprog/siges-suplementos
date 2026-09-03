import { PatientRegistrationForm } from './components/PatientRegistration/PatientRegistrationForm'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Sistema de Gestão de Suplementos (SIGES)
        </h1>
      </header>
      <main>
        <PatientRegistrationForm />
      </main>
    </div>
  )
}

export default App
