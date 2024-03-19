const router = require("express").Router();
const controller = require("./plans.controller");
const {ensureUserAuthenticated} = require("../../helper/guards");


/*
 *  Create Plan
 */

router.post("/create",ensureUserAuthenticated,controller.createPlan);
router.post("/",ensureUserAuthenticated,controller.allPlanList);
router.get("/:id",ensureUserAuthenticated,controller.getPlanDetails);
router.put("/:id",ensureUserAuthenticated,controller.updatePlanDetail);









module.exports = router;