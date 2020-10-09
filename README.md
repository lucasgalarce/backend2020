# Ejercicio Backend 2020

* Obtener puntuacion del equipo en un rango de fechas, se le pasa por query parameters 'from' y 'to'  
GET /score?from=2020-01-04&to=2020-10-04

* Crear usuario  
POST /user
email: string
password: email

* Obtener usuarios  
GET /user

* Login, conseguir token  
POST /login
email: string
password: string

* Cargar partidos en la db  
POST /loadmatches

* Crear partido manualmente  
POST /match
localTeam: string,
localScore: string,
awayTeam: string,
awayScore: string,
date: date

* Obtener ultimo partido  
GET /lastMatch

* Obtener ultimos 50 partidos  
GET /match

* Obtetener partido por id, se le pasa id por query parameter  
GET /match?id=

* Obtener partido por fecha, se le pasa fecha por query parameter  
GET /match?date=2020-10-04

* Obtener partidos por un rango de fecha, se le pasa por query parameters 'from' y 'to'  
GET /match?from=2020-09-05&to=2020-10-04