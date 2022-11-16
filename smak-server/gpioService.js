//
// ### 2. HARDWARE LOCAL / GPIO ###
//        webcam gpio webcam ...
// git://github.com/voodootikigod/node-serialport.git //
// to read the serial port where arduino is sitting.  //
              



// ### 2. CONNECT OLIMEX WITH SERIAL - JS


// ### 2. HARDWARE LOCAL / GPIO ###
//        webcam gpio webcam ...

// ## GPIO
var rpio = require('rpio');
/* Use physical layout for this example */
//rpio.setMode('physical');  /* Use the physical P1-P26/P40 layout */
rpio.setMode('gpio'); /* The default GPIOxx numbering system */
// Define the ports to use here or in separate gpio-conf.json file

/* Configure GPIOs here */
// load config from json file ### TB TODO if file exists! else load from code here
var gpios = require('./gpio-config.json');
console.log(gpios);

function gpioInit() {
    // Add optional gpio ID so only a single IO can be initialized/activated
    // setup GPIO from object array
    for (i = 0; i < gpios.length; i++) {
        switch (gpios[i].type) {
            case 'input':
                rpio.setInput(gpios[i].gpio);
                //console.log('input gpio' + gpios[i].gpio);
                break;
            case 'output':
                rpio.setOutput(gpios[i].gpio);
                //console.log('output gpio' + gpios[i].gpio); // + ' init value: ' + if(gpios[i].init!==0,gpios[i].init,0 ));
                // Set init state/value or 0
                if (typeof gpios[i].init !== 'undefined') {
                    //console.log('gpio'+gpios[i].gpio + " INIT " + gpios[i].init)
                    rpio.write(gpios[i].gpio, gpios[i].init);
                } else {
                    rpio.write(gpios[i].gpio, 0);
                };
                gpios[i].value = rpio.read(gpios[i].gpio);
                break;
            case 'pwm':
                // PWM only available on GPIO12/Pin32, GPIO13/Pin33, GPIO18/Pin12, or GPIO19/Pin35
                // TO DO: Test if pin available for PWM before setting
                rpio.setFunction(gpios[i].gpio, rpio.PWM);
                //console.log('PWM gpio' + gpios[i].gpio);
                //  power-of-two divisor of the base 19.2MHz rate, with a minimum of 4096 (4.6875kHz)
                rpio.pwmSetClockDivider(64); // if not defined use 300kHz gpios[i].clockdiv||
                //  This determines the maximum pulse width.
                if (typeof gpios[i].range !== 'undefined') {
                    //console.log('gpio'+gpios[i].gpio + " Range " + gpios[i].range)
                    rpio.pwmSetRange(gpios[i].gpio, gpios[i].range);
                } else {
                    //console.log('gpio'+gpios[i].gpio + " Range 100")
                    rpio.pwmSetRange(gpios[i].gpio, 100); // if not defined use 100% gpios[i].range || 
                };
                // TB If init state defined set immediately          
                if (typeof gpios[i].init !== 'undefined') {
                    //console.log('gpio'+gpios[i].gpio + " INIT " + gpios[i].init)
                    rpio.pwmSetData(gpios[i].gpio, gpios[i].init);
                    // write to status field as last updated setpoint
                    gpios[i].value = gpios[i].init;
                } else {
                    // TB probably not needed
                    rpio.pwmSetData(gpios[i].gpio, 0);
                };
                break;
        }
    };
};

gpioInit

function gpioList() {
    return ({
        'gpio': gpios
    });
};

function gpioWrite(gpio, setvalue) {
    // Check first if gpio defined as updateable/ if only readable jump to end  return value
    var i;
    // check if setvalue has been given
    if (typeof setvalue !== 'undefined') {
        //console.log ('writing gpio' + gpio + ' : ' + setvalue);
        // check if its an output PWM or digital port
        i = getIndexByAttribute(gpios, 'gpio', parseInt(gpio));

        if (gpios[i].type === 'pwm') {
            rpio.pwmSetData(gpios[i].gpio, parseInt(setvalue));
            // update GPIO status info
            gpios[i].value = parseInt(setvalue);
        } else {
            rpio.write(parseInt(gpio), parseInt(setvalue));
            // update GPIO status info
            gpios[i].value = rpio.read(gpios[i].gpio);
        };
        //gpios.status = gpio.read(gpio);              

    };
    // read result and write back
    console.log(JSON.stringify(gpios[i]));
    return (gpios[i]);
};

function getIndexByAttribute(array, attr, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(attr) && array[i][attr] === value) {
            return i;
        }
    }
    return -1;
};

// ### TB TO CLEAN.. GET SOME GOOD TEST SEQUENCES IN HERE ###
var async = require('async');

function gpioToggle(gpioID) {
    if (gpios[gpioID]) {
        var hwPin = gpios[gpioID].gpio;
        // ### TB: TO DO
        // OK for output pins switch on/off for 1 sec
        // for input pins just read and return status
        // for PWM pins fire an ease-in/ease-out sequence
        // for I2C ...??
        // for SPI Scan/return connected devices
        // ###
        try {
            async.series([
                    function(cb) {
                        //gpio.open(hwPin, "output");
                        console.log('Firing on/off sequence on gpio' + hwPin);
                        cb(null);
                    },
                    function(cb) {
                        rpio.write(hwPin, rpio.HIGH);
                        //gpio.write(hwPin, 1);
                        cb(null);
                    },
                    function(cb) {
                        setTimeout(cb, 2000); //millisecs
                        cb();
                    },
                    function(cb) {
                        rpio.write(hwPin, rpio.LOW);
                        //gpio.write(hwPin, 0);
                        cb();
                    },
                    function(cb) {
                        //gpio.close(hwPin);
                        cb();
                    },
                    function(cb) {
                        //gpio.close(hwPin);
                        cb();
                    }
                ],
                function(err) {
                    if (err) {
                        throw err
                    }
                }
            );
            return (gpios[gpioID]);
        } catch (e) {
            return ({
                'error': "Operation on hwpin " + hwPin + " failed: "
            });
        }
    } else {
        return ({
            'error': "Invalid ID supplied"
        });
    }
};
// ### TO CLEAN

exports.gpioWrite = gpioWrite
exports.gpioList = gpioList
exports.gpioToggle = gpioToggle
exports.gpioToggle = gpioInit
