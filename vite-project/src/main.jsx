javascriptreact
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Administracion from "./components/Administracion/Administracion.jsx";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Administracion/>
  </StrictMode>,
)
