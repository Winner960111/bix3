const router = require("express").Router();
const controller = require("./admin.controller");
const { ensureUserAuthenticated,ensureAdminAuthenticated } = require("../../helper/guards");


/*
 *  Register New All User like Admin,BDM,Recruiter,Candidate,Company
 */
router.post("/register",controller.adminRegister);

router.post("/report/count",ensureAdminAuthenticated,controller.statusCount);

/*
 *  Login All User like Admin,BDM,Recruiter,Candidate,Company
 */
router.post("/login",controller.adminLogin);
router.post("/company-details-by-companyId",ensureAdminAuthenticated, controller.listCompanyById);
router.get("/company-list", ensureUserAuthenticated, controller.listCompany);
// router.get("/logged-user-details",ensureAuthenticated,controller.loggedUserDetails);
// router.post("/user-type/list",ensureAuthenticated,controller.userListTypeWise);
router.post("/",ensureUserAuthenticated,controller.getAllAdminList);
router.get("/:id",ensureUserAuthenticated,controller.getAdminProfileDetails);
router.put("/edit/:id",ensureUserAuthenticated,controller.updateAdminProfile);
router.delete("/:id",ensureUserAuthenticated,controller.deleteAdminProfile);
router.get("/email/list",controller.getEmailList);

router.post("/forgot-password",controller.adminForgotPassword);
router.post("/reset-password",controller.adminResetPassword);
// router.post("/user/count",ensureAdminAuthenticated,controller.getUserListCount);




module.exports = router;


