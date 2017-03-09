/**
 * @fileoverview API for SparkFun OpenScale SEN-13261
 * @author felixgalindo91@gmail.com (Felix Galindo)
 */

var util = require('util');
var SerialPort = require('serialport');
var EventEmitter = require('events').EventEmitter;

//OpenScale class
function OpenScale(config) {
	console.log("Initializing OpenScale with options:", config);
	var openScale = this;
	this.config = config;
	this.data = {
		weight: 0,
		weightUnit: "",
		rawValue: 0,
		temp: 0,
		tempUnit: ""
	};
}

util.inherits(OpenScale, EventEmitter);

//Starts the OpenScale module
OpenScale.prototype.start = function() {
	var openScale = this;
	var data = this.data;
	var string;

	//Open serial port
	openScale.port = new SerialPort.SerialPort(openScale.config.serialPort.path, {
		baudRate: openScale.config.serialPort.baudRate
	});

	//Create open event handler
	openScale.port.on('open', function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('openScale Serial Port is now open:', openScale.config.serialPort.path,
				'with baudrate', openScale.config.serialPort.baudRate);
		}
	});

	//Open errors will be emitted as an error event 
	openScale.port.on('error', function(err) {
		console.log('Error: ', err.message);
	})

	//Create serial port data event handler
	openScale.port.on('data', function(data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i] > 31) {
				string += String.fromCharCode(data[i]);
			} else {
				if (string) {
					console.log("OpenScale data: " + string);
					data = parseOpenScaleData(string);

					if (data !== false) {
						openScale.data = data;
						openScale.emit("data", openScale.data); //Emit event with new data
					}
				}
				string = "";
			}
		}
	});
};

//Stops the OpenScale module
OpenScale.prototype.stop = function() {};

//Returns Open Scale sensor data object if available
//Otherwise returns false if data is unvailbale
OpenScale.prototype.getSensorData = function() {
	var openScale = this;
	if (openScale.data.unit != "") {
		return openScale.data;
	} else {
		return false;
	}
};

//Returns object of Open Scale data if parsing was successful
//Otherwise returns false
function parseOpenScaleData(dataStr) {
	var dataArray = dataStr.split(',');
	var data = {};

	//If valid array of data, populate data object
	if (dataArray.length > 3 && dataArray.indexOf("lbs") != -1) {
		data.weight = Number(dataArray[1]);
		data.weightUnit = dataArray[2];
		data.rawValue = Number(dataArray[3]);
		data.temp = Number(dataArray[4]);
		data.tempUnit = "Celsius";
		return data;
	} else {
		return false;
	}
};


module.exports = OpenScale;