let messagesContainer = document.getElementById('messages');
messagesContainer.scrollTop = messagesContainer.scrollHeight;

const memberContainer = document.getElementById('members_container');
const memberButton = document.getElementById('members_button');

const chatContainer = document.getElementById('messages_container');
const chatButton = document.getElementById('chat_button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }

  activeChatContainer = !activeChatContainer;
});

let displayFrame = document.getElementById("stream_box")
let videoFrames = document.getElementsByClassName("video_container")
let userDisplayFrame = null;

let expandVideoFrame = (e) => {
  // check if if there is any stream in stream box
  let child = displayFrame.children[0]
  if(child){
    // this will remove video container stream and take it back to streams container
    document.getElementById("streams_container").appendChild(child)
  }

  displayFrame.style.display = "block"

  // add the current element to displayFrame
  displayFrame.appendChild(e.currentTarget)

  // To know what stream in display frame 
  userDisplayFrame = e.currentTarget.id

  // resi
  for(let i = 0; videoFrames.length > i; i++){
    if(videoFrames[i] != userDisplayFrame){
      videoFrames[i].style.height = "100px";
      videoFrames[i].style.width = "100px";
    }

    
  }
}

// loop thorugh the video frames and add click event
for(let i = 0; videoFrames.length > i; i++){
  videoFrames[i].addEventListener("click", expandVideoFrame)
}

let hideDisplayFrame = () => {
  userDisplayFrame = null;
  displayFrame.style.display = null;


    let child = displayFrame.children[0]

    // this will remove video container stream and take it back to streams container
    document.getElementById("streams_container").appendChild(child)
    
    // this will reset all the video frames to 200px
    for(let i = 0; videoFrames.length > i; i++){

      videoFrames[i].style.height = "200px";
      videoFrames[i].style.width = "200px"
    }

}

displayFrame.addEventListener("click", hideDisplayFrame)