const APP_ID = "25489245c04f47a484462cebd7bc07e7"

let uid = sessionStorage.getItem("uid")

// each user have uid
if(!uid){
    uid = String(Math.floor(Math.random() * 1000))
    sessionStorage.setItem("uid", uid)
}
let token = null;
let client; 

let rtmClient;
let channel;


// get url value
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get("room")

// if there is no room id
if(!roomId){
    roomId = "main"
}

// this will redirect a user to lobby if the user dont have a name
let displayName = sessionStorage.getItem("display_name")
if(!displayName){
    window.location = "lobby.html"
}

// video and audio stream
let localTracks = []
let remoteUsers = {}

// screen track
let localScreenTrack;
let sharingScreen = false;

let joinRoomInit = async () => {

    // create rtm client instance
    rtmClient = await AgoraRTM.createInstance(APP_ID)

    // login rtm client
    // required uid and token
    await rtmClient.login({uid, token})

    // When a user join the room, this adds the name attributes
    // specify the attribute, and set the display name
    await rtmClient.addOrUpdateLocalUserAttributes({"name": displayName})

    // create channel with the same roomId
    channel = await rtmClient.createChannel(roomId)

    //join channel
    await channel.join()

    // event when user joined the room
    channel.on("MemberJoined", handleMemberJoined)

    // event when user leave the room
    channel.on("MemberLeft", handleMemberLeft)

    // event when user send a message
    channel.on("ChannelMessage", handleChannelMessage)

    // function that called when a user join a room
    // this will add the name of the user to the DOM
    getMembers()
    addBotmessageToDom(`Welcome to the room ${displayName}! 👋`)

    // create rtc client object 
    // required params: mode and codec
    // mode which is live or rtc
    // codec encoding method that the browser would use
    client = AgoraRTC.createClient({mode:"rtc", codec:"vp8"})

    
    // join room
    await client.join(APP_ID, roomId, token, uid)
    
    // publish stream event 
    client.on("user-published", handleUserPublished)

    // event that handles when users leave
    client.on("user-left", handleUserLeft)

    joinStream()
}

// whenever user join the room, it will call the join stream 
let joinStream = async () => {
    // if user join, this will access video and audio tracks stored in array
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    // video player container
    let player = `<div class="video_container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                </div>`

    // this will add the video player to the DOM
    document.getElementById("streams_container").insertAdjacentHTML("beforeend", player)

    // this will create event listener to expand the video frame 
    document.getElementById(`user-container-${uid }`).addEventListener("click", expandVideoFrame)
    
    // play video and audio stream
    // play method creates video tag and add it to video-player
    localTracks[1].play(`user-${uid}`)

    // publish local tracks and specify the local tracks
    // audio track is in index 0
    // video track is in index 1
    // this publish function will trigger the user-published event listener and it will call handleUserPublished function
    await client.publish([localTracks[0], localTracks[1]])
}

let switchToCamera = async () => {

    let player = `<div class="video_container" id="user-container-${uid}">
            <div class="video-player" id="user-${uid}"></div>
        </div>`

    displayFrame.insertAdjacentHTML("beforeend", player)

    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)

    document.getElementById("mic-btn").classList.remove("active")
    document.getElementById("screen-btn").classList.remove("active")
    
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])


}

// function everytime a user publish a stream
// user tracks and media type
let handleUserPublished = async (user, mediaType) => {
    
    // users will be added to remoteUsers tracks
    remoteUsers[user.uid] = user; // user object

    // subscribe to user tracks
    await client.subscribe(user, mediaType)
 
    let player = document.getElementById(`user-container-${user.uid}`)
    
    // check if player is already existed
    if(player === null){
    // this will create a new video player and added it to the DOM
        player = `<div class="video_container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div> `

        document.getElementById("streams_container").insertAdjacentHTML("beforeend", player)
        document.getElementById(`user-container-${user.uid }`).addEventListener("click", expandVideoFrame)

    }

    if(displayFrame.style.display){
        let videoFrames = document.getElementById(`user-container-${user.id}`)
        videoFrames.style.height = "100px";
        videoFrames.style.width = "100px";
    }

    // check media types
    if(mediaType === "video"){
        // access the video track parameter and append video tag
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === "audio"){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {

    // delete user from remote users
    delete remoteUsers[user.uid]

    // this will remove the user video container from the DOM
    document.getElementById(`user-container-${user.uid}`).remove()

    if(userDisplayFrame === `user-container-${user.uid}`){
        displayFrame.style.display = null;
        
        let videoFrames = document.getElementsByClassName("video_container")
        for(let i = 0; videoFrames.length > i; i++){
              videoFrames[i].style.height = "300px";
              videoFrames[i].style.width = "300px";
        }


    }
}

// audio track is in index 0
let toggleMic = async (e) => {
    let button = e.currentTarget

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

// video track is in index 1
let toggleCamera = async (e) => {
    let button = e.currentTarget

    

    if(localTracks[1].muted){

        await localTracks[1].setMuted(false)
        button.classList.add('active')
       
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget;
    let cameraButton = document.getElementById("camera-btn");

    if(!sharingScreen){
        if(!sharingScreen){
            sharingScreen = true;
    
            screenButton.classList.add("active")
            cameraButton.classList.remove("active")
            cameraButton.style.display = "none"
    
            // toggle screen sharing
            localScreenTrack = await AgoraRTC.createScreenVideoTrack()
    
            document.getElementById(`user-container-${uid}`).remove()
            displayFrame.style.display ="block"
    
            let player = `<div class="video_container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"></div>
                    </div> `
                    
            displayFrame.insertAdjacentHTML("beforeend", player)
            document.getElementById(`user-container-${uid}`).addEventListener("click", expandVideoFrame)
       
            userDisplayFrame = `user-container-${uid}`;
            localScreenTrack.play(`user-${uid}`)

            // unpublish video track
            // if this wasn't unpublish, the other user will see video track instead of screen track
            await client.unpublish(localTracks[1])
            
            //publish screen track
            await client.publish(localScreenTrack)

            let videoFrames = document.getElementsByClassName("video_container")
            for(let i = 0; videoFrames.length > i; i++){
                if(videoFrames[i] != userDisplayFrame){
                  videoFrames[i].style.height = "100px";
                  videoFrames[i].style.width = "100px";
                }
            
              }
        }
    }   
    else{
        sharingScreen = false;
        screenButton.classList.remove("active")
        cameraButton.style.display = "block"

        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTrack])

        switchToCamera()
    }

}

let leaveStream = async (e) => {
    
    e.preventDefault()

    document.getElementsByClassName("stream_actions")[0].style.display = "none"
    
    for(let i = 0; localTracks.length > i; i++){
        localTracks[0].stop()
        localTracks[1].close()
    }

    await client.unpublish([localTracks[0], localTracks[1]])

    if(localScreenTrack){
        await client.unpublish(localScreenTrack)
    }
        document.getElementById(`user-container-${uid}`).remove()

    if(userDisplayFrame === `user-container-${uid}`){
        displayFrame.style.display = null;
                
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = "300px"
                videoFrames[i].style.width = "300px"
                }
    }  
    
    window.location = "lobby.html"
    
    

}

document.getElementById("leave-btn").addEventListener("click", leaveStream)

document.getElementById("camera-btn").addEventListener("click", toggleCamera)
document.getElementById("mic-btn").addEventListener("click", toggleMic)

document.getElementById("screen-btn").addEventListener("click", toggleScreen)


joinRoomInit()
