const RoleService = require("./roles.services");
const { commonResponse, commonFunctions } = require("../../helper");
const validateRoleInput = require("../../validations/admin/role");
const isEmpty = require("../../validations/is-empty");



module.exports = {

    /*
    *  Create Job Opening
    */
    createRole: async (req, res, next) => {
        try {

            const { errors, isValid } = validateRoleInput(req.body);

            let is_exist_role = await RoleService.is_exist(req.body.role_name);

            if (is_exist_role) {
                errors.role_name = "Role is Already Exist"
            }

            if (!isValid || !isEmpty(errors)) {
                return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
            }

            let role_create = await RoleService.save(req.body);

            if (role_create) {
                commonResponse.success(res, 200, role_create, 'Role Create Successfully ');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, role_create, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *  All List Job Opening
    */
    listRole: async (req, res, next) => {
        try {

            let role_listing = await RoleService.list(req.body);

            if (role_listing) {
                commonResponse.success(res, 200, role_listing, 'Role Listing');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, role_listing, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Get Detail Job Opening By Id
    */
    getRoleDetails: async (req, res, next) => {
        try {
            let role_details = await RoleService.get(req.params.id);
            if (role_details) {
                commonResponse.success(res, 200, role_details, 'Role Details');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, jobopening_details, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },

    /*
    *   Update Role By Id
    */
    updateRole: async (req, res, next) => {
        try {
            let id = req.params.id;


            let is_exist_role = await RoleService.is_exist_role(id);

            if (is_exist_role) {

                const { errors, isValid } = validateRoleInput(req.body);

                let is_exist_role_name = await RoleService.is_exist(req.body.role_name);

                if (is_exist_role_name && isEmpty(errors.opening_id) && is_exist_role_name._id != id) {
                    errors.role_name = "Role Name is Already Exist"
                }

                if (!isValid || !isEmpty(errors)) {
                    return commonResponse.customErrorResponse(res, 422, "Something went wrong", errors);
                }

                let updateRole = await RoleService.update(id, req.body);


                if (updateRole) {
                    commonResponse.success(res, 200, updateRole, 'Role Updated Successfully');
                } else {
                    return commonResponse.customResponse(res, "SERVER_ERROR", 400, updateRole, 'Something went wrong, Please try again');
                }
            } else {
                return commonResponse.customResponse(res, "Role", 400, {}, "Role does not exist");
            }

        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    },


    /*
    *   Delete Role By Id
    */
    deleteRole: async (req, res, next) => {
        try {
            let id = req.params.id;

            let delete_role = await RoleService.delete(id);
            if (delete_role) {
                commonResponse.success(res, 200, delete_role, 'Role Deleted Successfully');
            } else {
                return commonResponse.customResponse(res, "SERVER_ERROR", 400, delete_role, 'Something went wrong, Please try again');
            }
        } catch (error) {
            console.log("Create User -> ", error);
            return next(error);
        }
    }

};