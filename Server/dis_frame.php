<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";

$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");

mysql_select_db($dbname, $conn);

$name = $_POST['record_username'];

$sql = "select * from path1 where name like '".$name."'";

$result = mysql_query($sql, $conn);

$rows = array();

if(mysql_num_rows($result) > 0)
{
    while($row = mysql_fetch_array($result, MYSQL_ASSOC))
    {
        $row_in['username'] = $row['name'];
        $row_in['frame'] = $row['frame'];
        array_push($rows,$row_in);
    }
}

echo json_encode($rows);

mysql_free_result($result);

mysql_close($conn);

?>
</body>
</html>
