async function login(e){
    try{
        e.preventDefault();

        const loginDetails = {
            email : e.target.email.value,
            password : e.target.password.value
        }

        console.log(loginDetails);

        const response = await axios.post('http://localhost:3000/user/login',loginDetails);

        console.log(response);

        if(response.status == 200) {
            alert(response.data.message);
            localStorage.setItem('token',response.data.token);
            window.location.href = "./chatApp.html";

        }
        else{
            throw new Error ("Failed To Login, Try Again!")
        }

    }catch(err){
        console.log(err);
        document.body.innerHTML += `<div style = "color:red">${err}</div>`
    }
}