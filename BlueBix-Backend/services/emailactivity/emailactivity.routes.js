const router = require("express").Router();
const controller = require("./emailactivity.controller");
const { ensureUserAuthenticated } = require("../../helper/guards");

router.get("/list", ensureUserAuthenticated, controller.getList);
router.put("/:id", ensureUserAuthenticated, controller.updateActivity);


// router.get('/dummy', controller.setDummy);

module.exports = router

