package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Estructura Servicio
// type Servicio struct {
//     ID          int     `json:"id"`
//     Nombre      string  `json:"nombre"`
//     DuracionMin int     `json:"duracion_min"`
//     Precio      float64 `json:"precio"`
// }

// Listar todos los servicios
func getServicios(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, nombre, duracion_min, precio FROM servicios")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var servicios []Servicio
	for rows.Next() {
		var s Servicio
		if err := rows.Scan(&s.ID, &s.Nombre, &s.DuracionMin, &s.Precio); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		servicios = append(servicios, s)
	}

	c.JSON(http.StatusOK, servicios)
}

// Obtener servicio por ID
func getServicio(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var s Servicio
	err := db.QueryRow("SELECT id, nombre, duracion_min, precio FROM servicios WHERE id=$1", id).
		Scan(&s.ID, &s.Nombre, &s.DuracionMin, &s.Precio)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "servicio no encontrado"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, s)
}

// Crear servicio
func createServicio(c *gin.Context, db *sql.DB) {
	var s Servicio
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO servicios (nombre, duracion_min, precio) VALUES ($1, $2, $3) RETURNING id`
	err := db.QueryRow(query, s.Nombre, s.DuracionMin, s.Precio).Scan(&s.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, s)
}

// Actualizar servicio
func updateServicio(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var s Servicio
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE servicios SET nombre=$1, duracion_min=$2, precio=$3 WHERE id=$4`
	res, err := db.Exec(query, s.Nombre, s.DuracionMin, s.Precio, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "servicio no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "servicio actualizado"})
}

// Borrar servicio (solo si no hay turnos asignados)
func deleteServicio(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	// Verificar si hay turnos con este servicio
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM turnos WHERE servicio_id=$1", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no se puede eliminar: existen turnos asignados a este servicio"})
		return
	}

	// Borrar servicio
	res, err := db.Exec("DELETE FROM servicios WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "servicio no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "servicio eliminado"})
}
