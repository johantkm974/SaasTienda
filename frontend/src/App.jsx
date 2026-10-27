import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register.jsx';
import { LayoutDashboard }from './layouts/LayoutDashboard';

import './App.css'
import { ProtectedRouter } from './components/ProtectedRouter.jsx';
import { Envios } from './layouts/Envios.jsx';
import { Ajustes } from './layouts/Ajustes.jsx';
import { Ventas } from './layouts/Ventas.jsx';
import { Inventario } from './layouts/Inventario.jsx';
import { Compras } from './layouts/Compras.jsx';
import { Reportes } from './layouts/Reportes.jsx';
import { TiendaOnline } from './layouts/TiendaOnline.jsx';
import { Contactos } from './layouts/Contactos.jsx';
import { PublicLayout } from './components/public/PublicLayout.jsx';
import { HomePublic } from './pages/public/HomePublic.jsx';
import { ProductosPublic } from './pages/public/ProductosPublic.jsx';
import { NosotrosPublic } from './pages/public/NosotrosPublic.jsx';
import { ContactanosPublic } from './pages/public/ContactanosPublic.jsx';
import { TiendaVitrina } from './pages/TiendaVitrina.jsx';
import { getToken, isTokenExpired } from './api';

function AuthRedirect({ to }) {
  if (getToken() && !isTokenExpired()) {
    return <Navigate to="/dashboard" replace />;
  }
  return to;
}

function PublicRoute() {
  const { empresaId } = useParams();
  return <PublicLayout key={empresaId} />;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/t/:empresaId" element={<PublicRoute />}>
          <Route index element={<HomePublic />} />
          <Route path="productos" element={<ProductosPublic />} />
          <Route path="nosotros" element={<NosotrosPublic />} />
          <Route path="contactanos" element={<ContactanosPublic />} />
          <Route path="tienda" element={<TiendaVitrina />} />
        </Route>
        <Route path="/login" element={<AuthRedirect to={<Login />} />} />
        <Route path="/register" element={<AuthRedirect to={<Register />} />} />
        <Route element={<ProtectedRouter/>}>
          <Route path="/dashboard" element={<LayoutDashboard />}>
            <Route index element={<Dashboard />} />
            <Route path='ventas' element={<Ventas />} />
            <Route path='envios' element={<Envios />} />
            <Route path='inventario' element={<Inventario />} />
            <Route path='compras' element={<Compras />} />
            <Route path='reportes' element={<Reportes />} />
            <Route path='tienda' element={<TiendaOnline />} />
            <Route path='ajustes' element={<Ajustes />} />
            <Route path='contactos' element={<Contactos />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
