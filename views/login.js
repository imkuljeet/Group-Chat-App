async function login(e){
    try{
        e.preventDefault();

        const loginDetails = {
            email : e.target.email.value,
            password : e.target.password.value
        }

        console.log(loginDetails);

        const response = await axios.post('http://localhost:3000/user/login',loginDetails);
        alert('User Logged in Successfully');



    }catch(err){
        console.log(err);
        document.body.innerHTML += `<div style = "color:red">${err}</div>`
    }
}