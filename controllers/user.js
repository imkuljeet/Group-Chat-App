const User = require("../models/users");
const bcrypt = require('bcrypt');

function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log("Email is", email);

    if (
      isStringInvalid(name) ||
      isStringInvalid(email) ||
      isStringInvalid(phone) ||
      isStringInvalid(password)
    ) {
      return res
        .status(400)
        .json({ err: "Bad Parameters, Something is missing" });
    }

    const existingUser = await User.findOne({
      where: {
        email: email
      }
    });
    if (existingUser) {
      return res.status(400).json({ message : "User already exists" });
    }

    const saltrounds = 10;
    bcrypt.hash(password, saltrounds, async(err,hash)=>{
      console.log("If any error in Hashing>>",err);


      await User.create({ name, email, phone, password: hash });
      res.status(201).json({ message: "Successfully Created New User" });

    });

  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ success: false, message: 'Email or Password is missing' });
    }

    // console.log('Password is>>', password);

    const user = await User.findAll({ where: { email } });

    if (user.length > 0) {
      const isPasswordMatch = await bcrypt.compare(password, user[0].password);
      
      if (isPasswordMatch) {
        return res.status(200).json({ success: true, message: 'User Logged In Successfully' });
      } else {
        return res.status(400).json({ success: false, message: 'Password is Incorrect' });
      }
    
    } else {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }
  
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


module.exports = { signup, login };
