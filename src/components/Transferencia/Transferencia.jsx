import { useState, useEffect, useCallback } from "react";
import "./Transferencia.css";

const BASE_URL = 'https://team-404-grupo-4-del-integrante-jhamel.onrender.com';

function Transferencia() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);

  const [usuarioIdInput, setUsuarioIdInput] = useState('');
  const [nombreActual, setNombreActual] = useState('');
  const [correoActual, setCorreoActual] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [nuevoResponsable, setNuevoResponsable] = useState('');

  const [cargandoTabla, setCargandoTabla] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const mostrarMensaje = useCallback((texto, tipo) => {
    setMensaje({ texto, tipo });
    if (tipo !== 'cargando') {
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
    }
  }, []);

  const cargarListaUsuarios = useCallback(async () => {
    setCargandoTabla(true);
    try {
      const res = await fetch(`${BASE_URL}/usuarios`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      mostrarMensaje('No se pudo cargar la lista: ' + error.message, 'error');
      setUsuarios([]);
    } finally {
      setCargandoTabla(false);
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarListaUsuarios();
  }, [cargarListaUsuarios]);

  const seleccionarDesdeTabla = (u) => {
    setUsuarioActual(u);
    setUsuarioIdInput(String(u.id));
    setNombreActual(u.nombre);
    setCorreoActual(u.correo);
    setNuevoNombre(u.nombre);
    setNuevoCorreo(u.correo);
    mostrarMensaje(`Usuario "${u.nombre}" seleccionado.`, 'exito');
  };

  const cargarUsuario = async () => {
    const id = usuarioIdInput.trim();
    if (!id) {
      mostrarMensaje('Ingrese un ID de usuario.', 'error');
      return;
    }

    mostrarMensaje('Cargando usuario...', 'cargando');
    try {
      const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
      });
      if (!res.ok) throw new Error(`Usuario no encontrado (${res.status})`);
      const u = await res.json();
      setUsuarioActual(u);
      setNombreActual(u.nombre);
      setCorreoActual(u.correo);
      setNuevoNombre(u.nombre);
      setNuevoCorreo(u.correo);
      mostrarMensaje('Usuario cargado correctamente.', 'exito');
    } catch (error) {
      mostrarMensaje('Error al cargar usuario: ' + error.message, 'error');
    }
  };

  const actualizarUsuario = async () => {
    if (!usuarioActual) {
      mostrarMensaje('Primero busque o seleccione un usuario.', 'error');
      return;
    }

    const nombre = nuevoNombre.trim();
    const correo = nuevoCorreo.trim();
    if (!nombre || !correo) {
      mostrarMensaje('El nombre y el correo son obligatorios.', 'error');
      return;
    }

    mostrarMensaje('Guardando transferencia...', 'cargando');
    const body = { id: usuarioActual.id, nombre, correo };

    try {
      const res = await fetch(`${BASE_URL}/usuarios/${usuarioActual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        mode: 'cors',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

      mostrarMensaje('Transferencia realizada con éxito.', 'exito');
      limpiarTodo();
      cargarListaUsuarios();
    } catch (error) {
      mostrarMensaje('Error al actualizar: ' + error.message, 'error');
    }
  };

  const eliminarUsuario = async () => {
    const id = usuarioIdInput.trim();
    if (!id) {
      mostrarMensaje('Ingrese o seleccione un ID para eliminar.', 'error');
      return;
    }
    if (!window.confirm(`¿Seguro que desea eliminar al usuario con ID ${id}?`)) return;

    mostrarMensaje('Eliminando usuario...', 'cargando');
    try {
      const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        mode: 'cors',
      });
      if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

      mostrarMensaje(`Usuario ${id} eliminado correctamente.`, 'exito');
      limpiarTodo();
      cargarListaUsuarios();
    } catch (error) {
      mostrarMensaje('Error al eliminar: ' + error.message, 'error');
    }
  };

  const crearUsuario = async () => {
    const nombre = nuevoNombre.trim();
    const correo = nuevoCorreo.trim();
    if (!nombre || !correo) {
      mostrarMensaje('Nombre y correo son obligatorios para crear.', 'error');
      return;
    }

    mostrarMensaje('Creando usuario...', 'cargando');
    try {
      const res = await fetch(`${BASE_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ nombre, correo }),
      });
      if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

      const creado = await res.json();
      mostrarMensaje(`Usuario creado con ID ${creado.id}.`, 'exito');
      limpiarTodo();
      cargarListaUsuarios();
    } catch (error) {
      mostrarMensaje('Error al crear usuario: ' + error.message, 'error');
    }
  };

  const limpiarTodo = () => {
    setUsuarioIdInput('');
    setNombreActual('');
    setCorreoActual('');
    setNuevoNombre('');
    setNuevoCorreo('');
    setNuevoResponsable('');
    setUsuarioActual(null);
  };

  const cancelar = () => {
    limpiarTodo();
    mostrarMensaje('Operación cancelada.', 'cargando');
  };

  return (
    <div className="ventana">
      <div className="barra-superior">TRANSFERENCIA</div>
      <div className="titulo">TRANSFERENCIA</div>

      <div id="mensaje" className={`mensaje ${mensaje.tipo}`}>
        {mensaje.texto}
      </div>

      <div className="contenido">
        <div className="seccion">Buscar Usuario</div>

        <div className="fila-buscar">
          <label>ID Usuario</label>
          <input
            type="number"
            min="1"
            placeholder="Ingrese el ID del usuario..."
            value={usuarioIdInput}
            onChange={(e) => setUsuarioIdInput(e.target.value)}
          />
          <button onClick={cargarUsuario}>Buscar</button>
        </div>

        <div className="seccion">Datos Actuales</div>

        <div className="fila">
          <label>Nombre Actual</label>
          <input type="text" value={nombreActual} readOnly />
        </div>

        <div className="fila">
          <label>Correo Actual</label>
          <input type="text" value={correoActual} readOnly />
        </div>

        <div className="seccion">Nuevos Datos</div>

        <div className="fila">
          <label>Nuevo Responsable</label>
          <select
            value={nuevoResponsable}
            onChange={(e) => setNuevoResponsable(e.target.value)}
          >
            <option value="">-- Seleccione un usuario --</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} - {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="fila">
          <label>Nuevo Nombre</label>
          <input
            type="text"
            placeholder="Escriba el nuevo nombre..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          />
        </div>

        <div className="fila">
          <label>Nuevo Correo</label>
          <input
            type="email"
            placeholder="Escriba el nuevo correo..."
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
          />
        </div>
      </div>

      <div className="botones">
        <button className="btn-crear" onClick={crearUsuario}>
          Crear
        </button>
        <button className="btn-eliminar" onClick={eliminarUsuario}>
          Eliminar
        </button>
        <button onClick={cancelar}>Cancelar</button>
        <button onClick={actualizarUsuario}>Aceptar</button>
      </div>

      <div className="tabla-seccion">
        <div className="tabla-titulo">Lista de Usuarios</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody id="tablaUsuarios">
            {cargandoTabla ? (
              <tr>
                <td colSpan="3" className="tabla-vacia">
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="3" className="tabla-vacia">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr
                  key={u.id}
                  className={usuarioActual?.id === u.id ? 'seleccionado' : ''}
                  onClick={() => seleccionarDesdeTabla(u)}
                >
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transferencia;