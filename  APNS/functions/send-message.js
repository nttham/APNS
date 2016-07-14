var apn = require('apn');
var path = require('path');
var constants = require('../constants/constants.json');

exports.sendAPNSMessage = function(message,deviceToken,settings){

	try {
		var options = {
			//cert: path.join(__dirname, 'cert.pem'),
			//key:  path.join(__dirname, 'key.pem'),
			pfx: path.join(__dirname, 'Certificates.p12'),
			passphrase: "password-1",
			production:true
		};

		var connection = new apn.Connection(options);
		//var myDevice = new apn.Device("e623bcd3ca5755171a0faa5f17d96bdc6697dad52137c48e02fd68c8acc6d908");
		//var myDevice = new apn.Device("afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5");
		//var myDevice = new apn.Device(JSON.stringify(deviceToken));
		//var myDevice = new apn.Device('["afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5","afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5","afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5"]');
		//var tokens = ["afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5", "abfec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5","afec26755fbde7164321f41a738d56975072a27c76c2aca51ea98a9cda6420b5"];
		var note = new apn.Notification();

		note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.

		note.alert = message;

		if(settings.badge) {
			note.badge = settings.badge;
		}

		if(settings.sound) {
			note.sound = settings.sound;
		}

		if(settings.payload) {
			note.payload = settings.payload;
		}


		//connection.pushNotification(note, myDevice);
		connection.pushNotification(note, deviceToken);

		// A submission action has completed. This just means the message was submitted, not actually delivered.
		connection.on('completed', function(a) {
			console.log('APNS: Completed sending push notification');
		});

		// A message has been transmitted.
		connection.on('transmitted', function(notification, device) {
			console.log('APNS: Successfully transmitted message to '+device);
		});

		// There was a problem sending a message.
		connection.on('transmissionError', function(errorCode, notification, device) {
			var deviceToken = device.toString('hex').toUpperCase();

			if (errorCode === 8) {
				console.log('APNS: Transmission error -- invalid token', errorCode, deviceToken);
				//callback(constants.error.msg_send_failure);
				// Do something with deviceToken here - delete it from the database?
			} else {
				console.error('APNS: Transmission error', errorCode, deviceToken);
			}
		});

		connection.on('connected', function() {
			console.log('APNS: Connected');
		});

		connection.on('timeout', function() {
			console.error('APNS: Connection timeout');
		});

		connection.on('disconnected', function() {
			console.error('APNS: Lost connection');
		});

		connection.on('socketError', console.log);

	}
	catch (ex) {
		console.log("ERROR Exception :"+ex);
	}


}
