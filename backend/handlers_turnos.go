package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"
	"strings"

	"github.com/gin-gonic/gin"
)

// Estructura Turno
// type Turno struct {
// 	    ID         int    `json:"id"`
// 	    ClienteID  int    `json:"cliente_id"`
// 	    EmpleadoID int    `json:"empleado_id"`
// 	    ServicioID int    `json:"servicio_id"`
// 	    Fecha      string `json:"fecha"`        // "2025-08-20"
// 	    HoraInicio string `json:"hora_inicio"`  // "15:30"
// 	    HoraFin    string `json:"hora_fin"`     // "16:00"
// 	    Estado     string `json:"estado"`
// 		DuracionMin int   `json:"duracion_min"`
// }

// Validaciones comunes
func validarTurno(db *sql.DB, t Turno) error {
	var tmp int

	// 1. Validar cliente existe
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

	// 4. Validar rango de horas (parsear HH:MM)
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

	// 5. Validar que el empleado no tenga solapamiento en la misma fecha
	count := 0
	query := `SELECT COUNT(*) FROM turnos 
              WHERE empleado_id=$1 AND fecha=$2
              AND hora_inicio < $4 AND hora_fin > $3`
	err = db.QueryRow(query, t.EmpleadoID, t.Fecha, t.HoraInicio, t.HoraFin).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("el empleado ya tiene un turno en ese horario")
	}

	return nil
}

func extraeHoraDesdeString(s string) (string, error) {
	// Parseamos el string en formato RFC3339
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return "", err
	}
	// Retornamos solo hora y minuto
	return t.Format("15:04"), nil
}

func combinarFechaHoraStr(fecha, horaInicio, horaFin string) (string, string, error) {
	horaInicio, _ = extraeHoraDesdeString(horaInicio)
	horaFin, _ = extraeHoraDesdeString(horaFin)

	// Definir zona horaria UTC-3
	loc := time.FixedZone("UTC-3", -3*60*60)

	// Formato combinado: "2006-01-02 15:04"
	layout := "2006-01-02 15:04"

	inicioStr := fmt.Sprintf("%s %s", fecha, horaInicio)
	finStr := fmt.Sprintf("%s %s", fecha, horaFin)

	fechaHoraInicio, err := time.ParseInLocation(layout, inicioStr, loc)
	if err != nil {
		return "", "", err
	}

	fechaHoraFin, err := time.ParseInLocation(layout, finStr, loc)
	if err != nil {
		return "", "", err
	}

	// Formatear como string con -03
	formatoFinal := "2006-01-02 15:04:05 -0700 -07"
	// fmt.Println("Fecha Inicio:", fechaHoraInicio.Format(formatoFinal))
	// fmt.Println("Fecha Fin   :", fechaHoraFin.Format(formatoFinal))
	return fechaHoraInicio.Format(formatoFinal), fechaHoraFin.Format(formatoFinal), nil
}

// Función que verifica si un slot está ocupado
func estaOcupado(inicio, fin time.Time, turnos []Turno, fecha string) bool {
	// fmt.Println("Entra estaOcupado")

	layout := "2006-01-02 15:04:05 -0700 -07"

	for _, t := range turnos {
		fecha_turno := strings.Split(t.Fecha, "T")[0]

		// Solo reviso turnos del mismo día
		if fecha_turno != fecha {
			continue
		}

		// Parsear HoraInicio y HoraFin con el layout correcto
		ocupadoInicio, err1 := time.Parse(layout, t.HoraInicio)
		ocupadoFin, err2 := time.Parse(layout, t.HoraFin)
		if err1 != nil || err2 != nil {
			fmt.Println("Error parseando horas del turno:", err1, err2)
			continue
		}

		// fmt.Println("Turno ocupado:", ocupadoInicio, "-", ocupadoFin)
		// fmt.Println("Turno nuevo:  ", inicio, "-", fin)

		// Chequear solapamiento
		if inicio.Before(ocupadoFin) && fin.After(ocupadoInicio) {
			return true
		}
	}
	return false
}



func getHorariosDisponibles(c *gin.Context, db *sql.DB) {
	empleadoID := c.Query("empleado_id")
	servicioID := c.Query("servicio_id")
	fecha := c.Query("fecha")
	// fmt.Println("fecha: ", fecha)

	// layoutTime := "15:04"
	layoutDate := "2006-01-02"

	if empleadoID == "" || servicioID == "" || fecha == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empleado_id, servicio_id y fecha son requeridos"})
		return
	}

	// 1. Obtener duración del servicio
	var duracion int
	err := db.QueryRow(`SELECT duracion_min FROM servicios WHERE id = $1`, servicioID).Scan(&duracion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error obteniendo duración del servicio"})
		return
	}

	// 2. Obtener turnos ocupados para ese empleado y fecha
	rows, err := db.Query(`
		SELECT hora_inicio, hora_fin, fecha
		FROM turnos
		WHERE empleado_id = $1 AND fecha = $2 AND estado != 'cancelado'`,
		empleadoID, fecha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error consultando turnos"})
		return
	}
	defer rows.Close()

	var turnos []Turno
	for rows.Next() {
		var t Turno
		if err := rows.Scan(&t.HoraInicio, &t.HoraFin, &t.Fecha); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		fechaInicio, fechaFin, err := combinarFechaHoraStr(fecha, t.HoraInicio, t.HoraFin)
		if err != nil {
			panic(err)
		}

		t.HoraInicio = fechaInicio
		t.HoraFin = fechaFin

		turnos = append(turnos, t)
	}

	// 3. Definir rango laboral (hardcodeado, luego lo podés parametrizar por empleado)
	layout := "15:04"
	workStart, _ := time.Parse(layout, "09:00")
	workEnd, _ := time.Parse(layout, "20:00")

	// 4. Ajustar fecha
	fechaParsed, _ := time.Parse(layoutDate, fecha)
	workStart = time.Date(fechaParsed.Year(), fechaParsed.Month(), fechaParsed.Day(), workStart.Hour(), workStart.Minute(), 0, 0, time.Local)
	workEnd = time.Date(fechaParsed.Year(), fechaParsed.Month(), fechaParsed.Day(), workEnd.Hour(), workEnd.Minute(), 0, 0, time.Local)

	// fmt.Println("workStart: ",workStart)
	// fmt.Println("workEnd: ",workEnd)
	// fmt.Println("turnos: ",turnos[0].HoraInicio)
	// fmt.Println("turnos: ",turnos[0].HoraFin)

	// 5. Generar slots disponibles
	slots := []string{}
	dur := time.Duration(duracion) * time.Minute
	for slotStart := workStart; slotStart.Add(dur).Before(workEnd) || slotStart.Add(dur).Equal(workEnd); slotStart = slotStart.Add(dur) {
		slotEnd := slotStart.Add(dur)
		if !estaOcupado(slotStart, slotEnd, turnos, fecha) {
			slots = append(slots, fmt.Sprintf("%s - %s", slotStart.Format("15:04"), slotEnd.Format("15:04")))
		}
	}

	// Mostrar slots
	// fmt.Println("Horarios disponibles para fecha ", fecha,":")
	// for _, s := range slots {
	// 	fmt.Println(s)
	// }

	c.JSON(http.StatusOK, gin.H{"disponibles": slots})
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

	query := `INSERT INTO turnos (cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado, duracion_min)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
              RETURNING id`
	err := db.QueryRow(query, t.ClienteID, t.EmpleadoID, t.ServicioID, t.Fecha, t.HoraInicio, t.HoraFin, t.Estado, t.DuracionMin).
		Scan(&t.ID)
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

	query := `UPDATE turnos 
              SET cliente_id=$1, empleado_id=$2, servicio_id=$3, fecha=$4, hora_inicio=$5, hora_fin=$6, estado=$7 
              WHERE id=$8`
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
