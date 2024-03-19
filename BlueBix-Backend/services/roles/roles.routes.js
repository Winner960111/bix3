const router = require("express").Router();
const controller = require("./roles.controller");


/*
 *  Register New All User like Admin,BDM,Recruiter,Candidate
 */

router.post("/create",controller.createRole);
router.post("/",controller.listRole);
router.get("/:id",controller.getRoleDetails);
router.put("/:id",controller.updateRole);
router.delete("/:id",controller.deleteRole);





module.exports = router;