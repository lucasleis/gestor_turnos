import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Phone, Mail, Plus, Edit, Trash2, Save, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import TurnoConfirmado from './TurnoConfirmado'; // Importar el componente

// --- Dark mode toggle ---
const DarkModeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="dark-toggle"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

// Componentes shadcn/ui simplificados
const Button = ({ children, variant = "primary", size = "default", className = "", ...props }) => {
  const baseClass = "btn";
  const variantClass = variant === "primary" ? "btn-primary" : `btn-${variant}`;
  const sizeClass = size !== "default" ? `btn-${size}` : "";
  
  return (
    <button
      {...props}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, type = "text", className = "", ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={className}
    {...props}
  />
);

const Select = ({ children, value, onChange, placeholder, className = "" }) => (
  <select value={value} onChange={onChange} className={className}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {children}
  </select>
);

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="card-header">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="card-title">{children}</h3>
);

const CardContent = ({ children }) => (
  <div>{children}</div>
);

// Componente principal
const ShiftBookingApp = () => {
  // Estados principales
  const [turnos, setTurnos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  
  // Estado para controlar la vista actual
  const [vistaActual, setVistaActual] = useState('formulario'); // 'formulario' | 'confirmacion'
  const [turnoConfirmado, setTurnoConfirmado] = useState(null); // Datos del turno confirmado

  // Fecha 
  const hoy = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const max = maxDate.toISOString().split("T")[0];
  
  
  // Estados de formulario de turno
  const [nuevoTurno, setNuevoTurno] = useState({
    cliente_id: '',
    empleado_id: '',
    servicio_id: '',
    fecha: hoy,   // arranca con fecha de hoy
    hora_inicio: '',
    hora_fin: '',
    duracion_min: '',
    estado: 'pendiente'
  });

  // Estados de formularios de modales
  const [nuevoCliente, setNuevoCliente] = useState({ dni: '', nombre: '', apellido: '', telefono: '', email: '' });

  // Empleado Indistinto -> Seleccionar empleado disponible
  const [empleadosDisponiblesSlot, setEmpleadosDisponiblesSlot] = useState([]);

  // URL a acceder
  const API_BASE = 'http://127.0.0.1:2020';

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        fetch(`${API_BASE}/empleados`),
        fetch(`${API_BASE}/servicios`)
      ]);

      for (const res of responses) {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }

      const [empleadosData, serviciosData] = await Promise.all(
        responses.map(res => res.json())
      );

      setEmpleados(empleadosData || []);
      setServicios(serviciosData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Crear turno
  const crearTurno = async () => {
    console.log("nuevoTurno: ", nuevoTurno)

    // Validar que todos los campos obligatorios estén completos
    if (
      !nuevoTurno.servicio_id ||
      !nuevoTurno.empleado_id ||
      !nuevoTurno.fecha ||
      !nuevoTurno.hora_inicio  
    ) {
      toast.error("Debe seleccionar Servicio, Empleado, Fecha y Hora antes de reservar.");
      return;
    }

    // Si es cliente nuevo, validar todos los campos
    if (clienteExistente === false) {
      if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.email || !nuevoCliente.telefono) {
        toast.error("Debe completar todos los datos del cliente nuevo.");
        return;
      }
    }

    try {
      let clienteId = nuevoTurno.cliente_id;

      // Crear cliente nuevo si corresponde
      if (clienteExistente === false) {
        const resCliente = await fetch(`${API_BASE}/clientes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoCliente)
        });

        if (!resCliente.ok) {
          const errData = await resCliente.json();
          throw new Error(errData.error || "Error creando cliente");
        }

        const dataCliente = await resCliente.json();
        clienteId = dataCliente.id;
      }

      // Convertir IDs a números
      const turnoParaEnviar = {
        ...nuevoTurno,
        cliente_id: Number(clienteId),
        servicio_id: Number(nuevoTurno.servicio_id),
        empleado_id: Number(nuevoTurno.empleado_id_real || nuevoTurno.empleado_id),
        estado: 'confirmado'
      };

      // POST al backend
      const resTurno = await fetch(`${API_BASE}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turnoParaEnviar)
      });

      if (!resTurno.ok) {
        const errData = await resTurno.json();
        throw new Error(errData.error || "Error creando turno");
      }

      const dataTurno = await resTurno.json();

      // Preparar datos para la página de confirmación
      const clienteNombre = clienteExistente ? 
        `${clienteExistente.nombre} ${clienteExistente.apellido || ''}`.trim() :
        `${nuevoCliente.nombre} ${nuevoCliente.apellido || ''}`.trim();
      
      const servicioNombre = servicios.find(s => s.id === Number(nuevoTurno.servicio_id))?.nombre || 'Servicio';
      const empleadoNombre = empleados.find(e => e.id === Number(nuevoTurno.empleado_id))?.nombre || 'Empleado';

      const turnoConfirmadoData = {
        ...dataTurno,
        cliente: clienteNombre,
        servicio: servicioNombre,
        empleado: empleadoNombre,
        fecha: new Date(nuevoTurno.fecha).toLocaleDateString('es-AR'),
        hora_inicio: nuevoTurno.hora_inicio,
        hora_fin: nuevoTurno.hora_fin
      };

      // Actualizar estados
      setTurnos([...turnos, dataTurno]);
      setTurnoConfirmado(turnoConfirmadoData);
      setVistaActual('confirmacion'); // Cambiar a la vista de confirmación
      
      // Resetear formularios
      setNuevoTurno({
        cliente_id: '',
        empleado_id: '',
        servicio_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        duracion_min: '',
        estado: 'pendiente'
      });
      setNuevoCliente({ dni: '', nombre: '', apellido: '', telefono: '', email: '' });
      setClienteExistente(null);

      console.log("FIN - turno creado", dataTurno);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al crear el turno');
    }
  };

  // Función para volver al formulario
  const volverAlFormulario = () => {
    const hoy = new Date().toISOString().split("T")[0];
    setNuevoTurno({
      cliente_id: '',
      empleado_id: '',
      servicio_id: '',
      fecha: hoy,  
      hora_inicio: '',
      hora_fin: '',
      duracion_min: '',
      estado: 'pendiente'
    });
    setVistaActual('formulario');
    setTurnoConfirmado(null);
  };

  // Horarios disponibles
  const servicioSeleccionado = servicios.find(
    (s) => s.id === parseInt(nuevoTurno.servicio_id)
  );
  const duracion = servicioSeleccionado ? servicioSeleccionado.duracion_min : 30;
  
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  
  useEffect(() => {
    if (!nuevoTurno.empleado_id || !nuevoTurno.servicio_id || !nuevoTurno.fecha) {
      setHorariosDisponibles([]);
      return;
    }
  
    // Si ya tenemos una hora seleccionada y solo estamos cambiando de empleado "all" a uno específico, no necesitamos recargar los horarios
    if (nuevoTurno.hora_inicio && nuevoTurno.hora_fin && nuevoTurno.empleado_id !== "all") {
      return;
    }
  
    fetch(
      `${API_BASE}/horarios_disponibles?empleado_id=${nuevoTurno.empleado_id}&servicio_id=${nuevoTurno.servicio_id}&fecha=${nuevoTurno.fecha}`
    )
      .then((res) => res.json())
      .then((data) => {
        setHorariosDisponibles(data.disponibles || []);
      })
      .catch((err) => {
        console.error("Error cargando horarios:", err);
        setHorariosDisponibles([]);
      });
  }, [nuevoTurno.empleado_id, nuevoTurno.servicio_id, nuevoTurno.fecha]);

  // Busqueda de cliente por DNI
  const [clienteExistente, setClienteExistente] = useState(null); 

  // Renderizado condicional según la vista actual
  if (vistaActual === 'confirmacion' && turnoConfirmado) {
    return <TurnoConfirmado turnoData={turnoConfirmado} onVolverInicio={volverAlFormulario} />;
  }

  // Vista principal del formulario
  return (
    <div style={{minHeight: '100vh'}}>
      <Toaster position="top-right" />
      <header className="header">
        <h1>
          <Scissors size={24} /> 
          Sistema de Gestión - nombre_negocio
        </h1>
        <DarkModeToggle />
      </header>
  
      <div className="container">
        <header className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Sistema de Gestión de Turnos</h1>
          <p style={{color: 'var(--color-text-light)'}}>Barbería & Estética</p>
        </header>
        
        <div className="grid grid-cols-2">
          {/* Panel Izquierdo - Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Nuevo Turno
                </CardTitle>
              </CardHeader>

              <CardContent className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', gap: '16px' }}">

                <div> {/* DNI */}
                  <h4 className="heading-small">
                    DNI
                  </h4>
                  <Input
                    type="text"
                    placeholder="Ingrese DNI"
                    value={nuevoCliente.dni || ""}
                    maxLength={8}
                    onChange={async (e) => {
                      const valor = e.target.value.replace(/\D/g, "");
                      if (valor.length <= 8) {
                        setNuevoCliente({ ...nuevoCliente, dni: valor });

                        if (valor.length >= 7 && valor.length <= 8) {
                          try {
                            const res = await fetch(`${API_BASE}/clientes/${valor}`);
                            if (res.ok) {
                              const data = await res.json();
                              setClienteExistente(data);
                              setNuevoTurno({ ...nuevoTurno, cliente_id: data.id });
                            } else {
                              setClienteExistente(false);
                            }
                          } catch (err) {
                            console.error("Error buscando cliente:", err);
                            setClienteExistente(false);
                          }
                        } else {
                          setClienteExistente(null);
                        }
                      }
                    }}
                  />
                  {nuevoCliente.dni && (nuevoCliente.dni.length < 7 || nuevoCliente.dni.length > 8) && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      El DNI debe tener 7 u 8 números
                    </span>
                  )}
                </div>

                {/* Mostrar mensaje si existe */}
                {clienteExistente && (
                  <p className="text-green-600 font-semibold">
                    Bienvenido {clienteExistente.nombre}
                  </p>
                )}

                {/* Mostrar formulario si no existe */}
                {clienteExistente === false && (
                  <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h4 className="heading-small font-medium text-slate-700">Datos del Cliente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="heading-small">Nombre</h4>
                        <Input
                          type="text"
                          placeholder="Nombre"
                          value={nuevoCliente.nombre || ""}
                          onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <h4 className="heading-small">Apellido</h4>
                        <Input
                          type="text"
                          placeholder="Apellido"
                          value={nuevoCliente.apellido || ""}
                          onChange={(e) => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="heading-small">Email</h4>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={nuevoCliente.email || ""}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <h4 className="heading-small">Teléfono</h4>
                      <Input
                        type="tel"
                        placeholder="Número de teléfono"
                        value={nuevoCliente.telefono || ""}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div> {/* Servicio */}
                  <h4 className="heading-small">
                    Servicio
                  </h4>

                  <Select 
                    value={nuevoTurno.servicio_id || ""}
                    onChange={(e) => setNuevoTurno({...nuevoTurno, servicio_id: e.target.value})}
                    placeholder="Seleccionar servicio"
                  >
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </Select>
                </div>

                <div> {/* Empleado */}
                  <h4 className="heading-small">Empleado</h4>
                  <Select
                    value={nuevoTurno.empleado_id || ""}
                    onChange={(e) =>
                      setNuevoTurno({ ...nuevoTurno, empleado_id: e.target.value })
                    }
                    placeholder="Seleccionar empleado"
                  >
                    <option value="all">Indistinto</option>
                    {empleados.map((empleado) => (
                      <option key={empleado.id} value={empleado.id}>
                        {empleado.nombre}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4"> {/* Fecha + Hora */}
                  <div>
                    <h4 className="heading-small">Fecha</h4>
                    <Input
                      type="date"
                      value={nuevoTurno.fecha || hoy}
                      min={hoy}
                      max={max}
                      onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })}
                    />
                  </div>

                  <div>
                    <h4 className="heading-small">Hora</h4>

                    <Select
                      value={
                        nuevoTurno.hora_inicio && nuevoTurno.hora_fin
                          ? JSON.stringify({hora: `${nuevoTurno.hora_inicio} - ${nuevoTurno.hora_fin}`, empleados: empleadosDisponiblesSlot})
                          : ""
                      }
                      onChange={(e) => {
                        const slot = JSON.parse(e.target.value);
                        const [horaInicio, horaFin] = slot.hora.split(" - ");

                        setNuevoTurno((prev) => ({
                          ...prev,
                          hora_inicio: horaInicio,
                          hora_fin: horaFin,
                          duracion_min: duracion,
                          empleado_id: prev.empleado_id === "all" ? "all" : prev.empleado_id,
                          empleado_id_real: slot.empleados.includes(prev.empleado_id_real)
                            ? prev.empleado_id_real
                            : ""
                        }));

                        setEmpleadosDisponiblesSlot(slot.empleados); // ids de empleados libres
                      }}
                    >
                      <option value="" disabled hidden>Seleccionar hora</option>
                      {horariosDisponibles.map((slot) => (
                        <option key={slot.hora} value={JSON.stringify(slot)}>
                          {slot.hora}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/*******************************************************/}
                {/* Empleado Indistinto -> Elegir empleado disponible */}
                {nuevoTurno.empleado_id === "all" && empleadosDisponiblesSlot.length > 0 && (
                  <div>
                    <h4 className="heading-small">Elegir empleado disponible</h4>
                    <Select
                      value={nuevoTurno.empleado_id_real || ""}
                      onChange={(e) =>
                        setNuevoTurno((prev) => ({
                          ...prev,
                          empleado_id_real: e.target.value,
                          empleado_id: e.target.value, // este será el que se envía al backend
                          // Mantenemos hora_inicio, hora_fin y duracion_min sin cambios
                          // NO los reseteamos
                        }))
                      }
                      placeholder="Seleccionar empleado"
                    >
                      <option value="" disabled hidden>Seleccionar empleado</option>
                      {empleadosDisponiblesSlot.map((empID) => {
                        const emp = empleados.find((e) => e.id === empID);
                        return (
                          <option key={empID} value={empID}>
                            {emp ? emp.nombre : `Empleado #${empID}`}
                          </option>
                        );
                      })}
                    </Select>
                  </div>
                )}
                {/*******************************************************/}

                <Button
                  className="w-full"
                  onClick={crearTurno}
                  disabled={
                    !nuevoTurno.servicio_id ||
                    !nuevoTurno.empleado_id ||
                    !nuevoTurno.fecha ||
                    !nuevoTurno.hora_inicio ||
                    (clienteExistente === false &&
                      (!nuevoCliente.nombre ||
                      !nuevoCliente.apellido ||
                      !nuevoCliente.email ||
                      !nuevoCliente.telefono))
                  }
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reservar Turno
                </Button>

              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Vista de Turnos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Turnos</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}>
                  {turnos.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay turnos registrados</p>
                  ) : (
                    <div className="space-y-2">
                      {turnos.map((turno) => (
                        <Card key={turno.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">Cliente #{turno.cliente_id}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-600">
                                <span>Empleado #{turno.empleado_id}</span>
                                <span>Servicio #{turno.servicio_id}</span>
                                <span>{turno.fecha} {turno.hora_inicio}-{turno.hora_fin}</span>
                              </div>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border">
                                {turno.estado}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShiftBookingApp;