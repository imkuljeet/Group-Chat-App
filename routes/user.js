const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const msgController = require('../controllers/message');
const authorization = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login',userController.login);
router.post('/message', authorization.authenticate, msgController.postMessage)


module.exports = router;
