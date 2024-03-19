const messageService = require("./message.service");
const { commonResponse, commonFunctions } = require("../../helper");
const validateCreateMessage = require("../../validations/admin/message/createMessage");
const isEmpty = require("../../validations/is-empty");

module.exports = {
  /*
   *  Add message
   */
  addMessage: async (req, res, next) => {
    try {
      const { errors, isValid } = validateCreateMessage(req.body);

      if (!isValid || !isEmpty(errors)) {
        return commonResponse.customErrorResponse(
          res,
          422,
          "Something went wrong",
          errors
        );
      }

      let message = await messageService.save(req.body);

      if (message) {
        commonResponse.success(res, 201, message, "Message added successfully");
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          message,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Freelance request to BDM -> ", error);
      return next(error);
    }
  },

  /*
   *  All List Messages
   */
  listMessages: async (req, res, next) => {
    try {
      let data = {};

      let message_listing = await messageService.message_listing(req.body);

      if (message_listing) {
        commonResponse.success(res, 200, message_listing, "Message Listing");
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          message_listing,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.log("Listing messages -> ", error);
      return next(error);
      console.log("Create User -> ", error);
      return next(error);
    }
  },

  updateMessage: async (req, res, next) => {
    try {
      let updateMessageData = await messageService.updateReadMessageFlag(
        req.body
      );
      if (updateMessageData) {
        commonResponse.success(
          res,
          200,
          updateMessageData,
          "Message flag Updated Successfully"
        );
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          updateMessageData,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.error("Error", error);
      return next(error);
    }
  },

  countData: async (req, res, next) => {
    try {
      let counts = await messageService.counter(req.body);
      if (counts >= 0) {
        commonResponse.success(res, 200, counts, "Counters found Successfully");
      } else {
        return commonResponse.customResponse(
          res,
          "SERVER_ERROR",
          400,
          counts,
          "Something went wrong, Please try again"
        );
      }
    } catch (error) {
      console.error("Error", error);
      return next(error);
    }
  },
};
