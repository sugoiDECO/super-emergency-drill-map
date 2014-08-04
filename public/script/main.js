var map;
var markers = [];
var firsttime = true;
var issues = [];
var MAPBOX_URL = 'memeshiexe.j033d7pl'
//var MAPBOX_URL = 'georepublic.h7fk5kam'
var taskLoader

$(function() {
  taskLoader = new TaskLoader();
  $("#show-about").click(function() {
    $('#about').fadeIn(500);
  });
  $("#close-about").click(function() {
    $('#about').fadeOut(500);
  });
  $("#menu input[type='checkbox']").click(function(){
      var tid = $(this).attr('id').split('_')[1];
      if ($(this).prop('checked') == true){
        taskLoader.load(tid);
      }else{
        taskLoader.cancel(tid);
      }
  })
});

$(window).load(function() {
  //console.log('hello');

  map = L.map('map', {zoomControl: false}).setView([35.67740687825185, 139.71395820379257], 5);

  //map.on('popupopen', function(e) {
  //  console.log('popupopen');
  //  console.log(e.popup._source);
  //});

  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  var redLayer = L.geoJson(null, {
     // http://leafletjs.com/reference.html#geojson-style
     style: function(feature) {
         return {
           color: '#55f',
           opacity: 0.1
         };
       }
     });
  var customLayer = L.geoJson(null, {
     // http://leafletjs.com/reference.html#geojson-style
     style: function(feature) {
         return {
           color: '#55f',
           opacity: 0.1
         };
       }
     });
  var runLayer = new L.KML('/kml/KINKYUYUSORO_AREA.kml', {async: true});
  map.addLayer(runLayer);
  runLayer.on("loaded", function(e) {
      map.fitBounds(e.target.getBounds());
      runLayer.setStyle({opacity:0.3});
  });

  var hinanbasho = new L.KML('/kml/HINANBASHO_AREA.kml', {async: true});
  map.addLayer(hinanbasho);
  hinanbasho.on("loaded", function(e) {
      hinanbasho.setStyle({opacity:0.3});
  });

  /*
  var kmlLayer = new L.KML('/kml/POINT_TEXT.kml', {async: true});
  map.addLayer(kmlLayer);
  kmlLayer.on('loaded', function(e){
      kmlLayer.setStyle({opacity:0.3, scale:0.1});
    });
    */
  var tonerUrl = "http://{S}tile.stamen.com/toner/{Z}/{X}/{Y}.png";
  var url = tonerUrl.replace(/({[A-Z]})/g, function(s) {
    return s.toLowerCase();
  });
  var googleLayer = new L.Google('ROADMAP');
  L.mapbox.tileLayer(MAPBOX_URL, {
    minZoom: 0,
    maxZoom: 20,
    type: 'png',
    attribution: 'OpenStreetMap contributors, CC-BY-SA, Imagery © Mapbox, Check Mark designed by <a href="http://www.thenounproject.com/Yaosamo">Yaroslav Samoilov</a> from the <a href="http://www.thenounproject.com">Noun Project</a> ',
    subdomains: ['','a.','b.','c.','d.'],
    detectRetina: true
    }).addTo(map);
  new L.Control.Zoom({ position: 'topright' }).addTo(map);
  //map.addLayer(googleLayer);
  //
  readIssues();

});

var readIssues = function(){
  var treeIcon = new TreeIcon();
  var opacityController = makeOpacityController();
  var loadIssues = function(offset){
    $.getJSON('/issues.json?offset=' + offset + "&limit=100").done(function(json){
    //console.log('done');
    //console.log(json);
    $.each(json.issues, function(key, issue) {
        var geometry = JSON.parse(issue.geometry);
        if ($.inArray(issue.id, issues) >= 0){
          //console.log('skip');
          return true;
        }
        issues.push(issue.id)
        var marker;
        var layer = L.geoJson(geometry,{
            pointToLayer: function (feature, latlng) {
              treeIcon.options.iconUrl = '/img/marker-icon-' + (issue.author.id % 6) + '-2x.png';
              marker = L.marker(latlng, {icon: treeIcon, opacity:0.6});
              opacityController.setOpacity(issue, marker);
              return marker;
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
      //map.fitBounds(markersToBounds(markers));
      if (json.total_count > json.offset + json.limit){
        loadIssues(json.offset + json.limit)
      }else{
        setTimeout(readIssues,1000);
        firsttime = false;
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

var makeOpacityController = (function(){
    var lastMarkers = [];
    var lastDates = [];
    return {
      setOpacity: function(_issue, _marker){
        var aid = _issue.author.id;
        date = new Date(_issue.created_on);
        if (aid in lastDates){
          if (lastDates[aid].getTime() < date.getTime()){
            console.log('move to new');
            if (aid in lastMarkers){
              lastMarkers[aid].options.opacity = 0.5;
              lastMarkers[aid].options.iconSize = [6,6];
            }
            lastMarkers[aid]= _marker;
            lastDates[aid] = date;
            _marker.options.opacity = 1.0;
            //_marker.options.icon.options.iconSize = [12,12];
          }
        }else{
          //console.log(_marker)
          _marker.options.opacity = 1.0;
          //_marker.options.icon.options.iconSize = [12,12];
          lastDates[aid] = date
          lastMarkers[aid] = _marker;
        }
      }
    }
});
var TreeIcon = L.Icon.extend({
    options: {
        iconUrl: '/img/marker-icon-2x.png',
        iconSize:     [6, 6],
        popupAnchor:  [7, -41]
    }
});
var TaskIcon = L.Icon.extend({
    options: {
        iconUrl: '/img/task-icon-0.png',
        iconSize:     [24, 24],
        popupAnchor:  [7, -41]
    }
});
var TaskLoader = (function(){
    var tasks = [];
    var markers = {};
    var taskIcon = new TaskIcon();
    var stop = [];
    return {
      getIcon: function(issue){
        if (issue.status.id == 3 || issue.status.id == 4){
          taskIcon.options.iconUrl = '/img/task-icon-done-' + issue.assigned_to.id + '.png';
        }else{
          taskIcon.options.iconUrl = '/img/task-icon-' + issue.assigned_to.id + '.png';
        }
        return taskIcon;
      },
      load: function(taskId){
        console.log('load ' + taskId);
        var _this = this;
        $.getJSON('/tasks.json?task_id=' + taskId).done(function(json){
            console.log(json);
            $.each(json.issues, function(key, issue) {
                if (issue.geometry == "") return;
                var tid = issue.id
                if (tasks.indexOf(tid) > -1){
                  if (markers[taskId][issue.id].issue.status.id != issue.status.id){
                    markers[taskId][issue.id].setIcon(taskLoader.getIcon(issue));
                  }
                }else{
                  tasks.push(issue.id)
                  var geometry = JSON.parse(issue.geometry);
                  var marker;
                  var layer = L.geoJson(geometry,{
                      pointToLayer: function (feature, latlng) {
                        var icon = taskLoader.getIcon(issue);
                        var marker = L.marker(latlng, {icon: taskIcon, opacity:1.0});
                        marker.issue = issue;
                        if (markers[taskId] == undefined) markers[taskId] = {};
                        markers[taskId][issue.id] = marker;
                        return marker;
                      }
                    }).addTo(map);
                }
              })
            if (stop[taskId] == undefined){
              setTimeout("taskLoader.load(" + taskId + ")", 1000);
            }else{
              stop[taskId] = undefined;
            }
          })
      },
      cancel: function(taskid){
        stop[taskid] = true;
      }
    }
});

