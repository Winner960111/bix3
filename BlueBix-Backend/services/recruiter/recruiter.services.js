const { commonFunctions } = require("../../helper");
const RecruiterModel = require("./recruiter.model");
const CandidateSubmissionsModel = require("../jobopening/submission.model");
const mongoose = require("mongoose");
const JobOpeningModel = require("../jobopening/jobopening.model");
const JobActivityModel = require("../jobopening/jobactivity.model");
const CandidateModel = require("../candidate/candidate.model");
const UserModel = require("../users/users.model");
const MessageModel = require('../message/message.model');
const BdmAssignment = require("../jobopening/bdmassignment.model");

/*
*  Check Email Exist
*/
exports.is_exist = async (email) => {
    try {

        let user = await RecruiterModel.findOne({ email: email }).lean();
        if (!user) {
            return false;
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
        let user = await RecruiterModel.findOne({ email: email, role: role }).lean();
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

        let user_recruiter = {};

        user_recruiter.email = reqbody.email,
            user_recruiter.password = hashpassword,
            user_recruiter.role = reqbody.role,
            user_recruiter.profile = reqbody.profile,
            user_recruiter.status = reqbody.status || 'In-Active',
            user_recruiter.first_name = reqbody.first_name,
            user_recruiter.last_name = reqbody.last_name,
            user_recruiter.display_name = reqbody.display_name,
            user_recruiter.alternative_email = reqbody.alternative_email || null,
            user_recruiter.phone_number_home = reqbody.phone_number_home || null,
            user_recruiter.contact_number = reqbody.contact_number,
            user_recruiter.profile = reqbody.profile,
            user_recruiter.current_location = reqbody.current_location


        return await RecruiterModel.create(user_recruiter);
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
*  User List Type Wise
*/
exports.recruiterlist = async (reqbody) => {
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

        let totalRecords = await RecruiterModel.countDocuments({ deleted: false });

        let filteredRecords = await RecruiterModel.countDocuments({ $and: [{ deleted: false }, searchStr] })

        let recruiter_list_details = await RecruiterModel.find(searchStr, {}, { 'skip': Number(offset), 'limit': Number(limit) }).sort(sortJson).lean();

        if (!recruiter_list_details) {
            return false;
        }

        let data = {
            totalRecords: totalRecords,
            filteredRecords: filteredRecords,
            recruiter_list_details: recruiter_list_details
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Recruiter Profile Details By Id
*/
exports.get = async (id) => {
    try {
        let recruiter_profile_details = await RecruiterModel.findOne({ _id: id }, { created_at: 0, updated_at: 0 }).lean();
        if (!recruiter_profile_details) {
            return false;
        }
        return recruiter_profile_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_user = async (id) => {
    try {
        let user_exist = await RecruiterModel.findOne({ _id: id }).lean();
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
        let update_recruiter_profile = {};

        update_recruiter_profile.email = reqbody.email,
            update_recruiter_profile.password = hashpassword,
            update_recruiter_profile.role = reqbody.role,
            update_recruiter_profile.status = reqbody.status || 'In-Active',
            update_recruiter_profile.updated_at = Date.now(),
            update_recruiter_profile.updated_by = user,
            // update_recruiter_profile.reporting_manager = reqbody.role != 'admin'?reqbody.reporting_manager:null
            update_recruiter_profile.first_name = reqbody.first_name,
            update_recruiter_profile.last_name = reqbody.last_name,
            update_recruiter_profile.display_name = reqbody.display_name,
            update_recruiter_profile.alternative_email = reqbody.alternative_email || null,
            update_recruiter_profile.phone_number_home = reqbody.phone_number_home || null,
            update_recruiter_profile.contact_number = reqbody.contact_number,
            update_recruiter_profile.profile = reqbody.profile,
            update_recruiter_profile.current_location = reqbody.current_location



        return await RecruiterModel.updateOne({ _id: id }, update_recruiter_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
    try {

        let user_update_token = await RecruiterModel.updateOne({ email: email }, token_data).lean();
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
        let is_exist_user_token = await RecruiterModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

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
        let reset_password = await RecruiterModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

        if (!reset_password) {
            return false;
        }
        return reset_password;
    } catch (error) {
        console.error("Error : ", error);
    }
};


exports.is_exist_recruiter_submission = async (reqbody) => {
    try {
        let candidate_id = reqbody.candidate_id;
        let recruiter_id = reqbody.recruiter_id;
        let opening_id = reqbody.opening_id;

        let user = await
            CandidateSubmissionsModel.findOne({
                candidate_id: candidate_id,
                recruiter_id: recruiter_id,
                opening_id: opening_id
            }).lean();

        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }

};

exports.recruiter_submission = async (reqbody) => {

    try {
        let recruiter_submit_data = {};
        recruiter_submit_data.opening_id = reqbody.opening_id;
        recruiter_submit_data.recruiter_id = reqbody.recruiter_id;
        recruiter_submit_data.candidate_id = reqbody.candidate_id;
        recruiter_submit_data.submission_status = reqbody.submission_status;
        recruiter_submit_data.bdm_id = reqbody.bdm_id;
        recruiter_submit_data.created_at = Date.now();
        recruiter_submit_data.updated_at = Date.now();

        let recruiter_submission_create = await CandidateSubmissionsModel.create(
            recruiter_submit_data
        );

        let Jobtitle = await JobOpeningModel.findOne(
            { opening_id: reqbody.opening_id },
            { opening_title: 1 }
        );

        let CandidateName = await CandidateModel.findOne(
            { _id: reqbody.candidate_id },
            { first_name: 1, last_name: 1 }
        );
        let fullName = CandidateName.first_name + " " + CandidateName.last_name;


        let recruiter_name = '';
        let submissionby = '';
        if (reqbody.freelancer_recruiter_id != undefined) {
            recruiter_name = await
                UserModel.findOne(
                    { _id: reqbody.freelancer_recruiter_id },
                    { display_name: 1 }
                );
            submissionby = 'freelancer';
        } else {
            recruiter_name = await
                UserModel.findOne(
                    { _id: reqbody.recruiter_id },
                    { display_name: 1 }
                );
            submissionby = 'recruiter';
        }

        if (submissionby == 'recruiter') {
            data_activity = {
                opening_id: reqbody.opening_id,
                company_id: reqbody.company_id,
                recruiter_id: reqbody.recruiter_id,
                freelancer_recruiter_id: reqbody.freelancer_recruiter_id,
                activity_log: `Candidate Shortlist by Recruiter - ${recruiter_name.display_name}`,
                created_at: Date.now(),
                updated_at: Date.now(),
            };

            data_messages = {
                title: "Candidate Shortlist",
                message: `${fullName} Shortlist for ${Jobtitle.opening_title} by Recruiter - ${recruiter_name.display_name}`,
                company_id: reqbody.company_id,
                opening_id: reqbody.opening_id,
                candidate_id: reqbody.candidate_id,
                user_role: "bdm",
                user_id: reqbody.bdm_id,
            };
        } else {
            data_activity = {
                opening_id: reqbody.opening_id,
                company_id: reqbody.company_id,
                freelancer_recruiter_id: reqbody.freelancer_recruiter_id,
                activity_log: `Candidate Shortlist by Freelancer - ${recruiter_name.display_name}`,
                created_at: Date.now(),
                updated_at: Date.now(),
            };

            data_messages = {
                title: "Candidate Shortlist",
                message: `${fullName} Shortlist for ${Jobtitle.opening_title} by Freelancer - ${recruiter_name.display_name}`,
                company_id: reqbody.company_id,
                opening_id: reqbody.opening_id,
                candidate_id: reqbody.candidate_id,
                user_role: "freelancer",
                user_id: reqbody.freelancer_recruiter_id,
            };
        }

        let message_create = await MessageModel.create(data_messages);

        let job_activity_log_create = await JobActivityModel.create(data_activity);
        return { recruiter_submission: recruiter_submission_create };

    } catch (error) {
        console.log(error);
    }
};


const returnSearchString = async (reqbody) => {
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
            // recruiter_id: { $eq:  id },
            created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
        };
    } else {
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
        assignedObj.assigned_recruiter = { $in: [id] };
    }

    if (bdm_id) {
        assignedObj.created_by = mongoose.Types.ObjectId(bdm_id);
    }

    let openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, assignedObj] }, { opening_id: 1 });

    assignedOpeningIds = openingIds.map(item => item.opening_id);
    BdmDateFilterConditions.opening_id = { $in: assignedOpeningIds };

    return BdmDateFilterConditions;
};


exports.count_jobopen_status = async (reqbody) => {
    try {
        const BdmDateFilterConditions = await returnSearchString(reqbody);

        let recruiterJobCount = {};
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
                recruiterJobCount[job._id] = job.count;
            }
        }

        return {
            recruiterJobCount,
            //cntjobsBDMStatus
        };
    } catch (error) {
        console.error("Error", error);
    }
};


exports.jobopen_status = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 10

        const BdmDateFilterConditions = await returnSearchString(reqbody);

        const jobsBDMStatus = await JobOpeningModel.aggregate([
            {
                $match: BdmDateFilterConditions,
            },
            {
                $facet: {
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                    dataInfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            },
            {
                $project: {
                    job_opening_listing: '$data',
                    totalRecords: { $first: '$dataInfo.count' }
                }
            }

        ]);


        let total_pages = Math.ceil(parseInt(jobsBDMStatus[0].totalRecords) / parseInt(limit));

        return {
            job_opening_listing: jobsBDMStatus[0].job_opening_listing,
            totalRecords: jobsBDMStatus[0].totalRecords,
            total_pages
        };

    } catch (error) {
        console.error("Error", error);
    }
};