package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	// "net/http"
)

func main() {
	db := initDB() // inicializar conexión y schema

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// CRUD clientes            // VERIFICADO
	r.GET("/clientes", func(c *gin.Context) { getClientes(c, db) })
	r.GET("/clientes/:id", func(c *gin.Context) { getCliente(c, db) })
	r.POST("/clientes", func(c *gin.Context) { createCliente(c, db) })
	r.PUT("/clientes/:id", func(c *gin.Context) { updateCliente(c, db) })
	r.DELETE("/clientes/:id", func(c *gin.Context) { deleteCliente(c, db) })

	// CRUD de empleados        // VERIFICADO
	r.GET("/empleados", func(c *gin.Context) { getEmpleados(c, db) })
	r.GET("/empleados/:id", func(c *gin.Context) { getEmpleado(c, db) })
	r.POST("/empleados", func(c *gin.Context) { createEmpleado(c, db) })
	r.PUT("/empleados/:id", func(c *gin.Context) { updateEmpleado(c, db) })
	r.DELETE("/empleados/:id", func(c *gin.Context) { deleteEmpleado(c, db) })

	// CRUD servicios           // VERIFICADO
	r.GET("/servicios", func(c *gin.Context) { getServicios(c, db) })
	r.GET("/servicios/:id", func(c *gin.Context) { getServicio(c, db) })
	r.POST("/servicios", func(c *gin.Context) { createServicio(c, db) })
	r.PUT("/servicios/:id", func(c *gin.Context) { updateServicio(c, db) })
	r.DELETE("/servicios/:id", func(c *gin.Context) { deleteServicio(c, db) })

	// CRUD de turnos           // VERIFICADO
	r.GET("/turnos", func(c *gin.Context) { getTurnos(c, db) })
	r.GET("/horarios_disponibles", func(c *gin.Context) { getHorariosDisponibles(c, db) })
	r.GET("/turnos/cliente/:id", func(c *gin.Context) { getTurnosPorCliente(c, db) })	
	r.POST("/turnos", func(c *gin.Context) { createTurno(c, db) })
	r.PUT("/turnos/:id", func(c *gin.Context) { updateTurno(c, db) })
	r.DELETE("/turnos/:id", func(c *gin.Context) { deleteTurno(c, db) })

	r.Run(":2020")
}
