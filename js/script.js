var fs = require('fs');
var db = require("./js/db.js");
var cron = require("./js/cron.js");

// on load
$(document).ready(function(){
    loadViews();
    processCronJobs();
});

function loadViews(){
  $("#newReminderModal").load("views/new.html"); 
  $("#editReminderModal").load("views/edit.html"); 
  $("#alertNotify").load("views/alertNotify.html"); 
  $('#containerDiv').load("views/upcoming.html")
}

// Events

// Tab selection
$(document).on("click", ".sidebarItem", function(){
    $(".sidebarItem").removeClass("selected");
    $("#"+this.id).addClass("selected");
    $('#containerDiv').load("views/"+this.id+".html");
});

// Close windows
$(document).on("click","#closeIcon", function(){
  window.close();
});

// Cleanup error on datepicker
$(document).on("click",".input-group-addon", function(){
  $("#datetimepicker1").removeClass("has-error")
});

// Cancel Button action
$(document).on("click","#cancelBtn", function(){
  clearForm(true);
});

// Save Button action
$(document).on("click","#saveBtn", function(){
  saveData(()=>{
    clearForm(false);
    $('#newReminderModal').modal('hide');
    displaySavedAlert();
    updateAllResources();
    updateCompResources();
  });
});

// Focus taskname on modal load
$('#newReminderModal').on('shown.bs.modal', function (event) {
  $('#newReminderModal #task_name').focus();  
});


$(document).on("click","#updateBtn", function(event){
  var id = $(this).attr("data-id");;
  var obj = new Object();
  obj.name = $("#editReminderModal #task_name").val();
  obj.category  = $("#editReminderModal #categorySelect2").val();
  obj.remindOn = $("#editReminderModal #datetimepicker").val();
  obj.notes = $("#editReminderModal #notes").val();
  obj.alarm = $("#editReminderModal #alertOn2").prop('checked');
  db.updateReminder(id, obj, (noUpdated)=> {
    displayUpdatedAlert();
    updateAllResources();
    updateCompResources();
  });
});


$(document).on("click","#openBtn", function(){
  var id = $("#alertNotify #openID").val();
  openEditReminder(id);
});

$(document).on("click", ".checkBoxImg", function(event){
  var id = getId($(this).attr("id"));
  var completedColor = "rgb(139, 195, 74)";
  var incompleteColor = "rgb(223, 226, 223)";
  var completed = false;
  if($(this).css('color')==incompleteColor) {
    $(this).css('color', completedColor);
    completed = true;
  } else {
    $(this).css('color', incompleteColor);
  }
  setCompleted(id, completed);
  event.stopPropagation();
});


// Trash Button action
$(document).on("click",".trashIcon", function(event){
  var id = getId($(this).attr("id"));
  $("#modelID").val(id);
  $('#confirmationDialog').modal({});
  event.stopPropagation();
});

// Delete Button action
$(document).on("click","#delConfirmation", function(event){
  var id = $("#modelID").val();
  db.deleteReminder(id, (res)=> {
    if(res!="Error"){
      updateAllResources();
      displayDeleteAlert();
    }
  });
});

// Methods used in html

function loadAlertSwitch(index){
  $("#alertOn"+index).bootstrapSwitch();
}

// load the select box
function loadSelectBox(index){
    var obj;
    var dropDown = $('#categorySelect'+index).empty().html(' ');
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


// clear the form
function clearForm(saveCategory){
  $("#task_name").val('');
  $("#datetimepicker").val('');
  $("#notes").val('');
  $("#alertOn1").bootstrapSwitch('state', true);
  if(saveCategory) {
    $("#categorySelect1").val("");
  }
}

// save data to db
function saveData(callBack){

  if(!isDataValid()){
    return
  }

  var name = $("#newReminderModal #task_name").val()
  var notes = $("#newReminderModal #notes").val()
  var remindOn = $("#newReminderModal #datetimepicker").val()
  var alarm = $("#newReminderModal #alertOn1").prop('checked');
  var category = $("#newReminderModal #categorySelect1").val();
  // Create the item using the values
  var item = { 
    name: name, 
    alarm: alarm,
    category: category, 
    notes: notes, 
    remindOn: remindOn,
    status: false 
  };

  // insert into db
  db.insertIntoDB(item);

  callBack();
}

// Validate data
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

function displayUpdatedAlert(){
  $("#updatedAlert").fadeIn();
  $("#updatedAlert").delay(2000).slideUp().fadeOut("slow");
}

function displayDeleteAlert(){
  $("#deleteAlert").fadeIn();
  $("#deleteAlert").delay(2000).slideUp().fadeOut("slow");
}

// Update all the resources in all reminders list
function updateAllResources(){
    db.getActiveReminders((remArr)=>{
      $('#allRemList').empty();
        for(item in remArr) {
          var rowC = $('<div/>', { class : "category label label-success", text : remArr[item].category });
          var rowD = $('<div/>', { class : "itemCont" });
          var statusCls = "statusI";
          if(remArr[item].status) {
            statusCls = "statusC";
          }
          var rowChbx = $('<span/>', { class : "glyphicon glyphicon-ok checkBoxImg " + statusCls , "id" : "c_"+remArr[item]._id });
          var rowA = $('<a/>', {class : "list-group-item itemToggle pointerCursor", "data-toggle" : "collapse", "data-target" : "#collapseExample"+item, "aria-expanded" : "false", "aria-controls" : "collapseExample" })
          var rowH4 = $('<h5/>', {class : "list-group-item-heading itemHeader pointerCursor", text : remArr[item].name, "id" : "n_"+remArr[item]._id});
          var rowI = $('<span/>', {class : "glyphicon glyphicon-edit pointerCursor editBtn"});
          var rowP = $('<p/>', {class : "list-group-item-text", text : remArr[item].remindOn });
          var rowNotesD = $('<div/>', {class : "collapse", id : "collapseExample"+item });
          var rowNotes = $('<div/>', { text : remArr[item].notes });
          var rowAlarm = $("<span/>", {class : "glyphicon glyphicon-bell alarmIcon"});
          var rowIAlarm = $("<span/>", {class : "glyphicon glyphicon-bell alarmIcon invisible"});
          var rowTrash = $("<span/>", {class : "glyphicon glyphicon-trash trashIcon pointerCursor", "id" : "t_"+remArr[item]._id});

          rowNotesD.append(rowNotes);
          rowD.append(rowC);
          rowD.append(rowH4);
          rowD.append(rowI);
          rowD.append(rowP);
          if(remArr[item].alarm) {
            rowD.append(rowAlarm);
          } else {
            rowD.append(rowIAlarm);
          }
          rowD.append(rowTrash);
          rowA.append(rowChbx);
          rowA.append(rowD);
          rowA.append(rowNotesD);
          $('#allRemList').append(rowA);
        }
    });  
}

// Update all the resources in all reminders list
function updateCompResources(){
    db.getCompReminders((remArr)=>{
      $('#compRemList').empty();
        for(item in remArr) {
          var rowC = $('<div/>', { class : "category label label-success", text : remArr[item].category });
          var rowD = $('<div/>', { class : "itemCont" });
          var statusCls = "statusI";
          if(remArr[item].status) {
            statusCls = "statusC";
          }
          var rowChbx = $('<span/>', { class : "glyphicon glyphicon-ok checkBoxImg " + statusCls , "id" : "c_"+remArr[item]._id });
          var rowA = $('<a/>', {class : "list-group-item itemToggle pointerCursor", "data-toggle" : "collapse", "data-target" : "#collapseExample"+item, "aria-expanded" : "false", "aria-controls" : "collapseExample" })
          var rowH4 = $('<h5/>', {class : "list-group-item-heading itemHeader pointerCursor", text : remArr[item].name, "id" : "n_"+remArr[item]._id});
          var rowI = $('<span/>', {class : "glyphicon glyphicon-edit pointerCursor editBtn"});
          var rowP = $('<p/>', {class : "list-group-item-text", text : remArr[item].remindOn });
          var rowNotesD = $('<div/>', {class : "collapse", id : "collapseExample"+item });
          var rowNotes = $('<div/>', { text : remArr[item].notes });
          var rowAlarm = $("<span/>", {class : "glyphicon glyphicon-bell alarmIcon"});
          var rowIAlarm = $("<span/>", {class : "glyphicon glyphicon-bell alarmIcon invisible"});
          var rowTrash = $("<span/>", {class : "glyphicon glyphicon-trash trashIcon pointerCursor", "id" : "t_"+remArr[item]._id});

          rowNotesD.append(rowNotes);
          rowD.append(rowC);
          rowD.append(rowH4);
          rowD.append(rowI);
          rowD.append(rowP);
          if(remArr[item].alarm) {
            rowD.append(rowAlarm);
          } else {
            rowD.append(rowIAlarm);
          }
          rowD.append(rowTrash);
          rowA.append(rowChbx);
          rowA.append(rowD);
          rowA.append(rowNotesD);
          $('#compRemList').append(rowA);
        }
    });  
}

// Should be called from pages which require edit.
function enableEditReminder(){
  $(document).on("click",".itemHeader", function(){
    var id = getId($(this).attr("id"));
    openEditReminder(id);
  });
}

/*
Returns the id value from complete token (<TKN>_<IDVAL>)
*/
function getId(idToken) {
  return idToken.substring(2)
}

/*
Opens the edit reminder modal
*/
function openEditReminder(id){
    $('#editReminderModal').modal({});
    $('#editReminderModal').on('shown.bs.modal', function (event) {
      $('#editReminderModal #task_name').focus();  
        db.getReminder(id, (docs)=>{
        populateData(docs);
        event.stopPropagation();
      });
    })
}

/*
Populate data on Edit Modal
*/
function populateData(doc) {
  $("#editReminderModal #task_name").val(doc.name);
  $("#editReminderModal #categorySelect2").val(doc.category);
  $("#editReminderModal #datetimepicker").val(doc.remindOn);
  if(!doc.alarm) {
      $("#alertOn2").bootstrapSwitch('state', false);
  }
  $("#editReminderModal #notes").val(doc.notes);
  $("#editReminderModal #updateBtn").attr("data-id", doc._id);
  clearForm(false);
}

/*
Process the cron jobs
*/
function processCronJobs(){
  db.getActiveReminders((remArr)=>{
    for(item in remArr) {
      var jobId = cron.addJob(remArr[item], openAlert);
      console.log(jobId);
    }
  });
}

function openAlert(doc) {
  $('#alertNotify').modal({});
  $('#alertNotify').on('shown.bs.modal', function (event) {
    $("#alertNotify #alertBody").text(doc.name);
    $("#alertNotify #openID").val(doc._id);
  });
}

function setCompleted(idVal, completed) {
  var obj = new Object();
  obj.status = completed;
    db.updateReminder(idVal, obj, (noUpdated)=> {
    displayUpdatedAlert();
    updateAllResources();
    updateCompResources();
  });
}