const User = require('../models/users');
const Group = require('../models/group');
const GroupUser = require('../models/groupUser');
const { Op } = require('sequelize');

exports.addUser = async (req,res,next) => {
    try {
        const groupId = req.body.groupId;
        const email = req.body.email;
        // console.log("admin groupId", groupId);
        // console.log("admin email", email);
        const userToBeAdded = await User.findOne({where: {email: email}})
        // console.log("this user needs to be added", userToBeAdded)
        if(!userToBeAdded) {
            return res.status(400).json({message: 'Member to be Added is not registered'});
        }
        const verifiedAdmin = await GroupUser.findOne({where: {[Op.and]: [{userId: req.user.id}, {isAdmin: true}, {groupId: groupId}]}})
        if(!verifiedAdmin) {
            return res.status(403).json({message: 'you dont have permissions'})
        }
        // console.log("this admin is verified", verifiedAdmin)
        const group = await Group.findByPk(groupId)
        await group.addUser(userToBeAdded, {
            through: {isAdmin: false}
        })
        res.status(200).json({message: `${userToBeAdded.name} Added to Group`})
    }
    catch(err) {
        console.log(err);
        res.status(500).json('something went wrong')
    }
}

exports.makeAdmin = async (req,res,next) => {
    try {
        const userIdToBeMadeAdmin = req.body.userId;
        // console.log("Make this user admin", userIdToBeMadeAdmin)
        const groupId = req.body.groupId;
        // console.log("this is makeAdmin groupid", groupId);
        const user = await User.findByPk(userIdToBeMadeAdmin);
        if(!user) {
            return res.status(400).json({message: 'Member to be Added is Not Registered'});
        }
        const verifiedAdmin = await GroupUser.findOne({where: {[Op.and]: [{userId: req.user.id}, {isAdmin: true}, {groupId: groupId}]}});
        if(!verifiedAdmin){
            return res.status(403).json({message: 'You Do Not Have Permission'});
        };
        // console.log(verifiedAdmin,"verifiedadmin")
        let memberToBeUpdated = await GroupUser.findOne({where: {[Op.and]: [{userId: userIdToBeMadeAdmin}, {groupId: groupId}]}});
        await memberToBeUpdated.update({isAdmin: true});
        res.status(200).json({message: `${user.name} is Admin Now`});
    }
    catch (error) {
        console.log(error);
        res.status(500).json('Something Went Wrong');
    }
}

exports.removeUserFromGroup = async(req,res,next) => {
    try {
        const userIdToBeRemoved = req.body.userId;
        const groupId = req.body.groupId;
        const user = await User.findByPk(userIdToBeRemoved);
        // console.log(user)
        if(!user) {
            return res.status(400).json({message: 'Member to be Removed is Not Registered'});
        }
        const verifiedAdmin = await GroupUser.findOne({where: {[Op.and]: [{userId: req.user.id}, {isAdmin: true}, {groupId: groupId}]}});
        if(!verifiedAdmin){
            return res.status(403).json({message: 'You Do Not Have Permission'});
        };
        let memberToBeRemoved = await GroupUser.findOne({where: {[Op.and]: [{userId: userIdToBeRemoved}, {groupId: groupId}]}});
        await memberToBeRemoved.destroy();
        res.status(200).json({message: `${user.name} Removed From Group`});  
    }
    catch(error) {
        console.log(error);
        res.status(500).json('something went wrong');
    }
}

exports.removeAdminPermission = async(req,res,next) => {
    try {
        const userIdToBeUpdated = req.body.userId;
        const groupId = req.body.groupId;
        const user = await User.findByPk(userIdToBeUpdated);
        if(!user) {
            return res.status(400).json({message: 'member to be removed as admin is no more registered'});
        }
        const verifiedAdmin = await GroupUser.findOne({where: {[Op.and]: [{userId: req.user.id}, {isAdmin: true}, {groupId: groupId}]}});
        if(!verifiedAdmin){
            return res.status(403).json({message: 'you dont have permissions'});
        };
        let memberToBeUpdated = await GroupUser.findOne({where: {[Op.and]: [{userId: userIdToBeUpdated}, {groupId: groupId}]}});
        await memberToBeUpdated.update({isAdmin: false});
        res.status(200).json({message: `${user.name} Removed as Admin`});  
    }
    catch(error) {
        console.log(error);
        res.status(500).json('something went wrong');
    }
}