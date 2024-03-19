const router = require("express").Router();
const controller = require("./contact.controller");
const { ensureCompanyAuthenticated, ensureJobAuthenticated, ensureCompanyAndAllUserAuthenticated } = require("../../helper/guards");

/*
 *  Create Contact
 */
router.post("/create", ensureCompanyAndAllUserAuthenticated, controller.createContact);
router.post("/", ensureJobAuthenticated, controller.getAllContactList);

router.get("/:id", ensureJobAuthenticated, controller.getContactProfileDetails);
router.put("/edit/:id", ensureCompanyAndAllUserAuthenticated, controller.updateContactProfile);
router.delete("/:id", ensureCompanyAndAllUserAuthenticated, controller.deleteContactProfile);
router.post("/create/activity", ensureJobAuthenticated, controller.createContactActivity);
router.post("/activity/list", ensureJobAuthenticated, controller.contactActivityList);
// router.post("/list",controller.getContactList);
// router.post("/forgot-password",controller.companyForgotPassword);
// router.post("/reset-password",controller.companyResetPassword);

router.post("/bdm", ensureCompanyAndAllUserAuthenticated, controller.bdmContactList);
router.post("/admin", ensureCompanyAndAllUserAuthenticated, controller.adminContactList);

module.exports = router;


