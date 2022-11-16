var host = process.env.IP || '192.168.1.151';
var port = process.env.PORT || 8000;
// Use a secured server to access
var https = require('https');
var fs = require('fs');
// Certs/keys here
var options = {
    Key : fs.readFileSync('cert/file.pem').toString(),
    certificate : fs.readFileSync('cert/file.pem').toString()
};

// Hardware Libs
var five = require("johnny-five");
var Raspi = require("raspi-io");

var gpioService = require("./gpioService.js");
//var ecgService = require("./ecgService.js");
//var ionsService = require("./ionsService.js");

var staticSite = __dirname + '/public';
var staticSiteCss = __dirname + '/public/css';
var staticSiteImg = __dirname + '/public/img';
var swaggerUI = __dirname + '/public/swag-ui';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// create an mqtt client object and connect to the mqtt broker
/* Pusher.js
Server side node.js script that services real-time websocket requests
Allows websocket connections to subscribe and publish to MQTT topics
*/
var sys = require('sys');
var net = require('net');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://127.0.0.1:1883');
//MONGOD





//
// ### 2. SETUP HARDWARE JOHNNY-FIVE HARDWARE / GPIO ###
//       
// Johnny



// 1. initialize hardware based on io.json file (DNS-like / TTL / status - i call that IONS)


// 2. Detect-hardware status & add newly connected hardware to IONS

// Setup hardware
var board = new five.Board;
board.on("ready", function() {
    // Initialize an Led instance on pin 13 of
    var payload;
    var led = new five.Led({
        pin: 13,
        board: board
    });
    // gyro-sensors
    var gyrox = new five.Sensor("A0");
    var gyroy = new five.Sensor("A1");
    var gyroz = new five.Sensor("A2");

    // OLIMEX-Sensor
    // var ekg = {};
    // byteArrayToLong = function( /*byte[]*/ byteArray) {
    //     var value = 0;
    //     for (var i = byteArray.length - 1; i >= 0; i--) {
    //         value = (value * 256) + byteArray[i];
    //     }
    //     return value;
    // };
    // ekg.resetBuffer = function() {
    //     ekg.buffer = []
    // };

    // ekg.pointCount = 0;
    // ekg.vals = [];

    // ekg.processPacket = function() {
    //     //console.log(
    //     //  byteArrayToLong([ekg.buffer[5], ekg.buffer[4]])+ ","+
    //     //  byteArrayToLong([ekg.buffer[7], ekg.buffer[6]])+ ","+
    //     //  byteArrayToLong([ekg.buffer[9], ekg.buffer[8]])
    //     //);
    //     ekg.pointCount++;
    //     var graphPoint = {
    //         y: byteArrayToLong([ekg.buffer[7], ekg.buffer[6]]),
    //         x: ekg.pointCount
    //     };
    //     // ### Send to MQTT here
    //     ekg.vals.push(graphPoint);
    //     // if (ekg.vals.length > 500) {
    //     //     ekg.vals.shift();
    //     // }
    //     payload = JSON.Stringify(graphPoint); //'{ "X" : "' + gyrox.value + '" ,"Y" : "' + gyroy.value + '" ,"Z" : "' + gyroz.value + '"}';
    //     client.publish('gyro', payload);        

    //     //chart.render();
    //     ekg.resetBuffer();
    // };

    // ekg.handleData = function(data) {
    //   if (data.data) {
    //     vals = new Uint8Array(data.data);
    //     console.log(vals);
    //     for (var i = 0; i < vals.length; i++) {
    //       if (ekg.buffer.length === 0) {
    //         if (vals[i] === 165) {
    //           ekg.buffer.push(165);
    //         }
    //       } else if (ekg.buffer.length === 1) {
    //         if (vals[i] === 90) {
    //           ekg.buffer.push(90);
    //         } else {
    //           ekg.resetBuffer();
    //         }
    //       } else if (ekg.buffer.length >= 2) {
    //         if (ekg.buffer.length === 16) {
    //           if (vals[i] === 1) {
    //             ekg.processPacket();
    //           } else {
    //             ekg.resetBuffer();
    //           }
    //         } else {
    //           ekg.buffer.push(vals[i]);
    //         }
    //       }
    //     }
    //   }
    // };

    //submit gyro changes into the
    gyrox.scale(0, 10).on('change', function() {
        // Emit sensor readings to broker
        payload = '{ "X" : "' + gyrox.value + '" ,"Y" : "' + gyroy.value + '" ,"Z" : "' + gyroz.value + '"}';
        client.publish('gyro', payload);
        //console.log(payload);
    });
});

io.sockets.on('connection', function(socket) {
    // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function(data) {
        console.log('Subscribing to ' + data.topic);
        socket.join(data.topic);
        client.subscribe(data.topic);
    });
	
	
    // when socket connection publishes a message, forward that message
    // the the mqtt broker
    socket.on('publish', function(data) {
        console.log('Publish to ' + data.topic + ' : ' + data.message);
        var options = {
            qos: 0,
            retain: true
        };
        client.publish(data.topic, data.payload, options);
    });
});

// listen to messages coming from the mqtt broker
client.on('message', function(topic, payload, packet) {
    //console.log(topic+'='+payload);
    io.sockets.emit('mqtt', {
        'topic': String(topic),
        'payload': String(payload)
    });
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router
//var router = require('express-router-wrapper')(express);

var rpio = require('rpio');
router.route('/gpio')
    .get(function(req, res, next) {
        res.json(gpioService.gpioList());
    });


// return current status of all registered gpios or of a single one
router.route('/gpio/status/:gpio*')
    .get(function(req, res, next) {
        //console.log('Get status gpio'+ (typeof req.params.gpio != "undefined" ? req.params.gpio : 's'));
        //How to access a single key or value                                                       
        //var result=gpioService.gpioRead(req.params.gpio);
        //res.json(gpioService.gpioWrite(req.params.gpio, req.params.setvalue));
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

router.route('/gpio/test/:id')
    .get(function(req, res, next) {
        var result = gpioService.gpioToggle(req.params.id);
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

router.route('/gpio/:gpio/:setvalue') // app.get('path/:required/:optional?*, ...should work for path/meow, path/meow/voof, path/meow/voof/moo/etc
    .get(function(req, res, next) {
        //console.log('gpio'+ req.params.gpio + ' setvalue : ' + req.params.setvalue);
        //How to access a single key or value                               
        //console.log(JSON.stringify(req.params));                               
        var result = gpioService.gpioWrite(req.params.gpio, req.params.setvalue);
        var status = result.error ? 400 : 200;
        res.status(status).json(result);
    });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.use('/', express.static(swaggerUI));

// ENABLE CORS for Express (so swagger.io and external sites can use it remotely .. SECURE IT LATER!!)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', express.static(staticSite));
// Use router for all /api requests
app.use('/api', router);

//app.use('/public/css', express.static(staticSiteCss));
//app.use('/public/img', express.static(staticSiteImg));
if (!process.env.C9_PID) {
    console.log('Running at http://' + host + ':' + port);
}
//app.listen(port, function() { console.log('Listening')});
server.listen(port, function() {
    console.log('Listening')
});
