const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');

const newGroupBtn = document.getElementById('new-group-btn');
const chatList = document.getElementById('chat-list');

const chatForm = document.getElementById('chat-form');
const openChat = document.getElementById('open-chat');
// const closeMembersBtn = document.getElementById('close-members-btn');
const membersUl = document.getElementById('members-ul');


let updateInterval; // Declare updateInterval outside to access it in the event listener

// document.getElementById("msgSent").onclick = async function(event) {
//     event.preventDefault();
//     const message = msgInput.value;
//     const inputData = {
//         message
//     }
//     // console.log(inputData);
//     await axios.post("http://localhost:3000/user/message", inputData, {headers: {"Authorization": token}})
//     .then((response) => {
//         // console.log(response);
//         localStorage.setItem('token', response.data.token);
//     })
//     .catch((err) => {
//         console.log(err);
//     })
//     msgInput.value = '';
// }

// window.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem('token');

//     const fetchNewMessagesAndUpdate = async () => {
//         try {
//             let lastId = localStorage.getItem('lastMessageId');

//             if (lastId === undefined || lastId === 0) {
//                 lastId = -1;
//             }

//             console.log("Last Id is here>>>", lastId);
            
//             let response = await axios.get(`http://localhost:3000/user/get-message-new?lastMessageId=${lastId}`, { headers: { "Authorization": token } });
//             console.log("All new Messages are>>>>", response.data.allNewMessages);
            
//             let newMessagesAll = Array.isArray(response.data.allNewMessages) ? response.data.allNewMessages : [];
//             let oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];

//             let mergedMessages = [...oldMessagesAll, ...newMessagesAll];

//             // Check if mergedMessages length exceeds 1000 and remove the first few messages
//             if (mergedMessages.length > 6) {
//                 const messagesToRemove = mergedMessages.length - 6;
//                 mergedMessages.splice(0, messagesToRemove);
//             }

//             console.log("Merged Messages are>>>", mergedMessages);
//             const lastMessageId = mergedMessages.length > 0 ? mergedMessages[mergedMessages.length - 1].id : null;
//             localStorage.setItem('lastMessageId', lastMessageId);
//             localStorage.setItem('allMessages', JSON.stringify(mergedMessages)); // Update allMessages in local storage
//             showMessage(mergedMessages);
//             // Check if button should be displayed based on message count after updating messages
//             checkLoadOlderMessagesBtn();
//         } catch (error) {
//             console.error('Error fetching or updating messages:', error);
//         }
//     };
    
//     fetchNewMessagesAndUpdate(); // Call the API initially

//     // Set interval to call fetchNewMessagesAndUpdate every second (1000 milliseconds)
//     updateInterval = setInterval(fetchNewMessagesAndUpdate, 1000);

//     function showMessage(messages) {
//         const parentElement = document.getElementById("listOfMessages");
//         parentElement.innerHTML = ""; // Clear previous messages
        
//         messages.forEach((message) => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.textContent = message.user.name + ": " + message.message;
//             parentElement.appendChild(listItem);
//         });
//     }

//     // Event listener for the "Load Older Messages" button
//     const loadOlderMessagesBtn = document.getElementById('loadOlderMessagesBtn');
//     let currentPage = 1; // Track the current page of messages

//     loadOlderMessagesBtn.addEventListener('click', async () => {
//         clearInterval(updateInterval); // Stop the update interval
//         try {
//             const oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];
//             const firstMessageId = oldMessagesAll.length > 0 ? oldMessagesAll[0].id : null;

//             if (firstMessageId !== null) {
//                 const response = await axios.get(`http://localhost:3000/user/get-older-messages?firstMessageId=${firstMessageId}&page=${currentPage}`, { headers: { "Authorization": token } });
//                 const olderMessages = response.data.olderMessages;

//                 if (Array.isArray(olderMessages) && olderMessages.length > 0) {
//                     showMessage(olderMessages);
//                     currentPage++; // Increment the current page after fetching messages
//                 } else {
//                     console.log('No older messages found.');
//                     loadOlderMessagesBtn.style.display = 'none'; // Hide the button if no more older messages
//                 }
//             } else {
//                 console.log('No messages in localStorage.');
//             }
//         } catch (error) {
//             console.error('Error fetching or processing older messages:', error);
//         }
//     });

    
//     // Check if button should be displayed based on message count
//     const checkLoadOlderMessagesBtn = () => {
//         const oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];
//         const shouldShowButton = oldMessagesAll.length > 0 && oldMessagesAll.length >= 6;
//         loadOlderMessagesBtn.style.display = shouldShowButton ? 'block' : 'none';
//     };

//     // Call the check function initially and after each update
//     // checkLoadOlderMessagesBtn();
//     window.addEventListener('storage', checkLoadOlderMessagesBtn);
// });


// -------------------------------------------------------------------------------------------------------------------

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
                <br>
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
        setInterval(() => {
            fetchGroupsAndShowToUser();
        }, 1000);
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
