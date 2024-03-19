const router = require("express").Router();
const controller = require("./planassign.controller");
const {ensureCompanyAndAllUserAuthenticated} = require("../../helper/guards");


/*
 *  Create Plan Assign to Company
 */

router.post("/create",ensureCompanyAndAllUserAuthenticated,controller.createPlanAssign);
// router.get("/:id",ensureCompanyAndAllUserAuthenticated,controller.getPlanAssignDetails);
// router.put("/:id",ensureCompanyAndAllUserAuthenticated,controller.updatePlanDetail);









module.exports = router;