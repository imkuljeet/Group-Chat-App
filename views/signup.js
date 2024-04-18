function signup(e) {
    try {
        e.preventDefault();

        let signUpDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            phn: e.target.tel.value,
            password: e.target.password.value
        };

        console.log(signUpDetails);
        

    } catch (err) {
        console.log(err);
        
        let errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = err;
        document.body.appendChild(errorDiv);
    }
}


