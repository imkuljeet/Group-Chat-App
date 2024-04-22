const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../util/database');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');

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

        const messages = await Message.findAll({
            include: [{
              model: User,
              attributes: ['name']
            }]
          })

        res.status(200).json({ allMessages: messages, success: true });
    } catch (err) {
        console.log('Failed to get messages', err);
        res.status(500).json({ error: err.message, success: false });
    }
};

exports.getMessageNew = async (req, res) => {
    try {
        const lastMessageId = req.query.lastMessageId; // Extract lastMessageId from request query params
        if (!lastMessageId) {
            return res.status(400).json({ error: 'lastMessageId is required in query params' });
        }

        // Query messages from the Message table where id is greater than lastMessageId
        const messages = await Message.findAll({
            where: {
                id: {
                    [Sequelize.Op.gt]: lastMessageId
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['name']
                }
            ]
        });
        
        // Send the queried messages as a response
        res.status(200).json({ allNewMessages: messages, success: true });
    } catch (err) {
        console.log('Failed to get messages', err);
        res.status(500).json({ error: err.message, success: false });
    }
};



