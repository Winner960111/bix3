const { commonFunctions } = require("../../helper");
const BdmModel = require("./bdm.model");
const JobOpeningModel = require("../jobopening/jobopening.model");
const SubmissionModel = require("../jobopening/submission.model");
const ContactModel = require("../contact/contact.model");
const UserModel = require("../users/users.model");
const RoleModel = require("../roles/roles.model");
const mongoose = require("mongoose");
const BdmAssignment = require("../jobopening/bdmassignment.model");

/*
*  Check Email Exist
*/
exports.is_exist = async (email) => {
    try {

        let user = await BdmModel.findOne({ email: email }).lean();
        if (!user) {
            ;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }
};




/*
*  Check Email Exist And Role
*/
exports.is_exist_role = async (email, role) => {
    try {
        let user = await BdmModel.findOne({ email: email, role: role }).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};


/*
*  Add New All User Admin,BDM,Recruiter,Candidate
*/
exports.save = async (reqbody) => {
    try {
        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        let user_bdm = {};

        user_bdm.email = reqbody.email,
            user_bdm.password = hashpassword,
            user_bdm.role = reqbody.role,
            user_bdm.profile = reqbody.profile,
            user_bdm.status = reqbody.status || 'In-Active',
            user_bdm.first_name = reqbody.first_name,
            user_bdm.last_name = reqbody.last_name,
            user_bdm.display_name = reqbody.display_name,
            user_bdm.alternative_email = reqbody.alternative_email || null,
            user_bdm.phone_number_home = reqbody.phone_number_home || null,
            user_bdm.contact_number = reqbody.contact_number,
            user_bdm.profile = reqbody.profile,
            user_bdm.current_location = reqbody.current_location


        return await BdmModel.create(user_bdm);
    } catch (error) {
        console.error("Error : ", error);
    }
};


// exports.loggedUserDetail = async (reqbody) => {
//     try {
//         let logged_user_details = await UsersModel.find({_id:reqbody}).lean();
//         if (!logged_user_details) {
//           return false;
//         }
//         return logged_user_details;
//     } catch (error) {
//         console.error("Error : ", error);
//     }
// };

/*
*  All BDM List
*/
exports.bdmlist = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        let limit = parseInt(reqbody.per_page)
        let order_column = reqbody.order_column || 'updated_at'
        let sort_order = reqbody.sort_order;
        let filter_value = reqbody.filter_value
        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr;
        if (filter_value != '') {
            searchStr = { $or: [{ display_name: filter_value }] };
        } else {
            searchStr = {};
        }

        let totalRecords = await BdmModel.countDocuments({ deleted: false });

        let filteredRecords = await BdmModel.countDocuments({ $and: [{ deleted: false }, searchStr] })


        let bdm_list_details = await BdmModel.find(searchStr, {}, { 'skip': Number(offset), 'limit': Number(limit) }).sort(sortJson).lean();

        if (!bdm_list_details) {
            return false;
        }

        let data = {
            totalRecords: totalRecords,
            filteredRecords: filteredRecords,
            bdm_list_details
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  User Profile Details By Id
*/
exports.get = async (id) => {
    try {
        let bdm_profile_details = await BdmModel.findOne({ _id: id }, { created_at: 0, updated_at: 0 }).lean();
        if (!bdm_profile_details) {
            return false;
        }
        return bdm_profile_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_user = async (id) => {
    try {
        let user_exist = await BdmModel.findOne({ _id: id }).lean();
        if (!user_exist) {
            return false;
        }
        return user_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Update User Profile 
*/
exports.update = async (id, reqbody, user) => {
    try {

        hashpassword = await commonFunctions.hashPassword(reqbody.password);
        let update_bdm_profile = {};

        update_bdm_profile.email = reqbody.email,
            update_bdm_profile.password = hashpassword,
            update_bdm_profile.role = reqbody.role,
            update_bdm_profile.status = reqbody.status || 'In-Active'
        update_bdm_profile.updated_at = Date.now()
        update_bdm_profile.updated_by = user
        update_bdm_profile.reporting_manager = reqbody.role != 'admin' ? reqbody.reporting_manager : null
        update_bdm_profile.first_name = reqbody.first_name,
            update_bdm_profile.last_name = reqbody.last_name,
            update_bdm_profile.display_name = reqbody.display_name,
            update_bdm_profile.alternative_email = reqbody.alternative_email || null,
            update_bdm_profile.phone_number_home = reqbody.phone_number_home || null,
            update_bdm_profile.contact_number = reqbody.contact_number,
            update_bdm_profile.profile = reqbody.profile,
            update_bdm_profile.current_location = reqbody.current_location

        return await BdmModel.updateOne({ _id: id }, update_bdm_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
    try {

        let user_update_token = await BdmModel.updateOne({ email: email }, token_data).lean();
        if (!user_update_token) {
            return false;
        }
        return user_update_token;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Reset Password Token and Reset Password Expires
*/
exports.is_exist_user_token = async (token) => {
    try {
        let is_exist_user_token = await BdmModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

        if (!is_exist_user_token) {
            return false;
        }
        return is_exist_user_token;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Password Change
*/
exports.user_password_reset = async (reqbody, user) => {
    try {
        //password covert into hash
        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        let update_user_password_reset = {
            password: hashpassword,
            updated_at: Date.now(),
            updated_by: user
        };

        // user_password_reset
        let reset_password = await BdmModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

        if (!reset_password) {
            return false;
        }
        return reset_password;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.count_jobopen_status = async (reqbody) => {
    try {
        let from_date = '';
        let to_date = '';
        let daterange = reqbody.dateRange;
        let id = reqbody.id ? mongoose.Types.ObjectId(reqbody.id) : null;
        let order_column = reqbody.order || "created_at";
        let sort_order = reqbody.order_direction || "desc";
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let company_id = reqbody.company_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;
        let freelance_id = reqbody.freelance_id;

        if (daterange != undefined && daterange != '' && daterange.length > 0) {
            from_date = daterange[0];
            to_date = daterange[1];
        }
        let searchStr = { deleted: false };

        //BDM
        let BdmDateFilterConditions = {};
        if (
            from_date != undefined &&
            to_date != undefined &&
            from_date != "" &&
            to_date != ""
        ) {
            BdmDateFilterConditions = {
                deleted: false,
                created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
            };
        }
        else if (id) {
            BdmDateFilterConditions = { deleted: false };
        }
        else {
            BdmDateFilterConditions = { deleted: false };
        }

        if (status) {
            BdmDateFilterConditions.status = status;
        }

        if (opening_title) {
            BdmDateFilterConditions.opening_title = opening_title;
        }

        let assignedObj = {};

        if (id) {
            assignedObj.assigned_bdm = { $in: [id] };
        }
        else if (bdm_id) {
            assignedObj.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
        }

        if (recruiter_id) {
            assignedObj.assigned_recruiter = { $in: [mongoose.Types.ObjectId(recruiter_id)] };
        }

        if (freelance_id) {
            assignedObj.assigned_freelancer = { $in: [mongoose.Types.ObjectId(freelance_id)] };
        }

        let openingIds = await BdmAssignment.find({ $and: [{ deleted: false, assigned_bdm: { $exists: true, $ne: [] } }, assignedObj] }, { opening_id: 1 });
        assignedOpeningIds = openingIds.map(item => item.opening_id);


        BdmDateFilterConditions.opening_id = { $in: assignedOpeningIds };

        let bdmJobCount = {};
        const cntjobsBDMStatus = await JobOpeningModel.aggregate([
            {
                $match: BdmDateFilterConditions,
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        if (cntjobsBDMStatus) {
            for (job of cntjobsBDMStatus) {
                bdmJobCount[job._id] = job.count;
            }
        }

        return {
            bdmJobCount
        }
    }
    catch (error) {
        console.error("Error", error);

    };
};

exports.jobopen_status = async (reqbody) => {

    let status = reqbody.status;
    let bdm_id = reqbody.bdm_id;
    let id = reqbody.id ? mongoose.Types.ObjectId(reqbody.id) : null;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let daterange = reqbody.dateRange;
    let from_date = '';
    let to_date = '';
    let opening_title = reqbody.opening_title;


    if (daterange != undefined && daterange != '' && daterange.length > 0) {
        from_date = daterange[0];
        to_date = daterange[1];
    }
    let searchStr = { deleted: false };

    //BDM
    let BdmDateFilterConditions = {};
    if (
        from_date != undefined &&
        to_date != undefined &&
        from_date != "" &&
        to_date != ""
    ) {
        BdmDateFilterConditions = {
            deleted: false,
            created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
        };
    }
    else if (id) {
        BdmDateFilterConditions = { deleted: false };
    }
    else {
        BdmDateFilterConditions = { deleted: false };
    }

    if (status) {
        BdmDateFilterConditions.status = status;
    }

    if (opening_title) {
        BdmDateFilterConditions.opening_title = opening_title;
    }

    let assignedObj = {};

    if (id) {
        assignedObj.assigned_bdm = { $in: [id] };
    }
    else if (bdm_id) {
        assignedObj.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    }

    let openingIds = await BdmAssignment.find({ $and: [{ deleted: false, assigned_bdm: { $exists: true, $ne: [] } }, assignedObj] }, { opening_id: 1 });
    assignedOpeningIds = openingIds.map(item => item.opening_id);

    BdmDateFilterConditions.opening_id = { $in: assignedOpeningIds };

    let bdmJobStatus = {};
    const jobsBDMStatus = await JobOpeningModel.aggregate([
        {
            $match: BdmDateFilterConditions,
        },
    ]);

    return {
        job_opening_listing: jobsBDMStatus
    }
}

exports.freelancer_list = async () => {
    try {
        let roledetails = await RoleModel.findOne({ role_name: 'freelancerecruiter', deleted: false }).lean();
        if (roledetails) {
            let role_id = roledetails._id;
            let user_exist = await UserModel.find({ assigned_role: role_id, deleted: false }, { display_name: 1, first_name: 1, last_name: 1 }).lean();
            if (!user_exist) {
                return false;
            }
            return user_exist;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.update_job_submission_view_status_by_bdm = async (reqbody) => {

    try {
        let bdm_id = mongoose.Types.ObjectId(reqbody.bdm_id);
        let opening_id = reqbody.opening_id;

        let jobdata = await BdmAssignment.findOne({ created_by: bdm_id, deleted: false, opening_id: opening_id }).lean();

        if (jobdata) {
            let result = await SubmissionModel.updateMany({ opening_id: opening_id }, { is_bdm_view_submission: 0 }).lean();
            return result
        } else {
            return '';
        }

    } catch (error) {
        console.error("Error : ", error);
    }


};

// /*
// *  All User List with count no of user
// */
// exports.user_list_count = async (reqbody,user) => {
//     try {
//         let recordsTotal = await UsersModel.countDocuments();
//         let user_list_count = await UsersModel.find({},{created_at:0,updated_at:0}).lean();

//         if (!user_list_count) {
//           return false;
//         }
//         var data = {
//             recordsTotal : recordsTotal,
//             userList : user_list_count
//         }
//         return data;
//     } catch (error) {
//         console.error("Error : ", error);
//     }
// };



