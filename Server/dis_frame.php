<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";
    
// mysql 연결
$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");
mysql_select_db($dbname, $conn);

// POST로 넘어온 사용자 이름 저장
$name = $_POST['record_username'];

// 사용자 이름으로 저장된 여행길 가져오기
$sql = "select * from path1 where name like '".$name."'";
$result = mysql_query($sql, $conn);

$rows = array();
// Jason 형태를 위해 dictionary로 저장
if(mysql_num_rows($result) > 0)
{
    while($row = mysql_fetch_array($result, MYSQL_ASSOC))
    {
        $row_in['username'] = $row['name'];
        $row_in['frame'] = $row['frame'];
        array_push($rows,$row_in);
    }
}
// Jason 출력
echo json_encode($rows);

// 결과값 free 및 종료
mysql_free_result($result);
mysql_close($conn);

?>
</body>
</html>
