var map;

function initMap() {

  var uluru = {lat: 43.4699626, lng: -80.5427128};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: uluru
  });
  // where data is a GeoJSON feature collection

  map.data.loadGeoJson('geoJson.json');

  // GPS location

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };


            //map.setCenter(pos);
            var infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(pos);
            infoWindow.setContent('Your Location');
            //map.setCenter(pos);
            //pos = {lat:43.4725383,lng:-80.5422333};
            findClassroom(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
    }
}
function rad(x) {return x*Math.PI/180;}
function findClassroom(pos){
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

  var roomlist = [rch301, rch302, rch305, rch306, rch308, rch309, mc2065, mc2066, mc2054, mc2017, mc2038, mc2035, mc2034];
  var roomname = ["rch301", "rch302", "rch305", "rch306", "rch308", "rch309","mc2065", "mc2066", "mc2054", "mc2017", "mc2038", "mc2035", "mc2034"];
    var lat = pos.lat;
    var lng = pos.lng;
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
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
            infoWindow.setContent(roomname[closest]);
  navagation(pos, roomlist[closest]);

}

function navagation(from, to){
  var directionsService = new google.maps.DirectionsService();
   var directionsDisplay = new google.maps.DirectionsRenderer();

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