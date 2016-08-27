import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import socketio from 'socket.io';
import http from 'http';

import apiRouter from './router';
import sendMessage from './controllers/conversation_controller';
import { requireAuthVersatile } from './services/passport';


// initialize
const app = express();
const server = http.createServer(app);
const io = socketio(server);
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

io.on('connection', (socket) => {
  // creates notes and
  socket.on('sendMessage', (fields) => {
    console.log(fields);
    socket.emit('error', 'create failed');
    // sendMessage(fields).then((result) => {
    //   pushNotes();
    // }).catch(error => {
    //   console.log(error);
    //   socket.emit('error', 'create failed');
    // });
  });
});

// START THE SERVER
// =============================================================================
const port = process.env.PORT || 9090;
server.listen(port);

console.log(`listening on: ${port}`);
