const router = require("express").Router();
const controller = require("./jobapplying.controller");
const { ensureUserAuthenticated, ensureCandidateAuthenticated, ensureCompanyAuthenticated } = require("../../helper/guards");


/*
 *  Register New All User like Admin,BDM,Recruiter,Candidate
 */


router.post("/create", ensureCandidateAuthenticated, controller.createJobApplying);
router.post("/", ensureUserAuthenticated, controller.listOfJobApplying);
router.get("/:id", ensureUserAuthenticated, controller.getJobApplyingDetails);
router.put("/candidate/short-list", ensureUserAuthenticated, controller.candidateProfileShortList);

router.post("/company/candidate/list", ensureCompanyAuthenticated, controller.listOfJobApplyingCandidateCompanyList);
router.post("/recruiter/candidate/list", ensureUserAuthenticated, controller.listOfJobApplyingCandidateRecruiterList);
router.get("/candidate-wise/list", ensureCandidateAuthenticated, controller.listOfJobApplyingCandidateWiseList);






module.exports = router;