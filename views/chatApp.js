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

// window.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem('token');
//     // console.log("token is >>>>", token);

//     // Function to fetch messages and update the screen
//     const fetchMessagesAndUpdate = () => {
//         axios.get(`http://localhost:3000/user/get-message`, { headers: { "Authorization": token } })
//             .then((response) => {
//                 // console.log("Response from domcontent get msg is >>", response);
//                 clearMessages(); // Clear existing messages
//                 // showMessage(response.data.allMessages); // Show new messages

//                 localStorage.setItem('allMessages', JSON.stringify(response.data.allMessages));
//             })
//             .catch((err) => { console.log(err) });
//     };

//      // Function to read messages from local storage and display them
//      const readMessagesFromLocalStorage = () => {
//         const storedMessages = localStorage.getItem('allMessages');
//         if (storedMessages) {
//             const parsedMessages = JSON.parse(storedMessages);
//             // console.log("Parsed messages are>>>>",parsedMessages);
//             showMessage(parsedMessages);
//         }
//     };

//     // Call the API initially
//     fetchMessagesAndUpdate();

//     // Read messages from local storage when the page is refreshed
//     readMessagesFromLocalStorage();

//     // Continuously call the API every 1 second
//     // setInterval(fetchMessagesAndUpdate, 1000);

//     // Function to clear existing messages
//     const clearMessages = () => {
//         const messageContainer = document.getElementById('listOfMessages');
//         messageContainer.innerHTML = ''; // Clear the container
//     };

// });

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');

    // Function to read messages from local storage and display them
    const readMessagesFromLocalStorage = () => {
        const storedMessages = localStorage.getItem('allMessages');
        if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages);
            const lastMessageId = parsedMessages.length > 0 ? parsedMessages[parsedMessages.length - 1].id : null;
            localStorage.setItem('lastMessageId', lastMessageId);
            showMessage(parsedMessages);
        }
    };

    const fetchNewMessagesAndUpdate = async () => {
        try {
            let lastId = localStorage.getItem('lastMessageId');
            console.log("Last Id is here>>>", lastId);
            let newMessages = await axios.get(`http://localhost:3000/user/get-message-new?lastMessageId=${lastId}`, { headers: { "Authorization": token } });
            console.log("All new Messages are>>>>", newMessages.data); // Access the response data using newMessages.data
        } catch (error) {
            console.error('Error fetching or updating messages:', error);
        }
    };
    
    // Call the API initially
    fetchNewMessagesAndUpdate();

    // Read messages from local storage when the page is refreshed
    readMessagesFromLocalStorage();

    function showMessage(messages) {
        const parentElement = document.getElementById("listOfMessages");
       
        messages.forEach((message) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.textContent = message.user.name + ": " + message.message;
            parentElement.appendChild(listItem);
        });
    }
});


// function showMessage(message) {
//     const parentitem = document.getElementById("listOfMessages");
//     for(let i = 0; i < message.length; i++) {
//         // console.log("messages are >>>",message[i]);
//         const childitem = document.createElement("li");
//         childitem.className = "list-group-item";
//         childitem.textContent = message[i].user.name + ":" + message[i].message;
//         parentitem.appendChild(childitem);
//     }
// }
