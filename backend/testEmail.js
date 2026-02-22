// Quick email test — run with: node testEmail.js
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', JSON.stringify(process.env.EMAIL_PASS)); // show exact value including trailing spaces

(async () => {
    try {
        await sendEmail({
            to: process.env.EMAIL_USER, // send to yourself
            subject: 'IPS Forum - Test Email',
            html: '<h2>It works!</h2><p>Email sending is configured correctly.</p>',
        });
        console.log('✅ Email sent successfully!');
    } catch (err) {
        console.error('❌ Email failed:', err.message);
        if (err.responseCode) console.error('   Response code:', err.responseCode);
        if (err.command) console.error('   Failed command:', err.command);
    }
    process.exit(0);
})();
