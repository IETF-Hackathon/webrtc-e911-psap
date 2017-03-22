
var signalingChannel, callChannel;

var pc, local_stream,
    doNothing = function() {},dc, data = {};

window.onload = function () {
    initialize();
	
	
	var map = $$('#J_btn_map'),
		location = $$('#a');
	/**/
	var geocoder = new google.maps.Geocoder();
	map.onclick = function(){
		//geocoder.geocode({ address: 'Moor Building 35274 State ST Fremont. U.S.A' }, function geoResults(results, status) {  
		geocoder.geocode({ address: location.value }, function geoResults(results, status) {  
			if (status == google.maps.GeocoderStatus.OK) {  
				console.log(results[0].geometry.location.lat());  
				console.log(results[0].geometry.location.lng());
				
				$$('.allmap').style.display = 'block';
				
				var latlng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
				var myOptions = {
					zoom: 15,
					center: latlng,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				var gmap = new google.maps.Map(document.getElementById("allmap"), myOptions);
				var marker = new google.maps.Marker({
					position: latlng,
					map: gmap
				});
			}  
		});
	}
	
	
	$$('.allmap .box-h-close').onclick = function(){
		$$('.allmap').style.display = 'none';
	}
	
	$$('#J_btn_video').onclick = function(){
		$$('.video-box').style.display = 'block';
	}
	$$('.video-box .box-h-close').onclick = function(){
		$$('.video-box').style.display = 'none';
	}
	
	oDIV = document.getElementById("videobox");
	oDIV.onmousedown = function(e) {
		$$('body').className = 'noselect';
		var diffX = e.clientX - oDIV.offsetLeft;
		var diffY = e.clientY - oDIV.offsetTop;
		
		document.onmousemove = function(e) {
			var e = e || window.event;
			oDIV.style.top = e.clientY - diffY + "px";
			oDIV.style.left = e.clientX - diffX + "px"
		};
		document.onmouseup = function() {
			document.onmousemove = null;
			document.onmouseup = null;
			$$('body').className = '';
		}
	};
	
};


function initialize() {
    $$("#login").value = get_query_param("login", "911");
    if (get_query_param("auto") == "true") {
        login();
    }
};

function $$(selector) {
    return document.querySelector(selector);
}

function get_query_param(name, def_value) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? (def_value || ""): decodeURIComponent(results[1].replace(/\+/g, " "));
}

function login() {
   // getMedia(function() {

           //createPC();
     //});
    signalingChannel = createSignalingChannel($$("#login").value, {
        onWaiting: function() {
            console.log('psap waiting');
        },
        onConnected: function() {
            console.log('psap connected');
        },
        onMessage: function(msg) {
            console.log('psap message ' + JSON.stringify(msg));
            if (msg.type == 'invite') {
                // TODO: add incoming call prompt. and continue when PSAP user answers the call.
				
                // 接收信息
				$$("#a").value = msg.o.a;
				$$("#b").value = msg.o.b;
				$$("#c").value = msg.o.c;
				$$("#d").value = msg.o.d;
				$$("#dd").value = msg.o.d;
				$$("#e").value = msg.o.e;
				$$("#f").value = msg.o.f;
				 // 接收信息 end
				
                if (!callChannel) {
                    signalingChannel.send({"type": "accept", "callid": msg.callid});
                    connect(msg.callid);
                } else {
                    signalingChannel.send({"type": "decline", "reason": "busy here"});
                }
            }
        }
    }, true);
    signalingChannel.connect(function(error) {
        console.error(error);
    });
}

function connect(callid) {
  console.log('connect function called');
    callChannel = createSignalingChannel(callid, {
        onWaiting: function() {
            console.log('waiting');
        },
        onConnected: function() {
            console.log('connected');
          
			
			$$(".layer").style.display = 'block';
			 getMedia(function() {

           createPC();
     });
			var jstype = document.getElementsByName('jstype');
			$$('#J_btn_answer').onclick = function(){
				$$(".layer").style.display = 'none';
				 
				var v = 'a';
				for( var i = 0, len = jstype.length; i < len; i++ ){
					if( jstype[i].checked ){
						v = jstype[i].value;
						break;
					}
				}
				if( v == 'a' ){
					callChannel.send(1);
					$$("#videobox").style.display = 'block';
					
				}else{
					callChannel.send(0);
				}
			}
			
        },
        onMessage: function(msg) {
            console.log(JSON.stringify(msg));
            
            if (msg.type == "offer") {
                pc.setRemoteDescription(new RTCSessionDescription(msg));
                pc.createAnswer(function(answer) {
                    pc.setLocalDescription(answer, function() {
                        callChannel.send(answer);
                    });
                }, function(error) {
                    console.log(error);
                });
            } else if (msg.type == "candidate") {
                pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
        }
    });
    
    callChannel.connect(function(error) {
        console.error(error);
    });
}

function getMedia(callback) {
  console.log('getMedia functioncalled');
    getUserMedia({"audio":true, "video":true}, function(stream) {
        local_stream = stream;
        attachMediaStream($$("div.local video"), stream);
        if (callback) {
            callback();
        }
    }, function(error) {
        console.error("cannot get media stream");
    });
}

function createPC() {
//    var config = {"url": "stun:stun.l.google.com:19302"}; // STUN-only
    // var config = {"url":"turn:user@turn.webrtcbook.com", "credential":"test"}); // TURN
    // var config = {"url":"turn:user@turn-only.webrtcbook.com", "credential":"test"}); // TURN-only
//    var config ={"urls":"turn:turn.webrtcbook.com","username":"user","credential":"test"};
	var config = [{"urls":"stun:stun.l.google.com:19302"},{"urls":"turn:turn.webrtcbook.com","username":"user","credential":"test"}];
/*	var config = [{ "urls": "stun:stun.l.google.com:19302" },
     { "urls": ["turns:turn.example.org", "turn:turn.example.net"],
       "username": "user",
       "credential": "myPassword",
       "credentialType": "password" }];
*/
    console.log('createPC function called');
    pc = new RTCPeerConnection({iceServers:config});
    pc.onicecandidate = function(event) {
        if (event.candidate) {
            callChannel.send({type: "candidate", candidate: event.candidate });
        }
    };
    pc.onaddstream = function(event) {
        attachMediaStream($$("div.remote video"), event.stream);
        console.log("call active");
    };
    pc.onremovestream = function(event) {
        console.log("removed stream");
    };
    
    pc.addStream(local_stream);
    pc.ondatachannel = onDataChannelAdded;

}
function onDataChannelAdded(e) {
  console.log("onDataChannelAdded");
  dc = e.channel;
  setupDataHandlers();
  console.log("setupDataHandlers when onDataChannelAdded");
  sendChat("hello");
}
function setupDataHandlers() {
  data.send = function(msg) {
    msg = JSON.stringify(msg);
    console.log("sending " + msg + " over data channel");
    dc.send(msg);
  }
  dc.onmessage = function(e) {
    var msg = JSON.parse(e.data),
        cb = document.getElementById("chatbox"),
        rtt = document.getElementById("rtt");
    
    if (msg.rtt) {
      // if real-time-text (per keypress) message, display in
      // real-time window
      console.log("received rtt of '" + msg.rtt + "'");
      rtt.value = msg.rtt;
      msg = msg.rtt;
    } else if (msg.chat) {
      // if full message, display in chat window,
      // reset real-time window,
      // and force chat window to last line
      console.log("received chat of '" + msg.chat + "'");
      cb.value += "<- " + msg.chat + "\n";
      rtt.value = "";
      cb.scrollTop = cb.scrollHeight;
      msg = msg.chat;
    } else {
      console.log("received " + msg + "on data channel");
    }
  };
}

// Send real-time text.  Basically for every keyup event we send
// the entire string so far as a real-time message so it can be
// displayed at each keyup.
function sendRtt() {
  //var msg = document.getElementById("chat").value;
  //data.send({'rtt':msg});
}

// Send normal chat message.  This happens when there is an enter
// keyup event, meaning that the remote user has finished typing
// a line.  This is also used to send our initial hello message.
function sendChat(msg) {
  var cb = document.getElementById("chatbox"),
      c = document.getElementById("chat");

  // display message locally, send it, and force chat window to
  // last line
  msg = msg || c.value;
  console.log("sendChat(" + msg + ")");
  cb.value += "-> " + msg + "\n";
  data.send({'chat':msg});
  c.value = '';
  cb.scrollTop = cb.scrollHeight;
}


function hangup() {
    if (callChannel) {
        callChannel.close();
        callChannel = null;
    }
    if (pc) {
        pc.close();
        pc = null;
    }
    if (local_stream) {
        local_stream.stop();
        local_stream = null;
    }
}