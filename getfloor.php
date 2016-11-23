<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
#### THIS GETS THE CORRESPONDING FLOORS FOR A BUILDING ####


include 'findDB.php';

$db = getDB();

$building = $_POST['building'];

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

$result = pg_query($pg_conn, "SELECT DISTINCT SUBSTR(room, 1, 1) floor FROM building_rooms WHERE building = '" . $building . "' ORDER BY floor;");

$resultArray = pg_fetch_all($result);

echo json_encode($resultArray);
pg_close($pg_conn);
exit();
?>