var request = require('request');
var async = require('async');
exports.getTokens = function(devices,callback){
    var apnsDevices =[];
    var gcmDevics = [];
    var wnsDevices = [];

    async.each(devices,
        function(devices, callback){
            if(devices.platform === "APNS") {
                apnsDevices.push(devices.deviceToken);
                callback();
            }
            else if(devices.platform === "GCM") {
                gcmDevics.push(devices.deviceToken);
                callback();
            }
            else if(devices.platform === "WNS") {
                wnsDevices.push(devices.deviceToken);
                callback();
            }
        },
        function(err){
            // All tasks are done now
            var tokens = {
                "apnsDevices" : apnsDevices,
                "gcmDevices" : gcmDevics,
                "wnsDevices" : wnsDevices
            }
            callback(tokens);
        }
    );
}
