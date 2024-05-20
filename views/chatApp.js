const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');

const newGroupBtn = document.getElementById('new-group-btn');
const chatList = document.getElementById('chat-list');

const chatForm = document.getElementById('chat-form');
const openChat = document.getElementById('open-chat');

const membersUl = document.getElementById('members-ul');
const closeMembersBtn = document.getElementById('close-members-btn');

const baseUrl = `http://localhost:3000`;

document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.clear();
});

let updateInterval; // Declare updateInterval outside to access it in the event listener

const socket = io(baseUrl);

socket.on('connect', () => {
    console.log('Server is Printing it to the client side',socket.id)
})
const groupId = localStorage.getItem('groupId');
console.log(groupId)
socket.emit('joinRoom', groupId);
socket.on('receivedMsg', (id) => {
    console.log(id)
    fetchMessagesAndShowToUser(id);
})

chatForm.onsubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const message = document.getElementById('message').value;
        const groupId = localStorage.getItem('groupId');
        if(!groupId) {
            alert('Please select a group first.');
            return document.getElementById('message').value = '';
            // throw new Error('no group selected');
        }
        const res = await axios.post(`http://localhost:3000/message/send`, 
        {
            message: message,
            groupId: groupId
        },
        {
            headers: {
                'Authorization': token
            }
        });
        console.log(message);
        socket.emit("send-message",message,groupId)
        document.getElementById('message').value = '';
    }
    catch (error) {
        console.log('error while sending msg', error);
    }
}

async function fetchMessagesAndShowToUser(groupId) {
    try {
        // localStorage.setItem('intervalId', intervalId);
        console.log("try groupid", groupId);
        let oldMessages = JSON.parse(localStorage.getItem('messages'));
        let lastMsgId;
        let messages;
        if(!oldMessages) {
            console.log('no old messages');
            oldMessages = [];
            lastMsgId = 0;
        }
        else {
            messages = oldMessages;
            lastMsgId = oldMessages[oldMessages.length - 1].id;
        }
        const res = await axios.get(`http://localhost:3000/message/fetchNewMsgs/?lastMsgId=${lastMsgId}&groupId=${groupId}`);
        if(res.status === 200){
            console.log("Inside this fetch", groupId);
            // console.log("Inside this fetch", intervalId);
            console.log(res.data.messages);
            console.log('this piece is executed');
            const newMessages = res.data.messages;
            messages = oldMessages.concat(newMessages);
            if(messages.length > 10){
                messages = messages.slice(messages.length - 10, messages.length);
            }
            console.log('messages in frontend', messages);
        }
        let currentMsgs = [];
        for(let i =0 ; i < messages.length; i++) {
            if(messages[i].groupId == groupId){
                currentMsgs.push(messages[i]);
            }
        }
        localStorage.setItem('messages', JSON.stringify(messages));
        showChatToUser(currentMsgs);    
    }
    catch (error) {
        console.log(error);
    }
}

function showChatToUser(messages) {
    try {
        const chatul = document.getElementById('chat-ul');
        chatul.innerHTML = '';
        messages.forEach((message) => {
            // chatBody.innerHTML += message.from+': '+ message.message + `<br>`;
            chatul.innerHTML += `
                <p>
                    ${message.username}: ${message.message}
                </p>
            `;

        });
    }
    catch (error) {
        console.log(error);
    }
}


newGroupBtn.onclick = async (e) => {
    window.location.href = 'createChat.html';
};

async function fetchGroupsAndShowToUser() {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/chat/getGroups`, {
            headers: {
                'Authorization': token
            }
        })
        if(res.status === 200) {
            const groups = res.data.groups;
            showGroupsToUser(groups);
        }
    }
    catch(error) {
        console.log(" catch error");
        console.log(error);
    }
}

function showGroupsToUser(groups) {
    try {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';
        groups.forEach(group => {
            chatList.innerHTML += `
                <div>
                <p id="${group.id}">${group.name}</p>
                <button class="btn btn-primary btn-sm gradient-custom-4">Add Member</button>
                </div>
                <hr>
            `;
        })
    }
    catch (error) {
        console.log(error);
    }
}

window.addEventListener("DOMContentLoaded", () => { 
    try {
        localStorage.removeItem('groupId');
        // setInterval(() => {
            fetchGroupsAndShowToUser();
        // }, 1000);
    }
    catch(error) {
        console.log(error);
    }
})

chatList.onclick = async (e) => {
    e.preventDefault();
    try {
        e.target.classList.add('active');
        // const previousIntervalId = localStorage.getItem('intervalId');
        // if(previousIntervalId) {
        //    clearInterval(previousIntervalId);
        // }
        if(e.target.nodeName === 'BUTTON') {
            const groupId = e.target.parentElement.children[0].id;
            sessionStorage.setItem('addToGroup', groupId);
            window.location.href = `newMember.html`;
        }
        else {
            const chatNameDiv = document.getElementById('open-chat');
            let groupId;
            if(e.target.nodeName === 'P'){
                chatNameDiv.innerHTML = `<p><b>${e.target.innerText}</b></p>`;
                groupId = e.target.id;
            }else {
                chatNameDiv.innerHTML = `<p><b>${e.target.children[0].innerText}</b></p>`;
                groupId = e.target.children[0].id;
            }
            await new Promise((resolve, reject) => {
                localStorage.setItem('groupId', groupId);
                resolve();
            });
            // const intervalId = 
            // setInterval(() => {
                // console.log("This is in chat", groupId);
                // console.log("This is fr interval cjhat", intervalId);
                fetchMessagesAndShowToUser(groupId);
            // }, 
            //1000);
        }
    }
    catch (error) {
        console.log(error);
    }
}

openChat.onclick = (e) => {
    e.preventDefault();
    try {
        document.getElementById('members-list').classList.add('active');
        const groupId = localStorage.getItem('groupId');
        fetchMembersAndShowToUser(groupId);
    }
    catch(error) {
        console.log(error);
    }
}

async function fetchMembersAndShowToUser(groupId) {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/chat/getMembers/?groupId=${groupId}`, {
            headers: {
                'Authorization': token
            }
        })
        console.log('get members response:', res);
        if(res.status === 200) {
            const members = res.data.members;
            showMembersToUser(members);
        }
    }
    catch (error) {
        console.log(error);
    }
}

function showMembersToUser(members) {
    try {
        const memberBody = document.getElementById('members-ul');
        memberBody.innerHTML = '';
        memberBody.innerHTML = `<h4>Group Members:-</h4>`;
        members.forEach(member => {
            if(member.isAdmin) {
                memberBody.innerHTML += `<li class="list-group-item text-uppercase">
                    ${member.dataValues.name} <b>-Admin</b>
                    <button class="btn btn-sm btn-outline-secondary" id="rmadminbtn-${member.dataValues.id}">Remove Admin Permission</button>
                    <button class="btn btn-sm btn-outline-danger" id="rmbtn-${member.dataValues.id}">Remove User</button>
                </li>`;
            }
            else {
                memberBody.innerHTML += `<li class="list-group-item text-uppercase">
                    ${member.dataValues.name}
                    <button class="btn btn-sm btn-outline-primary" id="mkbtn-${member.dataValues.id}">Make Admin</button>
                    <button class="btn btn-sm btn-outline-danger" id="rmbtn-${member.dataValues.id}">Remove User</button>
                </li>`;
            }
        })
    }
    catch (error) {
        console.log(error);
    }
}

membersUl.onclick = (e) => {
    e.preventDefault();
    try {
        if(e.target.className == 'btn btn-sm btn-outline-primary'){
            makeAdmin(e.target.id);
        }
        else if(e.target.className == 'btn btn-sm btn-outline-danger') {
            removeMember(e.target.id);
        } else if(e.target.className == 'btn btn-sm btn-outline-secondary') {
            removeAdminPermission(e.target.id);
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function makeAdmin(idString) {
    try {
        const userId = idString.split('-')[1];
        const token = localStorage.getItem('token');
        const groupId = localStorage.getItem('groupId');
        const res = await axios.put(`http://localhost:3000/admin/makeAdmin`, {userId: userId, groupId: groupId}, {
            headers: {
                'Authorization': token
            }
        })
        if(res.status === 200) {
            console.log('setting admin response:', res);
            console.log(res.data.message)
            confirm(res.data.message);
            fetchMembersAndShowToUser(groupId);
        }
    }
    catch (error) {
        console.log(error);
        if(error.response.status === 403) {
            alert(`You don't have required permissions.`);
        }
    }
}

async function removeMember(idString) {
    try {
        const userId = idString.split('-')[1];
        const token = localStorage.getItem('token');
        const groupId = localStorage.getItem('groupId');
        let config = { 
            headers: {
                Authorization: token
            },
            data: {userId: userId, groupId: groupId}
        }
        const res = await axios.delete(`http://localhost:3000/admin/removeFromGroup`, config)
        if(res.status === 200) {
            console.log('removing user response:', res);
            confirm(res.data.message);
            fetchMembersAndShowToUser(groupId);
        }
    }
    catch (error) {
        console.log(error);
        if(error.response.status === 403) {
            alert(`You don't have required permissions.`);
        }
    }
}

async function removeAdminPermission(idString) {
    try {
        const userId = idString.split('-')[1];
        const token = localStorage.getItem('token');
        const groupId = localStorage.getItem('groupId');
        const res = await axios.put(`http://localhost:3000/admin/removeAdmin`, {userId: userId, groupId: groupId}, {
            headers: {
                'Authorization': token
            }
        }); 
        if(res.status === 200) {
            console.log('remove admin response:', res);
            confirm(res.data.message);
            fetchMembersAndShowToUser(groupId);
        }
    }
    catch (error) {
        console.log(error);
        if(error.response.status === 403) {
            alert(`You don't have required permissions.`);
        }
    }
}

const fileInput = document.getElementById('myfile');

fileInput.addEventListener('input', handleSelectedFile = async(event) => {
    try {
        const file = event.target.files[0]; 
        // console.log('files**********',file);

        const formData = new FormData();
        formData.append('myfile', file)

        // console.log('formData', formData.get('myfile'))

        const groupId = localStorage.getItem('groupId');
        // console.log('groupId inside files',groupId)

        const token = localStorage.getItem('token');
        const fileStored = await axios.post(`http://localhost:3000/file/filestored/${groupId}`, formData, 
        {
            headers: {
                'Authorization': token
            }
        })

        console.log("This is file storage", fileStored);
        // console.log('file name', fileStored.data.fileName);
        // console.log('data message file', fileStored.data.msg.message);

        // document.getElementById('text').value = fileStored.data.message;  
        // console.log("Inside file", fileStored.data.msg.message);

        socket.emit("send-message",fileStored.data.message, groupId);   
    }
    catch(err) {
        console.log("Some error in files", err);
    }
})
