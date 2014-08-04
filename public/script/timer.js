$(function() {
    var timeDiv = $('#timer');
    var timer = function(){
      timeDiv.html(($.format.date(new Date(), "HH:mm:ss")));
      setTimeout(timer, 1000);
    }
    timer();
});


