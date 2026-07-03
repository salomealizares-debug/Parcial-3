import { useState, useEffect, useCallback } from "react";
import "./Administracion.css";

const BASE = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com";

function Administracion() {
  const [oficinas, setOficinas] = useState([]);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [mensaje, setMensajeState] = useState({ texto: "Cargando datos...", tipo: "cargando" });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", estado: "ACTIVO" });

  const setMensaje = (texto, tipo) => setMensajeState({ texto, tipo });

  const cargarDatos = useCallback(async () => {
    setMensaje("Cargando datos...", "cargando");
    try {
      const res = await fetch(`${BASE}/api/oficina`);
      if (!res.ok) throw new Error("Error " + res.status);
      const datos = await res.json();
      setOficinas(datos);
      setMensaje("", "");
    } catch (e) {
      setMensaje("No se pudo conectar con el servidor.", "err");
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const seleccionar = (id) => {
    setSeleccionadoId(id);
  };

  const deseleccionar = () => {
    setSeleccionadoId(null);
  };

  const abrirModalNuevo = () => {
    setModoEditar(false);
    setForm({ nombre: "", descripcion: "", estado: "ACTIVO" });
    setModalAbierto(true);
  };

  const abrirModalEditar = async () => {
    if (!seleccionadoId) return;
    setModoEditar(true);
    try {
      const res = await fetch(`${BASE}/api/oficina/${seleccionadoId}`);
      const o = await res.json();
      setForm({
        nombre: o.nombre ?? "",
        descripcion: o.descripcion ?? "",
        estado: o.estado ?? "ACTIVO",
      });
      setModalAbierto(true);
    } catch {
      setMensaje("No se pudo cargar el registro.", "err");
    }
  };

  const cerrarModal = () => setModalAbierto(false);

  const guardar = async () => {
    const body = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado,
    };
    if (!body.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    const url = modoEditar
      ? `${BASE}/api/oficina/${seleccionadoId}`
      : `${BASE}/api/oficina`;
    const method = modoEditar ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error " + res.status);
      cerrarModal();
      deseleccionar();
      await cargarDatos();
      setMensaje(modoEditar ? "Registro actualizado." : "Registro creado.", "ok");
    } catch {
      setMensaje("Error al guardar. Revisá los datos.", "err");
    }
  };

  const eliminar = async () => {
    if (!seleccionadoId) return;
    if (!window.confirm(`¿Eliminar la oficina con ID ${seleccionadoId}?`)) return;
    try {
      const res = await fetch(`${BASE}/api/oficina/${seleccionadoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error " + res.status);
      deseleccionar();
      await cargarDatos();
      setMensaje("Registro eliminado.", "ok");
    } catch {
      setMensaje("No se pudo eliminar.", "err");
    }
  };

  const handleFormChange = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const colorMensaje = {
    cargando: "#666",
    err: "#c0392b",
    ok: "#1e8449",
    "": "transparent",
  }[mensaje.tipo];

  return (
    <div style={styles.contenedor}>
      <div style={styles.titulo}>ADMINISTRACIÓN UNIDAD ADMINISTRATIVA</div>

      {mensaje.texto && (
        <div style={{ ...styles.mensaje, color: colorMensaje }}>{mensaje.texto}</div>
      )}

      <table style={styles.tabla}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>NOMBRE</th>
            <th style={styles.th}>DESCRIPCIÓN</th>
            <th style={styles.th}>ESTADO</th>
          </tr>
        </thead>
        <tbody>
          {oficinas.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ ...styles.td, color: "#888" }}>
                Sin registros
              </td>
            </tr>
          ) : (
            oficinas.map((o) => (
              <tr
                key={o.id}
                onClick={() => seleccionar(o.id)}
                style={{
                  ...styles.tr,
                  ...(seleccionadoId === o.id ? styles.trSeleccionado : {}),
                }}
              >
                <td style={styles.td}>{o.id}</td>
                <td style={styles.td}>{o.nombre ?? ""}</td>
                <td style={styles.td}>{o.descripcion ?? ""}</td>
                <td style={styles.td}>{o.estado ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={styles.botones}>
        <button style={styles.boton} onClick={abrirModalNuevo}>
          Nuevo
        </button>
        <button
          style={{ ...styles.boton, ...(seleccionadoId ? {} : styles.botonDisabled) }}
          onClick={abrirModalEditar}
          disabled={!seleccionadoId}
        >
          Editar
        </button>
        <button
          style={{ ...styles.boton, ...(seleccionadoId ? {} : styles.botonDisabled) }}
          onClick={eliminar}
          disabled={!seleccionadoId}
        >
          Eliminar
        </button>
        <button style={styles.boton} onClick={deseleccionar}>
          Limpiar selección
        </button>
        <button style={styles.boton} onClick={cargarDatos}>
          Actualizar
        </button>
      </div>

      {modalAbierto && (
        <div
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalTitulo}>
              {modoEditar ? "EDITAR OFICINA" : "NUEVA OFICINA"}
            </div>
            <div style={styles.modalCuerpo}>
              <label style={styles.label}>Nombre</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Nombre de la oficina"
                value={form.nombre}
                onChange={handleFormChange("nombre")}
              />
              <label style={styles.label}>Descripción</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={handleFormChange("descripcion")}
              />
              <label style={styles.label}>Estado</label>
              <select
                style={styles.input}
                value={form.estado}
                onChange={handleFormChange("estado")}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
            <div style={styles.modalBotones}>
              <button
                style={{ ...styles.boton, background: "#888" }}
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button style={styles.boton} onClick={guardar}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  contenedor: {
    maxWidth: 800,
    margin: "40px auto",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mensaje: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 14,
    minHeight: 18,
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 16,
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #333",
    padding: "8px",
    fontSize: 13,
  },
  td: {
    borderBottom: "1px solid #ddd",
    padding: "8px",
    fontSize: 13,
  },
  tr: {
    cursor: "pointer",
  },
  trSeleccionado: {
    background: "#d6e9ff",
  },
  botones: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  boton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: 4,
    background: "#2c6fbb",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },
  botonDisabled: {
    background: "#a9c3dd",
    cursor: "not-allowed",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    width: 320,
  },
  modalTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  modalCuerpo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#555",
    marginTop: 6,
  },
  input: {
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 13,
  },
  modalBotones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
};

export default Administracion;