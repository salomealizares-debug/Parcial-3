import { useState, useEffect, useRef } from "react";
import "./Oficina.css";

const BASE = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com";
const MIN_FILAS = 8;

async function apiFetch(url, method = "GET", body = null) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  if (res.status === 204) return null;
  return res.json();
}


export default function Oficina() {
  const [oficinas, setOficinas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [modoActual, setModoActual] = useState(null); // null | "nuevo" | "modificar"
  const [seleccionId, setSeleccionId] = useState(null);

  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estadoTexto, setEstadoTexto] = useState("-");
  const [selectValue, setSelectValue] = useState("");

  const [filtroActivo, setFiltroActivo] = useState(null); // null | "ACTIVO" | "INACTIVO"
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const textareaRef = useRef(null);
  const inputCodigoRef = useRef(null);

  const edicionHabilitada = modoActual !== null;

  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function inicializar() {
    setCargando(true);
    try {
      const estadosData = await apiFetch("/api/estado");
      setEstados(estadosData ?? []);
      await cargarOficinas();
    } catch (e) {
      alert("Error al inicializar:\n" + e.message);
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarOficinas() {
    try {
      const data = await apiFetch("/api/oficina");
      setOficinas(data ?? []);
      if (data && data.length) {
        setSelectValue((prev) =>
          data.some((o) => String(o.id) === String(prev)) ? prev : String(data[0].id)
        );
      }
    } catch (e) {
      alert("Error al cargar oficinas:\n" + e.message);
      setError(e.message);
    }
  }

  function limpiarFormulario() {
    setCodigo("");
    setDescripcion("");
    setEstadoTexto("-");
    setSeleccionId(null);
    setModoActual(null);
    if (oficinas.length) setSelectValue(String(oficinas[0].id));
  }

  function seleccionarFila(of) {
    setSeleccionId(of.id);
    setCodigo(of.nombre ?? "");
    setDescripcion(of.descripcion ?? "");
    setEstadoTexto(of.estado ?? "-");
    setSelectValue(String(of.id));
  }

  function accionNuevo() {
    limpiarFormulario();
    setModoActual("nuevo");
    setEstadoTexto(estados[0]?.nomestado ?? "ACTIVO");
    setTimeout(() => inputCodigoRef.current?.focus(), 0);
  }

  function accionModificar() {
    if (!seleccionId) {
      alert("Seleccioná una fila de la tabla primero.");
      return;
    }
    setModoActual("modificar");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function accionGuardar() {
    if (!modoActual) {
      alert("Presioná Nuevo o Modificar antes de guardar.");
      return;
    }

    const payload = {
      nombre: codigo.trim(),
      descripcion: descripcion.trim(),
      estado: estadoTexto.trim() || "ACTIVO",
    };

    if (!payload.nombre) {
      alert("El nombre es obligatorio.");
      return;
    }

    try {
      if (modoActual === "nuevo") {
        await apiFetch("/api/oficina", "POST", payload);
        alert("Oficina creada correctamente.");
      } else {
        await apiFetch(`/api/oficina/${seleccionId}`, "PUT", payload);
        alert("Oficina actualizada correctamente.");
      }
      await cargarOficinas();
      limpiarFormulario();
    } catch (e) {
      alert("Error al guardar:\n" + e.message);
    }
  }

  async function cambiarEstado(nuevoEstado) {
    if (!seleccionId) {
      alert("Seleccioná una fila primero.");
      return;
    }
    const oficina = oficinas.find((o) => o.id === seleccionId);
    if (!oficina) return;
    try {
      await apiFetch(`/api/oficina/${seleccionId}`, "PUT", {
        ...oficina,
        estado: nuevoEstado,
      });
      setEstadoTexto(nuevoEstado);
      await cargarOficinas();
    } catch (e) {
      alert("Error al cambiar estado:\n" + e.message);
    }
  }

  function filtrarTabla(estado) {
    setFiltroActivo((prev) => (prev === estado ? null : estado));
  }

  async function accionDeshacer() {
    limpiarFormulario();
    await cargarOficinas();
  }

  function accionSalir() {
    if (modoActual && !confirm("¿Salir sin guardar los cambios?")) return;
    window.history.back();
  }

  function scrollTextarea(dir) {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += dir === "up" ? -30 : 30;
    }
  }

  const listaFiltrada = filtroActivo
    ? oficinas.filter((o) => (o.estado ?? "").toUpperCase() === filtroActivo)
    : oficinas;

  const filasRelleno = Math.max(0, MIN_FILAS - listaFiltrada.length);

  return (
    <div className="of-body">
      <div className="of-ventana">
        <div className="of-titulo">
          <div className="of-unidad">
            <span>UNIDAD: 0252</span>
            <br />
            <small>Nivel Central</small>
          </div>
          <h1>OFICINA</h1>
        </div>

        {error && <div className="of-error">{error}</div>}

        <div className="of-cuerpo">
          {/* Formulario izquierda */}
          <div className="of-formulario">
            <div className="of-fila">
              <label>Oficina</label>
              <div className="of-oficina-box">
                <input
                  ref={inputCodigoRef}
                  type="text"
                  placeholder="ID"
                  value={codigo}
                  disabled={!edicionHabilitada}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <select
                  value={selectValue}
                  disabled={!edicionHabilitada}
                  onChange={(e) => setSelectValue(e.target.value)}
                >
                  {oficinas.map((o) => (
                    <option key={o.id} value={o.id}>
                      {`${o.id} - ${o.nombre ?? ""}`.trim()}
                    </option>
                  ))}
                </select>
                <div className="of-estado">{estadoTexto}</div>
              </div>
            </div>

            <div className="of-fila">
              <label>Descripción</label>
              <div className="of-textarea-wrapper">
                <textarea
                  ref={textareaRef}
                  value={descripcion}
                  disabled={!edicionHabilitada}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                <div className="of-textarea-buttons">
                  <button type="button" onClick={() => scrollTextarea("up")}>▲</button>
                  <button type="button" onClick={() => scrollTextarea("down")}>▼</button>
                </div>
              </div>
            </div>
          </div>

          {/* Botones derecha */}
          <div className="of-menu-derecha">
            <button onClick={() => cambiarEstado("ACTIVO")}>Activar</button>
            <button onClick={() => cambiarEstado("INACTIVO")}>Inactivar</button>
          </div>
        </div>

        {/* Tabla */}
        <div className="of-tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "10px" }}>
                    Cargando oficinas...
                  </td>
                </tr>
              ) : (
                <>
                  {listaFiltrada.map((o) => (
                    <tr
                      key={o.id}
                      className={seleccionId === o.id ? "seleccionada" : ""}
                      onClick={() => seleccionarFila(o)}
                    >
                      <td>{o.id ?? ""}</td>
                      <td>{o.nombre ?? ""}</td>
                      <td>{o.descripcion ?? ""}</td>
                      <td>{o.estado ?? ""}</td>
                    </tr>
                  ))}
                  {Array.from({ length: filasRelleno }).map((_, i) => (
                    <tr key={`relleno-${i}`}>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="of-footer">
          <button
            className={filtroActivo === "ACTIVO" ? "of-btn-activo-filtro" : "of-btn-desactivado"}
            onClick={() => filtrarTabla("ACTIVO")}
          >
            Activo
          </button>
          <button
            className={filtroActivo === "INACTIVO" ? "of-btn-activo-filtro" : "of-btn-desactivado"}
            onClick={() => filtrarTabla("INACTIVO")}
          >
            Inactivo
          </button>
          <button onClick={accionNuevo}>Nuevo</button>
          <button onClick={accionModificar}>Modificar</button>
          <button className="of-guardar" onClick={accionGuardar}>Guardar</button>
          <button onClick={accionDeshacer}>Deshacer</button>
          <button onClick={accionSalir}>Salir</button>
        </div>
      </div>
    </div>
  );
}