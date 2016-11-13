const DATE_FORMAT = 'Do MMM YYYY';
const DATETIME_FORMAT = 'Do MMM YYYY LT';

// remove entry from array
Array.prototype.removeValue = function(name, value){
   var array = $.map(this, function(v,i){
      return v[name] === value ? null : v;
   });
   this.length = 0; //clear original array
   this.push.apply(this, array); //push all elements except the one we want to delete
}

exports.getCurrentDate = ()=> {
    var today = new Date();
    return moment(today).format(DATE_FORMAT);
}

exports.getFormattedDate = (date)=> {
    return moment(date).format(DATE_FORMAT);
}

exports.getDate = (strDate)=>{
    var date = moment(strDate, DATETIME_FORMAT);
    return date.toDate();
}