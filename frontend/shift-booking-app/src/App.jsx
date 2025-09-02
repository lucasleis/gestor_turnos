import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Phone, Mail, Plus, Edit, Trash2, Save, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

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


/// Componentes shadcn/ui simplificados \\\

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
    {...props}  // <- reenvía min, max, required, etc.
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



// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// Componente principal
const ShiftBookingApp = () => {
  // Estados principales
  const [turnos, setTurnos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  
  // Estados de formulario de turno
  const [nuevoTurno, setNuevoTurno] = useState({
    cliente_id: '',
    empleado_id: '',
    servicio_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'pendiente'
  });

  const handleAddTurno = () => {
    if (!nuevoTurno.cliente || !nuevoTurno.servicio || !nuevoTurno.hora) {
      toast.error("Faltan campos obligatorios");
      return;
    }
    setTurnos([...turnos, { ...nuevoTurno, id: Date.now() }]);
    setNuevoTurno({ cliente: "", empleado: "", servicio: "", hora: "", estado: "pendiente" });
    toast.success("Turno agregado ✅");
  };

  // Estados de modales
  const [modalCliente, setModalCliente] = useState(false);
  const [modalEmpleado, setModalEmpleado] = useState(false);
  const [modalServicio, setModalServicio] = useState(false);
  const [modalEditTurno, setModalEditTurno] = useState(false);
  const [turnoEditar, setTurnoEditar] = useState(null);

  // Estados de formularios de modales
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' });
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', especialidad: '' });
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', duracion_min: '', precio: '' });

  // Vista actual
  const [vistaActual, setVistaActual] = useState('tabla');

  // URL a acceder
  const API_BASE = 'http://127.0.0.1:5000';

  // Funciones de API
  // const fetchData = async () => {
  //   try {
  //     const [turnosRes, clientesRes, empleadosRes, serviciosRes] = await Promise.all([
  //       fetch(`${API_BASE}/turnos`),
  //       fetch(`${API_BASE}/clientes`),
  //       fetch(`${API_BASE}/barbers`),
  //       fetch(`${API_BASE}/services`)
  //     ]);

  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        // fetch(`${API_BASE}/turnos`),
        //fetch(`${API_BASE}/clientes`),
        fetch(`${API_BASE}/barbers`),
        fetch(`${API_BASE}/services`)
      ]);

      // Verificamos que todos los fetch respondieron correctamente
      for (const res of responses) {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }

      // const [turnosData, /*clientesData,*/ empleadosData, serviciosData] = await Promise.all(
      const [ empleadosData, serviciosData] = await Promise.all(
        responses.map(res => res.json())
      );

      // setTurnos(turnosData || []);
      //setClientes(clientesData || []);
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
    try {
      const response = await fetch(`${API_BASE}/turnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoTurno,
          cliente_id: parseInt(nuevoTurno.cliente_id),
          empleado_id: parseInt(nuevoTurno.empleado_id),
          servicio_id: parseInt(nuevoTurno.servicio_id)
        })
      });
      
      if (response.ok) {
        setNuevoTurno({
          cliente_id: '',
          empleado_id: '',
          servicio_id: '',
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          estado: 'pendiente'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating turno:', error);
    }
  };

  // Actualizar turno
  const actualizarTurno = async () => {
    try {
      const response = await fetch(`${API_BASE}/turnos/${turnoEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...turnoEditar,
          cliente_id: parseInt(turnoEditar.cliente_id),
          empleado_id: parseInt(turnoEditar.empleado_id),
          servicio_id: parseInt(turnoEditar.servicio_id)
        })
      });
      
      if (response.ok) {
        setModalEditTurno(false);
        setTurnoEditar(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating turno:', error);
    }
  };

  // Eliminar turno
  const eliminarTurno = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/turnos/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting turno:', error);
    }
  };

  // Crear cliente
  const crearCliente = async () => {
    try {
      const response = await fetch(`${API_BASE}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      });
      
      if (response.ok) {
        setNuevoCliente({ nombre: '', telefono: '', email: '' });
        setModalCliente(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating cliente:', error);
    }
  };

  // Crear empleado
  const crearEmpleado = async () => {
    try {
      const response = await fetch(`${API_BASE}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEmpleado)
      });
      
      if (response.ok) {
        setNuevoEmpleado({ nombre: '', especialidad: '' });
        setModalEmpleado(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating empleado:', error);
    }
  };

  // Crear servicio
  const crearServicio = async () => {
    try {
      const response = await fetch(`${API_BASE}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoServicio,
          duracion_min: parseInt(nuevoServicio.duracion_min),
          precio: parseFloat(nuevoServicio.precio)
        })
      });
      
      if (response.ok) {
        setNuevoServicio({ nombre: '', duracion_min: '', precio: '' });
        setModalServicio(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating servicio:', error);
    }
  };

  // Obtener nombre por ID
  const getClienteName = (id) => clientes.find(c => c.id === id)?.nombre || 'N/A';
  const getEmpleadoName = (id) => empleados.find(e => e.id === id)?.name || 'N/A';
  const getServicioName = (id) => servicios.find(s => s.id === id)?.name || 'N/A';


  // Colores por estado
  /*
    const getEstadoColor = (estado) => {
      const colors = {
        pendiente: "bg-yellow-500 text-white",
        confirmado: "bg-green-500 text-white",
        cancelado: "bg-red-500 text-white",
        completado: "bg-blue-500 text-white",
      };
      return colors[estado] || "bg-gray-500 text-white";
    };
  */  

  // Vista de calendario simplificada
  const VistaCalendario = () => {
    const turnosHoy = turnos.filter(t => t.fecha === new Date().toISOString().split('T')[0]);

    return (
      <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
        <h3 className="text-lg font-semibold">Agenda de Hoy</h3>
        <div className="grid gap-2">
          {turnosHoy.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay turnos para hoy</p>
          ) : (
            turnosHoy.map((turno) => (
              <Card key={turno.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">{turno.hora_inicio} - {turno.hora_fin}</span>
                  </div>
                  <span className={`badge badge-${turno.estado}`}>
                    {turno.estado}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  <p><strong>Cliente:</strong> {getClienteName(turno.cliente_id)}</p>
                  <p><strong>Empleado:</strong> {getEmpleadoName(turno.empleado_id)}</p>
                  <p><strong>Servicio:</strong> {getServicioName(turno.servicio_id)}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };


  // Fecha 
  const hoy = new Date().toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const max = maxDate.toISOString().split("T")[0];

  // Horario
  const generarHorarios = () => {
    const horarios = [];
    const inicio = 10; // 10 AM
    const fin = 19;    // 19 horas (7 PM)
    for (let h = inicio; h <= fin; h++) {
      for (let m = 0; m < 60; m += 30) {
        // No exceder 19:30
        if (h === fin && m > 30) break;
        const horaStr = String(h).padStart(2, "0");
        const minStr = String(m).padStart(2, "0");
        horarios.push(`${horaStr}:${minStr}`);
      }
    }
    return horarios;
  };
  
  const horarios = generarHorarios();

  return (
    <div style={{minHeight: '100vh'}}>
      <Toaster position="top-right" />
      <header className="header">
        <h1>
          <Scissors size={24} /> 
          Sistema de Gestión - nombre_del_lugar{}
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

              <CardContent className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', gap: '16px' }} ">

                <div> {/* DNI */}
                  <h4 className="heading-small">
                    DNI
                  </h4>
                  <Input
                    type="text"
                    placeholder="Ingrese DNI"
                    value={nuevoCliente.dni || ""}
                    maxLength={8} // máximo 8 dígitos
                    onChange={(e) => {
                      // Permite solo números
                      const valor = e.target.value.replace(/\D/g, "");
                      // Limita entre 0 y 8 dígitos
                      if (valor.length <= 8) {
                        setNuevoCliente({ ...nuevoCliente, dni: valor });
                      }
                    }}
                  />
                  {nuevoCliente.dni && (nuevoCliente.dni.length < 7 || nuevoCliente.dni.length > 8) && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      El DNI debe tener 7 u 8 números
                    </span>
                  )}
                </div>

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
                        {servicio.name} {/* - ${servicio.precio ?? ''} */}
                      </option>
                    ))}
                  </Select>
                </div>

                <div> {/* Empleado */}
                  <h4 className="heading-small">
                    Empleado
                  </h4>

                  <Select
                    value={nuevoTurno.empleado_id || ""}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, empleado_id: e.target.value })}
                    placeholder="Seleccionar empleado"
                  >
                    {empleados.map((empleado) => (
                      <option key={empleado.id} value={empleado.id}>
                        {empleado.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div> {/* Fecha */}
                  <h4 className="heading-small">
                    Fecha
                  </h4>

                  <Input
                    type="date"
                    value={nuevoTurno.fecha || hoy} // si no hay fecha, mostrar hoy
                    min={hoy}                      // bloquea fechas anteriores
                    max={max}                      // bloquea fechas posteriores a 3 meses
                    onChange={(e) =>
                      setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })
                    }
                  />
                </div>

                <div> {/* Hora */}
                  <h4 className="heading-small">
                    Hora
                  </h4>
                  <Select
                    value={nuevoTurno.hora_fin || ""}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora_fin: e.target.value })}
                  >
                    <option value="" disabled hidden>Seleccionar hora</option>
                    {horarios.map((hora) => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </Select>
                </div>

                {/* 
                <Select 
                  value={nuevoTurno.estado} 
                  onChange={(e) => setNuevoTurno({...nuevoTurno, estado: e.target.value})}
                  placeholder="Estado"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="completado">Completado</option>
                </Select>
                */}

                <Button className="w-full" onClick={crearTurno}>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Gestión de Turnos</CardTitle>
                  <div className="flex flex gap-2">
                    <Button
                      variant={vistaActual === 'tabla' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVistaActual('tabla')}
                    >
                      Tabla
                    </Button>
                    <Button
                      variant={vistaActual === 'calendario' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVistaActual('calendario')}
                    >
                      Agenda
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {vistaActual === 'tabla' ? (
                  <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
                    {turnos.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No hay turnos registrados</p>
                    ) : (
                      <div className="space-y-2">
                        {turnos.map((turno) => (
                          <Card key={turno.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center flex gap-2">
                                  <User className="h-4 w-4 text-slate-500" />
                                  <span className="font-medium">{getClienteName(turno.cliente_id)}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-slate-600">
                                  <span>{getEmpleadoName(turno.empleado_id)}</span>
                                  <span>{getServicioName(turno.servicio_id)}</span>
                                  <span>{turno.fecha} {turno.hora_inicio}-{turno.hora_fin}</span>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(turno.estado)}`}>
                                  {turno.estado}
                                </span>
                              </div>
                              <div className="flex flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setTurnoEditar(turno);
                                    setModalEditTurno(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => eliminarTurno(turno.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <VistaCalendario />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modales */}
        <Modal isOpen={modalCliente} onClose={() => setModalCliente(false)} title="Nuevo Cliente">
          <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
            <Input
              placeholder="Nombre completo"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
            />
            <Input
              placeholder="Teléfono"
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
            />
            <Input
              placeholder="Email"
              type="email"
              value={nuevoCliente.email}
              onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
            />
            <Button className="w-full" onClick={crearCliente}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cliente
            </Button>
          </div>
        </Modal>

        <Modal isOpen={modalEmpleado} onClose={() => setModalEmpleado(false)} title="Nuevo Empleado">
          <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
            <Input
              placeholder="Nombre completo"
              value={nuevoEmpleado.nombre}
              onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})}
            />
            <Input
              placeholder="Especialidad"
              value={nuevoEmpleado.especialidad}
              onChange={(e) => setNuevoEmpleado({...nuevoEmpleado, especialidad: e.target.value})}
            />
            <Button className="w-full" onClick={crearEmpleado}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Empleado
            </Button>
          </div>
        </Modal>

        <Modal isOpen={modalServicio} onClose={() => setModalServicio(false)} title="Nuevo Servicio">
          <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
            <Input
              placeholder="Nombre del servicio"
              value={nuevoServicio.nombre}
              onChange={(e) => setNuevoServicio({...nuevoServicio, nombre: e.target.value})}
            />
            <Input
              placeholder="Duración (minutos)"
              type="number"
              value={nuevoServicio.duracion_min}
              onChange={(e) => setNuevoServicio({...nuevoServicio, duracion_min: e.target.value})}
            />
            <Input
              placeholder="Precio"
              type="number"
              value={nuevoServicio.precio}
              onChange={(e) => setNuevoServicio({...nuevoServicio, precio: e.target.value})}
            />
            <Button className="w-full" onClick={crearServicio}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Servicio
            </Button>
          </div>
        </Modal>

        <Modal isOpen={modalEditTurno} onClose={() => setModalEditTurno(false)} title="Editar Turno">
          {turnoEditar && (
            <div className="style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)'}}">
              <Select 
                value={turnoEditar.cliente_id} 
                onChange={(e) => setTurnoEditar({...turnoEditar, cliente_id: e.target.value})}
                placeholder="Cliente"
              >
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                ))}
              </Select>
              
              <Select 
                value={turnoEditar.empleado_id} 
                onChange={(e) => setTurnoEditar({...turnoEditar, empleado_id: e.target.value})}
                placeholder="Empleado"
              >
                {empleados.map(empleado => (
                  <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
              </Select>

              <Input
                type="date"
                value={turnoEditar.fecha}
                onChange={(e) => setTurnoEditar({...turnoEditar, fecha: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={turnoEditar.hora_inicio}
                  onChange={(e) => setTurnoEditar({...turnoEditar, hora_inicio: e.target.value})}
                />
                <Input
                  type="time"
                  value={turnoEditar.hora_fin}
                  onChange={(e) => setTurnoEditar({...turnoEditar, hora_fin: e.target.value})}
                />
              </div>

              <Select 
                value={turnoEditar.estado} 
                onChange={(e) => setTurnoEditar({...turnoEditar, estado: e.target.value})}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="completado">Completado</option>
              </Select>

              <Button className="w-full" onClick={actualizarTurno}>
                <Save className="h-4 w-4 mr-2" />
                Actualizar Turno
              </Button>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default ShiftBookingApp;