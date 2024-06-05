const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true });

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: email,
                subject: 'Password Reset Request',
                text: 'Please click on the link below to reset your password.',
                html: `<h1>Click on the link below to reset the password.</h1><a href="${process.env.WEBSITE}/password/resetpassword/${id}">Reset password</a>`
            };

            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            res.status(200).json({ message: 'Email sent successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error handling password reset:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
};

const resetpassword = async (req, res) => {
    const { id } = req.params;

    try {
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });

        if (forgotpasswordrequest) {
            await forgotpasswordrequest.update({ active: false });

            res.status(200).send(`<html>
            <script>
                function formsubmitted(e){
                    e.preventDefault();
                    console.log('called')
                }
            </script>
            <form action="/password/updatepassword/${id}" method="get">
                <label for="newpassword">Enter New password</label>
                <input name="newpassword" type="password" required></input>
                <button>reset password</button>
            </form>
        </html>`
        )
        res.end()
        } else {
            res.status(404).json({ error: 'Reset password request not found', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const resetpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });
        if (!resetpasswordrequest) {
            return res.status(404).json({ error: 'Reset password request not found', success: false });
        }

        const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });
        if (!user) {
            return res.status(404).json({ error: 'No user exists', success: false });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newpassword, salt);

        await user.update({ password: hash });

        res.status(201).json({ message: 'Successfully updated the new password' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}