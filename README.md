# Ejercicio Backend 2020

# Problema

En un miércoles como cualquiera surge la oportunidad de crear una AI llamada Gariboldi que analiza resultados del equipo Leicester City de la Premier League con el fin de predecir el outcome del próximo partido. Como la Premier es una institución muy antigua y poco tecnológica no hubo caso de conseguir una vía oficial para que Gariboldi se conecte a ellos.
Plan B:

# Se pide

Sebe debe construir una API Rest que devuelva cierta información básica sobre el equipo de los Foxes. Este API será un microservicio que se conecte a una DB de mongo y se utilize para guardar información en la misma y devolver ciertas cuentas simples para que Gariboldi luego se entrene.

La data debe ser obtenida con un cron una vez por día (o al prenderse el server) de la siguiente web: https://www.lcfc.com/
Los calls que se piden son los siguientes:

* GET Resultado del último partido.
* GET resultado de un partido en particular (se puede buscar por fecha o por id).
* GET Últimos 50 partidos.
* GET Partidos por intervalo de fecha
*GET Para obtener los puntos que tiene Leicester por un rango de fechas.

El API propia debe devolver la MONGO DB. De ninguna manera se debe ir a buscar en vivo resultados contra un request.

# Adicionales
* Implementar AUTH con jwt token cosa que para poder leer o hacer cualquier request debas antes obtener un authtoken logeandote y permita registrarse con user y password.
* Implementar un método POST para agregar un partido a mano, con las mismas carácteristicas que los partidos provenientes del API.

# Ejercicio resuelto

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