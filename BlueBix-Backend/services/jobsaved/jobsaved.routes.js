const router = require("express").Router();
const controller = require("./jobsaved.controller");
const { ensureCandidateAuthenticated } = require("../../helper/guards");

/*
 *  Candidate Job Saved for future apply
 */
router.post("/create", ensureCandidateAuthenticated, controller.createJobSaved);
router.post("/list", ensureCandidateAuthenticated, controller.listOfJobSaved);

module.exports = router;