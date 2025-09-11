package main

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Estructura Cliente
// type Cliente struct {
//     ID       int    `json:"id"`
//     Nombre   string `json:"nombre"`
//     Apellido string `json:"apellido"`
//     Telefono string `json:"telefono"`
//     Email    string `json:"email"`
//     Dni      string `json:"dni"`
// }

// Listar todos los clientes
func getClientes(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, nombre, telefono, email FROM clientes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var clientes []Cliente
	for rows.Next() {
		var cl Cliente
		if err := rows.Scan(&cl.ID, &cl.Nombre, &cl.Telefono, &cl.Email); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		clientes = append(clientes, cl)
	}

	c.JSON(http.StatusOK, clientes)
}

// Obtener cliente por ID
func getCliente(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var cl Cliente
	err := db.QueryRow("SELECT id, nombre, telefono, email FROM clientes WHERE id=$1", id).
		Scan(&cl.ID, &cl.Nombre, &cl.Telefono, &cl.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "cliente no encontrado"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, cl)
}

// Crear cliente
func createCliente(c *gin.Context, db *sql.DB) {
	var cl Cliente
	if err := c.ShouldBindJSON(&cl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `INSERT INTO clientes (id, nombre, apellido, telefono, email) VALUES ($1, $2, $3, $4) RETURNING id`
	err := db.QueryRow(query, cl.Dni, cl.Nombre, cl.Apellido, cl.Telefono, cl.Email).Scan(&cl.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, cl)
}

// Actualizar cliente
func updateCliente(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var cl Cliente
	if err := c.ShouldBindJSON(&cl); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `UPDATE clientes SET nombre=$1, telefono=$2, email=$3 WHERE id=$4`
	res, err := db.Exec(query, cl.Nombre, cl.Telefono, cl.Email, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cliente no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "cliente actualizado"})
}

// Borrar cliente (solo si no tiene turnos)
func deleteCliente(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	// Verificar si tiene turnos asignados
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM turnos WHERE cliente_id=$1", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no se puede eliminar: el cliente tiene turnos asignados"})
		return
	}

	// Borrar cliente
	res, err := db.Exec("DELETE FROM clientes WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cliente no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "cliente eliminado"})
}
