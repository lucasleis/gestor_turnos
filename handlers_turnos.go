package main

import (
    "database/sql"
    "errors"
    "github.com/gin-gonic/gin"
    "net/http"
    "time"
)

// Estructura Turno
// type Turno struct {
//     ID         int    `json:"id"`
//     ClienteID  int    `json:"cliente_id"`
//     EmpleadoID int    `json:"empleado_id"`
//     ServicioID int    `json:"servicio_id"`
//     Fecha      string `json:"fecha"`      // formato: "YYYY-MM-DD"
//     HoraInicio string `json:"hora_inicio"` // formato: "HH:MM"
//     HoraFin    string `json:"hora_fin"`    // formato: "HH:MM"
//     Estado     string `json:"estado"`      // pendiente, confirmado, cancelado, completado
// }

// Validaciones comunes
func validarTurno(db *sql.DB, t Turno) error {
    // 1. Validar cliente existe
    var tmp int
    err := db.QueryRow("SELECT id FROM clientes WHERE id=$1", t.ClienteID).Scan(&tmp)
    if err != nil {
        if err == sql.ErrNoRows {
            return errors.New("cliente no encontrado")
        }
        return err
    }

    // 2. Validar empleado existe
    err = db.QueryRow("SELECT id FROM empleados WHERE id=$1", t.EmpleadoID).Scan(&tmp)
    if err != nil {
        if err == sql.ErrNoRows {
            return errors.New("empleado no encontrado")
        }
        return err
    }

    // 3. Validar servicio existe
    err = db.QueryRow("SELECT id FROM servicios WHERE id=$1", t.ServicioID).Scan(&tmp)
    if err != nil {
        if err == sql.ErrNoRows {
            return errors.New("servicio no encontrado")
        }
        return err
    }

    // 4. Validar hora_inicio < hora_fin
    hi, err := time.Parse("15:04", t.HoraInicio)
    if err != nil {
        return errors.New("hora_inicio inválida")
    }
    hf, err := time.Parse("15:04", t.HoraFin)
    if err != nil {
        return errors.New("hora_fin inválida")
    }
    if !hf.After(hi) {
        return errors.New("hora_fin debe ser mayor que hora_inicio")
    }

    // 5. Validar que el empleado no tenga otro turno en el mismo horario
    count := 0
    query := `SELECT COUNT(*) FROM turnos 
              WHERE empleado_id=$1 AND fecha=$2 AND 
                    hora_inicio < $4 AND hora_fin > $3`
    err = db.QueryRow(query, t.EmpleadoID, t.Fecha, t.HoraInicio, t.HoraFin).Scan(&count)
    if err != nil {
        return err
    }
    if count > 0 {
        return errors.New("el empleado ya tiene un turno en ese horario")
    }

    return nil
}

// GET /turnos
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

// POST /turnos
func createTurno(c *gin.Context, db *sql.DB) {
    var t Turno
    if err := c.ShouldBindJSON(&t); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := validarTurno(db, t); err != nil {
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

// PUT /turnos/:id
func updateTurno(c *gin.Context, db *sql.DB) {
    id := c.Param("id")
    var t Turno
    if err := c.ShouldBindJSON(&t); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := validarTurno(db, t); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    query := `UPDATE turnos SET cliente_id=$1, empleado_id=$2, servicio_id=$3, fecha=$4, hora_inicio=$5, hora_fin=$6, estado=$7 WHERE id=$8`
    res, err := db.Exec(query, t.ClienteID, t.EmpleadoID, t.ServicioID, t.Fecha, t.HoraInicio, t.HoraFin, t.Estado, id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    rowsAffected, _ := res.RowsAffected()
    if rowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "turno no encontrado"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "turno actualizado"})
}

// DELETE /turnos/:id
func deleteTurno(c *gin.Context, db *sql.DB) {
    id := c.Param("id")
    res, err := db.Exec("DELETE FROM turnos WHERE id=$1", id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    rowsAffected, _ := res.RowsAffected()
    if rowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "turno no encontrado"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "turno eliminado"})
}
