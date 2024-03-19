const router = require("express").Router();
const controller = require("./emailtemplate.controller");
const { ensureUserAuthenticated ,ensureDashBoardAuthenticated,ensureCompanyAuthenticated,ensureCompanyAndAllUserAuthenticated,ensureBdmAuthenticated, ensureAdminAuthenticated} = require("../../helper/guards");



router.post("/email-template",ensureUserAuthenticated,controller.emailTemplateCreate);

router.put("/update-email-template/:id",ensureUserAuthenticated,controller.updateEmailTemplate);

router.get(
  "/email-template-detail/:id",
  ensureUserAuthenticated,
  controller.getEmailTemplateDetails
);

router.post(
    "/email-template-detail-by-type",
    ensureUserAuthenticated,
    controller.getEmailTemplateDetailsByType
);

module.exports = router;


