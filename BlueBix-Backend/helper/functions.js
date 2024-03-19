const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { customResponse, customErrorResponse } = require("./commonResponse");
const Validator = require("validator");
const isEmpty = require("../validations/is-empty");
const { get_smtp_detail } = require("../services/smtp/smtp.services");
const Imap = require("imap"),
  inspect = require("util").inspect,
  he = require("he"),
  quotedPrintable = require("quoted-printable"),
  cheerio = require("cheerio");

//Password convert into hash
exports.hashPassword = async (password, saltRounds = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  // Hash password
  return await bcrypt.hash(password, salt);
};

//Password match
exports.matchPassword = async (password, encryptedPassword) => {
  const password_match = await bcrypt.compare(password, encryptedPassword);
  return password_match;
};

exports.randomPassword = (len) => {
  const threshold = 2;
  return Math.random()
    .toString(16)
    .substring(threshold, len + threshold);
};

exports.isValidObjectId = (id) => {
  const { ObjectId } = require("mongodb");
  return ObjectId.isValid(id);
};

exports.validateId = async (res, id, modelName, fieldName) => {
  if (!this.isValidObjectId(id))
    return customErrorResponse(res, 422, "Something went wrong", {
      [fieldName]: `${fieldName} invalid`,
    });

  const document = await modelName.findOne({ _id: id });
  if (!document)
    return customErrorResponse(res, 422, "Something went wrong", {
      [fieldName]: `${fieldName} does not exist`,
    });
};

exports.commonValidation = (req, res) => {
  let errors = {};

  if (req.body.current_page)
    req.body.current_page = req.body.current_page.toString();
  if (Validator.isEmpty(req.body.current_page)) {
    errors.current_page = "Current page is required";
  }
  if (Validator.isEmpty(req.body.per_page)) {
    errors.per_page = "Per page is required";
  }
  if (Validator.isEmpty(req.body.sort_order)) {
    errors.sort_order = "Sort order is required";
  }
  if (Validator.isEmpty(req.body.order)) {
    errors.order = "Order is required";
  }
  return {
    errors,
    isValid: isEmpty(errors),
  };
};

function decodeQuotedPrintable(input) {
  return input.replace(/=([0-9A-F]{2})/g, (match, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
}

// function getHtml(message) {
//   // message = decodeQuotedPrintable(message)
//   const lines = message.split('\n');

//   // Find the index of the line with 'Content-Type: text/html;'
//   const htmlContentTypeIndex = lines.findIndex(line => line.includes('Content-Type: text/html;'));
//   console.log('htmlContentTypeIndex :>>', htmlContentTypeIndex);
//   if (htmlContentTypeIndex != -1) {
//     console.log('htmlContentTypeIndex :>>', htmlContentTypeIndex);
//     // Extract the HTML content lines starting from the next line
//     const htmlContentLines = lines.slice(htmlContentTypeIndex + 1);

//     // Remove the line with 'Content-Transfer-Encoding: quoted-printable'
//     const cleanedHtmlContentLines = htmlContentLines.filter(line => !line.includes('Content-Transfer-Encoding'));

//     // Join the lines to form the HTML content
//     const htmlContent = cleanedHtmlContentLines.join('');

//     // Decode quoted-printable content and remove whitespace
//     const decodedHtmlContent = decodeQuotedPrintable(htmlContent);
//     const strippedHtmlContent = decodedHtmlContent.replace(/\s+/g, ' ');
//     const filteredHtmlContent = strippedHtmlContent.replace(/--.*--/g, '');

//     return filteredHtmlContent
//   } else {
//     return ''
//   }
// }

function getHtml(message) {
  const startDelimiter = "<body";
  const endDelimiter = "</body>";

  const startDelimiterTable = "<table";
  const endDelimiterTable = "</table>";

  const startDelimiterDiv = "<div";
  const endDelimiterDiv = "</div>";


  const startIndex = message.indexOf(startDelimiter);
  const endIndex = message.lastIndexOf(endDelimiter);

  const startIndexTable = message.indexOf(startDelimiterTable);
  const endIndexTable = message.lastIndexOf(endDelimiterTable);

  const startIndexDiv = message.indexOf(startDelimiterDiv);
  const endIndexDiv = message.lastIndexOf(endDelimiterDiv);


  if (startIndex !== -1 && endIndex !== -1) {
    const htmlContent = message.substring(
      startIndex,
      endIndex + endDelimiter.length
    );
    return htmlContent;
  } else if (startIndexTable !== -1 && endIndexTable !== -1) {
    const htmlContent = message.substring(
      startIndexTable,
      endIndexTable + endDelimiterTable.length
    );
    return htmlContent;
  } else if (startIndexDiv !== -1 && endIndexDiv !== -1) {
    const htmlContent = message.substring(
      startIndexDiv,
      endIndexDiv + endDelimiterDiv.length
    );

    return htmlContent;
  } else {
    console.log("message", message);
    return "N/A";
  }
}

exports.getEmailList = async function (req, fetchLimit, imap) {
  let inboxList = [];
  const openBoxFolder =
    req.params.folderName == "inbox" ? "INBOX" : "[Gmail]/Sent Mail";
  // const openBoxFolder = '[Gmail]/Sent Mail'

  const box = await new Promise((resolve, reject) => {
    imap.openBox(openBoxFolder, false, (err, box) => {
      if (err) reject(err);
      resolve(box);
    });
  });
  console.log("totalMessage :>>", box.messages.total);

  const fetchObj = {
    startLimit:
      req.body.start == "1"
        ? box.messages.total
        : parseInt(box.messages.total) - (parseInt(req.body.start) - 1),
    limit: parseInt(box.messages.total) - (parseInt(req.body.limit) - 1),
  };
  const totalFetchLimit = `${fetchObj.startLimit}:${fetchObj.limit}`;
  console.log("totalFetchLimit :>>", totalFetchLimit);

  const f = imap.seq.fetch(totalFetchLimit, {
    bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
    struct: true,
  });

  f.on("message", function (msg, seqno) {
    var prefix = "(#" + seqno + ") ";
    var htmlContent = "";
    var htmlContentArr = [];
    var headerData = {};
    var attachmentsArray = [];
    let uid = "";

    msg.on("body", function (stream, info) {
      var buffer = "";
      stream.on("data", function (chunk) {
        buffer += chunk.toString("utf8");
      });
      stream.once("end", function () {
        headerData = Imap.parseHeader(buffer);
        if (info.which === "TEXT") {
          htmlContentArr.push(buffer);
          // htmlContent = buffer;
        }
      });

      // simpleParser(stream, async (err, parsed) => {
      //     const { attachments } = parsed;
      //     console.log('attachments :>>', attachments);
      // });
    });

    msg.once("attributes", async function (attrs) {
      // console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
      // console.log('Message structure:', attrs.struct);

      uid = attrs.uid;

      // Mail mark as read
      await new Promise((resolve) => {
        imap.addFlags(uid, ["\\Seen"], () => {
          console.log("Marked as read!");
          resolve();
        });
      });
    });

    msg.once("end", function () {
      htmlContent = htmlContentArr.join("");
      // attachmentsArray.forEach((attachment, index) => {
      //     console.log('attachment :>>', attachment);
      // });

      let html = getHtml(htmlContent);
      if (!html) html = htmlContent;

      // const pattern = /<!DOCTYPE[^>]*>((.|[\n\r])*)<\/html>/i;
      // const match = pattern.exec(htmlContent);
      // const resultHTml = match ? match[0] : htmlContent;

      const decodedEmail = quotedPrintable.decode(html);
      const cleanEmail = decodedEmail.replace(/\s+/g, " ");
      const $ = cheerio.load(cleanEmail);

      $("head").append(
        $('<style type="text/css">').text(
          `@media screen and (max-width: 500px) {#groups-footer-text {padding-top: 40px;}}`
        )
      );

      const modifiedHTML = $.html();
      const reModifiedHTML = he.decode(modifiedHTML);

      let obj = {
        uid: uid,
        seqno: seqno,
        html: reModifiedHTML.trim(),
        headerData: headerData,
      };
      inboxList.push(obj);
    });
  });

  await new Promise((resolve) => {
    f.once("error", function (err) {
      console.log("Fetch error: " + err);
      resolve();
    });

    f.once("end", function () {
      console.log("Done fetching all messages!");
      imap.end();
      resolve();
    });
  });

  return {
    messageList: inboxList.reverse(),
    totalMessageCount: box.messages.total,
  }; // Return the inboxList after fetching emails
};

exports.decrypt = function (text) {
  let password = process.env.ENCRYPT_DECRYPT_KEY;
  const key = password.repeat(32).substr(0, 32);
  const iv = password.repeat(16).substr(0, 16);
  const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

exports.getLoginUserSmtp = async function (req) {
  return await get_smtp_detail(req.user._id);
};
