function updateCourse() {
	var buildlist="";
	var e = document.getElementById("Building");
	var buildings = e.options[e.selectedIndex].value;
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
			  url: "getrooms.php",
			  data: { 'building' : buildings, 'dow': w, 'hr': t},
			  type: 'POST',
			  dataType: 'json',
			  success: function(output) {
			    		for( i=0;i<output.length; i++ ) {
					        buildlist=buildlist+"<div class=\"card\" id=\"" + output[i].building +" "+ output[i].room + "\" style=\"background-color:#daf4d7;\">";
					        buildlist=buildlist+"<b>Room: </b>";
					        buildlist=buildlist+output[i].building + " ";
					        buildlist=buildlist+output[i].room;

					        buildlist=buildlist+"<br>";
					        if (output[i].nextclass == "00:00") {
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
					          if (hours != 0) buildlist = buildlist + "This room is free for " + hours + " hours and " + minutes + " minutes";
					          else buildlist = buildlist + "This room is free for " + minutes + " minutes";
					        }
					        buildlist=buildlist+"</div>";
					      }
					      document.getElementById("sidecontent").innerHTML = buildlist;
					      for( i=0;i<output.length; i++ ) {
					        document.getElementById(output[i].building +" "+ output[i].room).onclick = function() {loadfinder(this.id);};
					      }
			  },
			  error: function(xhr, desc, err) {
			        console.log(xhr);
			        console.log("Details: " + desc + "\nError:" + err);
			        alert("We weren't able to find available rooms! :(");
			      }
			  });
	}
	else {
		$.ajax({
			url: "getcourses.php",
			data: { 'building' : buildings, 'dow': w, 'hr': t },
			type: 'POST',
			dataType: 'json',
			success: function(output) {
				classlist = output;
				for( i=0;i<output.length; i++ ) {
					buildlist=buildlist+"<div class=\"card\" id=\"" + output[i].building +" "+ output[i].room + "\" style=\"background-color:#f4d9d7;\">";
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
					buildlist=buildlist+"</div>";
				}
				document.getElementById("sidecontent").innerHTML = buildlist;
				for( i=0;i<output.length; i++ ) {
					document.getElementById(output[i].building +" "+ output[i].room).onclick = function() {loadfinder(this.id);};
				}
			},
			error: function(xhr, desc, err) {
			    console.log(xhr);
			    console.log("Details: " + desc + "\nError:" + err);
			    alert("There are no classes right now!");
			  }
		});
	}
}
//updateCourse();