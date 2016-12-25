<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";

$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");

mysql_select_db($dbname, $conn);

$name = $_POST['ping_username'];
$lat = $_POST['ping_lat'];
$lon = $_POST['ping_lon'];

$float_lat = floatval ($lat);
$float_lon = floatval ($lon);

$lat1 = $float_lat - 0.002;
$lat2 = $float_lat + 0.002;

$lon1 = $float_lon - 0.002;
$lon2 = $float_lon + 0.002;
/*
echo $lat1."<br>";
echo $lat2."<br>";
echo $lon1."<br>";
echo $lon2."<br>";
*/

$sql = "select * from image where (lat <= ".$lat2." AND lat >= ".$lat1.")"
."AND (lon >= ".$lon1." AND lon <= ".$lon2.")";

$result = mysql_query($sql, $conn);

//echo $result;

$rows = array();

if(mysql_num_rows($result) > 0)
{
    while($row = mysql_fetch_array($result, MYSQL_ASSOC))
    {
        $row_in['username'] = $row['name'];
        $row_in['lat'] = $row['lat'];
        $row_in['lon'] = $row['lon'];
        $row_in['image'] = $row['image'];
        array_push($rows,$row_in);
    }
}

echo json_encode($rows);

mysql_free_result($result);

mysql_close($conn);

?>
</body>
</html>
