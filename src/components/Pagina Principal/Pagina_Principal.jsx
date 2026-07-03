import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Pagina_Principal.css";
function Pagina_Principal() {
  const navigate = useNavigate();

  const opciones = [
    { label: "Transferencia", ruta: "/transferencia" },
    { label: "Grupos y Auxiliares", ruta: "/grupo-contable" },
    { label: "Oficinas", ruta: "/oficina" },
    { label: "Administracion De Recursos", ruta: "/admin-recursos" },
    { label: "Administracion", ruta: "/administracion" },
    { label: "Entidades", ruta: "/identidades" },
    { label: "Activos Fijos", ruta: "/administracion-unidad" },
    { label: "Unidad Administrativa", ruta: "/unidad-administrativa" },
  ];

  return (
    <div className="principal">
      <header className="header">
        <h3>SISTEMA DE ACTIVOS FIJOS</h3>
        <nav className="nav">
          <img
            src="https://www.flagsonline.it/uploads/2016-9-2/420-272/bolivia%20stato.jpg"
            alt="Bandera de Bolivia"
          />
          <div>
            <h1>VS.I.A.F</h1>
            <p>sistema de activos fijos</p>
          </div>
        </nav>
      </header>

      <main className="Contenido">
        <div className="contenido-button">
          <h2 className="titulo">MENU PRINCIPAL</h2>
          {opciones.map((op) => (
            <button key={op.ruta} onClick={() => navigate(op.ruta)}>
              {op.label}
            </button>
          ))}
        </div>

        <div className="administrativo">
          <div className="Administrativo-datos">
            <div className="datos1">
              <h3>Entidad:</h3>
              <p>0</p>
            </div>
            <div className="dato2">
              <h3>Unidad:</h3>
              <p></p>
            </div>
          </div>
          <div className="imagen-casa">
            <img
              src="/bugcitos.jpeg"
              style={{ opacity: 0.4 }}
              alt=""
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Pagina_Principal;