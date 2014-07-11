var map;
var markers = [];
var firsttime = true;
var issues = [];

$(function() {
  $("#show-about").click(function() {
    $('#about').fadeIn(500);
  });
  $("#close-about").click(function() {
    $('#about').fadeOut(500);
  });
});

$(window).load(function() {
  //console.log('hello');

  map = L.map('map').setView([35.67740687825185, 139.71395820379257], 5);

  //map.on('popupopen', function(e) {
  //  console.log('popupopen');
  //  console.log(e.popup._source);
  //});

  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  var tonerUrl = "http://{S}tile.stamen.com/toner/{Z}/{X}/{Y}.png";
  var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
  });
  var googleLayer = new L.Google('ROADMAP');
  L.mapbox.tileLayer('georepublic.h7fk5kam', {
    minZoom: 0,
    maxZoom: 20,
    type: 'png',
    attribution: 'OpenStreetMap contributors, CC-BY-SA, Imagery © Mapbox',
    subdomains: ['','a.','b.','c.','d.'],
    detectRetina: true
    }).addTo(map);
  //map.addLayer(googleLayer);
  //
  readIssues();

});

var readIssues = function(){
  var treeIcon = new TreeIcon();
  var loadIssues = function(offset){
    $.getJSON('/issues.json?offset=' + offset + "&limit=100").done(function(json){
    //console.log('done');
    $.each(json.issues, function(key, issue) {
        var geometry = JSON.parse(issue.geometry);
        if ($.inArray(issue.id, issues) >= 0){
          console.log('skip');
          return true;
        }
        issues.push(issue.id)
        var layer = L.geoJson(geometry,{
            pointToLayer: function (feature, latlng) {
              treeIcon.options.iconUrl = '/img/marker-icon-' + (issue.author.id % 6) + '-2x.png';
              return L.marker(latlng, {icon: treeIcon});
            }
          }).addTo(map);
        markers.push(layer);
        //console.log(issue);
        var popupHtml = '';
        popupHtml = '<a href="http://beta.shirasete.jp/issues/' + issue.id + '" target="_blank"><h2>' + issue.subject + '</h2></a>';
        layer.bindPopup(popupHtml, {maxWidth: 1024});
        layer.on('popupopen', function(e) {
            //console.log('popupopen');
            //console.log(e.popup);
            $.getJSON('/issues/'+ issue.id+ '.json').done(function(json){
                getIssueDone(json, e.popup);
                layer.clearAllEventListeners();
              }).fail(getIssueFail);
          });
      });
    if (firsttime){
      map.fitBounds(markersToBounds(markers));
      if (json.total_count > json.offset + json.limit){
        loadIssues(json.offset + json.limit)
      }else{
        firsttime = false;
        setTimeout(readIssues,1000);
      }
    }else{
      setTimeout(readIssues,1000);
    }
    }).fail(function( jqxhr, textStatus, error ){
      //console.log('fail');
      //console.log(textStatus);
      //console.log(error);
    });
  };
  loadIssues(0);
}

var getIssueDone = function(json, popup) {
  //console.log('getIssueDone');
  var issue = json.issue;
  //console.log(issue);
  //console.log(issue.attachments);
  var popupHtml = popup.getContent() + '<ul class="photo_thumb">';
  $.each(issue.attachments, function(key, attachment) {
    //console.log(attachment.content_url);
    popupHtml = popupHtml + '<li class="photo_thumb"><a href="' + attachment.content_url + '" data-lightbox=issue_"' + issue.id + '"><img class="photo_thumb" src="' + attachment.content_url + '" /></a></li>';
  });
  popupHtml = popupHtml + '</ul>';
  //console.log(popupHtml);
  var divNode = document.createElement('DIV');
  divNode.innerHTML = popupHtml;
  //popup.setContent(popupHtml);
  popup.setContent(divNode);
  //console.log('divNode');
  $.each($(divNode).find('img'), function(key, img) {
    //console.log(img);
    $(img).load(function() {
      //console.log('img load');
      popup.update();
    });
  });
  //popup.update();
}

var getIssueFail = function(jqxhr, textStatus, error) {
  //console.log('getIssueFail');
}

var markersToBounds = function(_markers) {
  var latlngs = [];
  $.each(_markers, function(key, marker) {
    var latlng = marker.getLayers()[0].getLatLng();
    latlngs.push(latlng);
  });
  var bounds = new L.LatLngBounds(latlngs);
  return bounds;
}

var TreeIcon = L.Icon.extend({
    options: {
        iconUrl: '/img/marker-icon-2x.png',
        iconSize:     [14, 14],
        popupAnchor:  [7, -41]
    }
});

