
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
    return moment(today).format('Do MMM YYYY');
}

exports.getFormattedDate = (date)=> {
    return moment(date).format('Do MMM YYYY');
}

exports.getMom=()=>{
    console.log(moment().format('Do MMM YYYY LT'));
}