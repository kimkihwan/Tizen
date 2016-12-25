<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";

$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");

mysql_select_db($dbname,$conn);

$name = $_POST['record_username'];
$frame = $_POST['record_frame'];
$frame1 = $_POST['location'];
$frame2 = $_POST['heading'];
$frame3 = $_POST['pitch'];
$frame4 = $_POST['key'];

$frame = $frame."&location=".$frame1."&heading=".$frame2."&pitch=".$frame3."&key=".$frame4;
$flag = $_POST['record_start'];


if($flag=="1")
{
    $sql1 = "delete from path1 where name like '".$name."'";
    if(mysql_query($sql1, $conn))
        echo "<h2>good</h2>";
    else
        echo "Error".mysql_error();
}


$sql = "INSERT INTO path1"
."(name,frame) VALUES ('"
.$name."','".$frame."')";

if(mysql_query($sql, $conn))
    echo "<h2>success</h2>";
else
    echo "Error".mysql_error();

mysql_close($conn);

?>
</body></html>
