import { useState } from "react";
import "./Entidades.css";

const BASE_URL =
  "https://team-404-grupo-4-del-integrante-jhamel.onrender.com/api/organismos-fin";

const OPCIONES_ORGANISMO = [
  { value: 6, label: "0006 Vicepresidencia del Estado Plurinacional" },
  { value: 10, label: "0010 Ministerio de Relaciones Exteriores" },
  { value: 15, label: "0015 Ministerio de Gobierno" },
  { value: 16, label: "0016 Ministerio de Educación" },
  { value: 20, label: "0020 Ministerio de Defensa" },
  { value: 25, label: "0025 Ministerio de la Presidencia" },
  { value: 30, label: "0030 Ministerio de Justicia" },
];

const FORM_VACIO = {
  entidadId: "0",
  gestion: "",
  codigoOrganismo: OPCIONES_ORGANISMO[0].value,
  sigla: "",
  institucion: "",
};

export default function EntidadesForm() {
  const [form, setForm] = useState(FORM_VACIO);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function mostrarMensaje(texto, tipo = "ok") {
    setMensaje({ texto, tipo });
    if (texto) {
      window.clearTimeout(mostrarMensaje._t);
      mostrarMensaje._t = window.setTimeout(
        () => setMensaje({ texto: "", tipo: "" }),
        5000
      );
    }
  }

  function limpiarFormulario() {
    setForm(FORM_VACIO);
    mostrarMensaje("", "");
  }

  function obtenerDatos() {
    return {
      id: parseInt(form.entidadId) || 0,
      gestion: parseInt(form.gestion) || 0,
      codigoOrganismo: parseInt(form.codigoOrganismo) || 0,
      descripcion: form.institucion.trim(),
      sigla: form.sigla.trim(),
    };
  }

  async function getOrganismoPorId() {
    const id = form.entidadId;
    if (!id || id === "0") {
      mostrarMensaje("⚠ Ingrese un ID válido para buscar.", "warning");
      return;
    }
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 404) {
        mostrarMensaje(`⚠ No existe un organismo con ID ${id}.`, "warning");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setForm({
        entidadId: String(data.id),
        gestion: String(data.gestion ?? ""),
        codigoOrganismo: data.codigoOrganismo,
        sigla: data.sigla ?? "",
        institucion: data.descripcion ?? "",
      });
      mostrarMensaje(`Organismo ID ${data.id} cargado.`, "ok");
    } catch (e) {
      mostrarMensaje("Error al buscar: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }

  async function postOrganismo() {
    const datos = obtenerDatos();

    if (!datos.gestion) {
      mostrarMensaje("⚠ Ingrese la Gestión.", "warning");
      return;
    }
    if (!datos.descripcion) {
      mostrarMensaje("⚠ Ingrese la Institución / Descripción.", "warning");
      return;
    }
    if (!datos.sigla) {
      mostrarMensaje("⚠ Ingrese la Sigla.", "warning");
      return;
    }

    const { id, ...datosPost } = datos;

    setCargando(true);
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosPost),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} — ${msg}`);
      }

      const creado = await res.json();
      actualizarCampo("entidadId", String(creado.id));
      mostrarMensaje(`✔ Organismo creado con ID: ${creado.id}`, "ok");
    } catch (e) {
      mostrarMensaje("✘ Error al guardar: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }

  async function putOrganismo() {
    const id = form.entidadId;
    if (!id || id === "0") {
      mostrarMensaje(
        "⚠ Primero busque un registro (OK / Buscar) para editar.",
        "warning"
      );
      return;
    }

    const datos = obtenerDatos();
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} — ${msg}`);
      }

      mostrarMensaje(`✔ Organismo ID ${id} actualizado correctamente.`, "ok");
    } catch (e) {
      mostrarMensaje("✘ Error al actualizar: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }

  async function deleteOrganismo() {
    const id = form.entidadId;
    if (!id || id === "0") {
      mostrarMensaje("⚠ Ingrese un ID para eliminar.", "warning");
      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar el organismo con ID ${id}?`
    );
    if (!confirmar) return;

    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 404) {
        mostrarMensaje(`⚠ No existe un organismo con ID ${id}.`, "warning");
        return;
      }
      if (!res.ok) throw new Error(`Error ${res.status}`);

      mostrarMensaje(`✔ Organismo ID ${id} eliminado.`, "ok");
      limpiarFormulario();
    } catch (e) {
      mostrarMensaje("✘ Error al eliminar: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="window-container">
      <div className="window-header">Entidades</div>
      <div className="main-header">INSTALACION ENTIDAD</div>

      <div className="form-box">
        <div className="form-group">
          <label>ID:</label>
          <input
            type="number"
            value={form.entidadId}
            onChange={(e) => actualizarCampo("entidadId", e.target.value)}
            placeholder="Ingrese ID"
          />
        </div>

        <div className="form-group">
          <label>Gestión:</label>
          <input
            type="number"
            value={form.gestion}
            onChange={(e) => actualizarCampo("gestion", e.target.value)}
            placeholder="Ej: 2024"
          />
        </div>

        <div className="form-group">
          <label>Entidad:</label>
          <select
            value={form.codigoOrganismo}
            onChange={(e) => actualizarCampo("codigoOrganismo", e.target.value)}
          >
            {OPCIONES_ORGANISMO.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sigla:</label>
          <input
            type="text"
            value={form.sigla}
            onChange={(e) => actualizarCampo("sigla", e.target.value)}
            placeholder="Ej: MIN-EDU"
          />
        </div>

        <div className="form-group">
          <label>Institución:</label>
          <input
            type="text"
            value={form.institucion}
            onChange={(e) => actualizarCampo("institucion", e.target.value)}
            placeholder="Descripción de la entidad"
          />
        </div>

        <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>

        <div className="buttons">
          <button className="btn" onClick={postOrganismo} disabled={cargando}>
            OK (Guardar)
          </button>
          <button
            className="btn secondary"
            onClick={getOrganismoPorId}
            disabled={cargando}
          >
            Buscar ID
          </button>
          <button
            className="btn secondary"
            onClick={putOrganismo}
            disabled={cargando}
          >
            Actualizar
          </button>
          <button
            className="btn danger"
            onClick={deleteOrganismo}
            disabled={cargando}
          >
            Eliminar
          </button>
          <button
            className="btn secondary"
            onClick={limpiarFormulario}
            disabled={cargando}
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}