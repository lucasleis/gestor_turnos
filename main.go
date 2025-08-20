package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    db := initDB() // inicializar conexión y schema

    r := gin.Default()

    // Ruta de prueba
    r.GET("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"message": "pong"})
    })

    // CRUD de turnos
    r.GET("/turnos", func(c *gin.Context) { getTurnos(c, db) })
    r.POST("/turnos", func(c *gin.Context) { createTurno(c, db) })
    r.PUT("/turnos/:id", func(c *gin.Context) { updateTurno(c, db) })
    r.DELETE("/turnos/:id", func(c *gin.Context) { deleteTurno(c, db) })

    r.Run(":2020")
}
