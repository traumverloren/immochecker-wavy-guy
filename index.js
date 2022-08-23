require('dotenv').config();
const fs = require('fs');
const express = require('express');
const app = express();
const aedes = require('aedes')();

const options = {
  key: fs.readFileSync(process.env.KEY),
  cert: fs.readFileSync(process.env.CERT),
};

const httpServer = require('https').createServer(options, app);
const ws = require('websocket-stream');
const appPort = 8080;
const mqtt = require('net').createServer(aedes.handle);
const mqttPort = 1883;

// mqtt broker for the arduino client
mqtt.listen(mqttPort, function () {
  console.log('mqtt server listening on port', mqttPort);
});

// secure mqtt broker for browser clients
ws.createServer(
  {
    server: httpServer,
  },
  aedes.handle
);

httpServer.listen(appPort, function () {
  aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
  console.log('server listening on port', appPort);
});

aedes.on('clientError', function (client, err) {
  console.log('client error', client.id, err.message, err.stack);
});

aedes.on('publish', function (packet, client) {
  console.log(packet);
  if (client) {
    console.log('message from client', client.id);
  }
});

aedes.on('subscribe', function (subscriptions, client) {
  if (client) {
    console.log('subscribe from client', subscriptions, client.id);
  }
});

aedes.on('client', function (client) {
  console.log('new client', client.id);
});

app.get('/', (req, res) => {
  res.send('server is working!');
});

