const Message = require('../models/messages');
const User = require('../models/users');
const sequelize = require('../util/database');

exports.postMessage = async(req,res,next) => {
    const t = await sequelize.transaction();
    try {
        const {message} = req.body;
        const data = await Message.create({message:message, userId:req.user.id}, {transaction:t});
        await t.commit();
        res.status(200).json({success: true});
    }
    catch(err) {
        await t.rollback();
        res.status(500).json({success:false,error:err})
    }
}