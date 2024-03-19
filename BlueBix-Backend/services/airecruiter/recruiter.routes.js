const router = require("express").Router();
const controller = require("./recruiter.controller");
const { ensureUserAuthenticated,ensureAdminAuthenticated } = require("../../helper/guards");


/*
 *  Register New All User like Admin,BDM,Recruiter,Candidate,Company
 */
router.post("/", controller.getRecruiter);


module.exports = router;