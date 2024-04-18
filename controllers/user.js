const User = require("../models/users");

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

    
    await User.create({ name, email, phone, password });
    res.status(201).json({ message: "Successfully Created New User" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup };
