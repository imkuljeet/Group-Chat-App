const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const msgController = require('../controllers/message');
const authorization = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login',userController.login);
router.post('/message', authorization.authenticate, msgController.postMessage);
router.get('/get-message', authorization.authenticate, msgController.getMessage);
router.get('/get-message-new',authorization.authenticate,msgController.getMessageNew);
router.get('/get-older-messages',authorization.authenticate,msgController.getOlderMessages);

module.exports = router;
