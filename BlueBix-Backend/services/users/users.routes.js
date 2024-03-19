const router = require("express").Router();
const controller = require("./users.controller");
const { ensureUserAuthenticated, ensureDashBoardAuthenticated, ensureCompanyAuthenticated } = require("../../helper/guards");
const multer  = require('multer')
const upload = multer()


/*
 *  Register New All User like Admin,BDM,Recruiter,Company
 */
router.post("/register",controller.userRegister);


/*
 *  Login All User like Admin,BDM,Recruiter,Company
 */
router.post("/login",controller.userLogin);
router.post("/",ensureUserAuthenticated,controller.allUserList);
router.get("/:id",ensureUserAuthenticated,controller.getUserProfileDetails);
router.put("/edit/:id",ensureUserAuthenticated,controller.updateUserProfile);
router.delete("/:id",ensureUserAuthenticated,controller.deleteUserProfile);
router.get("/profile/list",ensureCompanyAuthenticated,controller.allUserProfileList);
router.post("/primary-recruiter/list",ensureCompanyAuthenticated,controller.allUserPrimaryRecruiterList);
router.get("/assign-more-recruiter/list",ensureCompanyAuthenticated,controller.allUserAssignMoreRecruitersList);
router.get("/list/reporting-manager",controller.userReportingManagerList);
router.get("/list/role",controller.userRoleList);
router.post("/dashboard",ensureDashBoardAuthenticated,controller.dashboardUserList);
router.post("/dashboard/candidate/list",ensureDashBoardAuthenticated,controller.dashboardLatestCandidateList);
router.post("/change-password",ensureUserAuthenticated,controller.allUserChangePassword);
router.post("/forgot-password",controller.userForgotPassword);
router.post("/reset-password",controller.userResetPassword);
// router.post("/email/inbox/list",ensureUserAuthenticated, controller.getEmailInboxList);
router.post("/email/:folderName/list",ensureUserAuthenticated, controller.getEmailList);
router.post("/message-list-by-user",ensureUserAuthenticated,controller.messageListByUser);

router.post("/monster/list-candidate", ensureUserAuthenticated, controller.monsterCandidateList);
router.get("/monster/view-candidate/:id", ensureUserAuthenticated, controller.monsterCandidateView);

router.post("/monster-candidate/list", ensureUserAuthenticated, upload.none(), controller.getMonsterCandidateList);
router.get("/monster-candidate/view/:id", ensureUserAuthenticated, upload.none(), controller.getMonsterCandidate);

router.post("/insert-candidate", controller.insertUserFromCandidateTable);


module.exports = router;


