import express from 'express';

import bodyParser from 'body-parser';

import cors from 'cors';
import mongoose from 'mongoose';
import apiRouter from './router';

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

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
app.listen(port);

console.log(`listening on: ${port}`);
