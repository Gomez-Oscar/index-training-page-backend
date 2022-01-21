const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const slidesRoutes = require('./routes/slides-routes');
const recordingsRoutes = require('./routes/recordings-routes');

const server = express();

server.use(bodyParser.json());

//middleware para dar acceso a las imagenes
server.use(
  '/slides-pdf/images',
  express.static(path.join('slides-pdf', 'images'))
);

server.use('/slides-pdf/pdfs', express.static(path.join('slides-pdf', 'pdfs')));

// videos
server.use(
  '/recordings/videos',
  express.static(path.join('recordings', 'videos'))
);

server.use(
  '/recordings/images',
  express.static(path.join('recordings', 'images'))
);

// se adjuntan los headers para evitar CORS
server.use((req, res, next) => {
  // asterisco para cualquier dominio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'PATCH',
    'DELETE'
  );
  next();
});

server.use('/api/slides', slidesRoutes);

server.use('/api/recordings', recordingsRoutes);

// este middleware solo se alcanza si se tiene una solicitud que no recibio respuesta
// manejo de errores para rutas no soportadas
server.use((req, res, next) => {
  const error = new HttpError('Colud not find this route', 404);
  throw error;
});

//middleware para manejar errores
server.use((error, req, res, next) => {
  // si ya se envio una response pase el error a otra middleware
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500); //si tenemos un codigo de error o 500 cuando falla el servidor
  res.json({ message: error.message || 'An unknown error ocurred!' });
});

const url =
  'mongodb://oscar:perrito@cluster0-shard-00-00.ebnn2.mongodb.net:27017,cluster0-shard-00-01.ebnn2.mongodb.net:27017,cluster0-shard-00-02.ebnn2.mongodb.net:27017/index-training-db?ssl=true&replicaSet=atlas-6zhxhj-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose
  .connect(url)
  .then(() => {
    // si la conexion es exitosa, se inicia el servidor
    console.log('Connected to DB');
    server.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });