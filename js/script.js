 $(function(){
      $("#home_content").load("views/upcoming.html"); 
      $("#all_content").load("views/all_reminders.html"); 
      $("#category_content").load("views/category.html"); 
      $("#settings_content").load("views/settings.html"); 
      $("#help_content").load("views/help.html"); 
      $("#newReminder").load("views/new.html"); 
 });

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


$(document).ready(function(){
    $('.modal-trigger').leanModal({
      dismissible: true, 
      opacity: .5, 
      in_duration: 150, 
      out_duration: 100,
    });
});