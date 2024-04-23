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

exports.getOlderMessages = async (req, res) => {
    try {
        const firstMessageId = req.query.firstMessageId; // Extract firstMessageId from request query params
        if (!firstMessageId) {
            return res.status(400).json({ error: 'firstMessageId is required in query params' });
        }

        const page = req.query.page || 1; // Extract page number from request query params, default to 1 if not provided
        const pageSize = 10; // Number of messages per page

        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;

        // Query messages from the Message table where id is less than firstMessageId
        const messages = await Message.findAll({
            where: {
                id: {
                    [Sequelize.Op.lt]: firstMessageId
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['name']
                }
            ],
            order: [['id', 'ASC']], // Order by id in ascending order to get older messages
            offset, // Offset to skip previous messages based on page number
            limit: pageSize // Limit the number of older messages to fetch per page
        });
        
        // Send the queried older messages as a response
        res.status(200).json({ olderMessages: messages, success: true });
    } catch (err) {
        console.log('Failed to get older messages', err);
        res.status(500).json({ error: err.message, success: false });
    }
};


