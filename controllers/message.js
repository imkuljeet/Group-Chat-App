const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');

function generateAccessToken(id, name) {
    return jwt.sign({userId: id, name}, 'secretkey');
  }

exports.postMessage = async(req,res,next) => {
    const t = await sequelize.transaction();
    try {
        const {message} = req.body;
        const data = await Message.create({message:message, userId:req.user.id},{transaction:t});
        const user = await User.findByPk(data.userId, { transaction: t });        
        
        await t.commit();

        res.status(200).json({newMessage: [data], user: user, token: generateAccessToken(data.userId)});
    }
    catch(err) {
        await t.rollback();
        console.log("Error is>>>>",err);
        res.status(500).json({success:false,error : err});
    }
}

exports.getMessage = async (req, res, next) => {
    try {
       
         if (!req.user || !req.user.id) {
            throw new Error('User ID not available in request');
        }

        const messages = await Message.findAll();

        const user = await User.findByPk(req.user.id);

        if (!user || !messages) {
            throw new Error('User or messages not found');
        }

        res.status(200).json({ allMessages: messages, user: user, success: true });
    } catch (err) {
        console.log('Failed to get messages', err);
        res.status(500).json({ error: err.message, success: false });
    }
};
