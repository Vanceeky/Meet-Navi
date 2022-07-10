// by default when we call this function we want to know the memberID

let handleMemberJoined = async (MemberId) => {
    console.log("A new member has joined the room:", MemberId)

    addMemberToDOM(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ["name"])
    addBotmessageToDom(`Welcome to the room ${name}! 👋`)

}

// this function will add the users name to the DOM
let addMemberToDOM = async (MemberId) => {

    // this gets the values from the object property and assign them to the name variable
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ["name"])
    
    let membersWrapper = document.getElementById("member_list")

    // this will create new div inside the member list with their id
    let memberItem = `<div class="member_wrapper" id="member_${MemberId}_wrapper">
        <span class="green_icon"></span>
        <p class="member_name">${name}</p>
    </div>`

    // this will be added to the DOM
    membersWrapper.insertAdjacentHTML("beforeend", memberItem)
}

let updateMemberTotal = async () => {
    let total = document.getElementById("members_count")
    let members = await channel.getMembers()
    total.innerText = members.length
}


let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

}


// this function will remove the users name to the DOM
let removeMemberFromDom = async (MemberId) => {

    let memberWrapper = document.getElementById(`member_${MemberId}_wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotmessageToDom(`${name} has left the room. 😥`)
        
    // this will remove the member wrapper
    memberWrapper.remove()
}


let getMembers = async () => {

    // this gets the member list of the channel.
    let members = await channel.getMembers()
    updateMemberTotal(members)

    // loop through each channel member and it to the DOM
    for (let i = 0; members.length > i; i++){
        addMemberToDOM(members[i])
    }
}

// this will handle the channel message
// get message data with the member id
let handleChannelMessage = async (messageData, MemberId) => {
    console.log("A new message was receive")

    // the message is stringified so we have to parse it
    // get the text value
    let data = JSON.parse(messageData.text)

    if(data.type === "chat"){
        addMessageToDom(data.displayName, data.message)
    }

}

// channel message
let sendMessage = async (e) => {

    e.preventDefault()

    // get messsge from the form
    let message = e.target.message.value;

    // send channel message using sendMessage method
    // this will send the message to anyone that joined the channel
    // send message as string
    channel.sendMessage({text:JSON.stringify({"type": "chat", "message": message, "displayName":displayName})})
    

    addMessageToDom(displayName, message)

    // form will reset after sending
    e.target.reset()
}

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message_wrapper">
                        <div class="message_body">
                            <strong class="message_author">${name}</strong>
                            <p class="message_text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message_wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }

}

let addBotmessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message_wrapper">
                        <div class="message_body_bot">
                            <strong class="message_author_bot">👽 Navi Bot</strong>
                            <p class="message_text_bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message_wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }

}

// this leaveChannel function will also trigger the MemberLeft event listener
let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

// everytime a users close the tab this will automatically leave and logout
window.addEventListener("beforeunload", leaveChannel)

let messageForm = document.getElementById("message_form");
messageForm.addEventListener("submit", sendMessage)