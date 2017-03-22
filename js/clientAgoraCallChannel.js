// This code creates the client-side commands for an Agora.io
// signaling channel based on https://demo-sig.agora.io/

var appid = '53c44b11c063453991dca8af5562940a';
var call_signal = Signal(appid);
var call_session;
var call_channel;
var my_calluid;
var my_callid;
		
var createCallChannel = function(key, handlers) {

	var id, status, doNothing = function(){},
  	handlers = handlers || {},
  	initHandler = function(h) {
    	return ((typeof h === 'function') && h) || doNothing;
  	},
  	waitingHandler = initHandler(handlers.onWaiting),
  	connectedHandler = initHandler(handlers.onConnected),
  	messageHandler = initHandler(handlers.onMessage);


// Set up connection with signaling server
	function connect(failureCB) {
  		var failureCB = (typeof failureCB === 'function') ||
                  function() {};

  		this.do_join(key);
	}

// Send a message to the other browser on the signaling channel
	var send = function(msg, responseHandler) {
		console.log("Sending message!");
  		var reponseHandler = responseHandler || function() {};
  		call_channel.messageChannelSend(JSON.stringify(msg));
	};

var do_join = function(name){

    var id = randomString(10);
    call_session = call_signal.login(id, '_no_need_token');
    call_session.onLoginSuccess = function(uid){
    	console.log('Login success ' + id + " " + uid);
    	my_calluid = uid;
    	my_callid = id;

    console.log('Joining channel ' +  name);

    call_channel = call_session.channelJoin(name);
    call_channel.onChannelJoined = function(){
         console.log('channel.onChannelJoined');
         waitingHandler();

    };
            
    call_channel.onChannelJoinFailed = function(code, err){
        console.log('channel.onChannelJoinFailed', err);
        failureCB();
    };
            
   call_channel.onChannelLeaved = function(code){
    	console.log('channel.onChannelLeaved');
    };

    call_channel.onChannelUserJoined = function(account, uid){
        console.log('channel.onChannelUserJoined ' +  account + ' ' + uid);
        connectedHandler();
    };

    call_channel.onChannelUserLeaved = function(account, uid){
        console.log('channel.onChannelUserLeaved ' + account + ' ' + uid);
    };

    call_channel.onChannelUserList = function(users){
        console.info(users);
        console.log('channel.onChannelUserList ' + users);
        // Check to see if other peer has joined the channel
        if (users.length > 1) { 
        // Signaling channel is connected
            connectedHandler(); 
        } else {
        	waitingHandler();
        }	
    };

    call_channel.onChannelAttrUpdated = function(type, k, v){
        console.log('channel.onChannelAttrUpdated ' +  type + ' ' +  k + ' ' + v);
     };

    call_channel.onMessageChannelReceive = function(account, uid, msg){
    	console.log('channel.onMessageChannelReceive ' + account + ' ' + uid +
    																 ' : ' + msg);
    	// Check if this message sent by other peer															 
        if (uid != my_calluid)
        	messageHandler(JSON.parse(msg));
        };
      }  
    };
		
var send_msg = function(){
    msg = 'hello world';
    call_channel.messageChannelSend( msg );
	console.log("Sent message over channel!");
}

var randomString = function(length) {
    var string = "";
    var avail = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        string += avail.charAt(Math.floor(Math.random() * avail.length));
    }
    return string;
}

function close() {	
	console.log("Closing...");

	call_channel.channelLeave(function(){

  // left the channel
  	console.log("Left channel");
	});
 		
}

return {
  connect:  connect,
  send:  send,
  do_join: do_join,
  send_msg: send_msg,
  close: close
};
		

};
