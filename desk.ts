/// <reference path="node.d.ts" />

import * as mqtt from 'mqtt';
import * as process from 'process';

const fs = require('fs');

const my_topic = '/simark-desk/control';
const server = 'mqtt://test.mosquitto.org';

function handle_command(command: string) {
	console.log(command);
	switch (command) {
		case 'up':
			console.log('Got command up');
			fs.writeSync(device, 'u');
			break;

		case 'down':
			console.log('Got command down');
			fs.writeSync(device, 'd');
			break;

		case 'stop':
			console.log('Got command stop');
			fs.writeSync(device, 's');
			break;

		default:
		  console.log('Got unknown command: ' + command);
			break;
	}
}

let client = mqtt.connect(server);
let device = fs.openSync('/dev/ttyACM0', 'r+');
console.log('Opened device, fd = ' + device);

process.on('SIGINT', function () {
	console.log('Caught interrupt signal, shutting down MQTT client.');

	client.end(false, function () {
		fs.closeSync(device);
	});
});

client.on('connect', function () {
	console.log('We are connected!');

	client.subscribe(my_topic, 0, function (err, granted) {
		console.log('We have subscribed to ' + my_topic + '!');
	});
});

client.on('message', function (topic, message, packet) {
	if (topic == my_topic) {
		let str = message.toString();
		handle_command(str);
	}
});
