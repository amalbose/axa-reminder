var fs = require('fs');
var db = require("./js/db.js");

var remFile = "data/reminders.json"
var existingData;

$(function(){
    $("#newReminderModal").load("views/new.html"); 
});

// Tab selection
$(document).on("click", ".sidebarItem", function(){
    $(".sidebarItem").removeClass("selected");
    $("#"+this.id).addClass("selected");
    $('#containerDiv').load("views/"+this.id+".html");
    // updateAllResources();
});

// on load
$(document).ready(function(){
    loadDefaultDiv();
    // updateAllResources();
});

function loadAlertSwitch(){
  $("#alertOn").bootstrapSwitch();
}

// Close windows
$(document).on("click","#closeIcon", function(){
	window.close();
});

$(document).on("click",".input-group-addon", function(){
  $("#datetimepicker1").removeClass("has-error")
});

$(document).on("click",".input-group-addon", function(){
  $("#datetimepicker1").removeClass("has-error")
});


// load default div
function loadDefaultDiv(){
  $('#containerDiv').load("views/upcoming.html")
}

// load the select box
function loadSelectBox(){
    var obj;
    var dropDown = $('#categorySelect').empty().html(' ');
    fs.readFile('data/categories.json', 'utf8', function (err, data) {
      if (err)
       throw err;
      
      obj = JSON.parse(data);
      // update options
      $.each(obj, function (index, item) {
        dropDown.append($('<option>', { 
          value: item.name,
          text : item.name
        }));
      });
    });
}

// Cancel Button action
$(document).on("click","#cancelBtn", function(){
  clearForm(true);
});

// clear the form
function clearForm(saveCategory){
  $("#task_name").val('');
  $("#datetimepicker").val('');
  $("#notes").val('');
  $("#alertOn").bootstrapSwitch('state', true);
  if(saveCategory) {
    $("#categorySelect").val("");
  }
}

// Save Button action
$(document).on("click","#saveBtn", function(){
  saveData(()=>{
    clearForm(false);
    $('#newReminderModal').modal('hide');
    displaySavedAlert();
    updateAllResources();
  });
});

// save data to file
function saveData(callBack){

  if(!isDataValid()){
    return
  }

  readJson(remFile,(remArr)=> {
    var newId = Object.keys(remArr).length + 1;
    var name = $("#task_name").val()
    var notes = $("#notes").val()
    var remindOn = $("#datetimepicker").val()
    var alarm = $("#alertOn").prop('checked');
    var category = $("#categorySelect").val();
    // Create the item using the values
    var item = { 
      id: newId, 
      name: name, 
      alarm: alarm,
      category: category, 
      notes: notes, 
      remindOn: remindOn 
    };

    // insert into db
    db.insertIntoDB(item);

    if(remArr==''){
      remArr = []
      remArr.push(item);
    }
    else
      remArr.push(item)
    var prettyJSON = JSON.stringify(remArr, null, 4);
    console.log(prettyJSON)

    fs.writeFile(remFile, prettyJSON, function(err) {
        if(err) {
            return console.log(err);
        }
        callBack();
    }); 
  });
  
}

// read json file
function readJson(file,callBack){
  if (!fs.existsSync(file)) {
    callBack('')
  }
  fs.readFile(remFile, 'utf8', function (err, data) {
  if (err)
    throw err;
  
  if(data==''){
    callBack('')
  }
  var res = JSON.parse(data);
  callBack(res)
  });
}

function isDataValid(){
  var remindOn = $("#datetimepicker").val()
  if(remindOn==''){
    $("#datetimepicker1").addClass("has-error")
    return false
  }
  return true
}

function displaySavedAlert(){
  $("#savedAlert").fadeIn();
  $("#savedAlert").delay(2000).slideUp().fadeOut("slow");
}


function updateAllResources(){

    db.getAllReminders((remArr)=>{
      $('#allRemList').empty();
        for(item in remArr) {
          var rowC = $('<div/>', { class : "category label label-success", text : remArr[item].category });
          var rowD = $('<div/>', { });
          var rowA = $('<a/>', {class : "list-group-item itemToggle pointerCursor", "data-toggle" : "collapse", "data-target" : "#collapseExample"+item, "aria-expanded" : "false", "aria-controls" : "collapseExample" })
          var rowH4 = $('<h4/>', {class : "ist-group-item-heading itemHeader", text : remArr[item].name});
          var rowP = $('<p/>', {class : "list-group-item-text", text : remArr[item].remindOn });
          var rowNotesD = $('<div/>', {class : "collapse", id : "collapseExample"+item });
          var rowNotes = $('<div/>', { text : remArr[item].notes });
          var rowAlarm = $("<span/>", {class : "glyphicon glyphicon-bell alarmIcon"});

          rowNotesD.append(rowNotes);
          rowD.append(rowC);
          rowD.append(rowH4);
          rowD.append(rowP);
          if(remArr[item].alarm) {
            rowD.append(rowAlarm);
          }
          rowA.append(rowD);
          rowA.append(rowNotesD);
          $('#allRemList').append(rowA);
        }
    });  
}