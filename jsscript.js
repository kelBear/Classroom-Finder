var map;
var pos={lat:43.4717555,lng:-80.5453032};
var directionsDisplay;
var building = "ALL";
var floor = 1;
var available = [];
var infoWindow;
var roomInfoWindow;
var findRoomInfoWindow;

var sellat = sellng = null;

var mouse = {
    x: 0,
    y: 0
};

document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX || e.pageX;
    mouse.y = e.clientY || e.pageY
}, false);

function loadMap(floor) {
  map.data.forEach(function(feature) {
    map.data.remove(feature);
  });

  var buildlist = "";
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var t = h*100+m;
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var w =days[d.getDay()];

  $.ajax({
      url: "https://classroom-finder.herokuapp.com/getrooms.php",
      data: { 'building' : building, 'dow': w, 'hr': t, 'floor':floor },
      type: 'POST',
      dataType: 'json',
      success: function(ava) {

          document.getElementById("available").innerHTML =
            building + " Floor " + floor + " - <b>" + ava.length + "</b> Rooms Available";

          var arr = [];
          for (var i = 0; i < ava.length; i++) {
            var a = ava[i]
            arr.push({
              building: a['building'],
              room: a['room']
            });
          };
          getGrey(floor, arr);
      },
      error: function(xhr, desc, err) {
          console.log(xhr);
          console.log("Details: " + desc + "\nError:" + err);
          console.log({ 'building' : building, 'dow': w, 'hr': t, 'floor':floor });
          //alert("We weren't able to find available rooms! :(");
      }
  });

}
$( document ).ready(function() {
   var wHeight = $(window).height();
    var dHeight = wHeight * 0.8;
  $('#dialog1').dialog({
       autoOpen: false,
       width: '60%',
       height: dHeight,
       modal: true,
       my: "center",
       at: "center",
       of: window,
       close: function( event, ui ) {
            sellat = sellng = null;
        }
  });
});

function getGrey(floor, ava) {
  $.ajax({
    url: "https://classroom-finder.herokuapp.com/getgreyrooms.php",
    data: { 'building' : building, 'floor': floor },
    type: 'POST',
    dataType: 'json',
    success: function(data) {
      loadPlan(floor, ava, data);
    },
    error: function(xhr, desc, err) {
          console.log(xhr);
          console.log({ 'building' : building, 'floor': floor });
          console.log("Details: " + desc + "\nError:" + err);
        }
    });
}

function loadPlan(floor, ava, grey) {
  $.ajax({
    url: "https://classroom-finder.herokuapp.com/getfloorplans.php",
    data: { 'building' : building, 'floor': floor },
    type: 'POST',
    dataType: 'json',
    success: function(data) {

      totjson = {
        "type": "FeatureCollection",
        "features": []
      };

      for (var i = 0; i < data.length; i++) {
        var datum = data[i];

        var coords = JSON.parse(datum["coords"].replace(/\{/g, '[').replace(/\}/g, ']'));

        var a = 'Red';

        for (var j = 0; j < grey.length; j++) {
          var b = grey[j];
          if (datum['building'] == b['building'] && datum['room'] == b['room']) {
            a = '#555555';
          }
        }
        for (var j = 0; j < ava.length; j++) {
          var b = ava[j];
          if (datum['building'] == b['building'] && datum['room'] == b['room']) {
            a = '#77C088';
          }
        }


        var json = {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              coords
            ]
          },
          "properties": {
            'building' : datum['building'],
            'room' : datum['room'],
            'lat' : parseFloat(datum['lat']),
            'lng' : parseFloat(datum['lng']),
            'available' : a
          }
        };

        totjson["features"].push(json);
      }
      map.data.addGeoJson(totjson);

    },
    error: function(xhr, desc, err) {
          console.log(xhr);
          console.log({ 'building' : building, 'floor': floor });
          console.log("Details: " + desc + "\nError:" + err);
        }
    });
}

function fillBuildingDropdown() {
    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getbuildings.php",
        type: 'POST',
        async: false,
        dataType: 'json',
        success: function(output) {
            var select = document.getElementById("Building");
            var str = "";
            str = str + '<option value="ALL">Filter Buildings</option>\n';
            for (var i = 0; i < output.length; i++) {
              str = str + '<option value="' + output[i].building + '">' + output[i].building + '</option>\n';
            }
            select.innerHTML = str;
            fillFloorDropdown();
        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
        }
    });

}

function fillFloorDropdown() {
    var e = document.getElementById("Building");
    var building = e.options[e.selectedIndex].value;
    var f = $('#Floor').selectedIndex || 1;

    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getfloor.php",
        type: 'POST',
        data: { 'building' : building },
        async: false,
        dataType: 'json',
        success: function(output) {
            var select = document.getElementById("Floor");
            var str = "";
            str = str + '<option value="ALL">Filter Floors</option>\n';
            if (output) {
              for (var i = 0; i < output.length; i++) {
                str = str + '<option value="' + output[i].floor + '">' + output[i].floor + '</option>\n';
              }
            }
            select.innerHTML = str;
            if (f > select.options.length-1) {
              f = select.options.length-1;
            }
            select.selectedIndex = f;
            if (building == "ALL") {
              floor = 1;
            } else{
              floor = f;
            }

        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
        }
    });

}

function buildingChanged() {
  fillFloorDropdown();
  updateCourse();
}

$(function(){
    //on floor change
    $("#Building").change(function () {
        building = $('#Building').val();
        fillFloorDropdown();
        loadMap(floor);
    });

    //on floor change
    $("#Floor").change(function () {
        floor = parseInt($('#Floor').val());
        loadMap(floor);
    });
});

// finds all available classrooms
function loadavailable(buildings, floor){
    var buildlist = "";
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var t = h*100+m;
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var w =days[d.getDay()];
    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getrooms.php",
        data: { 'building' : buildings, 'dow': w, 'hr': t, 'floor':floor },
        type: 'POST',
        dataType: 'json',
        success: function(output) {
            available = output;
            console.log(available);
            findClassroom("<b>Closest available classroom: </b><br>", "c");
        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
            alert("We weren't able to find available rooms! :(");
        }
    });
}

function fromLatLngToPoint(latLng, map) {
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function initMap() {



    fillBuildingDropdown();
    updateCourse();

    var uluru = {lat: 43.4699626, lng: -80.5427128};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: uluru,
        scrollwheel: false
    });

    // where data is a GeoJSON feature collection
    roomInfoWindow = new google.maps.InfoWindow({map: map});
    roomInfoWindow.close();

    map.data.setStyle(function(feature) {
        var available = feature.getProperty('available');
        //set colour based on availability can be switch
        var color = available;
        return {
            fillColor: color,
            strokeWeight: 2
        };
    });

    //on room hover
    map.data.addListener('mouseover', function(event) {
      var latLng = {
          lat:event.feature.getProperty('lat'),
          lng:event.feature.getProperty('lng')
      };
      var point = fromLatLngToPoint(new google.maps.LatLng(latLng), map);
      var text = event.feature.getProperty('building') + " " + event.feature.getProperty('room');

      $("#tt").css("left", point.x + "px").css("top", (point.y - 10) + "px");
      $("#tt").attr('title', text).tooltip('fixTitle').tooltip('show');

    });

    map.data.addListener('mouseout', function(event) {
        $("#tt").tooltip('hide');
    });

    //on room click
    map.data.addListener('click', function(event) {
        roomInfoWindow.open(map, this);
        var pos = {
            lat:event.feature.getProperty('lat'),
            lng:event.feature.getProperty('lng')
        };
        var room = event.feature.getProperty('room');
        var build = event.feature.getProperty('building');
        sellat = event.feature.getProperty('lat');
        sellng = event.feature.getProperty('lng');

        //roomInfoWindow.setPosition(pos);
        //roomInfoWindow.setContent(event.feature.getProperty('room'));
        $("#dialog1").dialog('open');
        $("#dialog1").dialog('option', 'title',  build + ' ' + room );

        $('#calendar').fullCalendar({
            header: {
              left: '',
              center: '',
              right: ''
            },
            defaultView: 'agendaWeek',
            contentHeight: '60vh',
            weekends: false, // will hide Saturdays and Sundays
            eventLimit: true,
            allDayDefault: false,
            eventColor: '#448D55',
            minTime: "06:00:00",
            nowIndicator : true,
            eventClick: function(calEvent, jsEvent, view) {
              console.log('Event: ' + calEvent.title);
            },
            eventRender: function(event, element) {
              $(element).tooltip({title: event.secondary});
            }
          });
        $('#calendar').fullCalendar('removeEventSources');

        $.ajax({
        url: "https://classroom-finder.herokuapp.com/getRoomInfo.php",
        data: { 'building' : build, 'room' : room},
        type: 'POST',
        dataType: 'json',
        success: function(output) {

            console.log(output);
            ret = [];
            for (var i = 0; i < output.length; i++) {
              var evt = output[i];
              var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
              var tots = [];

              var start = moment(evt['start_time'], 'HH:mm');
              var end = moment(evt['end_time'], 'HH:mm');
              startDay = moment().startOf('week').hour(start.get('hours')).minute(start.get('minutes'));
              endDay = moment().startOf('week').hour(end.get('hours')).minute(end.get('minutes'));

              for (var j = 0; j < days.length; j++) {
                if (evt[days[j]] === 'true') {
                  tots.push(j+1);
                }
              }

              for (var j = 0; j < tots.length; j++) {

                ret.push({
                  start:startDay.add(tots[j], 'days').format(),
                  end:endDay.add(tots[j], 'days').format(),
                  overlap: true,
                  title:evt['subject'] + ' ' + evt['catalog_number'],
                  secondary:evt['subject'] + ' ' + evt['catalog_number'] + ' - ' + evt['title']
                });
              }
            }
            $('#calendar').fullCalendar( 'addEventSource', ret );

          },
          error: function(xhr, desc, err) {
              console.log(xhr);
              console.log({ 'building' : build, 'room' : room});
              console.log("Details: " + desc + "\nError:" + err);
          }
        });

    });

    //load first floor
    //loadFloor(floor);
    loadMap(floor);

    var myloc = new google.maps.Marker({
        clickable: false,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                        new google.maps.Size(22,22),
                                                        new google.maps.Point(0,18),
                                                        new google.maps.Point(11,11)),
        shadow: null,
        zIndex: 999,
        map: map
    });

    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function(pos) {
        var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);
    }, function(error) {
        // ...
    });

    // GPS location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow = new google.maps.InfoWindow({map: map});
            infoWindow.setPosition(pos);
            infoWindow.setContent('Your Location');
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function rad(x) {return x*Math.PI/180;}

function findClassroom(content, tag) {
    if (directionsDisplay) {
        directionsDisplay.setMap(null);
    }
    var lat = pos.lat;
    var lng = pos.lng;
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = 0;
    var roomlist = [];
    var roomnames = [];

    var buildlist = "";

    if (tag == "c") {
        for (i = 0; i < available.length; i++) {
            var mlat = available[i].lat;
            var mlng = available[i].lng;
            var dLat = rad(mlat - lat);
            var dLong = rad(mlng - lng);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            distances[i] = d;
            if (closest == -1 || d < distances[closest]) {
                closest = i;
            }
        }

        if (!document.getElementById(available[closest].building + " " + available[closest].room)) {
            var f = document.getElementById("Option");
            var option = f.options[f.selectedIndex].value;
            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var t = h * 100 + m;
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var w = days[d.getDay()];
            var g = document.getElementById("Floor");
            var floor = g.options[g.selectedIndex].value;

            $.ajax({
                url: "https://classroom-finder.herokuapp.com/getrooms.php",
                data: {'building': building, 'dow': w, 'hr': t, 'floor': floor },
                type: 'POST',
                dataType: 'json',
                success: function (output) {
                    for (i = 0; i < output.length; i++) {
                        if (output[i].building == available[closest].building && output[i].room == available[closest].room) {
                            buildlist = buildlist + "<b>Room: </b>";
                            buildlist = buildlist + output[i].building + " ";
                            buildlist = buildlist + output[i].room;

                            buildlist = buildlist + "<br>";
                            if (output[i].nextclass == "99:00") {
                                buildlist = buildlist + "This room is free for the rest of the day!";
                            }
                            else {
                                buildlist = buildlist + "<b>Free until: </b>";
                                buildlist = buildlist + output[i].nextclass;
                                buildlist = buildlist + "<br>";
                                var nexttime = output[i].nextclass;
                                nexttime = nexttime.slice(0, 2) + nexttime.slice(3);
                                var intnext = parseInt(nexttime);

                                var diff = 60 * (Math.floor(intnext / 100) - Math.floor(t / 100)) + (intnext % 100 - t % 100);
                                var hours = Math.floor(diff / 60);
                                var minutes = diff % 60;
                                if (hours == 0) buildlist = buildlist + "This room is free for " + minutes + " minutes";
                                if (hours != 0) buildlist = buildlist + "This room is free for " + hours;
                                if (hours == 1) buildlist = buildlist + " hour and " + minutes + " minutes";
                                if (hours > 1) buildlist = buildlist + " hours and " + minutes + " minutes";
                            }
                            buildlist = buildlist + "<br>";
                        }
                    }

                },
                error: function (xhr, desc, err) {
                    console.log(xhr);
                    console.log("Details: " + desc + "\nError:" + err);
                    buildlist = input;
                },
                complete: function () {
                    content = content + buildlist;
                    var cl = {lat: parseFloat(available[closest].lat), lng: parseFloat(available[closest].lng)};

                    if (sellat && sellng) {
                      cl = {lat: sellat, lng: sellng};
                    }
                    $("#dialog1").dialog('close');

                    if (findRoomInfoWindow != null) findRoomInfoWindow.close();
                    findRoomInfoWindow = new google.maps.InfoWindow({map: map});
                    findRoomInfoWindow.setPosition(cl);
                    findRoomInfoWindow.setContent(content);
                    navagation(pos, cl);
                }
            });
        }
        else {
          content = content + document.getElementById(available[closest].building + " " + available[closest].room).innerHTML;
          var cl = {lat: parseFloat(available[closest].lat), lng: parseFloat(available[closest].lng)};
          if (sellat && sellng) {
            cl = {lat: sellat, lng: sellng};
          }
          $("#dialog1").dialog('close');

          if (findRoomInfoWindow != null) findRoomInfoWindow.close();
          findRoomInfoWindow = new google.maps.InfoWindow({map: map});
          findRoomInfoWindow.setPosition(cl);
          findRoomInfoWindow.setContent(content);
          navagation(pos, cl);
        }
    }
    else {
        var cl = {lat: parseFloat(available[closest].lat), lng: parseFloat(available[closest].lng)};
        if (sellat && sellng) {
          cl = {lat: sellat, lng: sellng};
        }
        $("#dialog1").dialog('close');

        if (findRoomInfoWindow != null) findRoomInfoWindow.close();
        findRoomInfoWindow = new google.maps.InfoWindow({map: map});
        findRoomInfoWindow.setPosition(cl);
        findRoomInfoWindow.setContent(content);
        navagation(pos, cl);
    }
}

// looks for a single room
function loadfinder(input){
    var build = input.split(" ")[0];
    var room  = input.split(" ")[1];
    var buildlist = "";

    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getroom.php",
        data: { 'building' : build, "room" : room},
        type: 'POST',
        dataType: 'json',
        success: function(output) {
            available = output;

            building = build;
            var f = room.charAt(0);
            $('#Building').val(building);
            fillFloorDropdown();
            console.log(f);
            $('#Floor').val(parseInt(f));
            loadMap(f);

            if (!document.getElementById(input)) {
                var found = false;
                var f = document.getElementById("Option");
                var option = f.options[f.selectedIndex].value;
                var floor = room.charAt(0);
                var d = new Date();
                var h = d.getHours();
                var m = d.getMinutes();
                var t= h*100+m;
                var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var w =days[d.getDay()];
                //if (option == "available") {
                    $.ajax({
                        url: "https://classroom-finder.herokuapp.com/getcourses.php",
                        data: { 'building' : building, 'dow': w, 'hr': t, 'floor': floor },
                        type: 'POST',
                        async: false,
                        dataType: 'json',
                        success: function(output) {


                            for( i=0;i<output.length; i++ ) {
                                if (output[i].building == building && output[i].room == room) {
                                    buildlist=buildlist+"<b>Room: </b>";
                                    buildlist=buildlist+output[i].building + " ";
                                    buildlist=buildlist+output[i].room;

                                    buildlist=buildlist+"<br>";
                                    buildlist=buildlist+"<b>Class: </b>";
                                    buildlist=buildlist+output[i].subject;
                                    buildlist=buildlist+" ";
                                    buildlist=buildlist+output[i].catalog_number;
                                    buildlist=buildlist+"<br>";
                                    buildlist=buildlist+"<b>Time: </b>";
                                    buildlist=buildlist+output[i].start_time;
                                    buildlist=buildlist+"-";
                                    buildlist=buildlist+output[i].end_time;
                                    buildlist=buildlist+"<br>";
                                    found = true;
                                }
                            }
                        },
                        error: function(xhr, desc, err) {
                            console.log(xhr);
                            console.log("Details: " + desc + "\nError:" + err);
                            buildlist = input;
                        },
                        complete: function() {
                            findClassroom(buildlist, "");
                        }
                    });
                //}
                //else {
                if (!found) {
                    buildlist = "";
                    $.ajax({
                        url: "https://classroom-finder.herokuapp.com/getrooms.php",
                        data: { 'building' : building, 'dow': w, 'hr': t, 'floor': floor },
                        type: 'POST',
                        dataType: 'json',
                        success: function(output) {
                            for( i=0;i<output.length; i++ ) {
                                if (output[i].building == building && output[i].room == room) {
                                    buildlist=buildlist+"<b>Room: </b>";
                                    buildlist=buildlist+output[i].building + " ";
                                    buildlist=buildlist+output[i].room;

                                    buildlist=buildlist+"<br>";
                                    if (output[i].nextclass == "99:00") {
                                        buildlist = buildlist + "This room is free for the rest of the day!";
                                    }
                                    else {
                                        buildlist=buildlist+"<b>Free until: </b>";
                                        buildlist=buildlist+output[i].nextclass;
                                        buildlist = buildlist + "<br>";
                                        var nexttime = output[i].nextclass;
                                        nexttime = nexttime.slice(0, 2) + nexttime.slice(3);
                                        var intnext = parseInt(nexttime);

                                        var diff = 60*(Math.floor(intnext/100) - Math.floor(t/100))+(intnext%100-t%100);
                                        var hours = Math.floor(diff/60);
                                        var minutes = diff%60;
                                        if (hours == 0) buildlist = buildlist + "This room is free for " + minutes + " minutes";
                                        if (hours != 0) buildlist = buildlist + "This room is free for " + hours;
                                        if (hours == 1) buildlist = buildlist + " hour and " + minutes + " minutes";
                                        if (hours > 1) buildlist = buildlist + " hours and " + minutes + " minutes";
                                    }
                                    buildlist = buildlist + "<br>";
                                    found = true;
                                }
                            }
                        },
                        error: function(xhr, desc, err) {
                            console.log(xhr);
                            console.log("Details: " + desc + "\nError:" + err);
                            buildlist = input;
                        },
                        complete: function() {
                            findClassroom(buildlist, "");
                        }
                    });
                  }
                if (!found) {
                    buildlist = "";
                    $.ajax({
                        url: "https://classroom-finder.herokuapp.com/getgreyrooms.php",
                        type: 'POST',
                        dataType: 'json',
                        success: function(output) {
                            for( i=0;i<output.length; i++ ) {
                                if (output[i].building == building && output[i].room == room) {
                                    buildlist=buildlist+"<b>Room: </b>";
                                    buildlist=buildlist+output[i].building + " ";
                                    buildlist=buildlist+output[i].room;

                                    buildlist=buildlist+"<br>";
                                    buildlist=buildlist + "This room may not be a classroom<br>";
                                    found = true;
                                }
                            }
                        },
                        error: function(xhr, desc, err) {
                            console.log(xhr);
                            console.log("Details: " + desc + "\nError:" + err);
                            buildlist = input;
                        },
                        complete: function() {
                            findClassroom(buildlist, "");
                        }
                    });
                  }
            }
            else {
                buildlist = document.getElementById(input).innerHTML;
                findClassroom(buildlist, "");
            }
        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
            alert("We weren't able to find the classroom you are looking for! :(\nDid you try using the format 'MC 2065'?");
        }
    });
}

function startNavigation() {
    var e = document.getElementById("Building");
    var building = e.options[e.selectedIndex].value;
    var input = document.getElementById("searchtxt").value;
    var f = document.getElementById("Floor");
    var floor = f.options[f.selectedIndex].value;
    loadavailable(building, floor);
}

function findroom() {
    var input = document.getElementById("searchtxt").value;

    loadfinder(input);
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