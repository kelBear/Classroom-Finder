var map;
var pos={lat:43.4717555,lng:-80.5453032};
var directionsDisplay;
var building = "All";
var floor = 1;
var available = [];
var allFiles = ['MC_F2','RCH_F3'];
var RCH = [3];
var MC = [2];

var infoWindow;
var roomInfoWindow;
var findRoomInfoWindow;

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

// finds all available classrooms
function loadavailable(buildings){
    var buildlist = "";
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var t = h*100+m;
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var w =days[d.getDay()];
    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getrooms.php",
        data: { 'building' : buildings, 'dow': w, 'hr': t},
        type: 'POST',
        dataType: 'json',
        success: function(output) {
            available = output;
            findClassroom("<b>Closest available classroom: </b><br>", "c");
        },
        error: function(xhr, desc, err) {
            console.log(xhr);
            console.log("Details: " + desc + "\nError:" + err);
            alert("We weren't able to find available rooms! :(");
        }
    });
}

//load geoJsonFile
function loadFile(file) {
    $.getJSON(file, function(json) {
        //TODO: replace this with a api call
        var available2 = [ "RCH301", "RCH302", "RCH305", "RCH306", "RCH308", "RCH309", "MC2065", "MC2066", "MC2054", "MC2017", "MC2038", "MC2035", "MC2034" ];
        var features = json.features;
        //loop through rooms on floor
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var props = feature.properties;
            var found = $.inArray(props.building + props.room, available2) > -1;

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

            props.available2 = found; //set availablity property for room
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
    roomInfoWindow = new google.maps.InfoWindow({map: map});
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

            $.ajax({
                url: "https://classroom-finder.herokuapp.com/getrooms.php",
                data: {'building': building, 'dow': w, 'hr': t},
                type: 'POST',
                dataType: 'json',
                success: function (output) {
                    for (i = 0; i < output.length; i++) {
                        if (output[i].building == building && output[i].room == room) {
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
          if (findRoomInfoWindow != null) findRoomInfoWindow.close();
          findRoomInfoWindow = new google.maps.InfoWindow({map: map});
          findRoomInfoWindow.setPosition(cl);
          findRoomInfoWindow.setContent(content);
          navagation(pos, cl);
        }
    }
    else {
        var cl = {lat: parseFloat(available[closest].lat), lng: parseFloat(available[closest].lng)};
        if (findRoomInfoWindow != null) findRoomInfoWindow.close();
        findRoomInfoWindow = new google.maps.InfoWindow({map: map});
        findRoomInfoWindow.setPosition(cl);
        findRoomInfoWindow.setContent(content);
        navagation(pos, cl);
    }
}

// looks for a single room
function loadfinder(input){
    var building = input.split(" ")[0];
    var room  = input.split(" ")[1];
    var buildlist = "";
    $.ajax({
        url: "https://classroom-finder.herokuapp.com/getroom.php",
        data: { 'building' : building, "room" : room},
        type: 'POST',
        dataType: 'json',
        success: function(output) {
            available = output;
            if (!document.getElementById(input)) {
                var f = document.getElementById("Option");
                var option = f.options[f.selectedIndex].value;
                var d = new Date();
                var h = d.getHours();
                var m = d.getMinutes();
                var t= h*100+m;
                var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var w =days[d.getDay()];
                if (option == "available") {
                    $.ajax({
                        url: "https://classroom-finder.herokuapp.com/getcourses.php",
                        data: { 'building' : building, 'dow': w, 'hr': t },
                        type: 'POST',
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
                else {
                    $.ajax({
                        url: "https://classroom-finder.herokuapp.com/getrooms.php",
                        data: { 'building' : building, 'dow': w, 'hr': t},
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

    loadavailable(building);
    var f = document.getElementById("Floor");
    var floor = f.options[f.selectedIndex].value;
}

function findroom() {
    var e = document.getElementById("Building");
    var building = e.options[e.selectedIndex].value;
    var input = document.getElementById("searchtxt").value;
    loadfinder(input);
    var f = document.getElementById("Floor");
    var floor = f.options[f.selectedIndex].value;
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