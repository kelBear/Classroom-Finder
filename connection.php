<?php
/*$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "myDB";*/
function pg_connection_string_from_database_url() {
  extract(parse_url($_ENV["DATABASE_URL"]));
  return "user=$user password=$pass host=$host dbname=" . substr($path, 1); # <- you may want to add sslmode=require there too
}
# Here we establish the connection. Yes, that's all.
$pg_conn = pg_connect(pg_connection_string_from_database_url());
if (!$pg_conn) {
	echo "Error: Cannot connect to server!";
	return;
}
# Now let's use the connection for something silly just to prove it works:
$result = pg_query($pg_conn, "SELECT * FROM building_rooms");
print "<pre>\n";
if (!pg_num_rows($result)) {
  print("Warning: No results returned!\n");
} else {
  print "Tables in your database:\n";
  while ($row = pg_fetch_row($result)) { print("- $row[0]\n"); }
}
print "\n";
pg_close($pg_conn);
?>