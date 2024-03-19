const AdminModel = require("../services/admin/admin.model");
const UserModel = require("../services/users/users.model");
const BdmModel = require("../services/bdm/bdm.model");
const RoleModel = require("../services/roles/roles.model");
const CandidateModel = require("../services/candidate/candidate.model");
const CompanyModel = require("../services/company/company.model");
const ContactModel = require("../services/contact/contact.model");
const { promisify } = require('util');
const { commonResponse } = require("../helper");
const jwt = require("jsonwebtoken");


exports.ensureUserAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            req.user = await UserModel.findOne({ _id: decoded._id })

            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}


exports.ensureAdminAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await AdminModel.findOne({ _id: decoded._id })

            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureBdmAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await BdmModel.findOne({ _id: decoded._id })
            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureCandidateAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await CandidateModel.findOne({ _id: decoded._id })
            if (decoded.profile) {

                req.user = await UserModel.findOne({ _id: decoded._id })
            }
            if (req.user.candidate_id) req.user._id = req.user.candidate_id
            console.log('req.user :>>', req.user);
            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureCompanyAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await CompanyModel.findOne({ _id: decoded._id })
            if (decoded.profile) {
                let role = await RoleModel.findOne({ _id: decoded.assigned_role }, { role_name: 1 });
                if (role.role_name == 'admin') {
                    req.user = await UserModel.findOne({ _id: decoded._id })
                }
            }
            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureCompanyAndAllUserAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await CompanyModel.findOne({ _id: decoded._id })

            if (decoded.profile) {
                req.user = await UserModel.findOne({ _id: decoded._id })
            }
            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureRecruiterAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await UserModel.findOne({ _id: decoded._id })
            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureJobAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await CompanyModel.findOne({ _id: decoded._id })

            if (decoded && decoded.company_id) {

                req.user = await ContactModel.findOne({ _id: decoded._id })
            }
            // if(decoded.role == 'admin'){
            //     req.user = await AdminModel.findOne({_id: decoded._id})
            // }
            // if(decoded.role == 'bdm'){
            //     req.user = await BdmModel.findOne({_id: decoded._id})
            // }

            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}

exports.ensureJobAuthenticatedByUser = async (req, res, next) => {

    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await UserModel.findOne({ _id: decoded._id })

            if (decoded && decoded.company_id) {

                req.user = await UserModel.findOne({ _id: decoded._id })
            }

            if (decoded.assigned_role.role_name == 'admin' || decoded.assigned_role.role_name == 'bdm') {
                next();
            }
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    else {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}



exports.ensureDashBoardAuthenticated = async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await CandidateModel.findOne({ _id: decoded._id })
            if (decoded.profile) {
                req.user = await UserModel.findOne({ _id: decoded._id })
            }
            if (decoded.company_name) {
                req.user = await CompanyModel.findOne({ _id: decoded._id })
            }

            if (decoded && decoded.company_id) {

                req.user = await ContactModel.findOne({ _id: decoded._id })
            }

            next()
        } catch (error) {
            return commonResponse.customErrorResponse(res, 401, "Not authorized,token failed", error);

        }
    }
    if (!token) {
        return commonResponse.customErrorResponse(res, 401, "Not authorized", "no token");
    }
}