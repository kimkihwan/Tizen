<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";

$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");

mysql_select_db($dbname,$conn);

$file_name = $_FILES['upload_image']['name'];
$tmp_file = $_FILES['upload_image']['tmp_name'];
$name = $_POST['upload_username'];
$lat = $_POST['upload_lat'];
$lon = $_POST['upload_lon'];

$file_path = './upload/'.$name.$file_name;
$db_file = $name.$file_name;

$r = move_uploaded_file($tmp_file, $file_path);
/*
if($r) {
      echo " upload success";
}
else {
      echo " upload failed";
}
*/

$sql = "INSERT INTO image"
."(name,lat,lon,image) VALUES ('"
.$name."','".$lat."','".$lon."','".$db_file."')";

if(mysql_query($sql, $conn))
    echo "<h2>success</h2>";
else
    echo "Error".mysql_error();

mysql_close($conn);

?>
</body></html>
