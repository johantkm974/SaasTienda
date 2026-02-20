import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register.jsx';
import { LayoutDashboard }from './layouts/LayoutDashboard';

import './App.css'
import { ProtectedRouter } from './components/ProtectedRouter.jsx';
import { Ventas } from './layouts/Ventas.jsx';
import { Inventario } from './layouts/Inventario.jsx';
import { Compras } from './layouts/Compras.jsx';
import { Reportes } from './layouts/Reportes.jsx';
import { Ajustes } from './layouts/Ajustes.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRouter/>}>
          <Route path="/dashboard" element={<LayoutDashboard />}>
            <Route index element={<Dashboard />} />
            <Route path='ventas' element={<Ventas />} />
            <Route path='inventario' element={<Inventario />} />
            <Route path='compras' element={<Compras />} />
            <Route path='reportes' element={<Reportes />} />
            <Route path='ajustes' element={<Ajustes />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
