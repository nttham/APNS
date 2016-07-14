var mongoose = require('mongoose');
var request = require('request');
var device = require('../models/device');
var constants = require('../constants/constants.json');

exports.updateDevice = function(deviceId,deviceDetails,callback){

    var objForUpdate = {};

    if (deviceDetails.userId) {
        objForUpdate.userId = deviceDetails.userId;
    }
    if (deviceDetails.deviceToken) {
        objForUpdate.deviceToken = deviceDetails.deviceToken;
    }
    if (deviceDetails.platform) {
        objForUpdate.platform = deviceDetails.platform;
    }

    objForUpdate.lastUpdatedTime = Date.now();

    //var setObj = { $set: objForUpdate };

    device.findOneAndUpdate({deviceId:deviceId},{$set:objForUpdate}, {new: true}, function(err, doc){

        if (!err) {

            callback(constants.success.msg_update_success);

        } else {

            callback(constants.error.msg_update_failure);
        }

    });

}