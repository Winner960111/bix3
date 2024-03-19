const router = require("express").Router();
const controller = require("./recruiter.controller");
const { ensureRecruiterAuthenticated } = require("../../helper/guards");


/*
 *  Register New User BDM
 */
router.post("/register", controller.recruiterRegister);


/*
 *  Login User BDM
 */
router.post("/", ensureRecruiterAuthenticated, controller.getAllRecruiterList);
router.post("/report/count", ensureRecruiterAuthenticated, controller.statusCount);
router.post("/report/jobs", ensureRecruiterAuthenticated, controller.statusJobs);
router.post("/recruiter-apply-submission", ensureRecruiterAuthenticated, controller.recruiterSubmissionCreate);



module.exports = router;


