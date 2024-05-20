const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'views' });
});

router.get('/home', (req, res) => {
    res.sendFile('home.html', { root: 'views' });
});

router.get('/signup', (req, res) => {
    res.sendFile('signup.html', { root: 'views' });
});

router.get('/forgotpasswordss', (req, res) => {
    res.sendFile('forgotPassword.html', { root: 'views' });
});

router.get('/chatapp', (req, res) => {
    res.sendFile('chatApp.html', { root: 'views' });
});

router.get('/createchat', (req, res) => {
    res.sendFile('createChat.html', { root: 'views' });
});

router.get('/namethegroup', (req, res) => {
    res.sendFile('nameTheGroup.html', { root: 'views' });
});

router.get('/newmember', (req, res) => {
    res.sendFile('newMember.html', { root: 'views' });
});

module.exports = router;