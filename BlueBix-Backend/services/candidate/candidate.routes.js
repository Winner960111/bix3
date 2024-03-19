const router = require("express").Router();
const controller = require("./candidate.controller");
const { ensureCandidateAuthenticated, ensureJobAuthenticated, ensureCompanyAndAllUserAuthenticated } = require("../../helper/guards");

/*
 *  Register
 */
router.post("/register", controller.candidateDirectRegister);
router.post("/recruiter/register", ensureCompanyAndAllUserAuthenticated, controller.candidateRecruiterRegister);
router.post("/employee-details/register", controller.candidateEmployeeDetailsRegister);
router.post("/employee-qualification-details/register", controller.candidateQualificationDetailsRegister);
router.post("/employee-it-skill/register", controller.candidateITSkillDetailsRegister);

router.put("/employee-details/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateEmployeeDetails);
router.put("/employee-qualification-details/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateQualificationDetails);
router.put("/employee-it-skill/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateITSkillsDetails);
router.put("/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateProfileDetails);
router.put("/personal-details/edit/:id", ensureCandidateAuthenticated, controller.updateCandidatePersonalDetails);
router.put("/career-profile/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateCareerProfileDetails);
router.put("/profile-summary/edit/:id", ensureCandidateAuthenticated, controller.updateCandidateProfileSummaryDetails);
router.post("/apply-job", ensureCandidateAuthenticated, controller.applyJobs);
router.post("/candidate-list", ensureCandidateAuthenticated, controller.listCandidates);
router.post("/save-job", ensureCandidateAuthenticated, controller.savedJob);
router.delete("/remove-job/:id", ensureCandidateAuthenticated, controller.deleteJobSaved);
router.get("/saved-job-list", ensureCandidateAuthenticated, controller.saved_job_list);

/*
 *  Login
 */
router.post("/login", controller.candidateLogin);
router.post("/", ensureCandidateAuthenticated, controller.getAllCandidateList);
router.get("/:id", ensureCandidateAuthenticated, controller.getCandidateProfileDetails);
// router.put("/edit/:id",ensureCandidateAuthenticated,controller.updateCandidateProfile);
// router.delete("/:id",ensureCandidateAuthenticated,controller.deleteCandidateProfile);
router.delete("/employee-details/:id", ensureCandidateAuthenticated, controller.deleteEmployeeProfileDetails);
router.delete("/employee-qualification-details/:id", ensureCandidateAuthenticated, controller.deleteEmployeeQualificationProfileDetails);
router.delete("/employee-it-skill/:id", ensureCandidateAuthenticated, controller.deleteCandidateITSkillsDetails);
router.post("/forgot-password", controller.candidateForgotPassword);
router.post("/reset-password", controller.candidateResetPassword);
router.post("/change-password", ensureCandidateAuthenticated, controller.candidatePasswordChange);
router.post("/verify-email", controller.candidateRegisterVerifyEmail);
router.put("/status/:id", ensureJobAuthenticated, controller.candidateSubmissionStatusChange);
router.post("/shortlist/details", ensureCandidateAuthenticated, controller.candidateShortListDetails);
router.post("/job-opening/list", controller.candidateShowAllJobOpeningList);
router.get("/city/list", controller.candidateJobOpeningWiseCityList);
router.get("/category/list", controller.candidateJobOpeningWiseCategoryList);

router.post("/report/list", ensureCompanyAndAllUserAuthenticated, controller.reportListSubmissions);

router.delete("/profile-image", ensureCandidateAuthenticated, controller.deleteUserProfileImage);

// monster
router.get("/fetch-candidates", ensureCompanyAndAllUserAuthenticated, controller.fetchCandidatesFromMonster)

module.exports = router;


