import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from './components/Home';
import NotFound from './components/NotFound';
import ClientList from './components/ClientList';
import ClientDetails from './components/ClientDetails';
import AddClient from './components/AddClient';
import EditClient from './components/EditClient';
import CreditApplicationsList from './components/CreditApplicationsList';
import EvaluateCreditApplication from './components/EvaluateCreditApplication';
import CreateCreditApplication from './components/AddCreditApplication';
import EditCreditApplication from './components/EditCreditApplication';
import CreditApplicationApproval from './components/CreditApplicationApproval';
import CreditApplicationDetails from './components/CreditApplicationDetails';
import CreditSimulation from './components/CreditSimulation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          
          {/* Rutas para Clientes */}
          <Route path="/clients" element={<ClientList />} />
          <Route path="/client/:id" element={<ClientDetails />} />
          <Route path="/client/add" element={<AddClient />} />
          <Route path="/client/edit/:id" element={<EditClient />} />

          {/* Rutas para Credit Applications */}
          <Route path="/creditApplications" element={<CreditApplicationsList />} />
          <Route path="/creditApplication/evaluation/:id" element={<EvaluateCreditApplication/>} />
          <Route path="/creditApplication/add" element={<CreateCreditApplication />} />
          <Route path="/creditApplication/:id" element={<CreditApplicationDetails />} /> 
          <Route path="/creditApplication/edit/:id" element={<EditCreditApplication />} />
          <Route path="/creditApplication/finalApproval/:id" element={<CreditApplicationApproval />} />

          {/* Rutas para Simulación de crédito */}
          <Route path="/simulate" element={<CreditSimulation />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
