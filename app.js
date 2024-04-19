const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./util/database");
const User = require("./models/users");
const Message = require('./models/messages');
const userController = require("./controllers/user");
const userRoutes = require("./routes/user");

const app = express();

app.use(cors({
  origin : "*",
  // methods : ["GET","POST"],
  // credentials : true
}));

app.use(bodyParser.json());

app.use('/user', userRoutes);

User.hasMany(Message);
Message.belongsTo(User);


sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
