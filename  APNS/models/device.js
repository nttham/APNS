var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deviceSchema = mongoose.Schema({
	deviceId		: String,
	userId			: String,
	deviceToken		: String,
	platform		: String,
	createdTime		: Date,
	lastUpdatedTime	: Date,
	createdMode		: String
});

//var deviceSchema = mongoose.Schema({
//	deviceId		: String,
//	userId			: String,
//	deviceToken		: String,
//	platform		: String,
//	createdTime		: Date,
//	lastUpdatedTime	: Date,
//	createdMode		: String
//});


//mongoose.connect('mongodb://admin:jsDw15a@54.169.162.137:10053/pushNotification',{auth:{authdb:'admin'}});
mongoose.connect('mongodb://localhost:27017/pushNotificationdatabase');


module.exports = mongoose.model('device', deviceSchema);        
