document.getElementById('new-chat-form').onsubmit = async(e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const participantEmail = document.getElementById('chat-mate-email').value;
        const res = await axios.post(`http://localhost:3000/chat/addParticipant`, {
            email: participantEmail
        },
        {
            headers: {
                'Authorization': token
            } 
        })
        console.log(res);
        if(res.status === 200) {
            console.log(res.data.group);
            const group = res.data.group;
            sessionStorage.setItem('createdGroupId', group.id);
            window.location.href = 'nameTheGroup.html';
        }
        if(res.status === 204) {
            alert('Email is not registered. Please send them an invite.');
            window.location.href = 'chatApp.html';
        }
    }
    catch (error) {
        console.log(error);
    }
}