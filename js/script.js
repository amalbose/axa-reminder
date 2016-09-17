var fs = require('fs');
var remFile = "data/reminders.json"

 // Load page components
 $(function(){
      $("#home_content").load("views/upcoming.html"); 
      $("#all_content").load("views/all_reminders.html"); 
      $("#category_content").load("views/category.html"); 
      $("#settings_content").load("views/settings.html"); 
      $("#help_content").load("views/help.html"); 
      $("#newReminder").load("views/new.html"); 
 });

// Tab selection
$(document).on("click", ".sideLink", function(){
	$("#newReminder").removeClass("newContent");
    $(".content").removeClass("inside");
    $(".sideLink").removeClass("selected");
    $("#"+this.id+"_content").addClass("inside");
    $("#"+this.id).addClass("selected");
});

// Close windows
$(document).on("click","#closeIcon", function(){
	window.close();
});

// Open modal window
$(document).ready(function(){
    $('.modal-trigger').leanModal({
      dismissible: true, 
      opacity: .5, 
      in_duration: 150, 
      out_duration: 100,
    });
});

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
      // emit event
      dropDown.trigger('contentChanged');
    });

    // $('select').material_select();
    $('select').on('contentChanged', function() {
      $(this).material_select();
    });
}

// Cancel Button action
$(document).on("click","#cancelBtn", function(){
  clearForm(true);
});

// clear the form
function clearForm(saveCategory){
  $("#task_name").val('')
  $("#datetimepicker").val('')
  $("#notes").val('')
  $("#alarm").prop('checked', true);
  if(saveCategory) {
    $("#categorySelect option[value=0]").prop('selected', true);
    $("#categorySelect").trigger('contentChanged');
  }
}

// Save Button action
$(document).on("click","#saveBtn", function(){
  saveData(()=>{
    clearForm(false);
  });
});

// save data to file
function saveData(callBack){
  readJson(remFile,(remArr)=> {
    var newId = Object.keys(remArr).length + 1;
    var name = $("#task_name").val()
    var notes = $("#notes").val()
    var remindOn = $("#datetimepicker").val()
    var alarm = $("#alarm").prop('checked');
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
        alert("Saved")
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
