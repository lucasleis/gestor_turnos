import React from 'react';
import { CheckCircle, Calendar, Clock, User, Scissors, Phone, Mail, Home } from "lucide-react";

const TurnoConfirmado = ({ 
  turnoData = null, 
  onVolverInicio = () => window.location.href = '/' 
}) => {
  // Datos por defecto si no se pasan props
  const turno = turnoData || {
    cliente: "Cliente",
    servicio: "Servicio",
    empleado: "Empleado",
    fecha: new Date().toLocaleDateString('es-AR'),
    hora_inicio: "10:00",
    hora_fin: "11:00"
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #f8fafc)' }}>
      {/* Header */}
      <header className="header">
        <h1>
          <Scissors size={24} /> 
          Sistema de Gestión - nombre_negocio
        </h1>
      </header>

      <div className="container" style={{ paddingTop: '60px' }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg, 24px)'
        }}>
          
          {/* Mensaje de confirmación principal */}
          <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl, 32px)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: 'var(--spacing-lg, 24px)' 
            }}>
              <CheckCircle 
                size={80} 
                style={{ 
                  color: 'var(--color-success, #22c55e)',
                  animation: 'fadeIn 0.5s ease-in-out'
                }} 
              />
            </div>
            
            <h1 style={{ 
              fontSize: 'var(--font-size-2xl, 24px)', 
              fontWeight: '600',
              color: 'var(--color-success, #22c55e)',
              marginBottom: 'var(--spacing-md, 16px)'
            }}>
              ¡Turno Reservado Correctamente!
            </h1>
            
            <p style={{ 
              fontSize: 'var(--font-size-lg, 18px)',
              color: 'var(--color-text-light, #64748b)',
              marginBottom: 0
            }}>
              Su reserva ha sido confirmada exitosamente
            </p>
          </div>

          {/* Detalles del turno */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Calendar size={20} />
                Detalles de su Turno
              </h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gap: 'var(--spacing-md, 16px)',
              padding: 'var(--spacing-lg, 24px) 0'
            }}>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-md, 16px)',
                padding: 'var(--spacing-md, 16px)',
                background: 'var(--color-bg, #f8fafc)',
                borderRadius: 'var(--radius, 8px)'
              }}>
                <User size={20} style={{ color: 'var(--color-primary, #2563eb)' }} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-light, #64748b)' }}>
                    Cliente
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base, 16px)', fontWeight: '600' }}>
                    {turno.cliente}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-md, 16px)',
                padding: 'var(--spacing-md, 16px)',
                background: 'var(--color-bg, #f8fafc)',
                borderRadius: 'var(--radius, 8px)'
              }}>
                <Scissors size={20} style={{ color: 'var(--color-primary, #2563eb)' }} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-light, #64748b)' }}>
                    Servicio
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base, 16px)', fontWeight: '600' }}>
                    {turno.servicio}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-md, 16px)',
                padding: 'var(--spacing-md, 16px)',
                background: 'var(--color-bg, #f8fafc)',
                borderRadius: 'var(--radius, 8px)'
              }}>
                <User size={20} style={{ color: 'var(--color-primary, #2563eb)' }} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-light, #64748b)' }}>
                    Profesional
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base, 16px)', fontWeight: '600' }}>
                    {turno.empleado}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md, 16px)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-md, 16px)',
                  padding: 'var(--spacing-md, 16px)',
                  background: 'var(--color-bg, #f8fafc)',
                  borderRadius: 'var(--radius, 8px)'
                }}>
                  <Calendar size={20} style={{ color: 'var(--color-primary, #2563eb)' }} />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-light, #64748b)' }}>
                      Fecha
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base, 16px)', fontWeight: '600' }}>
                      {turno.fecha}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-md, 16px)',
                  padding: 'var(--spacing-md, 16px)',
                  background: 'var(--color-bg, #f8fafc)',
                  borderRadius: 'var(--radius, 8px)'
                }}>
                  <Clock size={20} style={{ color: 'var(--color-primary, #2563eb)' }} />
                  <div>
                    <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-light, #64748b)' }}>
                      Horario
                    </div>
                    <div style={{ fontSize: 'var(--font-size-base, 16px)', fontWeight: '600' }}>
                      {turno.hora_inicio} - {turno.hora_fin}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, var(--color-primary, #2563eb), var(--color-primary-hover, #1d4ed8))',
            color: 'white',
            border: 'none'
          }}>
            <div style={{ padding: 'var(--spacing-lg, 24px)' }}>
              <h3 style={{ 
                fontSize: 'var(--font-size-lg, 18px)', 
                fontWeight: '600',
                marginBottom: 'var(--spacing-md, 16px)',
                color: 'white'
              }}>
                Información Importante
              </h3>
              
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm, 12px)'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 12px)' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.8)' 
                  }}></div>
                  Por favor, llegue 10 minutos antes de su cita
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 12px)' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.8)' 
                  }}></div>
                  Si necesita cancelar, hágalo con 24hs de anticipación
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 12px)' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.8)' 
                  }}></div>
                  Recibirá un recordatorio por WhatsApp
                </li>
              </ul>
            </div>
          </div>

          {/* Contacto y acciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md, 16px)' }}>
            
            {/* Información de contacto */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ 
                fontSize: 'var(--font-size-base, 16px)', 
                fontWeight: '600',
                marginBottom: 'var(--spacing-md, 16px)'
              }}>
                ¿Consultas?
              </h4>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--spacing-sm, 12px)',
                fontSize: 'var(--font-size-sm, 14px)'
              }}>
                <a href="tel:+54911234567" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm, 12px)',
                  color: 'var(--color-primary, #2563eb)',
                  textDecoration: 'none'
                }}>
                  <Phone size={16} />
                  (011) 1234-5678
                </a>
                
                <a href="mailto:info@negocio.com" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm, 12px)',
                  color: 'var(--color-primary, #2563eb)',
                  textDecoration: 'none'
                }}>
                  <Mail size={16} />
                  info@negocio.com
                </a>
              </div>
            </div>

            {/* Botón volver */}
            <div className="card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 'var(--spacing-lg, 24px)'
            }}>
              <button 
                onClick={onVolverInicio}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Home size={18} />
                Volver al Inicio
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TurnoConfirmado;