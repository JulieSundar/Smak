//
// ### 2. JOHNNY-FIVE HARDWARE / GPIO ###
//       
// Johnny
var five = require("johnny-five");
var Raspi = require("raspi-io");
// 1. initialize hardware based on io.json file (DNS-like / TTL / status - i call that IONS)


// 2. Detect-hardware status & add newly connected hardware to IONS






// Setup hardware
var board=new five.Board;
board.on("ready", function() {
    // Initialize an Led instance on pin 13 of
    var led = new five.Led({ pin: 13, board: board });
    // gyro-sensors
    var gyrox = new five.Sensor("A0");
    var gyry = new five.Sensor("A1");
    var gyroz = new five.Sensor("A2");

    client.on('message', function (topic, payload, packet) {
        // If led switched on -> strobe it or kill it!
        console.log('switching led now : ' + payload.toString());
        if (topic=='led' && payload == "off") {
          led.off();
        }
        if (topic=='led' && payload == "on") {
          led.on();
        };
    });
    //submit gyro changes into the

    gyrox.scale(0, 10).on('change', function() {
          // Emit sensor readings to broker
          client.publish('gyro',toString(this.value));
          //console.log(this.value);
    });



});
  
io.sockets.on('connection', function (socket) {
    // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function (data) {
        console.log('Subscribing to '+data.topic);
        socket.join(data.topic);
        client.subscribe(data.topic);
    });
    // when socket connection publishes a message, forward that message
    // the the mqtt broker
    socket.on('publish', function (data) {
        console.log('Publish to '+data.topic + ' : '+data.message);
        var options = {qos: 0, retain:true};
        client.publish(data.topic,data.payload, options);       
    });  
});
 
// listen to messages coming from the mqtt broker
client.on('message', function (topic, payload, packet) {
    //console.log(topic+'='+payload);
    io.sockets.emit('mqtt',{'topic':String(topic),
                            'payload':String(payload)});
});