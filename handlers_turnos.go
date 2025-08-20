package main

import (
    "database/sql"
    "github.com/gin-gonic/gin"
    "net/http"
)

func getTurnos(c *gin.Context, db *sql.DB) {
    rows, err := db.Query("SELECT id, cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado FROM turnos")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    var turnos []Turno
    for rows.Next() {
        var t Turno
        if err := rows.Scan(&t.ID, &t.ClienteID, &t.EmpleadoID, &t.ServicioID, &t.Fecha, &t.HoraInicio, &t.HoraFin, &t.Estado); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        turnos = append(turnos, t)
    }

    c.JSON(http.StatusOK, turnos)
}

func createTurno(c *gin.Context, db *sql.DB) {
    var t Turno
    if err := c.ShouldBindJSON(&t); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    query := `INSERT INTO turnos (cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado)
              VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`
    err := db.QueryRow(query, t.ClienteID, t.EmpleadoID, t.ServicioID, t.Fecha, t.HoraInicio, t.HoraFin, t.Estado).Scan(&t.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, t)
}

func updateTurno(c *gin.Context, db *sql.DB) {
    id := c.Param("id")
    var t Turno
    if err := c.ShouldBindJSON(&t); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    query := `UPDATE turnos SET cliente_id=$1, empleado_id=$2, servicio_id=$3, fecha=$4, hora_inicio=$5, hora_fin=$6, estado=$7 WHERE id=$8`
    _, err := db.Exec(query, t.ClienteID, t.EmpleadoID, t.ServicioID, t.Fecha, t.HoraInicio, t.HoraFin, t.Estado, id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "turno actualizado"})
}

func deleteTurno(c *gin.Context, db *sql.DB) {
    id := c.Param("id")
    _, err := db.Exec("DELETE FROM turnos WHERE id=$1", id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "turno eliminado"})
}
