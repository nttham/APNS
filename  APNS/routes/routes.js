var constants = require('../constants/constants.json');
var registerFunction = require('../functions/register');	
var devicesFunction = require('../functions/devices');
var deleteFunction = require('../functions/delete');
var sendFunction = require('../functions/send-message');
var updateFunction = require('../functions/update');
var getTokens = require('../functions/getTokens');
var mongoose = require('mongoose');
var device = require('../models/device');

module.exports = function(app,io) {


	io.on('connection', function(socket){

		console.log("Client Connected");
		socket.emit('update', { message: 'Hello Client',update:false });

  		socket.on('update', function(msg){

    		console.log(msg);
  		});
	});

	app.get('/',function(req,res) {

		res.sendFile('index.html');
		
	});

	app.post('/devices',function(req,res) {

		var deviceId   = req.body.deviceId;
		var deviceToken = req.body.deviceToken;
		var platform = req.body.platform.toUpperCase();
		var createdMode = "API";
		var userId = "";

		//var dbname = req.headers.apiSecret;

		//TODO :: Add the apiSecret check on the headers part for security

		//if ( typeof userId  == 'undefined' || typeof deviceId == 'undefined' || typeof deviceToken  == 'undefined' || typeof platform  == 'undefined') {
		if ( typeof deviceId == 'undefined' || typeof deviceToken  == 'undefined' || typeof platform  == 'undefined') {


			console.log(constants.error.msg_invalid_param.message);

			res.json(constants.error.msg_invalid_param);

		} else if ( !deviceId.trim() || !deviceToken.trim() || !platform.trim() ) {

			console.log(constants.error.msg_empty_param.message);

			res.json(constants.error.msg_empty_param);

		} else if ( platform === "APNS" || platform === "GCM" || platform === "WNS") {


			if(req.body.createdMode) {
				createdMode = req.body.createdMode;
			}

			if(req.body.userId) {
				createdMode = req.body.userId;
			}


			registerFunction.register( userId,deviceId,deviceToken,platform,createdMode, function(result) {

				res.json(result);

				if (result.result != 'error'){

					io.emit('update', { message: 'New Device Added',update:true});

				}
			});
		} else {
			console.log(constants.error.msg_invalid_param.message);
			res.json(constants.error.msg_invalid_param);
		}
	});

	app.get('/devices',function(req,res) {

		devicesFunction.listDevices(function(result) {

			res.json(result);

		});
	});

	app.put('/devices/:device',function(req,res) {
		//TODO :: Check if deviceid(device) is present
		var deviceId = req.params.device;

		var deviceDetails = {
			userId : req.body.userId,
			deviceToken : req.body.deviceToken,
			platform : req.body.platform
		}

		if ( typeof deviceId  == 'undefined') {

			console.log(constants.error.msg_invalid_param.message);

			res.json(constants.error.msg_invalid_param);

		}
		else if (typeof deviceDetails.userId == 'undefined' && typeof deviceDetails.deviceToken  == 'undefined' && typeof deviceDetails.platform  == 'undefined') {
			console.log(constants.error.msg_invalid_param.message);
			res.json(constants.error.msg_invalid_param);
		}
		else {
			updateFunction.updateDevice(deviceId,deviceDetails,function(result) {

				res.json(result);

			});
		}

	});

	app.delete('/devices/:device',function(req,res) {

		//TODO :: Check if deviceid(device) is present

		var deviceId = req.params.device;

		deleteFunction.removeDevice(deviceId,function(result) {

			res.json(result);

		});
	});

	app.post('/send',function(req,res){

		var message = req.body.message;
		//var deviceToken = req.body.deviceToken;
		var deviceId = req.body.deviceId;

		if ( typeof message  == 'undefined' || typeof deviceId == 'undefined') {
			console.log(constants.error.msg_invalid_param.message);
			res.json(constants.error.msg_invalid_param);
		}

		else {
			device.find({
				deviceId: { $in: deviceId},
				//platform: { $eq: "A"}
			}, function(err, docs){
				if(err) {
					console.log(err);
				}
				else {
					getTokens.getTokens(docs,function(tokens) {
						var apnsDevices=tokens.apnsDevices;
						var gcmDevices=tokens.gcmDevices;
						var wnsDevices=tokens.wnsDevices;

						console.log("Total number of devices "+apnsDevices.length);

						if(apnsDevices.length || gcmDevices.length || wnsDevices.length) {
							if(apnsDevices.length) {

								var settings;

								if(req.body.settings) {
									if(req.body.settings.apns) {
										settings = req.body.settings.apns;
									}
								}

								console.log("Total number of APNS devices :"+apnsDevices.length);
								sendFunction.sendAPNSMessage(message,apnsDevices,settings);
							}
							if(gcmDevices.length) {
								var payload = {};

								if(req.body.settings) {
									if(req.body.settings.gcm) {
										var settings = req.body.settings.gcm;
										if(settings.payload) {
											payload = settings.payload;
										}
									}

								}

								sendFunction.sendGCMMessage(message,gcmDevices,payload);
							}
							if(wnsDevices.length) {

								var payload = {};

								if(req.body.settings) {
									if(req.body.settings.wns) {
										var settings = req.body.settings.wns;
										if(settings.payload) {
											payload = settings.payload;
										}
									}

								}
								sendFunction.sendWNSMessage(message,wnsDevices,payload);
							}

							res.status(202).send('Accepted to send Push Notification');
						}
						else {
							res.status(404).send("No devices found");
						}
					});

				}
			});
		}
	});


	app.post('/upload', multer({ dest: './uploads/'}).single('upl'), function(req,res){

		console.log("req file "+JSON.stringify(req.file));
		connector.connectToMongo('upl',function(err,dbInstance){

			var fileName = req.file.filename;
			var password = req.body.password;
			var filePath = process.cwd() +'/uploads/'+fileName;
			var originalName = req.file.fileName;
			console.log("req file "+JSON.stringify(req.file));
			var writestream = dbInstance.gfs.createWriteStream({
				filename: fileName
			});

			fs.createReadStream(filePath).pipe(writestream);
			writestream.on('close', function (file) {
				fs.unlink(filePath, function() {
					afterResponse(dbInstance.dbConnection);
					res.json(file);
					res.status(204).end();

				});
			});


		})



	});

}


