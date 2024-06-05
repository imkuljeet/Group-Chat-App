const User = require('../models/users');
const Group = require('../models/group');
const GroupUser = require('../models/groupUser');
const { Op } = require('sequelize');

exports.addUser = async (req, res, next) => {
    try {
        const { groupId, email } = req.body;

        // Find the user to be added by email
        const userToBeAdded = await User.findOne({ where: { email } });
        if (!userToBeAdded) {
            return res.status(400).json({ message: 'Member to be added is not registered' });
        }

        // Verify if the requester is an admin of the group
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                userId: req.user.id,
                isAdmin: true,
                groupId
            }
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: 'You do not have permissions' });
        }

        // Find the group and add the user to the group
        const group = await Group.findByPk(groupId);
        await group.addUser(userToBeAdded, { through: { isAdmin: false } });

        res.status(200).json({ message: `${userToBeAdded.name} added to group` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.makeAdmin = async (req, res, next) => {
    try {
        const { userId, groupId } = req.body;

        // Find the user to be made admin
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Member to be added is not registered' });
        }

        // Verify if the requester is an admin of the group
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                userId: req.user.id,
                isAdmin: true,
                groupId
            }
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: 'You do not have permission' });
        }

        // Find the group user record and update the isAdmin status
        let memberToBeUpdated = await GroupUser.findOne({
            where: {
                userId,
                groupId
            }
        });
        if (!memberToBeUpdated) {
            return res.status(404).json({ message: 'Member not found in the group' });
        }
        
        await memberToBeUpdated.update({ isAdmin: true });

        res.status(200).json({ message: `${user.name} is admin now` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.removeUserFromGroup = async (req, res, next) => {
    try {
        const { userId, groupId } = req.body;

        // Find the user to be removed
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Member to be removed is not registered' });
        }

        // Verify if the requester is an admin of the group
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                userId: req.user.id,
                isAdmin: true,
                groupId
            }
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: 'You do not have permission' });
        }

        // Find the group user record and remove the user from the group
        let memberToBeRemoved = await GroupUser.findOne({
            where: {
                userId,
                groupId
            }
        });
        if (!memberToBeRemoved) {
            return res.status(404).json({ message: 'Member not found in the group' });
        }

        await memberToBeRemoved.destroy();
        res.status(200).json({ message: `${user.name} removed from group` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.removeAdminPermission = async (req, res, next) => {
    try {
        const { userId, groupId } = req.body;

        // Find the user to be updated
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(400).json({ message: 'Member to be removed as admin is not registered' });
        }

        // Verify if the requester is an admin of the group
        const verifiedAdmin = await GroupUser.findOne({
            where: {
                userId: req.user.id,
                isAdmin: true,
                groupId
            }
        });
        if (!verifiedAdmin) {
            return res.status(403).json({ message: 'You do not have permission' });
        }

        // Find the group user record and update the isAdmin status
        let memberToBeUpdated = await GroupUser.findOne({
            where: {
                userId,
                groupId
            }
        });
        if (!memberToBeUpdated) {
            return res.status(404).json({ message: 'Member not found in the group' });
        }

        await memberToBeUpdated.update({ isAdmin: false });

        res.status(200).json({ message: `${user.name} removed as admin` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
