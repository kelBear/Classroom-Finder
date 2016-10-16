var map;
var pos={lat:43.4717555,lng:-80.5453032};
var directionsDisplay;
var building = "All";
var floor = 1;

var allFiles = ['MC_F2','RCH_F3'];
var RCH = [3];
var MC = [2];

$(function(){
  //on floor change
  $("#Building").change(function () {
      building = $('#Building').val();
      loadFloor(floor);
  });

  //on floor change
  $("#Floor").change(function () {
      floor = parseInt($('#Floor').val());
      loadFloor(floor);

  });
});

function loadFloor(floor) {
  //clear previous features
  map.data.forEach(function(feature) {
    map.data.remove(feature);
  });

  //search
  var files = [];
  for (var i = 0; i < allFiles.length; i++) {
    file = allFiles[i];
    if (parseInt(file.substring(file.length-1)) === floor) {
      if (building === "All") {
        files.push(file+'.json');
      } else {
        var b = file.substr(0, file.indexOf('_'));
        if (b === building) {
          files.push(file+'.json');
        }
      }
    }
  }

  loadFiles(files);

}
function loadFiles(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    loadFile(file);
  }
}

//load geoJsonFile
function loadFile(file) {
  $.getJSON(file, function(json) {
    //TODO: replace this with a api call
    var available = [ "RCH301", "RCH302", "RCH305", "RCH306", "RCH308", "RCH309", "MC2065", "MC2066", "MC2054", "MC2017", "MC2038", "MC2035", "MC2034" ];
    var features = json.features;

    //loop through rooms on floor
    for (var i = 0; i < features.length; i++) {
      var feature = features[i];
      var props = feature.properties;
      var found = $.inArray(props.building + props.room, available) > -1;

      var total = 0;
      var sumLat = 0;
      var sumLng = 0;

      //get center
      var coords = feature.geometry.coordinates[0];
      for (var j = 0; j < coords.length; j++) {
        sumLat += coords[j][1];
        sumLng += coords[j][0];
        total++;
      }
      props.lat = sumLat / total;
      props.lng = sumLng / total;

      props.available = found; //set availablity property for room
    }
    map.data.addGeoJson(json);
  });
}

function initMap() {

  var uluru = {lat: 43.4699626, lng: -80.5427128};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: uluru,
    scrollwheel: false
  });

  // where data is a GeoJSON feature collection
  var roomInfoWindow = new google.maps.InfoWindow({map: map});
  roomInfoWindow.close();

  map.data.setStyle(function(feature) {
    var available = feature.getProperty('available');
    //set colour based on availability can be switch
    var color = available ? 'green' : 'red';
    return {
      fillColor: color,
      strokeWeight: 2
    };
  });

  //on room click
  map.data.addListener('click', function(event) {
    roomInfoWindow.open(map, this);
    var pos = {
      lat:event.feature.getProperty('lat'),
      lng:event.feature.getProperty('lng')
    };
    roomInfoWindow.setPosition(pos);
    roomInfoWindow.setContent(event.feature.getProperty('room'));
  });

  //load first floor
  loadFloor(floor);

  // GPS location
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };


            //map.setCenter(pos);
            var infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(pos);
            infoWindow.setContent('Your Location');
            //map.setCenter(pos);

          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
    }
}
function rad(x) {return x*Math.PI/180;}
function findClassroom(){
  var e = document.getElementById("Building");
  var building = e.options[e.selectedIndex].value;
  var f = document.getElementById("Floor");
  var floor = f.options[f.selectedIndex].value;

  var rch301 = {lat: 43.4704565, lng: -80.5405506};
  var rch302 = {lat: 43.4703416,lng: -80.5404776};
  var rch305 = {lat: 43.4701796,lng: -80.5406727};
  var rch306 = {lat: 43.4701314,lng: -80.5408638};
  var rch308 = {lat: 43.4703333,lng: -80.541016};
  var rch309 = {lat: 43.4704156,lng: -80.5408316};

  var mc2065 = {lat:43.4718448,lng:-80.5436564};
  var mc2066 = {lat:43.4717816,lng:-80.5437959};
  var mc2054 = {lat:43.4721067,lng:-80.5438234};
  var mc2017 = {lat:43.4720502,lng:-80.5439716};
  var mc2038 = {lat:43.4724103,lng:-80.5440098};
  var mc2035 = {lat:43.4723612,lng:-80.5441405};
  var mc2034 = {lat:43.472313,lng:-80.54427};
  var buildingNames = ["RCH", "MC"];
  var RCH = [rch301, rch302, rch305, rch306, rch308, rch309];
  var RCHnames = ["rch301", "rch302", "rch305", "rch306", "rch308", "rch309"];
  var MC = [mc2065, mc2066, mc2054, mc2017, mc2038, mc2035, mc2034];
  var MCnames = ["mc2065", "mc2066", "mc2054", "mc2017", "mc2038", "mc2035", "mc2034"];
  var buildingList = [RCH, MC];
  var buildingNameList = [RCHnames, MCnames];
  //var roomname = ["rch301", "rch302", "rch305", "rch306", "rch308", "rch309","mc2065", "mc2066", "mc2054", "mc2017", "mc2038", "mc2035", "mc2034"];
    var lat = pos.lat;
    var lng = pos.lng;
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
    var roomlist = [];
    var roomnames = [];
    if(building == "ALL"){
      for(i=0; i<buildingList.length;i++){
        roomlist = roomlist.concat(buildingList[i]) ;
        roomnames = roomnames.concat(buildingNameList[i]) ;
      }
    }
    else{
      for(i=0; i<buildingNames.length;i++){
        if(building==buildingNames[i]){
          roomlist=buildingList[i];
          roomnames = buildingNameList[i];
          break;
        }
      }
    }
    //console.log(roomlist[1]);
    for( i=0;i<roomlist.length; i++ ) {
        var mlat = roomlist[i].lat;
        var mlng = roomlist[i].lng;
        var dLat  = rad(mlat - lat);
        var dLong = rad(mlng - lng);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        distances[i] = d;
        if ( closest == -1 || d < distances[closest] ) {
            closest = i;
        }
    }
  // var marker = new google.maps.Marker({
  //   position: roomlist[closest],
  //   map: map,
  // });
  var infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(roomlist[closest]);
            infoWindow.setContent(roomnames[closest]);
  navagation(pos, roomlist[closest]);

}
function startNavigation() {
  if(directionsDisplay){
    directionsDisplay.setMap(null);
  }
  findClassroom();
}
function navagation(from, to){
  var directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();

         directionsDisplay.setMap(map);
         directionsDisplay.setPanel(document.getElementById('panel'));

         var request = {
           origin: from,
           destination: to,
           travelMode: google.maps.DirectionsTravelMode.WALKING,
           optimizeWaypoints: false
         };

         directionsService.route(request, function(response, status) {
           if (status == google.maps.DirectionsStatus.OK) {
             directionsDisplay.setDirections(response);
           }
         });
}

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        //infoWindow.setPosition(pos);
        alert(browserHasGeolocation ?
                              'Error: Cannot detect location' :
                              'Error: Your browser doesn\'t support geolocation');
      }