
/* Wait for the page to load */
$(function() {
    console.log("[DEMO] :: Rainbow Application started!");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "",
        applicationSecret = "";

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");


    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log('login now ...');
        console.log("[DEMO] :: On SDK Ready !");


        /////////////// Paste Guest account here//////
        //////////////////////////////////////////////
        var myRainbowLogin = "";       // Replace by your login
        var myRainbowPassword = ""; // Replace by your password
        /////////////////////////////////////////////


        // The SDK for Web is ready to be used, so you can sign in
        rainbowSDK.connection.signin(myRainbowLogin, myRainbowPassword)
        .then(function(account) {
            console.log(myRainbowLogin+" login in successfully!");
        })
        .catch(function(err) {
            console.log(myRainbowLogin + " login failed. " + err);
        });


        if(rainbowSDK.webRTC.canMakeAudioVideoCall()) {
            console.log(' Web allows AudioVideocall')
        }

        if(rainbowSDK.webRTC.hasACamera()) {
            /* A webcam is available, you can make video call */
            console.log('camera is available');
        }

        /* Call this method to know if a microphone is detected */
        if(rainbowSDK.webRTC.hasAMicrophone()) {
            console.log('mic is available');
        }



    };


    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function() {
                console.log("[DEMO] :: Rainbow SDK is initialized!");
            })
            .catch(function(err) {
                console.log("[DEMO] :: Something went wrong with the SDK...", err);
            });
    };

    var conversation_global;

    // Im handler
    let onNewMessageReceived = function(event) {

        // as noted in the documentation, RAINBOW_ONNEWIMMESSAGERECEIVED carries three parameters: Message, Conversation and CC. Let's retrieve them:
    
        let message = event.detail.message;
        let conversation = event.detail.conversation;   // refer to api "conversation"-web-sdk

        conversation_global = conversation;

        let conversation_id = conversation.id;
        let contact = conversation.contact;

        console.log('conversation id is :' + conversation_id);
        console.log('contact id is : '+contact.id)
        console.log('msg id is : ' + message.id);
        console.log('msg is from : '+ message.from.id);

        appendMessage(`Agent: ${message.data} \n\n`);
        console.log('New message >>>>>>>>>>>>>>>>>>: '+ message.data);

    }
    
    // add event listener
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)

    
    const messageContainer = document.getElementById('message-container')
    const messageForm = document.getElementById('send-container')
    const messageInput = document.getElementById('message-input')
    messageForm.addEventListener('submit', e=>{
        e.preventDefault()
        const message = messageInput.value
        rainbowSDK.im.sendMessageToConversation(conversation_global, message);
        appendMessage(`You: ${message} \n\n`)
        messageInput.value=''
    })
    function appendMessage(message){
        const messageElement = document.createElement('div')
        messageElement.innerText = message
        messageContainer.append(messageElement)
    } 


    var onWebRTCCallChanged = function onWebRTCCallChanged(event) {
        /* Listen to WebRTC call state change */
        let call = event.detail;
    
        if (call.status.value === "incommingCall") {
            console.log('new incoming call');
    
            if (call.remoteMedia === 3) {
                console.log('it is video call');
                // The incoming call is of type audio + video
                rainbowSDK.webRTC.answerInVideo(call);
                console.log('call answered');
    
                rainbowSDK.webRTC.showLocalVideo();
                rainbowSDK.webRTC.showRemoteVideo(call);
    
            } else if (call.remoteMedia === 1) {
                console.log('it is audio call');
                rainbowSDK.webRTC.answerInAudio(call);
                console.log('call answered');
            }
        }
    };
    
    /* Subscribe to WebRTC call change */
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();
});

