let form = document.getElementById('lobby_form')

// this will save the user name and put it to form automatically
let displayName = sessionStorage.getItem('display_name')
if(displayName){
    form.name.value = displayName
}

form.addEventListener('submit', (e) => {
    e.preventDefault()

    // set name everytime a user submit
    sessionStorage.setItem('display_name', e.target.name.value)

    // room invite code
    let inviteCode = e.target.room.value
    if(!inviteCode){
        inviteCode = String(Math.floor(Math.random() * 10000))
    }

    // redirect user to room.html
    window.location = `index.html?room=${inviteCode}`
})