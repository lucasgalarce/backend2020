require('./config/config')

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Configuración global de rutas
app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}, (err, res) => {
    if(err) throw err;

    console.log("base de datos online");
});

app.listen(PORT, () => {
    console.log(`Escuchando el puerto ${PORT}`)
})