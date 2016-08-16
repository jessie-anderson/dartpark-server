import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
<<<<<<< HEAD:app/server.js
import apiRouter from './router_jessie';

// DB Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/dartpark';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;
=======
import apiRouter from './routerMau';
>>>>>>> f97ce3880d3b49672c92ae1c4a5632dd970a67d6:app/serverMau.js

// initialize
const app = express();
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/dartpark';
mongoose.connect(mongoURI);
// set mongoose promises to es6 default
mongoose.Promise = global.Promise;

// enable/disable cross origin resource sharing if necessary
app.use(cors());

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);
<<<<<<< HEAD:app/server.js


// default index route
app.get('/', (req, res) => {
  res.send('hi');
});
=======
>>>>>>> f97ce3880d3b49672c92ae1c4a5632dd970a67d6:app/serverMau.js

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
