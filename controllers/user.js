const User = require("../models/users");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function isStringInvalid(string) {
  if (string === undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

function generateAccessToken(id, name) {
  return jwt.sign({userId: id, name}, process.env.SECRET_KEY);
}

const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if ([name, email, phone, password].some(isStringInvalid)) {
      return res.status(400).json({ err: "Bad Parameters, Something is missing" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltrounds = 10;
    bcrypt.hash(password, saltrounds, async (err, hash) => {
      if (err) {
        console.error("Error in Hashing", err);
        return res.status(500).json({ message: "Error in Hashing" });
      }

      await User.create({ name, email, phone, password: hash });
      res.status(201).json({ message: "Successfully Created New User" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ success: false, message: 'Email or Password is missing' });
    }

    const user = await User.findOne({ where: { email } });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      
      if (isPasswordMatch) {
        return res.status(200).json({ success: true, message: "User logged in successfully", token: generateAccessToken(user.id, user.name) });
      } else {
        return res.status(400).json({ success: false, message: 'Password is Incorrect' });
      }
    
    } else {
      return res.status(404).json({ success: false, message: 'Invalid Email or Password' });
    }
  
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


module.exports = { signup, login, generateAccessToken };
