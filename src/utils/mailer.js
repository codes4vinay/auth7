//Currently not implemented
import nodemailer from "nodemailer";

export const createTransporter = (smtpConfig) => {

    /* DEV MODE (No SMTP) */
    if (!smtpConfig?.host) {

        console.log("⚠️ Running in DEV mail mode (No SMTP)");

        return {
            sendMail: async (mail) => {

                console.log("\n📧 DEV MAIL");
                console.log("================================");
                console.log("TO:", mail.to);
                console.log("SUBJECT:", mail.subject);
                console.log("CONTENT:");
                console.log(mail.html);
                console.log("================================\n");
            }
        };
    }

    /* PROD MODE (Real SMTP) */
    return nodemailer.createTransport({

        host: smtpConfig.host,
        port: smtpConfig.port,

        secure: smtpConfig.port === 465,

        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        }
    });
};
