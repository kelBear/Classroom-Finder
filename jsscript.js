function initMap() {
  var uluru = {lat: 43.4699626, lng: -80.5427128};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });

  // GPS location

  var infoWindow = new google.maps.InfoWindow({map: map});

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Your Location');
            map.setCenter(pos);
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
  var roomlist = [rch301, rch302, rch305, rch306, rch308, rch309];
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
  var marker = new google.maps.Marker({
    position: roomlist[closest],
    map: map
  });


}

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: Cannot detect location' :
                              'Error: Your browser doesn\'t support geolocation');
      }