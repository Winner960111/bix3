const router = require("express").Router();
const controller = require("./smtp.controller");
const {ensureUserAuthenticated} = require("../../helper/guards");


/*
 *  Create SMTP
 */

router.post("/create",ensureUserAuthenticated,controller.createSmtp);
router.get("/:id",ensureUserAuthenticated,controller.getDetailsOfSmtp);
router.post("/email-details",ensureUserAuthenticated,controller.emailDetailsImap);
router.post("/email/send",ensureUserAuthenticated,controller.emailSendTOMultipleUser);
router.post("/email/test",ensureUserAuthenticated,controller.emailTest);









module.exports = router;