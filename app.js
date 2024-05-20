const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const multer = require('multer');
const upload = multer();

const CronJob = require('cron').CronJob;

const sequelize = require("./util/database");
// const http = require('http');
// const socketio = require('socket.io');
const {Server} = require("socket.io");
const {createServer} = require("http");

const User = require("./models/users");
const Message = require('./models/messages');
const Group = require('./models/group');
const GroupUser = require('./models/groupUser');
const StoredFile = require('./models/groupfiles');
const Archieve = require('./models/archieve-chat');
const Forgotpassword = require('./models/forgotpassword');

const userRoutes = require("./routes/user");
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');
const fileRoutes = require('./routes/group-files');
const resetPasswordRoutes = require('./routes/resetpassword');
const mainRoute = require('./routes/main');

const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

const server = createServer(app);
const io = new Server(server,{
  cors : {
    origin:"*"
  }
})

app.use(cors({
  origin : "*",
  // methods : ["GET","POST"],
  // credentials : true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(mainRoute);
app.use('/user', userRoutes);
app.use('/message', messageRoutes);
app.use('/chat', chatRoutes);
app.use('/admin', adminRoutes);
app.use('/file', upload.single('myfile'), fileRoutes)
app.use('/password', resetPasswordRoutes);

app.use((req, res) => {
    res.status(404).sendFile('404.html', { root: 'views' });
});

// app.use('/', (req, res) => {
//     res.sendFile(path.join(__dirname, `${req.url}`));
// });



User.hasMany(Message);
Message.belongsTo(User);

Group.belongsToMany(User, {through: GroupUser});
User.belongsToMany(Group, {through: GroupUser});

Group.hasMany(Message);
Message.belongsTo(Group);

Group.hasMany(StoredFile);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);


sequelize.sync()
.then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`Server is ruuning at ${process.env.PORT}`)
    })
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('send-message', (msg,id) => {
            console.log('groupId :',id);
            console.log('Received message:',msg);
            io.emit('receivedMsg', id);
        })
        socket.on('disconnect', () => {
            console.log('user disconnected');
        })
    })
    new CronJob('0 0 * * *', async function() {
        const chats = await Message.findAll();
        console.log('daily chat',chats);

        for(const chat of chats) {
            await Archieve.create({ groupId: chat.groupId, userId: chat.userId, message: chat.message })
            console.log('id',chat.id)
            await Message.destroy({where: {id: chat.id} })
        }
    },
    null,
    true,
    )
})
.catch(error => console.log("error in appjs file"));