function updateCourse() {
	var buildlist="";
	var e = document.getElementById("Building");
	var buildings = e.options[e.selectedIndex].value;
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var t= h*100+m;
 	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var w =days[d.getDay()];
	$.ajax({
		url: "getcourses.php",
		data: { 'building' : buildings, 'dow': w, 'hr': t },
		type: 'POST',
		dataType: 'json',
		success: function(output) {
			for( i=0;i<output.length; i++ ) {
				buildlist=buildlist+"<b>Room: </b>";
				buildlist=buildlist+output[i].building;
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
				buildlist=buildlist+"<br>";

			}
			document.getElementById("sidebar").innerHTML = buildlist;
		},
		error: function(xhr, desc, err) {
		    console.log(xhr);
		    console.log("Details: " + desc + "\nError:" + err);
		  }
	});
}
//updateCourse();