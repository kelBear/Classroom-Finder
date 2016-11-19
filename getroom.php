<?php
#### THIS GETS THE POSITION(LATITUDE, LONGITUDE) OF A GIVE ROOM ####


include 'findDB.php';

$building = $_POST['building'];
$room = $_POST['room'];

$db = getDB();

function pg_connection_string_from_database_url($db) {
  extract(parse_url($_ENV[$db]));
  return "user=$user password=$pass host=$host dbname=" . substr($path, 1); # <- you may want to add sslmode=require there too
}
# Here we establish the connection. Yes, that's all.
$pg_conn = pg_connect(pg_connection_string_from_database_url($db));

if (!$pg_conn) {
	echo "Error: Cannot connect to server!";
	return;
}
# Now let's use the connection for something silly just to prove it works:
$result = pg_query($pg_conn, "SELECT DISTINCT building_rooms.building, building_rooms.room, building_rooms.lat, building_rooms.lng FROM building_rooms WHERE building='".$building."' AND room='" .$room."'");
if (!pg_num_rows($result)) {
  print("Warning: No results returned!\n");
}
$resultArray = pg_fetch_all($result);

echo json_encode($resultArray);
pg_close($pg_conn);
exit();
?>