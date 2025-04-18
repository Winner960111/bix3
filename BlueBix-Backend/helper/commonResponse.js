let messages = require("./resources/messages.json");

const getMessage = (code, defaultcode) => {
  return messages[code] ? messages[code] : messages[defaultcode];
};

exports.getErrorMessage = (code, defaultcode) => {
  return getMessage(code, defaultcode);
};

exports.error = (res, code = "", statusCode = 400) => {
  const resData = {
    error: true,
    message: getMessage(code, "DEFAULT"),
    statusCode: statusCode,
    messageCode: code,
  };
  return res.status(statusCode).json(resData);
};

exports.success = (res, statusCode = 200, data = {}, message) => {
  const resData = {
    error: false,
    message: message,
    statusCode: statusCode,
    data,
  };


  return res.status(statusCode).json(resData);
};

exports.customSuccess = (response) => {
  return res.status(200).json(response);
};

exports.customResponse = (res, code = "", statusCode = 200, data = {}, message = getMessage(code, "DEFAULT")) => {
  const resData = {
    error: true,
    message: message,
    statusCode: statusCode,
    messageCode: code,
    data,
  };
  return res.status(statusCode).json(resData);
};

exports.customErrorResponse = (res, statusCode = 200, message, errors = {}) => {
  const resData = {
    error: true,
    statusCode: statusCode,
    message: message,
    errors,
  };
  return res.status(statusCode).json(resData);
};

exports.notFound = (res, code, statusCode = 404) => {
  const resData = {
    error: true,
    statusCode: statusCode,
    message: getMessage(code, "DEFAULTERR") || "Invalid request data",
    data: {},
    messageCode: code,
  };
  return res.status(statusCode).send(resData);
};

exports.unAuthentication = (res, data, code = "", statusCode = 401) => {
  const resData = {
    error: true,
    statusCode: statusCode,
    message: getMessage(code, "DEFAULT_AUTH"),
    data,
    messageCode: code ? code : "DEFAULT_AUTH",
  };
  return res.status(statusCode).send(resData);
};


exports.validateResp = (errorObj) => {
  const outputObject = {};
  for (const key in errorObj) {
    if (errorObj.hasOwnProperty(key)) {
      outputObject[key] = errorObj[key].message;
    }
  }

  const result = { "errors": outputObject };
  return outputObject
}