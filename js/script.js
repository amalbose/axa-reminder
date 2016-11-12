var fs = require('fs');

var db = require("./js/db.js");
var cron = require("./js/cron.js");
var utils = require("./js/utils.js");

var cJobs = {};
var catFile = 'data/categories.json'
var categoriesList = {};

// on load
$(document).ready(function(){
    categoriesList = getCategoryColors();
    loadViews();
    processCronJobs();
});

function loadViews(){
  $("#newReminderModal").load("views/new.html"); 
  $("#editReminderModal").load("views/edit.html"); 
  $("#alertNotify").load("views/alertNotify.html"); 
  $('#containerDiv').load("views/upcoming.html");
  $('#newCategoryModalDiv').load("views/newCat.html");
  resetNewBtn();
}

// EventsQ

// Tab selection
$(document).on("click", ".sidebarItem", function(){
    $(".sidebarItem").removeClass("selected");
    $("#"+this.id).addClass("selected");
    $('#containerDiv').load("views/"+this.id+".html");
    resetNewBtn();
});

function resetNewBtn(){
  $("#newCatBtn").hide();
  $("#floatingIcon").show();
}

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
    updateReminders();
    reloadCronJobs();
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
    updateReminders();
    reloadCronJobs();
  });
});


$(document).on("click","#openBtn", function(){
  var id = $("#alertNotify #openID").val();
  openEditReminder(id);
});

$(document).on("click","#compConfirmation", function(){
  var id = $("#alertNotify #openID").val();
  setCompleted(id, true);
  reloadCronJobs();
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
  reloadCronJobs();
  event.stopPropagation();
});

$(document).on("click", "#compBtn", function(event){
  var id = $(this).attr("data-id");
  setCompleted(id, true);
  reloadCronJobs();
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
      updateReminders();
      displayDeleteAlert();
      reloadCronJobs();
    }
  });
});

$(document).on("click", "#resetCategories", ()=>{
  loadAllCategories(loadColorPicker);
});

$(document).on("click", "#updCategories", ()=>{
  fs.readFile(catFile, 'utf8', function (err, data) {
    if (err)
     throw err;
    
    obj = JSON.parse(data);
    var newCats = [];
    var indx = 0;
    // update options
    $.each(obj, function (index, item) {
      if(item.name == ""){
        return true;
      }
      var newColor = $("#i_"+item.id).val();
      var newName = $("#n_"+item.id).text();
      var newCat = {}
      // update catlist
      categoriesList[newCat.name] = newColor;
      
      newCat.id = item.id;
      if(item.name != newName) {
        updateDBCategory(item.name, newName);
      }
      newCat.name = newName;
      newCat.color = newColor;
      newCats[indx++] = newCat;
    });
    saveCategories(newCats);
  });
});

function updateReminders(){
  updateAllResources();
  updateCompResources();
}

function reloadCategories(){
  loadCategoriesForFile();
  updateReminders()
}

// Methods used in html

function loadAlertSwitch(index){
  $("#alertOn"+index).bootstrapSwitch();
}

// load the select box
function loadSelectBox(index){
    var obj;
    var dropDown = $('#categorySelect'+index).empty().html(' ');
    dropDown.append($('<option>', { value: 0, text : "" }));
    fs.readFile(catFile, 'utf8', function (err, data) {
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
      populateReminders('#allRemList',remArr);
    });  
}

// Update all the resources in all reminders list
function updateCompResources(){
  db.getCompReminders((remArr)=>{
    populateReminders('#compRemList',remArr);
  });
}

function populateReminders(elementId, remArr) {
  $(elementId).empty();
  var typ = "_a";
  if(elementId.indexOf("all") !== -1) {
    typ ="_c";
  }
  for(item in remArr) {
    if(item=="removeValue")
      continue;
    var rowC = $('<div/>', { class : "category label", text : remArr[item].category,"id" : "ca_"+remArr[item]._id  });
    var rowD = $('<div/>', { class : "itemCont" });
    var statusCls = "statusI";
    if(remArr[item].status) {
      statusCls = "statusC";
    }
    var rowChbx = $('<span/>', { class : "glyphicon glyphicon-ok checkBoxImg " + statusCls , "id" : "c_"+remArr[item]._id });
    var rowA = $('<a/>', {class : "list-group-item itemToggle pointerCursor", "data-toggle" : "collapse", "data-target" : "#collapseComp"+typ+item, "aria-expanded" : "false", "aria-controls" : "collapseComp" })
    var rowH4 = $('<h5/>', {class : "list-group-item-heading itemHeader pointerCursor", text : remArr[item].name, "id" : "n_"+remArr[item]._id});
    var rowI = $('<span/>', {class : "glyphicon glyphicon-edit pointerCursor editBtn"});
    var rowP = $('<p/>', {class : "list-group-item-text", text : remArr[item].remindOn });
    var rowNotesD = $('<div/>', {class : "collapse", id : "collapseComp"+typ+item });
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
    $(elementId).append(rowA);
  }
  loadCategoryColor();
}

$(document).on("click",".itemHeader", function(){
  var id = getId($(this).attr("id"));
  openEditReminder(id);
});

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
  $("#editReminderModal #compBtn").attr("data-id", doc._id);
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
      cJobs[remArr[item]._id] = jobId;
    }
  });
}

function reloadCronJobs(){
  stopAllJobs();
  processCronJobs();
}

function stopAllJobs(){
  for(idV in cJobs) {
    stopJob(idV);
  }
}

function stopJob(idVal){
  cJobs[idVal].stop();
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

function saveCategories(newCats) {
  var prettyJSON = JSON.stringify(newCats, null, 4);
  console.log(prettyJSON)

  fs.writeFile(catFile, prettyJSON, function(err) {
      if(err) {
          return console.log(err);
      }
      reloadCategories();
  }); 
  loadSelectBox(1);
  loadSelectBox(2); 
}

function addCategory(name, color){
  readJson(catFile,(catArr)=> {
   var newId = Object.keys(catArr).length + 1;
    var item = {
      id: newId,
      name: name, 
      color: color
    };

    if(catArr==''){
      catArr = []
      catArr.push(item);
    }
    else
      catArr.push(item)
    
    saveCategories(catArr);
    loadAllCategories(loadColorPicker);
  }); 
}


// read json file
function readJson(file,callBack){
  if (!fs.existsSync(file)) {
    callBack('')
  }
  fs.readFile(file, 'utf8', function (err, data) {
  if (err)
    throw err;
  
  if(data==''){
    callBack('')
  }
  var res = JSON.parse(data);
  callBack(res)
  });
}

function loadAllCategories(callback){
  $('#allCategories').empty();
  fs.readFile(catFile, 'utf8', function (err, data) {
    if (err)
     throw err;
    
    obj = JSON.parse(data);
    // update options
    $.each(obj, function (index, item) {
      if(item.name == ""){
        return true;
      }

      var rowA = $('<a/>', {class : "list-group-item"})
      var rowD = $('<div/>', { class : "col-sm-7 control-label topPadding" });
      var rowH4 = $('<h5/>', {class : "list-group-item-heading catHeader pointerCursor", text : item.name, "id" : "n_"+item.id});
      var rowI = $('<span/>', {class : "glyphicon glyphicon-edit pointerCursor editBtn"});
      var pDiv = $('<div/>' , {class : "input-group colorpicker-component cPicker"});
      var pInp = $('<input/>', {class: "form-control hexValue" , "type" : "text", "value" : item.color, id : "i_"+item.id});
      var pSpan = $('<span/>', {class : "input-group-addon noDrag pointerCursor"});
      var pI = $('<i/>', { class : "noDrag"});
      var rowTrash = $("<span/>", {class : "glyphicon glyphicon-trash catTrashIcon pointerCursor", "id" : "t_"+item.id , "cname" : item.name});

      pSpan.append(pI);
      pDiv.append(pInp);
      pDiv.append(pSpan);
      pDiv.append(rowTrash);
      rowD.append(rowH4);
      rowD.append(rowI);
      rowA.append(rowD);
      rowA.append(pDiv);
      $('#allCategories').append(rowA);
    });
    callback();
  });
}

function loadColorPicker() {
 $('.cPicker').colorpicker(); 
}

function getCategoryColors(){
  if(Object.size(categoriesList) < 1) {
    console.log("Loading categories");
    loadCategoriesForFile();
  }
  return categoriesList;
  
}

function loadCategoriesForFile(){
  var data = fs.readFileSync(catFile, 'utf8');
    var obj = JSON.parse(data);
    for(index in obj) {
      categoriesList[obj[index].name] = obj[index].color;
  }
}

Object.size = function(arr) 
{
    var size = 0;
    for (var key in arr) 
    {
        if (arr.hasOwnProperty(key)) size++;
    }
    return size;
};

function loadCategoryColor(){
  $( ".category" ).each(function( index ) {
    var cat = $(this).text();
    var id = $(this).attr("id"); 
    var color = categoriesList[cat];
    $("#"+id).css('background-color', color);
  });
}

$(document).on("click",".catHeader", function(){
  var id = $(this).attr("id");
  var input = $('<input />', {
      'type': 'text',
      'name': id,
      'class': 'catHeaderInp',
      'value': $(this).html()
  });
  $(this).parent().prepend(input);
  $(this).remove();
  input.focus();
});

$(document).on('blur', '.catHeaderInp', function () {
    var h5 = $('<h5 />', {
      'id': $(this).attr("name"),
      'class': 'list-group-item-heading catHeader pointerCursor',
      'text': $(this).val()
    });
    $(this).parent().prepend(h5);
    $(this).remove();
})

// replacing all old category values in DB to new value.
function updateDBCategory(oldVal, newVal){
  db.updateCategory(oldVal, newVal);
}

// let myNotification = new Notification('Title', {
//   body: 'Lorem Ipsum Dolor Sit Amet'
// })

// myNotification.onclick = () => {
//   console.log('Notification clicked')
// }

function enableAddCategory(){
  $(document).on("click","#addCatBtn", function(){
    $('#newCategoryModal').modal({});
  });  
}

function changeNewBtn(){
  $("#newCatBtn").show();
  $("#floatingIcon").hide();
}

$(document).on("click", "#saveCat", function() {
  var newCat = $("#newCatName").val();
  var newColor = "#8BC34A";
  addCategory(newCat, newColor);
  $('#newCategoryModal').modal('hide');
});

//delete category event
$(document).on("click",".catTrashIcon", function(){
  var id = getId($(this).attr("id"));
  var name = $(this).attr("cname");
  $("#catModelID").val(id);
  $("#catModelName").val(name);
  $('#catConfirmationDialog').modal({});
});

$(document).on("click","#delCatConfirmation", function(){
  var id = $("#catModelID").val();
  var name = $("#catModelName").val();
  deleteCategory(id, name);
});

//delete category
function deleteCategory(idVal, name){
  readJson(catFile,(catArr)=> {
    catArr.removeValue("id", parseInt(idVal));
    updateDBCategory(name, "");
    saveCategories(catArr);
    loadAllCategories(loadColorPicker);
  }); 
}