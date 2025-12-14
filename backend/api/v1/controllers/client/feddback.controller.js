const sendMailHelper = require("../../helper/sendMail");
const axios = require('axios');

// [POST]/api/v1/feedbacks
module.exports.feddback = async (req, res) => {
    const { email, name, message, captchaToken } = req.body;

    const captchaResponse = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: captchaToken
            }
        }
    );

    if (!captchaResponse.data.success) {
        return res.json({
            code: 400,
            message: "Xác minh CAPTCHA thất bại"
        });
    }

    // gửi otp qua email user
    const subject = `Bạn ${name} gửi phản hồi đến hệ thống!`;
    const html = `Email: <b>${email}</b><br>
                    <b>Nội dung: </b><br>
                    ${message}`;

    sendMailHelper.feedbackMail(email, subject, html);
    res.json({
        code: 200,
        message: "Gửi phản hồi thành công"
    });
};