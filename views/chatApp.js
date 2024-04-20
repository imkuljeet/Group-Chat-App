const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');

document.getElementById("msgSent").onclick = async function(event) {
    event.preventDefault();
    const message = msgInput.value;
    const inputData = {
        message
    }
    console.log(inputData);
    await axios.post("http://localhost:3000/user/message", inputData, {headers: {"Authorization": token}})
    .then((response) => {
        console.log(response);
        localStorage.setItem('token', response.data.token);
    })
    .catch((err) => {
        console.log(err);
    })
    msgInput.value = '';
}

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    console.log("token is >>>>", token);

    // Function to fetch messages and update the screen
    const fetchMessagesAndUpdate = () => {
        axios.get(`http://localhost:3000/user/get-message`, { headers: { "Authorization": token } })
            .then((response) => {
                console.log("Response from domcontent get msg is >>", response);
                clearMessages(); // Clear existing messages
                showMessage(response.data.allMessages); // Show new messages
            })
            .catch((err) => { console.log(err) });
    };

    // Call the API initially
    fetchMessagesAndUpdate();

    // Continuously call the API every 1 second
    setInterval(fetchMessagesAndUpdate, 1000);

    // Function to clear existing messages
    const clearMessages = () => {
        const messageContainer = document.getElementById('listOfMessages');
        messageContainer.innerHTML = ''; // Clear the container
    };

});


function showMessage(message) {
    const parentitem = document.getElementById("listOfMessages");
    for(let i = 0; i < message.length; i++) {
        console.log("messages are >>>",message[i]);
        const childitem = document.createElement("li");
        childitem.className = "list-group-item";
        childitem.textContent = message[i].user.name + ":" + message[i].message;
        parentitem.appendChild(childitem);
    }
}