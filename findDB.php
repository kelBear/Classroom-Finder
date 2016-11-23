<?php

#### THIS DETERMINES WHETHER BACKUP DB SHOULD BE USED ####

function pg_connection_string_from_database_url2($dbName) {
	  extract(parse_url($_ENV[$dbName]));
	  return "user=$user password=$pass host=$host dbname=" . substr($path, 1); # <- you may want to add sslmode=require there too
	}

function getDB() {
	$db = "SE464_URL";
	$dbbkup = "SE464_BKUP_URL";

	$countSQL =  "select count(*) from courses;";


	# Here we establish the connection. Yes, that's all.
	$pg_conn = pg_connect(pg_connection_string_from_database_url2($db));
	if (!$pg_conn) {
		echo "Error: Cannot connect to server!";
		$countDB = 0;
	}
	$countDBResult = pg_query($pg_conn, $countSQL);
	$countDB = pg_fetch_result($countDBResult, 1, 0);
	pg_close($pg_conn);

	$pg_conn2 = pg_connect(pg_connection_string_from_database_url2($dbbkup));
	if (!$pg_conn2) {
		echo "Error: Cannot connect to server!";
		$countDBbkup = 0;
	}
	$countDBResultbkup = pg_query($pg_conn2, $countSQL);
	$countDBbkup = pg_fetch_result($countDBResultbkup, 1, 0);
	pg_close($pg_conn2);

	if ( $countDB >= $countDBbkup ) {
		return $db;
	}
	else {
		return $dbbkup;
	}

}

?>

