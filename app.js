const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./util/database");
const User = require("./models/users");
const Message = require('./models/messages');
const Group = require('./models/group');
const GroupUser = require('./models/groupUser');

const userController = require("./controllers/user");
const userRoutes = require("./routes/user");
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const app = express();

app.use(cors({
  origin : "*",
  // methods : ["GET","POST"],
  // credentials : true
}));

app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);



User.hasMany(Message);
Message.belongsTo(User);

Group.belongsToMany(User, {through: GroupUser});
User.belongsToMany(Group, {through: GroupUser});

Group.hasMany(Message);
Message.belongsTo(Group);




sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
