async function signup(e) {
    try {
      e.preventDefault();
  
      let signUpDetails = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.tel.value,
        password: e.target.password.value,
      };
  
      console.log(signUpDetails);
  
      const response = await axios.post('http://localhost:3000/user/signup', signUpDetails);
  
      if (response.status === 201) {
        window.location.href = "./login.html";
      } else {
        throw new Error("Failed to create user. Please try again.");
      }
   
    } catch (err) {
      console.error(err);
  
      let errorDiv = document.createElement('div');
      errorDiv.style.color = 'red';
      errorDiv.textContent = err.message || "An error occurred. Please try again.";
      document.body.appendChild(errorDiv);
    }
  }
  
