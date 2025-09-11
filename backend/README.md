# Comandos para inicializar

## DB Postgresql

### Correr container posgres
```
docker run --name postgres-gestor_turnos -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=gestor_turnos -p 5432:5432 -d postgres
```


### Iniciar ejecucion container stopped
```
docker start container_id
```

# Acceder por consola a container postgres 
```
docker exec -it postgres-gestor_turnos psql -U admin -d gestor_turnos 
```

comandos para acceder a la bd por consola.

1. Mostrar todas las bases de datos
```
\l
```

2. Cambiar a otra bd
```
\c postgres
```

3. Mostrar todas las tablas en la base de datos actual
```
\dt
```

4. Hacer un SELECT para ver datos de cualquier tabla
```
SELECT * FROM empleados;

SELECT * FROM turnos ORDER BY date DESC LIMIT 5;

```

5. Hacer un INSERT
```
INSERT INTO peluquerias (id, nombre) VALUES (1, 'Peluquería Central');
```


## Go
1. go mod init gastor_turnos
2. go mod tidy  /* instala paquetes *\
3. go build -o gestor_turnos .
4. ./gestor_turnos
5. go build -o gestor_turnos . && ./gestor_turnos



# TODO
1. Frontend  


# DONE
1. Todos los cruds validados y funcionando


# Comandos en db

## Empleados
```
SELECT * FROM empleados;
```


En la db, en la table clientes, el dni debe ser el id.