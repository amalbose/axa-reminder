// Database scripts
var Nedb = require("./lib/nedb.min.js");

var db = new Nedb({ filename: 'axa-reminder-data/datafile.db', autoload: true });

// db.remove({}, { multi: true }, function (err, numRemoved) {});

// db.insert({ planet: 'Earth' }, function (err) {
// db.find({}, function (err, docs) {
// console.log(docs)
// });
// });

/*
Insert data into the database
*/
exports.insertIntoDB = function(data) {
	db.insert(data, function (err) {
		db.find({}, function (err, docs) {
			return docs;
		});
	});
}

exports.getAllReminders = function(callback) {
	db.find({}).sort({ remindOn: 1 }).exec(function (err, docs) {
		console.log(docs)
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