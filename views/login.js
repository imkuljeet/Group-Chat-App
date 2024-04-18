async function login(e){
    try{
        e.preventDefault();

        const loginDetails = {
            email : e.target.email.value,
            password : e.target.password.value
        }

        console.log(loginDetails);

    }catch(err){
        console.log(err);
        document.body.innerHTML += `<div style = "color:red">${err}</div>`
    }
}