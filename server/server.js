require('./config/config');

const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios')
const cron = require('node-cron');

const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Configuración global de rutas
app.use(require('./routes/index'));

// Conexión db
mongoose.connect(process.env.URLDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}, (err, res) => {
    if(err) throw err;

    console.log("DB online");
});

// Funcion que se ejecuta al iniciar el servidor, crea un usuario, logea y consigue token, y hace el request para cargar los partidos
(async () => {
  const email = 'emailtest@gmail.com';
  const password = '1234';
  let token;
  // Creo un usuario
  await axios.post('http://localhost:3000/user/', {
    email,
    password
  }).then( (response) => {
    console.log(response.data)
  }).catch( (err) => {
    console.log(err.response.data)
  })

  // Logueo y consigo token
  await axios.post('http://localhost:3000/login/', {
    email,
    password
  }).then( (response) => {
    console.log(response.data)
    token = response.data.token
  }).catch( (err) => {
    console.log(err.response.data)
  })

  // Hago el request con el token
  console.log("Adding matches...")
  await axios.post('http://localhost:3000/loadmatches', {}, {
    headers: {
      'token': token
    }
  }).then( (response) => {
    console.log(response.data)
  }).catch( (err) => {
    console.log(err)
  })
  console.log("Added matches")
})();

// Cron programado para correr todos los dias a las 00hs, lo dejo comentado porque opte por la opcion de que se 
// carguen los datos al iniciar el server
// cron.schedule('0 0 * * *', async function() {
//   console.log('Running task...');
//   const email = 'emailtest@gmail.com';
//   const password = '1234';
//   let token;
//   // Creo un usuario
//   await axios.post('http://localhost:3000/user/', {
//     email,
//     password
//   }).then( (response) => {
//     console.log(response.data)
//   }).catch( (err) => {
//     console.log(err.response.data)
//   })

//   // Logueo y consigo token
//   await axios.post('http://localhost:3000/login/', {
//     email,
//     password
//   }).then( (response) => {
//     console.log(response.data)
//     token = response.data.token
//   }).catch( (err) => {
//     console.log(err.response.data)
//   })

//   // Hago el request con el token
//   console.log("Adding matches...")
//   await axios.post('http://localhost:3000/loadmatches', {}, {
//     headers: {
//       'token': token
//     }
//   }).then( (response) => {
//     console.log(response.data)
//   }).catch( (err) => {
//     console.log(err)
//   })
//   console.log("Added matches")
// });

app.listen(PORT, () => {
    console.log(`Listening port ${PORT}`)
})