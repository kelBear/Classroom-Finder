<?php header('Access-Control-Allow-Origin: *');
/*$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "myDB";*/

$building = $_POST['building'];
$dayofweek = $_POST['dow'];
$hour = $_POST['hr'];

function pg_connection_string_from_database_url() {
  extract(parse_url($_ENV["SE464_URL"]));
  return "user=$user password=$pass host=$host dbname=" . substr($path, 1); # <- you may want to add sslmode=require there too
}
# Here we establish the connection. Yes, that's all.
$pg_conn = pg_connect(pg_connection_string_from_database_url());
if (!$pg_conn) {
	echo "Error: Cannot connect to server!";
	return;
}
# Now let's use the connection for something silly just to prove it works:
if ($building=="ALL"){
	$result = pg_query($pg_conn, "SELECT DISTINCT building_rooms.building, building_rooms.room, courses.subject, courses.catalog_number, courses.start_time, courses.end_time FROM building_rooms, courses WHERE building_rooms.building = courses.building AND building_rooms.room = courses.room AND " . $dayofweek . "='true' AND ". $hour. "> cast(CONCAT(SUBSTR(start_time, 1,2),SUBSTR(start_time, 4,5)) AS INT) AND ". $hour. "< cast(CONCAT(SUBSTR(end_time, 1,2),SUBSTR(end_time, 4,5)) AS INT) ORDER BY building_rooms.building, building_rooms.room, courses.subject, courses.catalog_number, courses.start_time, courses.end_time;");
} else{
	$result = pg_query($pg_conn, "SELECT DISTINCT building_rooms.building, building_rooms.room, courses.subject, courses.catalog_number, courses.start_time, courses.end_time FROM building_rooms, courses WHERE building_rooms.building = '" . $building . "' AND building_rooms.building = courses.building AND building_rooms.room = courses.room AND " . $dayofweek . "='true' AND ". $hour. "> cast(CONCAT(SUBSTR(start_time, 1,2),SUBSTR(start_time, 4,5)) AS INT) AND ". $hour. "< cast(CONCAT(SUBSTR(end_time, 1,2),SUBSTR(end_time, 4,5)) AS INT) ORDER BY building_rooms.building, building_rooms.room, courses.subject, courses.catalog_number, courses.start_time, courses.end_time;");
}
if (!pg_num_rows($result)) {
  print("Warning: No results returned!\n");
}
$resultArray = pg_fetch_all($result);

echo json_encode($resultArray);
pg_close($pg_conn);
exit();
?>