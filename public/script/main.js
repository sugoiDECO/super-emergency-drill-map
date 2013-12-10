var map;

$(window).load(function() {
  //console.log('hello');

  map = L.map('map').setView([35.67740687825185, 139.71395820379257], 5);

  //map.on('popupopen', function(e) {
  //  console.log('popupopen');
  //  console.log(e.popup._source);
  //});

  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  var treeIcon = new TreeIcon();
  var tonerUrl = "http://{S}tile.stamen.com/toner/{Z}/{X}/{Y}.png";
  var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
  });
  L.tileLayer(url, {
    minZoom: 0,
    maxZoom: 20,
    type: 'png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
    subdomains: ['','a.','b.','c.','d.'],
    }).addTo(map);

  $.getJSON('/issues.json').done(function(json){
  //console.log('done');
  $.each(json.issues, function(key, issue) {
    var geometry = JSON.parse(issue.geometry);
    var layer = L.geoJson(geometry,{
                pointToLayer: function (feature, latlng) {
                  return L.marker(latlng, {icon: treeIcon});
                }
    }).addTo(map);
    //console.log(issue);
    var popupHtml = '';
    popupHtml = '<h2>' + issue.subject + '</h2>';
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
}).fail(function( jqxhr, textStatus, error ){
  //console.log('fail');
  //console.log(textStatus);
  //console.log(error);
});
});

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

var TreeIcon = L.Icon.extend({
    options: {
        iconUrl: '/img/marker-icon-2x.png',
        iconSize:     [35, 41],
        shadowSize:   [41, 27],
        iconAnchor:   [11, 41],
        shadowAnchor: [2, 31],
        popupAnchor:  [-3, -38]
    }
});
