function updateCourse() {
	var buildlist="";
	var e = document.getElementById("Building");
	var buildings = e.options[e.selectedIndex].value;
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var t= h*100+m;
	var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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

				buildlist=buildlist+" ";
				buildlist=buildlist+"<b>Class: </b>";
				buildlist=buildlist+output[i].subject;
				buildlist=buildlist+" ";
				buildlist=buildlist+output[i].catalog_number;
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