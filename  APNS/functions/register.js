var mongoose = require('mongoose');
var request = require('request');
var device = require('../models/device');
var constants = require('../constants/constants.json');


exports.register = function(userId,deviceId,deviceToken,platform,createdMode,callback){


	var newDevice = new device({ 

		userId			: userId,
		deviceId		: deviceId,
		deviceToken		: deviceToken,
		platform		: platform,
		createdTime		: Date.now(),
		lastUpdatedTime	: null,
		createdMode		: createdMode

	});


	device.find({deviceId : deviceId}, function(err,devices){

		var totalDevices = devices.length;

		if (totalDevices == 0) {

			newDevice.save(function(err){

				if (!err) {

					callback(constants.success.msg_reg_success);

				} else {

					callback(constants.error.msg_reg_failure);

				}
			});
		} else {

			callback(constants.error.msg_reg_exists);

		}
	});
}