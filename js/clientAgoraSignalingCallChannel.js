// This code creates the client-side commands for an Agora.io
// signaling channel based on https://demo-sig.agora.io/

var appid = '53c44b11c063453991dca8af5562940a';
var signal = Signal(appid);
var session;
var channel;
var my_uid;
var my_id;
		
var createSignalingChannel = function(key, handlers) {

    var id, status, doNothing = function(){},
    handlers = handlers || {},
    initHandler = function(h) {
        return ((typeof h === 'function') && h) || doNothing;
    },
    waitingHandler = initHandler(handlers.onWaiting),
    connectedHandler = initHandler(handlers.onConnected),
    messageHandler = initHandler(handlers.onMessage);


    // Set up connection with signaling server
    var connect = function(failureCB) {
  	var failureCB = (typeof failureCB === 'function') ||
                        function() {};
	var id = randomString(10);
	session = signal.login(id, '_no_need_token');
	session.onLoginSuccess = function(uid){
	    console.log('Login success ' + id + uid);
            my_uid = uid;
            my_id = id;

            console.log('Joining channel ' +  key);

	    channel = session.channelJoin(key);
	    channel.onChannelJoined = function(){
		console.log('channel.onChannelJoined');
		waitingHandler();
            };
            
            channel.onChannelJoinFailed = function(code, err){
                console.log('channel.onChannelJoinFailed', err);
                failureCB();
            };
            
            channel.onChannelLeaved = function(code){
    	        console.log('channel.onChannelLeaved');
            };

            channel.onChannelUserJoined = function(account, uid){
                console.log('channel.onChannelUserJoined ' +  account + ' ' + uid);
                connectedHandler();
            };

            channel.onChannelUserLeaved = function(account, uid){
                console.log('channel.onChannelUserLeaved ' + account + ' ' + uid);
            };

            channel.onChannelUserList = function(users){
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

            channel.onChannelAttrUpdated = function(type, k, v){
                console.log('channel.onChannelAttrUpdated ' +  type + ' ' +  k + ' ' + v);
            };

            channel.onMessageChannelReceive = function(account, uid, msg){
    	        console.log('channel.onMessageChannelReceive ' + account + ' ' + uid + ' : ' + msg);
    	        // Check if this message sent by other peer
                if (uid != my_uid) messageHandler(JSON.parse(msg));
            };
        };
    };

    // Send a message to the other browser on the signaling channel
    var send = function(msg, responseHandler) {
	console.log("Sending message!");
  	var reponseHandler = responseHandler || function() {};
  	channel.messageChannelSend(JSON.stringify(msg));
    };
		
    var send_msg = function(){
        msg = 'hello world';
        channel.messageChannelSend( msg );
	console.log("Sent message over channel!");
    };

    var randomString = function(length) {
        var string = "";
        var avail = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < length; i++) {
            string += avail.charAt(Math.floor(Math.random() * avail.length));
        }
        return string;
    };

    var close = function() {	
	console.log("Closing...");

	channel.channelLeave(function(){
            // left the channel
  	    console.log("Left channel");
	});
    };

    return {
        connect:  connect,
        send:  send,
        send_msg: send_msg,
        close: close
    };	
};
