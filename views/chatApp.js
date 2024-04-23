const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');
let updateInterval; // Declare updateInterval outside to access it in the event listener

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

            // Check if mergedMessages length exceeds 1000 and remove the first few messages
            if (mergedMessages.length > 6) {
                const messagesToRemove = mergedMessages.length - 6;
                mergedMessages.splice(0, messagesToRemove);
            }

            console.log("Merged Messages are>>>", mergedMessages);
            const lastMessageId = mergedMessages.length > 0 ? mergedMessages[mergedMessages.length - 1].id : null;
            localStorage.setItem('lastMessageId', lastMessageId);
            localStorage.setItem('allMessages', JSON.stringify(mergedMessages)); // Update allMessages in local storage
            showMessage(mergedMessages);
            // Check if button should be displayed based on message count after updating messages
            checkLoadOlderMessagesBtn();
        } catch (error) {
            console.error('Error fetching or updating messages:', error);
        }
    };
    
    fetchNewMessagesAndUpdate(); // Call the API initially

    // Set interval to call fetchNewMessagesAndUpdate every second (1000 milliseconds)
    updateInterval = setInterval(fetchNewMessagesAndUpdate, 1000);

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

    // Event listener for the "Load Older Messages" button
    const loadOlderMessagesBtn = document.getElementById('loadOlderMessagesBtn');
    let currentPage = 1; // Track the current page of messages

    loadOlderMessagesBtn.addEventListener('click', async () => {
        clearInterval(updateInterval); // Stop the update interval
        try {
            const oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];
            const firstMessageId = oldMessagesAll.length > 0 ? oldMessagesAll[0].id : null;

            if (firstMessageId !== null) {
                const response = await axios.get(`http://localhost:3000/user/get-older-messages?firstMessageId=${firstMessageId}&page=${currentPage}`, { headers: { "Authorization": token } });
                const olderMessages = response.data.olderMessages;

                if (Array.isArray(olderMessages) && olderMessages.length > 0) {
                    showMessage(olderMessages);
                    currentPage++; // Increment the current page after fetching messages
                } else {
                    console.log('No older messages found.');
                    loadOlderMessagesBtn.style.display = 'none'; // Hide the button if no more older messages
                }
            } else {
                console.log('No messages in localStorage.');
            }
        } catch (error) {
            console.error('Error fetching or processing older messages:', error);
        }
    });

    
    // Check if button should be displayed based on message count
    const checkLoadOlderMessagesBtn = () => {
        const oldMessagesAll = JSON.parse(localStorage.getItem('allMessages')) || [];
        const shouldShowButton = oldMessagesAll.length > 0 && oldMessagesAll.length >= 6;
        loadOlderMessagesBtn.style.display = shouldShowButton ? 'block' : 'none';
    };

    // Call the check function initially and after each update
    // checkLoadOlderMessagesBtn();
    window.addEventListener('storage', checkLoadOlderMessagesBtn);
});




