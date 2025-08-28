package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"

	// "gorm.io/driver/postgres"
	// "gorm.io/gorm"
	_ "github.com/lib/pq" // driver nativo postgres
)

type Cliente struct {
    ID       int    `json:"id"`
    Nombre   string `json:"nombre"`
    Telefono string `json:"telefono"`
    Email    string `json:"email"`
}

type Empleado struct {
    ID          int    `json:"id"`
    Nombre      string `json:"nombre"`
    Especialidad string `json:"especialidad"`
}

type Servicio struct {
    ID          int     `json:"id"`
    Nombre      string  `json:"nombre"`
    DuracionMin int     `json:"duracion_min"`
    Precio      float64 `json:"precio"`
}

// Estructura mínima para mapear JSON
type Turno struct {
    ID         int    `json:"id"`
    ClienteID  int    `json:"cliente_id"`
    EmpleadoID int    `json:"empleado_id"`
    ServicioID int    `json:"servicio_id"`
    Fecha      string `json:"fecha"`        // "2025-08-20"
    HoraInicio string `json:"hora_inicio"`  // "15:30"
    HoraFin    string `json:"hora_fin"`     // "16:00"
    Estado     string `json:"estado"`
}


func initDB() *sql.DB {
	user := "admin"
	password := "admin123"
	host := "localhost"
	port := 5432
	dbname := "gestor_turnos"

	// Conectar primero a la base postgres
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=postgres sslmode=disable",
		host, port, user, password)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error conectando a postgres:", err)
	}
	defer db.Close()

	// Crear DB si no existe
	_, err = db.Exec("CREATE DATABASE " + dbname)
	if err != nil && err.Error() != fmt.Sprintf("pq: database \"%s\" already exists", dbname) {
		log.Println("Aviso:", err) // si ya existe, sigue
	}

	// Conectar a la DB barberia
	connStrDB := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	dbBarberia, err := sql.Open("postgres", connStrDB)
	if err != nil {
		log.Fatal("Error conectando a barberia:", err)
	}

	// Leer archivo query.sql
	sqlBytes, err := ioutil.ReadFile("query.sql")
	if err != nil {
		log.Fatal("Error leyendo query.sql:", err)
	}
	sqlSchema := string(sqlBytes)

	// Ejecutar schema
	_, err = dbBarberia.Exec(sqlSchema)
	if err != nil {
		log.Fatal("Error ejecutando schema:", err)
	}

	log.Println("Base de datos inicializada correctamente")
	return dbBarberia
}
