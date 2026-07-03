import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Administracion from "./components/Administracion/Administracion.jsx";
import UnidadAdministrativa from './components/Unidad Administrativa/Unidad Administrativa.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Administracion/>
    <UnidadAdministrativa/>
    
  </StrictMode>,
)
