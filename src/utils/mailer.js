import nodemailer from "nodemailer";

/*
Auth7 Mailer

Supports:
• DEV mode (console logs)
• SMTP mode (real emails)

SMTP config example:

smtp: {
    host: "smtp.gmail.com",
    port: 465,
    user: "example@gmail.com",
    pass: "app-password",
    from: "Auth7 <example@gmail.com>"
}
*/

export const createTransporter = (smtpConfig = {}) => {

    /* DEV MODE (No SMTP configured) */
    if (!smtpConfig.host) {

        console.log("⚠️ Auth7 running in DEV mail mode (emails logged to console)");

        return {
            sendMail: async ({ to, subject, html }) => {

                console.log("\n📧 AUTH7 DEV MAIL");
                console.log("================================");
                console.log("TO:", to);
                console.log("SUBJECT:", subject);
                console.log("CONTENT:");
                console.log(html);
                console.log("================================\n");

                return true;
            }
        };
    }

    /* SMTP MODE */
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,

        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        }
    });

    return {
        sendMail: async ({ to, subject, html }) => {

            await transporter.sendMail({
                from: smtpConfig.from || smtpConfig.user,
                to,
                subject,
                html
            });

            return true;
        }
    };
};