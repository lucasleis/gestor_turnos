package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Estructura Empleado
// type Empleado struct {
//     ID          int    `json:"id"`
//     Nombre      string `json:"nombre"`
//     Especialidad string `json:"especialidad"`
// }

// Listar todos los empleados
func getEmpleados(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, nombre, especialidad FROM empleados")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var empleados []Empleado
	for rows.Next() {
		var e Empleado
		if err := rows.Scan(&e.ID, &e.Nombre, &e.Especialidad); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		empleados = append(empleados, e)
	}

	c.JSON(http.StatusOK, empleados)
}

// Obtener empleado por ID
func getEmpleado(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var e Empleado
	err := db.QueryRow("SELECT id, nombre, especialidad FROM empleados WHERE id=$1", id).
		Scan(&e.ID, &e.Nombre, &e.Especialidad)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "empleado no encontrado"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, e)
}

// Crear empleado
func createEmpleado(c *gin.Context, db *sql.DB) {
	var e Empleado
	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO empleados (nombre, especialidad) VALUES ($1, $2) RETURNING id`
	err := db.QueryRow(query, e.Nombre, e.Especialidad).Scan(&e.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, e)
}

// Actualizar empleado
func updateEmpleado(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var e Empleado
	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE empleados SET nombre=$1, especialidad=$2 WHERE id=$3`
	res, err := db.Exec(query, e.Nombre, e.Especialidad, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "empleado no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "empleado actualizado"})
}

// Borrar empleado
func deleteEmpleado(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	// Verificar si el empleado tiene turnos asignados
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM turnos WHERE empleado_id=$1", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no se puede eliminar: el empleado tiene turnos asignados"})
		return
	}

	// Si no tiene turnos, borrar
	res, err := db.Exec("DELETE FROM empleados WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "empleado no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "empleado eliminado"})
}
