<html><body>
<?php

$hostname = "localhost";
$username = "cs20101611";
$password = "dbpass";
$dbname = "db20101611";

// mysql 연결      
$conn = mysql_connect($hostname, $username, $password) or die("DB Connection Failed");
mysql_select_db($dbname,$conn);

// App에서 넘어온 이미지, 사용자이름, 위치 저장
$file_name = $_FILES['upload_image']['name'];
$tmp_file = $_FILES['upload_image']['tmp_name'];
$name = $_POST['upload_username'];
$lat = $_POST['upload_lat'];
$lon = $_POST['upload_lon'];

// 이미지를 저장할 경로 저장(현재 경로에서 upload 폴더에 사용자이름+파일이름으로 저장
$file_path = './upload/'.$name.$file_name;
// DB에 집어넣을 파일 이름 저장
$db_file = $name.$file_name;
// 서버에 이미지 저장
$r = move_uploaded_file($tmp_file, $file_path);
/*
if($r) {
      echo " upload success";
}
else {
      echo " upload failed";
}
*/

// DB에 사용자이름, 위치, 이미지 경로를 저장
$sql = "INSERT INTO image"
."(name,lat,lon,image) VALUES ('"
.$name."','".$lat."','".$lon."','".$db_file."')";

if(mysql_query($sql, $conn))
    echo "<h2>success</h2>";
else
    echo "Error".mysql_error();
//mysql 종료
mysql_close($conn);

?>
</body></html>
