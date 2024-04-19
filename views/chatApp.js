const msgInput = document.getElementById('chat');
const token = localStorage.getItem('token');

myForm.addEventListener('submit', onSubmit);

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





// function onSubmit(event) {
//     event.preventDefault();
//     const email = emailInput.value;
//     const password = passwordInput.value;
//     const inputData = {
//         email,
//         password,
//     };
//     console.log(inputData);
//     axios.post("http://localhost:3000/user/login", inputData)
//     .then((response) => {
//         if(response.request.status == 201) {
//             alert(response.data.message);
//             localStorage.setItem('token', response.data.token);
//             window.location.href = "./mainpage.html";
//         }
//         else{
//             throw new Error ("Failed To Login, Try Again!")
//         }
//     })
//     .catch((err) => {
//         console.log(err);
//         console.log(err.response.data.message);
//         document.body.innerHTML+=`<div style="color:red;">${err.response.data.message}<div>`; 
//     })
//     emailInput.value='';
//     passwordInput.value = ''; 

// } 