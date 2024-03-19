const SmtpService = require("./smtp.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateSmtpInput = require("../../validations/admin/smtp/smtpCreate");
const validateEmailTestInput = require("../../validations/admin/smtp/emailSend");
const validateEmailSendInput = require("../../validations/admin/smtp/emailTest");
const isEmpty = require("../../validations/is-empty");
const simpleParser = require('mailparser').simpleParser;
const crypto = require('crypto');
const mail = require("../../helper/email/index");







module.exports = {


    /*
    *  Create SMTP
    */
    createSmtp: async (req, res, next) => {
        try {

            if (!req.user) {
                return commonResponse.customErrorResponse(res, 401, "Invalid User login", "Invalid Login credential");
            }

            let user = req.user;

            const { errors, isValid } = validateSmtpInput(req.body);


            if (req.body.form_type == "create") {

                let is_exist_email = await SmtpService.is_exist_email_user_wise(req.body);
                if (is_exist_email) {
                    errors.email = "Email is already Exist"
                }
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let smtp_create = await SmtpService.save(req.body, user);

            if (smtp_create) {
                commonResponse.success(res, 200, smtp_create, 'Smtp Create Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, smtp_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
     *   Get Detail Of All Email by Email Id
     */
    emailDetailsImap: async (req, res, next) => {
        try {

            var Imap = require('imap'),
                inspect = require('util').inspect;

            var imap = new Imap({
                user: 'test.knptech@gmail.com', //test.knptech@gmail.com
                password: '27WLZEAShPNqXeUn',     //27WLZEAShPNqXeUn
                host: 'imap.gmail.com',             //'imap.gmail.com'
                port: 993,   //993
                tls: true,
                tlsOptions: {
                    rejectUnauthorized: false
                },
                authTimeout: 3000
            });

            var email_array = [];
            var email_details_data = [];
            function openInbox(cb) {
                imap.openBox('INBOX', true, cb);
            }


            imap.once('ready', function () {
                openInbox(function (err, box) {
                    if (err) throw err;
                    var f = imap.seq.fetch('1:50', {
                        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
                        struct: true
                    });
                    f.on('message', function (msg, seqno) {
                        msg.on('body', async function (stream, info) {
                            let parsed = await simpleParser(stream);

                            email_details_data.push(parsed)
                            //    commonResponse.success(res, 200, email_details_data, 'Email List Successfully');

                            // the parsed will contains all information is in json object format
                        });
                    })
                    // this will occurs when any error occurs while fetching emails
                    f.on('error', function (err) {
                        console.log(err)
                    })

                    f.on('end', function () {
                        imap.end();

                    })


                });


            });

            imap.once('error', function (err) {
                console.log(err);
            });

            imap.once('end', function () {
                console.log('Connection ended');
                commonResponse.success(res, 200, email_details_data, 'Email List Successfully');

            });

            imap.connect();

            // } else {
            //     return commonResponse.customResponse(res, "SMTP", 400, {}, "Email does not exist");
            // }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Get Smtp Detail By Id
    */
    getDetailsOfSmtp: async (req, res, next) => {
        try {


            let smtp_details = await SmtpService.get_smtp_detail(req.params.id);

            if (smtp_details) {
                commonResponse.success(res, 200, smtp_details, 'Smtp Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, smtp_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   Email Send TO Multiple User
    */
    emailSendTOMultipleUser: async (req, res, next) => {
        try {

            const { errors, isValid } = validateEmailSendInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let email_send_user_detail = await SmtpService.email_send_with_user(req.body, req);

            if (email_send_user_detail) {
                const encrypto = {
                    decrypt(text, password) {
                        const key = password.repeat(32).substr(0, 32)
                        const iv = password.repeat(16).substr(0, 16)
                        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
                        let decrypted = decipher.update(text, 'hex', 'utf8')
                        decrypted += decipher.final('utf8')
                        return decrypted
                    }
                }

                const key = process.env.ENCRYPT_DECRYPT_KEY


                let user_password = encrypto.decrypt(email_send_user_detail.smtp_password, key)

                const mail_option = {
                    filename: "mail_send",
                    data: req.body.message,
                    subject: req.body.subject,
                    from_user_email: email_send_user_detail.email,
                    from_user_password: user_password,
                    smtp_host: email_send_user_detail.smtp_host,
                    smtp_port: email_send_user_detail.smtp_port,
                    user: {
                        email: req.body.to
                    },
                };

                // Send attachment
                if (!isEmpty(req.body.attachment && req.body.attachment.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
                    // const base64Data = 'data:text/csv;base64,Rm9yZW5hbWUgMSxGb3JlbmFtZSAyLFN1cm5hbWUsTklOTyxTVEFSVERBVEUsVGl0bGUsRE9CLFNFWCxQQVlST0xMTk8sUEFZU1RBUlQsUEFZUEVSSU9ELFBBWUZSRVEsRU5ST0wgREFURSxQT1NUUE9ORU1FTlQgREFURSxBU1NFU1NNRU5ULEFERFJFU1MgMSxBRERSRVNTIDIsQUREUkVTUyAzLEFERFJFU1MgNCxBRERSRVNTIDUsUE9TVENPREUsRU1BSUwsU0FMIFNBQ1JJRklDRSxFRSBDT05UUyxFUiBDT05UUyxBVkNTLE9QVElOLE9QVE9VVCxHUk9TUyBQQVksRVhJVCBEQVRFLEVFIENPTlQgJSxFUiBDT05UICUsUEFZIENPREUsRVIgQ09ERSxTQ0hFTUUgQ09ERSxQRU5TSU9OQUJMRSBFQVJOSU5HUw0K';
                    const base64Data = req.body.attachment;
                    const attachment = {
                        path: base64Data,
                    };
                    mail_option.attachments = [attachment]
                }
                var send_mail = await mail.send(mail_option);
                commonResponse.success(res, 200, "email send", 'Email Send');
            }
            else {
                if (email_send_user_detail == false) {
                    return commonResponse.customResponse(res, "SMTP", 400, email_send_user_detail, "Email does not Exit");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, email_send_user_detail, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },



    /*
    *   Email Test By Email Id
    */
    emailTest: async (req, res, next) => {
        try {

            const { errors, isValid } = validateEmailTestInput(req.body);

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let user_email_detail = await SmtpService.email_send_with_user(req.body, req);

            if (user_email_detail) {


                const encrypto = {

                    decrypt(text, password) {
                        const key = password.repeat(32).substr(0, 32)
                        const iv = password.repeat(16).substr(0, 16)
                        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv)
                        let decrypted = decipher.update(text, 'hex', 'utf8')
                        decrypted += decipher.final('utf8')
                        return decrypted
                    }

                }

                const key = process.env.ENCRYPT_DECRYPT_KEY


                let user_password = encrypto.decrypt(user_email_detail.smtp_password, key)

                const mail_option = {
                    filename: "mail_send",
                    data: "Thank You For Joining With Us.",
                    // data:req.body.message,
                    subject: "Test Email",
                    from_user_email: user_email_detail.email,
                    from_user_password: user_password,
                    smtp_host: user_email_detail.smtp_host,
                    smtp_port: user_email_detail.smtp_port,
                    user: {
                        email: req.body.to
                    },
                };
                var send_mail = await mail.send(mail_option);
                commonResponse.success(res, 200, "email send", 'Email Send');
            }
            else {
                if (user_email_detail == false) {
                    return commonResponse.customResponse(res, "SMTP", 400, user_email_detail, "Email does not Exit");
                }
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, user_email_detail, 'Something went wrong, Please try again');
            }
        } catch (error) {

            // console.log("this is else block is called",error);
            return commonResponse.customResponse(res, "SMTP", 400, error, 'Something went wrong, Please try again');
            // return next(error);
        }
    },


}