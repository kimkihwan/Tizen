<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";
// mysql에 연결
$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");
mysql_select_db($dbname,$conn);
// 사용자이름과 Google API에 넘기는 URL 정보를 저장. URL을 App에서 넘겨받을 때 '&' 때문에 key:value로 인식하기에 일일이 저장해야 한다.
$name = $_POST['record_username'];
$frame = $_POST['record_frame'];
$frame1 = $_POST['location'];
$frame2 = $_POST['heading'];
$frame3 = $_POST['pitch'];
$frame4 = $_POST['key'];
// 넘어온 정보들을 하나의 URL로 저장.   
$frame = $frame."&location=".$frame1."&heading=".$frame2."&pitch=".$frame3."&key=".$frame4;
// 사용자가 녹화를 시작할 때 1을 보낸다.
$flag = $_POST['record_start'];

// 사용자가 녹화를 시작하기 전 이전에 녹화했던 기록을 모두 지운다. 사용자 이름 하나당 하나의 여행길만 저장 가능하다.
if($flag=="1")
{
    $sql1 = "delete from path1 where name like '".$name."'";
    if(mysql_query($sql1, $conn))
        echo "<h2>good</h2>";
    else
        echo "Error".mysql_error();
}

// 사용자 이름과 URL 정보를 DB에 저장
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
