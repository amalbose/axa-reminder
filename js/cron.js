var CronJob = require('cron').CronJob;

/*
* Add job and return the job handler.
*/
exports.addJob = function(doc, func){
	var job = new CronJob(new Date(doc.remindOnT), function() {
		func(doc);
	}, function () {
	},
	true
	);
	return job;
}

/*
* Stops the job
*/
exports.stopJob = function(jobObj) {
	jobObj.stop();
}