(function() {
	var google_apiKey = "AIzaSyDf_XSGcqn_P6ySl9dYCuHYJycbJTdQ0tM";				// 구글 지도 API KEY (비공개)
	var imgRefUrl = "http://cspro.sogang.ac.kr/~cse20101611/upload/";			// 서버의 이미지 저장 경로 (비공개)			
	var gps, vLat, vLon, pLat, pLon, xPos, yPos, heading, pheading, timer, ptimer;
	var queryCnt, recCnt, isRecording, recFrame, isPlaying;
	var overlayImg;
	
	// 디버그 전용 설정 변수
	var debugMode = true;
	var useGPS = true;
	var lockMove = true; 
	var lockTurn = true;
	var speed = 3;
	//
	
	// 타이젠 하드웨어 키 종료 이벤트 함수
    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try { tizen.application.getCurrentApplication().exit(); } catch (ignore) {}
        }
    }
    
    // GPS 위치정보 반환 callback 함수
    function getGPSPosition(position) { gps = position; }
    
    // 기울기센서 조작 이벤트 함수
    function tiltHandler(dataEvent) {
    	var MAX_G = 10;
        var noGravitation, xDiff, yDiff;
        var moved, turned;
        moved = turned = false;

        noGravitation = dataEvent.acceleration;
        dataEvent = dataEvent.accelerationIncludingGravity;
        xDiff = dataEvent.x - noGravitation.x;
        if (Math.abs(xDiff) > MAX_G) { xDiff = xDiff / Math.abs(xDiff) * MAX_G; }
        yDiff = -1 * (dataEvent.y - noGravitation.y);
        if (Math.abs(yDiff) > MAX_G) { yDiff = yDiff / Math.abs(yDiff) * MAX_G; }
        xPos = (xDiff / MAX_G);
        yPos = (yDiff / MAX_G);
        
        if(xPos > 0.3 && lockTurn === false) {		// 왼쪽으로 기울기 => 시점 좌회전
        	if(heading>0) {heading -= 1;}
        	else {heading = 359;}
        	document.getElementById("btn_turn").src = "img/btn_turn_ing2.png";
        }			
        else if(xPos < -0.3 && lockTurn === false) {	// 오른쪽으로 기울기 => 시점 우회전
        	if(heading<360) {heading += 1;}
        	else {heading = 1;}
        	document.getElementById("btn_turn").src = "img/btn_turn_ing2.png";
        }
        else { displayTurn(); }
        
        var deg, rad;
        if (heading>180) {deg = heading-360;}
        else {deg = heading;}
        rad = deg * Math.PI / 180;
        if(yPos > -0.50 && lockMove === false) {		// 아래쪽으로 기울기 => 전진 이동
        	vLat += Math.cos(rad)/1000000*speed;
        	vLon += Math.sin(rad)/1000000*speed;
        	document.getElementById("btn_move").src = "img/btn_move_ing2.png";
        }
        else if(yPos < -0.90 && lockMove === false){ 	// 위쪽으로 기울기 => 후진 이동
        	vLat -= Math.cos(rad)/1000000*speed;
        	vLon -= Math.sin(rad)/1000000*speed;
        	document.getElementById("btn_move").src = "img/btn_move_ing2.png";
        }
        else { displayMove(); }
        
        if (Math.abs(pLat-vLat) >= 0.0001) {			// 위도,경도의 누적 변화가 0.0001도 이상일 경우 반영
        	pLat = vLat;
        	moved = true;
        }
        if (Math.abs(pLon-vLon) >= 0.0001) {
        	pLon = vLon;
        	moved = true;
        } 
        if(Math.abs(pheading-heading) >= 10) {			// 시점 회전의 누적 변화가 10도 이상일 경우 반영
        	pheading = heading;
        	turned = true;
        }
                
        if(isPlaying) {									// 기록된 여행 경로 재생중일 경우의 처리
        	timer++;
        	if(timer === ptimer) {
        		document.getElementById("sviewImg").src=recFrame[recCnt].frame;
        		recCnt++;
        		timer = 0;
        		if(recCnt === recFrame.length) { isPlaying = false; }
        	}
        }
        
        if (moved || turned) {							// 반영된 위도, 경도, 방위의 구글 스트리트뷰 이미지를 로드
        	var params;
        	var imgsrc = "https://maps.googleapis.com/maps/api/streetview?size=300x400";
        	imgsrc += "&location=" + vLat + ", " + vLon;
        	imgsrc += "&heading=" + heading;
        	imgsrc += "&pitch=" + 0;
        	imgsrc += "&key=" + google_apiKey;
        	
        	document.getElementById("sviewImg").src = imgsrc;
        	document.getElementById("input_lat").value = vLat.toFixed(5);
        	document.getElementById("input_lon").value = vLon.toFixed(5);

        	// 위치 변동시, 해당 위치에서 가까운 거리에 업로드된 이미지가 있는지 서버에 쿼리
        	if(moved) {
        		params="ping_username="+document.getElementById("input_name").value;
        		params+="&ping_lat="+vLat.toFixed(5)+"&ping_lon="+vLon.toFixed(5);
        	
        		jQuery.ajax({
        	      type:"POST",
        	      url:"http://cspro.sogang.ac.kr/~cse20101611/display.php",
        	      data: params,
        	      success : function(data) {
        	    	  var start, end, raw, list;
        	    	  start = data.indexOf("[");
        	    	  end = data.indexOf("]");
        	    	  raw = data.substring(start,end+1);
        	    	  list = jQuery.parseJSON(raw);
        	    	  for(var i=0; i<list.length && i<3; i++) {
        	    		  overlayImg[i].user = list[i].username;
        	    		  overlayImg[i].url = imgRefUrl+list[i].image;
        	    		  overlayImg[i].lat = list[i].lat;
        	    		  overlayImg[i].lon = list[i].lon;
        	    		  document.getElementById("overlayImg"+i).src=overlayImg[i].url;
        	    		  overlayImg[i].isNear = true;
        	    	  }
        	      },
        	      error : function() { }
        		});
        	}
        	
        	// 여행 경로 기록중일시, 사용자 이름과 현재 위치를 서버에 쿼리
        	if(isRecording) {
        		params="record_username="+document.getElementById("input_name").value;
        		params+="&record_frame="+imgsrc+"&record_start=";
        		
        		if(recCnt === 0) { params+="1"; }
        		else { params+="0"; }
        		
        		jQuery.ajax({
          	      type:"POST",
          	      url:"http://cspro.sogang.ac.kr/~cse20101611/path.php",
          	      data: params,
          	      success : function() {},
          	      error : function() {}
          		});
        		
        		recCnt++;
        		if(recCnt === 50) { setRec(); }
        	}
        	
        	// 가까운 거리에 업로드된 이미지가 있을 경우 이미지를 오버레이 표시
        	for(var i=0; i<3; i++) { if(overlayImg[i].isNear) { setOverlayImg(i); }}
        	queryCnt++;
        }
        
        if(debugMode) { viewDebugText(); }
    }
    
    // 디버깅을 위한 정보 표시
    function viewDebugText() {
    	var debugtext = "위도:" + vLat.toFixed(5) + "경도: " + vLon.toFixed(5);
    	debugtext += " 방위:" + heading;
    	debugtext += " X:" + xPos.toFixed(2) + " Y:" + yPos.toFixed(2);
    	debugtext += " 쿼리:" + queryCnt; 
    	
    	document.getElementById("debugText").innerHTML = debugtext;
    }
    
    // 이동 및 회전 고정 변경과 현재 상태 표시 함수
    function displayMove() {
    	if(lockMove) { document.getElementById("btn_move").src = "img/btn_move_lock2.png"; }
    	else { document.getElementById("btn_move").src = "img/btn_move_able2.png"; }
    }
    
    function displayTurn() {
    	if(lockTurn) { document.getElementById("btn_turn").src = "img/btn_turn_lock2.png"; }
    	else { document.getElementById("btn_turn").src = "img/btn_turn_able2.png"; }
    }
    
    function setMove() {
    	if(lockMove) {
    		lockMove = false;
    		document.getElementById("btn_move").src = "img/btn_move_able2.png";
    	}
    	else {
    		lockMove = true;
    		document.getElementById("btn_move").src = "img/btn_move_lock2.png";
    	}
    }
    
    function setTurn() {
    	if(lockTurn) {
    		lockTurn = false;
    		document.getElementById("btn_turn").src = "img/btn_turn_able2.png";
    	}
    	else {
    		lockTurn = true;
    		document.getElementById("btn_turn").src = "img/btn_turn_lock2.png";
    	}
    }
    
    // 여행 기록 시작 및 종료 함수
    function setRec() {
    	if(isRecording) {
    		isRecording = false;
    		document.getElementById("btn_rec").src = "img/btn_rec_start2.png";
    	}
    	else {
    		recCnt = 0;
    		isRecording = true;
    		document.getElementById("btn_rec").src = "img/btn_rec_stop2.png";
    	}
    }
    
    // 업로드된 이미지 오버레이 함수
    function setOverlayImg(i) {
		var dLat, dLon, dist, rad, deg, deg2, img, id;
		
		dLat = (overlayImg[i].lat - pLat) * 100000;
		dLon = (overlayImg[i].lon - pLon) * 100000;
		dist = Math.sqrt(Math.pow(dLat,2) + Math.pow(dLon,2));
		id = "overlayImg"+i;
		img = document.getElementById(id).style;
		
		if(dist > 200) { 						// 현재 위치와 업로드된 이미지의 거리가 약 200미터 이상일 경우 표시를 초기화
			overlayImg[i].isNear = false;
			overlayImg[i].url = "";
			img.opacity = 0;
		}
		else {
			rad = Math.asin(dLon/dist);
			deg = rad * 180 / Math.PI;
			if(dLat < 0) { deg = 180-deg; }
			else if(dLon < 0) { deg += 360; }
			if(heading < 180) {
				if(deg > heading+180 && deg < 360) { deg2 = -heading-(360-deg); }
				else { deg2 = deg-heading; }
			}
			else {
				if(deg >= 0 && deg < heading-180) { deg2 = deg+(360-heading); }
				else { deg2 = deg-heading; }
			}
			
			img.opacity = 1;
			if(deg2 < 0 && deg2 > -40) { img.margin = "100px 0px 0px "+(120+deg2*2.4)+"px"; }
			else if(deg2 > 0 && deg2 < 40) { img.margin = "100px 0px 0px "+(120+deg2*2.4)+"px"; }
			else if(deg2 === 0) { img.margin = "100px 0px 0px 120px"; }
			else { img.opacity = 0; }
		}
	}
    
    // 과거에 기록한 여행 경로를 서버에 쿼리
    function playRec() {
    	var params="record_username="+document.getElementById("input_name").value;
    	if(lockMove===false) { setMove(); }  
      	if(lockTurn===false) { setTurn(); }
      	document.getElementById("overlayImg0").style.opacity = 0;
      	document.getElementById("overlayImg1").style.opacity = 0;
      	document.getElementById("overlayImg2").style.opacity = 0;
    	jQuery.ajax({
    	      type:"POST",
    	      url:"http://cspro.sogang.ac.kr/~cse20101611/dis_frame.php",
    	      data: params,
    	      success : function(data) {
    	    	  var start, end, raw;
    	    	  start = data.indexOf("[");
    	    	  end = data.indexOf("]");
    	    	  raw = data.substring(start,end+1);
    	    	  recFrame = jQuery.parseJSON(raw);
    	      	recCnt = timer = 0;
    	      	ptimer = 25;
    	    	  isPlaying = true;
    	      },
    	      error : function() {}
    		});
    }
    
    // 초기 설정 및 시작 함수
    function init() {	
        document.addEventListener("tizenhwkey", keyEventHandler);
        
        pLat = pLon = 0;
        vLat = 37.5497;
        vLon = 126.9415;
        if(useGPS) {
        	navigator.geolocation.getCurrentPosition(getGPSPosition);
        	vLat = gps.coords.latitude;
        	vLon = gps.coords.longitude;
        }
        
        xPos = yPos = heading = queryCnt = recCnt = 0;
        pheading = 360;
        isRecording = isPlaying = false;
        
        if(lockMove) { document.getElementById("btn_move").src = "img/btn_move_lock2.png"; }
        if(lockTurn) { document.getElementById("btn_turn").src = "img/btn_turn_lock2.png"; }
        document.getElementById('btn_move').addEventListener('click', setMove);
        document.getElementById('btn_turn').addEventListener('click', setTurn);
        document.getElementById('btn_rec').addEventListener('click', setRec);
        document.getElementById('btn_play').addEventListener('click', playRec);
        
        // 오버레이 이미지 객체 초기화
        overlayImg = new Array(3);
    	for(var i=0; i<3; i++) {
    		overlayImg[i] = new Object();
    		overlayImg[i].isNear = false;
    		overlayImg[i].url = "";
    		overlayImg[i].user = "";
    		overlayImg[i].lat = 0;
    		overlayImg[i].lon = 0;
    	}

        window.addEventListener("devicemotion", tiltHandler);
    }
    window.onload = init();
}());