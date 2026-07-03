import { useState, useEffect } from "react";
import "./Unidad Administrativa.css";

// Ajusta esta URL a tu endpoint real del backend
const API_URL = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com/api/unidad-administrativa";

function UnidadAdministrativa() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);

  const [form, setForm] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    estado: "",
  });

  const [popup, setPopup] = useState({ visible: false, mensaje: "" });
  const [popupEliminar, setPopupEliminar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Cargar registros al montar el componente
  useEffect(() => {
    cargarTabla();
  }, []);

  async function cargarTabla() {
    setCargando(true);
    setError(null);
    setIdSeleccionado(null);

    try {
      const resp = await fetch(API_URL, { headers: { Accept: "application/json" } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const lista = await resp.json();
      setRegistros(lista);
    } catch (err) {
      console.error("Error cargarTabla:", err);
      setError("Error al cargar datos");
    } finally {
      setCargando(false);
    }
  }

  function seleccionarFila(item) {
    setIdSeleccionado(item.id);
  }

  function editarFila(item) {
    setIdSeleccionado(item.id);
    setEditando(true);
    setForm({
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      estado: item.estado,
    });
  }

  function cancelarEdicion() {
    setEditando(false);
    setForm({ id: "", nombre: "", descripcion: "", estado: "" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function guardarRegistro() {
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    const esEdicion = editando && !!form.id;
    const cuerpo = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado.trim(),
    };

    const url = esEdicion ? `${API_URL}/${form.id}` : API_URL;
    const metodo = esEdicion ? "PUT" : "POST";

    try {
      setGuardando(true);
      const resp = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(cuerpo),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      await cargarTabla();
      cancelarEdicion();
      mostrarPopup(
        esEdicion ? "Registro actualizado correctamente." : "Los datos fueron ingresados correctamente."
      );
    } catch (err) {
      console.error("Error guardar:", err);
      alert("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  function pedirEliminar(id) {
    setIdSeleccionado(id);
    setPopupEliminar(true);
  }

  async function confirmarEliminar() {
    try {
      setEliminando(true);
      const resp = await fetch(`${API_URL}/${idSeleccionado}`, { method: "DELETE" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      setPopupEliminar(false);
      await cargarTabla();
      mostrarPopup("Registro eliminado correctamente.");
    } catch (err) {
      console.error("Error eliminar:", err);
      alert("No se pudo eliminar. Intenta de nuevo.");
    } finally {
      setEliminando(false);
    }
  }

  function mostrarPopup(mensaje) {
    setPopup({ visible: true, mensaje });
  }

  function cerrarPopup() {
    setPopup({ visible: false, mensaje: "" });
  }

  function handleSalir() {
    if (window.confirm("¿Está seguro de que desea salir?")) {
      window.history.back();
    }
  }

  return (
    <div className="container">
      <div className="top-bar">Unidad Administrativa</div>
      <header>UNIDAD ADMINISTRATIVA</header>

      <div className="formulario">
        <div className="fila">
          <label>ID:</label>
          <input type="text" value={form.id} placeholder="(automático)" disabled />
        </div>
        <div className="fila">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Oficina Administrativa"
          />
        </div>
        <div className="fila">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Ej: Área principal"
          />
        </div>
        <div className="fila">
          <label>Estado:</label>
          <input
            type="text"
            name="estado"
            value={form.estado}
            onChange={handleChange}
            placeholder="Ej: Activo"
          />
        </div>

        <div className="botones">
          {!editando && (
            <button className="btn" onClick={guardarRegistro} disabled={guardando}>
              {guardando ? "Guardando..." : "Grabar"}
            </button>
          )}

          {editando && (
            <>
              <button
                className="btn"
                style={{ background: "linear-gradient(#b87d0f, #e6a817)" }}
                onClick={guardarRegistro}
                disabled={guardando}
              >
                {guardando ? "Actualizando..." : "Actualizar"}
              </button>
              <button
                className="btn"
                style={{ background: "linear-gradient(#555, #888)" }}
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            </>
          )}

          <button className="salir" onClick={handleSalir}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <h3 style={{ color: "#2e5c8a", marginBottom: "10px" }}>Registros</h3>
        <table id="tablaOficinas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && error && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            )}

            {!cargando && !error && registros.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#888" }}>
                  Sin registros
                </td>
              </tr>
            )}

            {!cargando &&
              !error &&
              registros.map((item) => (
                <tr
                  key={item.id}
                  className={idSeleccionado === item.id ? "seleccionado" : ""}
                  onClick={() => seleccionarFila(item)}
                >
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.descripcion}</td>
                  <td>{item.estado}</td>
                  <td>
                    <button className="btn" onClick={() => editarFila(item)}>
                      Editar
                    </button>{" "}
                    <button
                      className="btn"
                      style={{ background: "linear-gradient(#a83232, #d94b4b)" }}
                      onClick={() => pedirEliminar(item.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Popup de éxito */}
      {popup.visible && (
        <div id="popup" className="popup">
          <div className="ventana">
            <div className="barra">
              WSIAF <span className="cerrar" onClick={cerrarPopup}>X</span>
            </div>
            <p>{popup.mensaje}</p>
            <a href="#" className="aceptar" onClick={(e) => { e.preventDefault(); cerrarPopup(); }}>
              Aceptar
            </a>
          </div>
        </div>
      )}

      
      {popupEliminar && (
        <div id="popupEliminar" className="popup">
          <div className="ventana">
            <div className="barra">
              WSIAF <span className="cerrar" onClick={() => setPopupEliminar(false)}>X</span>
            </div>
            <p>¿Está seguro de que desea eliminar este registro?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
              <button className="btn" onClick={confirmarEliminar} disabled={eliminando}>
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <a
                href="#"
                className="aceptar"
                onClick={(e) => { e.preventDefault(); setPopupEliminar(false); }}
              >
                Cancelar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnidadAdministrativa;