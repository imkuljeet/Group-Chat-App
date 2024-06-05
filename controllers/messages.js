const Message = require('../models/messages');
const Group = require('../models/group');
const GroupUser = require('../models/groupUser');
const { Op } = require("sequelize");

function isValidMessage(message) {
    if(typeof message === 'string' && message.length > 0){
        return true;
    } else {
        return false;
    }
}

exports.saveMessage = async (req, res, next) => {
    try {
        const { message, groupId } = req.body;

        // Validate the message
        if (!isValidMessage(message)) {
            return res.status(400).json({ message: 'Invalid message format' });
        }

        // Check if the user is part of the group
        const groupUser = await GroupUser.findOne({
            where: {
                groupId,
                userId: req.user.id
            }
        });
        if (!groupUser) {
            return res.status(403).json({ message: 'User not found in group' });
        }

        // Save the message to the database
        await req.user.createMessage({
            message,
            groupId,
            username: req.user.name
        });

        res.status(200).json({ message: 'Message saved to database' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.fetchNewMessages = async (req, res, next) => {
    try {
        const lastMsgId = +req.query.lastMsgId; // Convert string to integer
        const groupId = +req.query.groupId;

        // Fetch new messages
        const messages = await Message.findAll({
            where: {
                id: { [Op.gt]: lastMsgId },
                groupId
            }
        });

        if (messages.length > 0) {
            res.status(200).json({ messages });
        } else {
            res.status(201).json({ message: 'No new messages' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch messages' });
    }
};

