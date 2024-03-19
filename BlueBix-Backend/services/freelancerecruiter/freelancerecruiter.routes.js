const router = require("express").Router();
const controller = require("./freelancerecruiter.controller");
const { ensureUserAuthenticated, ensureDashBoardAuthenticated, ensureCompanyAuthenticated, ensureCompanyAndAllUserAuthenticated, ensureBdmAuthenticated } = require("../../helper/guards");


/*
 *  Send request to BDM for job work
 */
router.post("/job-work-request", ensureUserAuthenticated, controller.jobWorkRequest);

router.post("/", ensureUserAuthenticated, controller.listJobOpening);
router.put("/update-job-work-status/:id", ensureUserAuthenticated, controller.updateJobWork);
router.post("/report/count", ensureUserAuthenticated, controller.statusCount);
router.post("/report/jobs", ensureUserAuthenticated, controller.statusJobs);
router.post("/freelancer-submission", ensureUserAuthenticated, controller.freelanceSubmissionCreate);
router.post("/list-job-work", ensureUserAuthenticated, controller.listJobWorkApplications);
router.post("/approve-job-opening-list", ensureUserAuthenticated, controller.approveJobOpening);

module.exports = router;


