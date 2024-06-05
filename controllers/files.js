const S3Service = require('../services/S3services');
const GroupFiles = require('../models/groupfiles');
const Message = require('../models/messages');

exports.downloadFiles = async (req, res, next) => {
    try {
        const { buffer: file, originalname: fileName } = req.file;
        const { id, name } = req.user.dataValues;
        const { groupId } = req.params;

        const fileUrl = await S3Service.uploadToS3(file, fileName);

        await GroupFiles.create({ url: fileUrl, groupId });
        await Message.create({ message: fileUrl, username: name, userId: id, groupId });

        res.status(200).json({ message: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ fileUrl: '', success: false, err });
    }
};
