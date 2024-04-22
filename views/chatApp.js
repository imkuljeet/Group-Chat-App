const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');

document.getElementById("msgSent").onclick = async function(event) {
    event.preventDefault();
    const message = msgInput.value;
    const inputData = {
        message
    }
    // console.log(inputData);
    await axios.post("http://localhost:3000/user/message", inputData, {headers: {"Authorization": token}})
    .then((response) => {
        // console.log(response);
        localStorage.setItem('token', response.data.token);
    })
    .catch((err) => {
        console.log(err);
    })
    msgInput.value = '';
}

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');

    const fetchNewMessagesAndUpdate = async () => {
        try {
            let lastId = localStorage.getItem('lastMessageId');

            if (lastId === undefined || lastId === 0) {
                lastId = -1;
            }

            console.log("Last Id is here>>>", lastId);
            
            let response = await axios.get(`http://localhost:3000/user/get-message-new?lastMessageId=${lastId}`, { headers: { "Authorization": token } });
            console.log("All new Messages are>>>>", response.data.allNewMessages);
            
            let newMessagesAll = Array.isArray(response.data.allNewMessages) ? response.data.allNewMessages : [];
            let oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];

            let mergedMessages = [...oldMessagesAll, ...newMessagesAll];
            console.log("Merged Messages are>>>", mergedMessages);
            const lastMessageId = mergedMessages.length > 0 ? mergedMessages[mergedMessages.length - 1].id : null;
            localStorage.setItem('lastMessageId', lastMessageId);
            localStorage.setItem('allMessages', JSON.stringify(mergedMessages)); // Update allMessages in local storage
            showMessage(mergedMessages);
        } catch (error) {
            console.error('Error fetching or updating messages:', error);
        }
    };
    
    fetchNewMessagesAndUpdate(); // Call the API initially

    function showMessage(messages) {
        const parentElement = document.getElementById("listOfMessages");
        parentElement.innerHTML = ""; // Clear previous messages
        
        messages.forEach((message) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = message.user.name + ": " + message.message;
            parentElement.appendChild(listItem);
        });
    }
});




