const router = require("express").Router();
const controller = require("./company.controller");
const { ensureCompanyAuthenticated, ensureCompanyAndAllUserAuthenticated, ensureJobAuthenticated } = require("../../helper/guards");

/*
 *  Register New User Company
 */
router.post("/register", controller.companyRegister);
router.post("/register-by-user", ensureCompanyAndAllUserAuthenticated, controller.companyRegister);

/*
 *  Login User Company
 */
router.post("/login", controller.companyLogin);
router.post("/", ensureCompanyAndAllUserAuthenticated, controller.getAllCompanyList);
router.post("/names", ensureCompanyAndAllUserAuthenticated, controller.getAllCompanyName);
router.post("/details", ensureCompanyAuthenticated, controller.getCompanyProfileDetails);
router.put("/edit/:id", ensureCompanyAuthenticated, controller.updateCompanyProfile);
router.delete("/:id", ensureCompanyAuthenticated, controller.deleteCompanyProfile);
router.post("/report/count", ensureCompanyAuthenticated, controller.statusCount);
router.post("/account-name/list", ensureCompanyAndAllUserAuthenticated, controller.listOfCompanyNameList);
router.post("/account-name/recruiter/list", ensureCompanyAndAllUserAuthenticated, controller.listOfCompanyNameListRecruiterWise);
router.post("/change-password", ensureCompanyAuthenticated, controller.companyPasswordChange);

router.post("/forgot-password", controller.companyForgotPassword);
router.post("/reset-password", controller.companyResetPassword);
router.post("/candidate-submission/list", ensureJobAuthenticated, controller.candidateSubmissionListForCompany);
router.post("/candidate-submission_by_company/list", ensureCompanyAuthenticated, controller.candidateSubmissionListByCompany);
router.get("/state/list", controller.listOfStateList);
router.post("/city/list", controller.listOfCityList);
// router.post("/state/add", controller.addState);
// router.post("/city/add", controller.addCity);

router.post("/candidate-details", ensureJobAuthenticated, controller.getCandidateProfileDetailsByIdForCompany);
router.post("/opening-id-title/list", ensureJobAuthenticated, controller.getCompanyWiseOpeningIdList);
router.post("/shortlist-candidate/category/list", ensureJobAuthenticated, controller.getCompanyWiseShortListCandidateCategoryList);
router.post("/status/:id", ensureCompanyAndAllUserAuthenticated, controller.companyStatusChange);
router.post("/update-job-submission-view-status-by-company", ensureCompanyAndAllUserAuthenticated, controller.updateJobSubmissionViewStatusByCompanyCount)


router.post("/interview-schedule", ensureCompanyAndAllUserAuthenticated, controller.interviewSchedule);


module.exports = router;


