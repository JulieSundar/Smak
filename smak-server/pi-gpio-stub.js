"use strict";
function noop(){}

function sanitizeDirection(direction) {
	direction = (direction || "").toLowerCase().trim();
	if(direction === "in" || direction === "input") {
		return "in";
	} else if(direction === "out" || direction === "output" || !direction) {
		return "out";
	} else {
		throw new Error("Direction must be 'input' or 'output'");
	}
}

var gpio = {
	rev: 1,
	status:{},
	
	open: function(pinNumber, options, callback) {
		gpio.status[pinNumber]={ "value":0 };
		if(!callback && typeof options === "function") {
			callback = options;
			options = "out";
		}
		gpio.setDirection(pinNumber, options, callback);
	},

	setDirection: function(pinNumber, direction, callback) {
		gpio.status[pinNumber].direction = sanitizeDirection(direction);
		(callback || noop)();
	},

	getDirection: function(pinNumber, callback) {
		(callback)(null, gpio.status[pinNumber].direction);
	},

	close: function(pinNumber, callback) {
		gpio.status[pinNumber] = undefined; 
		(callback || noop)();
	},

	read: function(pinNumber, callback) {
		(callback || noop)(null, gpio.status[pinNumber].value);
	},

	write: function(pinNumber, value, callback) {
		gpio.status[pinNumber].value = parseInt(value,10);
		(callback || noop)();
	}
};

gpio.export = gpio.open;
gpio.unexport = gpio.close;

module.exports = gpio;
