import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Administracion from "./components/Administracion/Administracion.jsx";
import UnidadAdministrativa from "./components/Unidad Administrativa/Unidad Administrativa.jsx";
import Oficina from './components/Oficina/Oficina.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Administracion/>
    <UnidadAdministrativa/>
    <Oficina/>
  </StrictMode>
)
