// Database scripts
var Nedb = require("nedb");

var db = new Nedb({ filename: 'axa-reminder-data/datafile.db', autoload: true });

// db.remove({}, { multi: true }, function (err, numRemoved) {});

// DATA

exports.insertIntoDB = function(data) {
	db.insert(data, function (err) {
		db.find({}, function (err, docs) {
			return docs;
		});
	});
}

exports.getAllReminders = function(callback) {
	db.find({}).sort({ remindOn: 1 }).exec(function (err, docs) {
	  callback(docs);
	});
}

exports.getActiveReminders = function(callback) {
	db.find({ status : false }).sort({ remindOn: 1 }).exec(function (err, docs) {
	  callback(docs);
	});
}

exports.getCompReminders = function(callback) {
	db.find({ status : true }).sort({ remindOn: 1 }).exec(function (err, docs) {
	  callback(docs);
	});
}

exports.deleteReminder = function(idVal, callback) {
	db.remove({ _id: idVal }, {}, function (err, numRemoved) {
	  if(err)
	  	callback("Error");
	  else
	  	callback(numRemoved);
	});
}

exports.getReminder = function(idVal, callback) {
	db.findOne({ _id: idVal }, function (err, doc) {
		callback(doc);
	});
}

exports.updateReminder = function(idVal, data, callback) {
	db.update({ _id: idVal }, { $set: data }, { multi: false }, function (err, numReplaced) {
	if(err)
		alert(err)
	  callback(numReplaced);
	});
}

exports.updateCategory = function(oldVal, newVal) {
	db.update({ category: oldVal }, { $set: { category: newVal } }, { multi: true }, function (err, numReplaced) {
	if(err)
		alert(err)
	});
}

exports.getActiveForCurDate = function(dateStr,date, callback){
	db.find({ $and : [{remindOn: { $regex: dateStr }}, {remindOnT: { $gt: date } }, {status: false }] }, function (err, docs) {
	  if(err)
		console.log(err)
	  callback(docs);
	});
};

exports.getAllAlerts = function(callback) {
	db.find({ alarm : true }).sort({ remindOn: 1 }).exec(function (err, docs) {
	  callback(docs);
	});
}

exports.getActiveForDate = function(date, callback){
	db.find({ $and : [{remindOn: { $regex: date }}, {status: false }] }, function (err, docs) {
	  if(err)
		console.log(err)
	  callback(docs);
	});
};

exports.getPreviousReminders = function(date, callback) {
	db.find({ $and : [{status: false }, {remindOnT: { $lt: date } }]}, function (err, docs) {
	  if(err)
		console.log(err)
	  callback(docs);
	})
}