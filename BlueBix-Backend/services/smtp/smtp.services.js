const SmtpModel = require("./smtp.model");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");
const crypto = require('crypto');



/*
*  Check Email already Exist
*/
exports.is_exist_email = async (reqbody) => {
    try {
        let email_id_exist = await SmtpModel.findOne({ email: reqbody.email, email_type: reqbody.email_type }).lean();
        if (!email_id_exist) {
            return false;
        }
        return email_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Email already Exist
*/
exports.is_exist_email_user_wise = async (reqbody) => {
    try {
        let email_id_exist = await SmtpModel.findOne({ user_id: reqbody.user_id, email_type: reqbody.email_type }).lean();
        if (!email_id_exist) {
            return false;
        }
        return email_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Smtp Create
*/

exports.save = async (reqbody, user) => {
    try {

        const encrypto = {

            encrypt(text, password) {
                const key = password.repeat(32).substr(0, 32)
                const iv = password.repeat(16).substr(0, 16)
                const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)

                let encrypted = cipher.update(text, 'utf8', 'hex')
                encrypted += cipher.final('hex')
                return encrypted
            }

        }

        const key = process.env.ENCRYPT_DECRYPT_KEY

        if (reqbody.form_type == "create") {

            const encryptedMessage = encrypto.encrypt(reqbody.smtp_password, key)

            let smtp_create = {};

            smtp_create.email_type = reqbody.email_type,
                smtp_create.email_protocol = reqbody.email_protocol,
                smtp_create.email_encryption = reqbody.email_encryption,
                smtp_create.smtp_host = reqbody.smtp_host,
                smtp_create.smtp_port = reqbody.smtp_port,
                smtp_create.email = reqbody.email,
                // smtp_create.smtp_user_name = reqbody.smtp_user_name,
                smtp_create.smtp_password = encryptedMessage,
                smtp_create.email_charset = reqbody.email_charset || null,
                smtp_create.email_signature = reqbody.email_signature || null,
                smtp_create.user_id = reqbody.user_id,
                smtp_create.created_at = Date.now()
            smtp_create.updated_at = Date.now()
            smtp_create.created_by = user._id
            smtp_create.updated_by = user._id

            let create_smtp = await SmtpModel.create(smtp_create);

            return create_smtp
        }

        if (reqbody.form_type == "edit") {


            const encryptedMessage = encrypto.encrypt(reqbody.smtp_password, key)

            let smtp_update = {};

            smtp_update.email_type = reqbody.email_type;
            smtp_update.email_protocol = reqbody.email_protocol;
            smtp_update.email_encryption = reqbody.email_encryption;
            smtp_update.smtp_host = reqbody.smtp_host;
            smtp_update.smtp_port = reqbody.smtp_port;
            smtp_update.email = reqbody.email;
            // smtp_create.smtp_user_name = reqbody.smtp_user_name,
            smtp_update.smtp_password = encryptedMessage;
            smtp_update.email_charset = reqbody.email_charset || null;
            smtp_update.email_signature = reqbody.email_signature || null;
            smtp_update.user_id = reqbody.user_id;
            smtp_update.updated_at = Date.now();
            smtp_update.updated_by = user._id;


            let update_smtp_details = await SmtpModel.updateOne({ user_id: reqbody.user_id, email_type: reqbody.email_type }, smtp_update);

            return update_smtp_details
        }


    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Get Smtp Detail By Id
*/
exports.get_smtp_detail = async (id) => {
    try {
        let smtp_detail = await SmtpModel.find({ user_id: id }).lean();
        const encrypto = {

            // encrypt(text, password) {
            //   const key = password.repeat(32).substr(0, 32)
            //   const iv = password.repeat(16).substr(0, 16)
            //   const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)
            //   let encrypted = cipher.update(text, 'utf8', 'hex')
            //   encrypted += cipher.final('hex')
            //   return encrypted
            // },

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


        let obj = {}
        for (var i = 0; i <= smtp_detail.length - 1; i++) {

            if (smtp_detail[i].email_type == "send") {
                let email_send = {
                    _id: smtp_detail[i]._id,
                    email_type: smtp_detail[i].email_type,
                    email_protocol: smtp_detail[i].email_protocol,
                    email_encryption: smtp_detail[i].email_encryption,
                    smtp_host: smtp_detail[i].smtp_host,
                    smtp_port: smtp_detail[i].smtp_port,
                    email: smtp_detail[i].email,
                    smtp_password: encrypto.decrypt(smtp_detail[i].smtp_password, key),
                    email_charset: smtp_detail[i].email_charset,
                    email_signature: smtp_detail[i].email_signature,
                    user_id: smtp_detail[i].user_id,
                }
                obj["email_send"] = email_send;
            }
            if (smtp_detail[i].email_type == "receive") {
                let email_receive = {
                    _id: smtp_detail[i]._id,
                    email_type: smtp_detail[i].email_type,
                    email_protocol: smtp_detail[i].email_protocol,
                    email_encryption: smtp_detail[i].email_encryption,
                    smtp_host: smtp_detail[i].smtp_host,
                    smtp_port: smtp_detail[i].smtp_port,
                    email: smtp_detail[i].email,
                    smtp_password: encrypto.decrypt(smtp_detail[i].smtp_password, key),
                    email_charset: smtp_detail[i].email_charset,
                    email_signature: smtp_detail[i].email_signature,
                    user_id: smtp_detail[i].user_id,
                }
                obj["email_receive"] = email_receive;
            }
        }


        return obj;

    } catch (error) {
        console.error("Error : ", error);
    }
};




/*
*  Email Send Check User Exits with Email Type
*/
exports.email_send = async (reqbody) => {
    try {
        let email_id_exist = await SmtpModel.findOne({ email: reqbody.email, email_type: 'send' }).lean();
        if (!email_id_exist) {
            return false;
        }
        return email_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};
/*
*  Email Send Check User Exits with Email Type & User
*/
exports.email_send_with_user = async (reqbody, req) => {
    try {
        let email_id_exist = await SmtpModel.findOne({ email: reqbody.email, email_type: 'send', user_id: req.user._id }).lean();
        if (!email_id_exist) {
            return false;
        }
        return email_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};
