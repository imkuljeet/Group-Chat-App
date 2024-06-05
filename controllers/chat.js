const User = require('../models/users');
const Group = require('../models/group');
const { Op } = require('sequelize');
const GroupUser = require('../models/groupUser');

exports.addParticipant = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find the user by email
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(204).json({ message: 'Email is not registered' });
        }

        // Create a new group and add the requesting user as an admin
        const newGroup = await req.user.createGroup();
        await newGroup.addUser(req.user, {
            through: { isAdmin: true }
        });

        // Uncomment the following lines if you want to add the user to the group
        // await newGroup.addUser(user, {
        //     through: { isAdmin: false }
        // });

        res.status(200).json({ group: newGroup, message: 'Added new user to group' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.setGroupName = async (req, res, next) => {
    try {
        const { groupname, groupid } = req.body;

        // Validate the group name
        if (typeof groupname !== 'string' || groupname.trim().length === 0) {
            return res.status(400).json({ message: 'Invalid group name' });
        }

        // Find the group by ID and update the name
        const group = await Group.findByPk(groupid);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await group.update({ name: groupname });

        res.status(200).json({ message: 'Group name updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getGroups = async (req, res, next) => {
    try {
        const groups = await req.user.getGroups();

        if (groups.length === 0) {
            return res.status(200).json({ message: 'No groups currently' });
        }

        res.status(200).json({ groups });
    } catch (error) {
        console.error("Backend catch error", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getMembers = async(req,res,next) => {
    try {
        const groupId = +req.query.groupId;
        // console.log(groupId);
        const members = await GroupUser.findAll({where: {groupId: groupId}})
        // console.log(members);
        let membersToSend = [];
        for(let i = 0; i < members.length; i++) {
            const user = await User.findByPk(members[i].userId)
            if(user) {
                let newPart = {};
                const userInGroupUser = await GroupUser.findOne({where: {[Op.and]: [{userId: user.id}, {groupId: groupId}]}})
                newPart['isAdmin'] = userInGroupUser.isAdmin;
                const userToSend = {
                    ...user,
                    ...newPart
                }
                membersToSend.push(userToSend);
                // console.log("chat file newPart", newPart);
                // console.log("chat file useringroup",userInGroupUser);
            }
        }
        res.status(200).json({members: membersToSend});
    }
    catch(error) {
        console.log(error);
        res.status(500).json({message: 'something went wrong'});
    }
}