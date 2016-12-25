(function() {
	var google_apiKey = "AIzaSyDf_XSGcqn_P6ySl9dYCuHYJycbJTdQ0tM";
	var imgRefUrl = "http://cspro.sogang.ac.kr/~cse20101611/upload/";
	var gps, vLat, vLon, pLat, pLon, xPos, yPos, heading, pheading, timer, ptimer;
	var queryCnt, recCnt, isRecording, recFrame, recFrameLength, isPlaying;
	var overlayImg;
	
	var debugMode = true;
	var useGPS = false;
	var lockMove = true; 
	var lockTurn = true;
	var speed = 3;

    function keyEventHandler(event) {
        if (event.keyName === "back") {
            try { tizen.application.getCurrentApplication().exit(); } catch (ignore) {}
        }
    }
    
    function getGPSPosition(position) { gps = position; }
    
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
        
        if(xPos > 0.3 && lockTurn === false) {		// 왼쪽
        	if(heading>0) {heading -= 1;}
        	else {heading = 359;}
        	document.getElementById("btn_turn").src = "img/btn_turn_ing2.png";
        }			
        else if(xPos < -0.3 && lockTurn === false) {	// 오른쪽
        	if(heading<360) {heading += 1;}
        	else {heading = 1;}
        	document.getElementById("btn_turn").src = "img/btn_turn_ing2.png";
        }
        else { displayTurn(); }
        
        var deg, rad;
        if (heading>180) {deg = heading-360;}
        else {deg = heading;}
        rad = deg * Math.PI / 180;
        if(yPos > -0.50 && lockMove === false) {		// 아래쪽, 전진
        	vLat += Math.cos(rad)/1000000*speed;
        	vLon += Math.sin(rad)/1000000*speed;
        	document.getElementById("btn_move").src = "img/btn_move_ing2.png";
        }
        else if(yPos < -0.90 && lockMove === false){ 	// 위쪽, 후진
        	vLat -= Math.cos(rad)/1000000*speed;
        	vLon -= Math.sin(rad)/1000000*speed;
        	document.getElementById("btn_move").src = "img/btn_move_ing2.png";
        }
        else { displayMove(); }
        
        if (Math.abs(pLat-vLat) >= 0.0001) {
        	pLat = vLat;
        	moved = true;
        }
        if (Math.abs(pLon-vLon) >= 0.0001) {
        	pLon = vLon;
        	moved = true;
        } 
        if(Math.abs(pheading-heading) >= 10) {
        	pheading = heading;
        	turned = true;
        }
                
        if(isPlaying) {
        	timer++;
        	//document.getElementById("debugText").innerHTML = recFrame[recCnt].frame;
        	//document.getElementById("debugText").innerHTML = timer;
        	if(timer === ptimer) {
        		document.getElementById("sviewImg").src=recFrame[recCnt].frame;
        		recCnt++;
        		timer = 0;
        		if(recCnt === recFrame.length) { isPlaying = false; }
        	}
        }
        
        if (moved || turned) {
        	var params;
        	var imgsrc = "https://maps.googleapis.com/maps/api/streetview?size=300x400";
        	imgsrc += "&location=" + vLat + ", " + vLon;
        	imgsrc += "&heading=" + heading;
        	imgsrc += "&pitch=" + 0;
        	imgsrc += "&key=" + google_apiKey;
        	
        	document.getElementById("sviewImg").src = imgsrc;
        	document.getElementById("input_lat").value = vLat.toFixed(5);
        	document.getElementById("input_lon").value = vLon.toFixed(5);

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
        	
        	for(var i=0; i<3; i++) { if(overlayImg[i].isNear) { setOverlayImg(i); }}
        	queryCnt++;
        }
        
        if(debugMode) { viewDebugText(); }
    }
    
    function viewDebugText() {
    	var debugtext = "위도:" + vLat.toFixed(5) + "경도: " + vLon.toFixed(5);
    	debugtext += " 방위:" + heading;
    	debugtext += " X:" + xPos.toFixed(2) + " Y:" + yPos.toFixed(2);
    	debugtext += " 쿼리:" + queryCnt; 
    	
    	document.getElementById("debugText").innerHTML = debugtext;
    }
    
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
    
    function setOverlayImg(i) {
		var dLat, dLon, dist, rad, deg, deg2, img, id;
		
		dLat = (overlayImg[i].lat - pLat) * 100000;
		dLon = (overlayImg[i].lon - pLon) * 100000;
		dist = Math.sqrt(Math.pow(dLat,2) + Math.pow(dLon,2));
		id = "overlayImg"+i;
		img = document.getElementById(id).style;
		
		if(dist > 200) { 
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
    	      //async: false,
    	      success : function(data) {
    	    	  var start, end, raw, list;
    	    	  start = data.indexOf("[");
    	    	  end = data.indexOf("]");
    	    	  raw = data.substring(start,end+1);
    	    	  recFrame = jQuery.parseJSON(raw);
    	    	  //recFrameLength = list.length;
    	    	  //document.getElementById("debugText").innerHTML = recFrame[0].frame;
    	    	  //for(var i=0; i<list.length; i++) { recFrame[i] = list[i].frame; }
    	      	recCnt = timer = 0;
    	      	ptimer = 25;
    	    	  isPlaying = true;
    	      },
    	      error : function() {}
    		});
    }
    
    function sleep(num) {
    	var now = new Date();
		var stop = now.getTime() + num;
		while(true){
			now = new Date();
			if(now.getTime() > stop) { return; }
		}
    }
    
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