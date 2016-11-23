<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
#### THIS GETS THE POSITION(LATITUDE, LONGITUDE) OF A GIVE ROOM ####


include 'findDB.php';


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
$result = pg_query($pg_conn, "select distinct b.building, b.room from building_rooms b left join courses c on b.building = c.building and b.room = c. room where c.subject is null");
$resultArray = pg_fetch_all($result);

echo json_encode($resultArray);
pg_close($pg_conn);
exit();
?>