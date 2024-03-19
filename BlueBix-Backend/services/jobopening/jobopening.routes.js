const router = require("express").Router();
const controller = require("./jobopening.controller");
const { ensureCandidateAuthenticated, ensureUserAuthenticated, ensureDashBoardAuthenticated, ensureCompanyAuthenticated, ensureJobAuthenticated, ensureCompanyAndAllUserAuthenticated, ensureJobAuthenticatedByUser } = require("../../helper/guards");

/*
 *  Register New All User like Admin,BDM,Recruiter,Candidate
 */
router.post("/create", ensureJobAuthenticated, controller.createJobOpening);

// for admin/ bdm job create
router.post("/createByUser", ensureCompanyAndAllUserAuthenticated, controller.createJobOpening);

router.post("/", ensureCompanyAndAllUserAuthenticated, controller.listJobOpening);
router.post("/by-bdm", ensureCompanyAndAllUserAuthenticated, controller.listJobOpeningBDM);
router.post("/report-download-list", ensureCompanyAndAllUserAuthenticated, controller.reportDownloadListJobOpening);
router.get("/account-name", ensureCompanyAndAllUserAuthenticated, controller.listAccountName);
router.get("/visa-type/list", ensureCompanyAndAllUserAuthenticated, controller.listOfVisaType);
// router.post("/account-owner",ensureJobAuthenticated,controller.listAccountOwner);
// router.post("/primary-recruit",ensureJobAuthenticated,controller.listPrimaryRecruit);
router.post("/contact-name", ensureJobAuthenticated, controller.getContactList);

// router.get("/bdm/list",ensureJobAuthenticated,controller.listBDM);

router.get("/:id", ensureJobAuthenticated, controller.getJobOpeningDetails);
router.put("/:id", ensureCompanyAndAllUserAuthenticated, controller.updateJobOpening);
router.put("/status/:id", ensureCompanyAndAllUserAuthenticated, controller.jobOpeningStatusChange);


router.get("/category/list", ensureJobAuthenticated, controller.listCategory);
router.post("/sub-category/list", ensureJobAuthenticated, controller.listSubCategory);
router.delete("/:id", ensureCompanyAndAllUserAuthenticated, controller.deleteJobOpening);
router.get("/candidate-skill/list", ensureCandidateAuthenticated, controller.listJobOpeningCandidateSkillswise);
router.post("/user-wise/category/list", ensureDashBoardAuthenticated, controller.listOfCategoryUserwise);
router.put("/admin/assign", ensureUserAuthenticated, controller.adminJobAssgin);
router.get("/bdm/list", ensureUserAuthenticated, controller.allBdmUserList);
router.get("/recruiter/list", ensureUserAuthenticated, controller.allRecruiterUserList);


//visa type crud
router.post("/visa-type/create", controller.createVisaType);
router.get("/visa-type/:id", controller.getVisaTypeDetails);
router.put("/visa-type/:id", controller.updateVisaTypeDetails);

//Submission by BDM or Recruiter
router.post("/submission-by/recruiter", ensureCompanyAndAllUserAuthenticated, controller.createCandidateSubmissionByRecruiter);
router.post("/submission-by/bdm", ensureCompanyAndAllUserAuthenticated, controller.createCandidateSubmissionByBDM);
router.post("/candidate-submission/reject", ensureCompanyAndAllUserAuthenticated, controller.candidateSubmissionRejectListByBDM);
router.post("/candidate-submission/hold", ensureCompanyAndAllUserAuthenticated, controller.candidateSubmissionHoldListByBDM);

// for bdm to see candidate submitted listing for a particular job by other bdms. ie as history 
router.post("/submission-by/other-bdm", ensureCompanyAndAllUserAuthenticated, controller.candidatesSubmissionByOtherBDM);

//Submission List for BDM or Recruiter
router.post("/submission-by", ensureCompanyAndAllUserAuthenticated, controller.candidateSubmissionList);
router.post("/activity-log", ensureCompanyAndAllUserAuthenticated, controller.jobActivityLogList);
router.post("/submission/candidate/list", ensureCompanyAndAllUserAuthenticated, controller.allCandidateListForSubmission);
router.post("/submit-candidate/list", ensureCompanyAndAllUserAuthenticated, controller.submitCandidateListOpeningIdWise);
router.post("/submission-candidate/bdm/list", ensureCompanyAndAllUserAuthenticated, controller.submissionCandidateListForBdm);
router.post("/candidate/re-submission", ensureCompanyAndAllUserAuthenticated, controller.candidateSubmissionResubmitByBDMToRecruiter);
router.post("/candidate-withdraw/recruiter", ensureCompanyAndAllUserAuthenticated, controller.candidateWithDrawByRecruiter);

router.post("/submit-candidate-by-id/list", ensureCompanyAndAllUserAuthenticated, controller.submitCandidateListByBDMRecruiterFreelancerIdWise);

router.post("/list-for-assignments", ensureCompanyAndAllUserAuthenticated, controller.listOfAssignments)

router.post("/list-bdm-assign", ensureCompanyAndAllUserAuthenticated, controller.listForAssignedBdm);

// for both recruiter and freelancer
router.post("/list-recruiter-assign", ensureCompanyAndAllUserAuthenticated, controller.listForAssignedRecruiters);


module.exports = router;