const router = require("express").Router();
const controller = require("./message.controller");
const {
  ensureUserAuthenticated,
  ensureDashBoardAuthenticated,
  ensureCompanyAuthenticated,
  ensureCompanyAndAllUserAuthenticated,
  ensureBdmAuthenticated,
} = require("../../helper/guards");

/*
 *  Send request to BDM for job work
 */
router.post("/create-message", controller.addMessage);
router.post("/list-messages", controller.listMessages);
router.post("/update-flag", controller.updateMessage);
router.post("/count", controller.countData);

module.exports = router;
