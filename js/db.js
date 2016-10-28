// Database scripts
var Nedb = require("./nedb.min.js");

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
	  callback(docs);
	});
}
