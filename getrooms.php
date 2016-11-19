<?php
#### THIS GETS ALL CLASSROOMS THAT ARE CURRENTLY AVAILABLE ####


include 'findDB.php';

$building = $_POST['building'];
$dayofweek = $_POST['dow'];
$hour = $_POST['hr'];

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
if ($building=="ALL"){
	$result = pg_query($pg_conn, "WITH temp AS (
		SELECT DISTINCT building_rooms.building, building_rooms.room, building_rooms.lat, building_rooms.lng FROM building_rooms, courses 
		WHERE building_rooms.building = courses.building AND building_rooms.room = courses.room 
		EXCEPT 
		SELECT DISTINCT building_rooms.building, building_rooms.room, building_rooms.lat, building_rooms.lng 
		FROM building_rooms, courses WHERE building_rooms.building = courses.building AND building_rooms.room = courses.room 
		AND " .$dayofweek . "='true' AND " . $hour . " > cast(CONCAT(SUBSTR(start_time, 1,2), SUBSTR(start_time, 4,5)) AS INT) 
		AND " . $hour . " < cast(CONCAT(SUBSTR(end_time, 1,2),SUBSTR(end_time, 4,5)) AS INT)
	)

	SELECT temp.building, temp.room, temp.lat, temp.lng, COALESCE(A.nextclass, '00:00') nextclass FROM temp
	LEFT JOIN
	(SELECT building, room, MIN(start_time) nextclass FROM courses WHERE CAST(CONCAT(SUBSTR(start_time, 1, 2), SUBSTR(start_time, 4, 5)) AS int) > " . $hour . " AND " . $dayofweek . " = 'true'
	GROUP BY building, room) A
	ON temp.building = A.building AND temp.room = A.room 
	ORDER BY nextclass;");
} else{
	$result = pg_query($pg_conn, "WITH temp AS (
		SELECT DISTINCT building_rooms.building, building_rooms.room, building_rooms.lat, building_rooms.lng FROM building_rooms, courses 
		WHERE building_rooms.building = courses.building AND building_rooms.room = courses.room AND building_rooms.building = '" . $building . "' 
		EXCEPT 
		SELECT DISTINCT building_rooms.building, building_rooms.room, building_rooms.lat, building_rooms.lng 
		FROM building_rooms, courses WHERE building_rooms.building = courses.building AND building_rooms.room = courses.room AND building_rooms.building = '" . $building . "' 
		AND " .$dayofweek . "='true' AND " . $hour . " > cast(CONCAT(SUBSTR(start_time, 1,2), SUBSTR(start_time, 4,5)) AS INT) 
		AND " . $hour . " < cast(CONCAT(SUBSTR(end_time, 1,2),SUBSTR(end_time, 4,5)) AS INT)
	)

	SELECT temp.building, temp.room, temp.lat, temp.lng, COALESCE(A.nextclass, '00:00') nextclass FROM temp
	LEFT JOIN
	(SELECT building, room, MIN(start_time) nextclass FROM courses WHERE CAST(CONCAT(SUBSTR(start_time, 1, 2), SUBSTR(start_time, 4, 5)) AS int) > " . $hour . " AND " . $dayofweek . " = 'true'
	GROUP BY building, room) A
	ON temp.building = A.building AND temp.room = A.room ORDER BY nextclass;");
}
if (!pg_num_rows($result)) {
  print("Warning: No results returned!\n");
}
$resultArray = pg_fetch_all($result);

echo json_encode($resultArray);
pg_close($pg_conn);
exit();
?>