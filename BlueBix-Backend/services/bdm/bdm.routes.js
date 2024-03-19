const router = require("express").Router();
const controller = require("./bdm.controller");
const { ensureBdmAuthenticated, ensureUserAuthenticated } = require("../../helper/guards");

const companyController = require("../company/company.controller")

/*
 *  Register New User BDM
 */
router.post("/register", controller.bdmRegister);

/*
 *  Login User BDM
 */
// router.post("/login", controller.bdmLogin);
// router.post("/", ensureBdmAuthenticated, controller.getAllBdmList);
router.post("/report/count", ensureBdmAuthenticated, controller.statusCount);
router.post("/report/jobs", ensureBdmAuthenticated, controller.statusJobs);
// router.get("/:id", ensureBdmAuthenticated, controller.getBdmProfileDetails);
// router.put("/edit/:id", ensureBdmAuthenticated, controller.updateBdmProfile);
router.get("/freelancer/list", ensureBdmAuthenticated, controller.getFreelancerList);
// router.post("/forgot-password", controller.bdmForgotPassword);
// router.post("/reset-password", controller.bdmResetPassword);
router.post("/update-job-submission-view-status-by-bdm", ensureBdmAuthenticated, controller.updateJobSubmissionViewStatusByBdmCount);
router.put("/company/edit/:id", ensureUserAuthenticated, companyController.updateCompanyProfile);

module.exports = router;