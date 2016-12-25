<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";
//mysql 연결
$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");
mysql_select_db($dbname, $conn);

//POST로 넘어온 사용자 이름, 위도, 경도 저장
$name = $_POST['ping_username'];
$lat = $_POST['ping_lat'];
$lon = $_POST['ping_lon'];

//Text형태인 위도, 경도를 Float로 변환
$float_lat = floatval ($lat);
$float_lon = floatval ($lon);

//근거리 측정을 위해 범위 지정
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

// 근처의 이미지만 찾는다 
$sql = "select * from image where (lat <= ".$lat2." AND lat >= ".$lat1.")"
."AND (lon >= ".$lon1." AND lon <= ".$lon2.")";
$result = mysql_query($sql, $conn);

//echo $result;

// Jason을 위해 dictionary로 저장     
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
// Jason 형태로 출력
echo json_encode($rows);

// 결과값 free 및 종료
mysql_free_result($result);
mysql_close($conn);

?>
</body>
</html>
