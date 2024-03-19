const { commonFunctions } = require("../../helper");
const CompanyModel = require("./company.model");
const StateModel = require("./state.model");
const CityModel = require("./city.model");
const mongoose = require("mongoose");
const CandidateModel = require("../candidate/candidate.model");
const CandidateSubmissionModel = require("../jobopening/submission.model");
const JobOpeningModel = require("../jobopening/jobopening.model");
const CategoryModel = require("../jobopening/category.model");
const ContactModel = require("../contact/contact.model");
const InterviewscheduleModel = require("./interviewschedule.model");
const { messageServices } = require("../message");
const BdmAssignment = require("../jobopening/bdmassignment.model");

/*
*  Check Email Exist
*/
exports.is_exist = async (email_1, project) => {
    try {

        let user = await CompanyModel.findOne({ email_1: email_1 }, project).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Company Name Exist
*/
exports.is_exist_company_name = async (company_name) => {
    try {

        let exist_company_name = await CompanyModel.findOne({ company_name: company_name }).lean();
        // let exist_company_name = await CompanyModel.findOne({$or:[ {company_name:reqbody.company_name}, {contact_person_name:reqbody.contact_person_name}, {contact_person_email:reqbody.contact_person_email},{company_code:reqbody.company_code} ]}).lean();
        if (!exist_company_name) {
            return false;
        }
        return exist_company_name;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Contact Person Name Exist
*/
exports.is_exist_contact_person_name = async (contact_person_name) => {
    try {

        let exist_contact_person_name = await CompanyModel.findOne({ contact_person_name: contact_person_name }).lean();
        if (!exist_contact_person_name) {
            return false;
        }
        return exist_contact_person_name;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Contcat Person Email Exist
*/
exports.is_exist_contact_email = async (contact_person_email) => {
    try {
        let exist_contact_email = await CompanyModel.findOne({ contact_person_email: contact_person_email }).lean();
        if (!exist_contact_email) {
            return false;
        }
        return exist_contact_email;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Company Code Exist
*/
exports.is_exist_company_code = async (company_code) => {
    try {

        let exist_company_code = await CompanyModel.findOne({ company_code: company_code }).lean();
        if (!exist_company_code) {
            return false;
        }
        return exist_company_code;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Email Exist And Role
*/
exports.is_exist_role = async (email_1) => {
    try {
        let user = await CompanyModel.findOne({ email_1: email_1, status: "Active" }).lean();
        if (user == null) {
            let obj = {};
            let contact_user = await ContactModel.findOne({ email: email_1 }).lean();

            if (contact_user) {

                let company_data = await CompanyModel.findOne({ _id: contact_user.company_id, status: "Active" }).lean();
                obj = company_data
                obj['contact_person_details'] = contact_user
                return obj;
            }
        } else {
            return user
        }

    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};



exports.save = async (reqbody) => {
    try {

        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        // .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
        let user_company = {};
        user_company.company_name = reqbody.company_name;
        user_company.access = reqbody.access;
        user_company.company_owner = reqbody.company_owner || null;
        user_company.category = reqbody.category;
        user_company.website = reqbody.company_website || null;
        user_company.status = reqbody.status;
        user_company.company_code = reqbody.company_code;
        user_company.phone_number_1 = reqbody.phone_number_1 || null;
        user_company.phone_number_2 = reqbody.phone_number_2 || null;
        user_company.country = reqbody.country;
        user_company.state = reqbody.state;
        user_company.city = reqbody.city;
        user_company.street = reqbody.street || null;
        user_company.zip_code = reqbody.zip_code || null;
        user_company.fax = reqbody.fax || null;
        user_company.email_1 = reqbody.email_1;
        user_company.email_2 = reqbody.email_2 || null;
        user_company.description = reqbody.description || null;
        user_company.industry_type = reqbody.industry_type;
        user_company.employee_strength = reqbody.employee_strength;
        user_company.product_services = reqbody.product_services || null;
        user_company.password = hashpassword;
        user_company.assigned_to_bdm = reqbody.assigned_to_bdm;
        user_company.company_plan_status = 0;
        user_company.created_at = Date.now();
        user_company.updated_at = Date.now();
        user_company.is_email_send = reqbody.is_email_send;

        return await CompanyModel.create(user_company);

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
*  All Company List
*/
exports.companylist = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        let filter_value = reqbody.search;
        let company_id = reqbody.company_id;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let bdm_id = reqbody.bdm_id;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr;
        if (filter_value != '') {
            var regex_filter = new RegExp(filter_value, "i");
            searchStr = { $or: [{ company_name: regex_filter }, { company_owner: regex_filter }, { company_code: regex_filter }] };
        } else {
            searchStr = {};
        }

        let filter_condition = { deleted: false };

        if (categories != '' && categories.length > 0) {
            filter_condition.industry_type = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
        }

        if (status != '') {
            //  var regex_status = new RegExp(status, "i")
            filter_condition.status = status
        }

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];

            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
            filter_condition.created_at = searchDate
        }

        if (company_id != '' && company_id != undefined) {
            filter_condition._id = mongoose.Types.ObjectId(company_id)
        }

        if (bdm_id != '' && bdm_id != undefined) {
            filter_condition.assigned_to_bdm = { $in: [mongoose.Types.ObjectId(bdm_id)] }
        }

        let company_list_details = await CompanyModel.aggregate([
            { $match: filter_condition },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'company_owner',
                    foreignField: '_id',
                    as: 'company_owner'
                }
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'industry_type',
                    foreignField: 'code',
                    as: 'industry_type'
                },
            },
            {
                $lookup:
                {
                    from: 'states',
                    localField: 'state',
                    foreignField: 'code',
                    as: 'state'
                }
            },
            {
                $lookup:
                {
                    from: 'cities',
                    localField: 'city',
                    foreignField: 'code',
                    as: 'city'
                }
            },
            {
                $lookup:
                {
                    from: 'plan_assigns',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$company_id', '$$id'] },
                                        { $eq: ['$plan_assign_status', 'Active'] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'plan_assign_details'
                }
            },
            {
                $project: { company_owner: { $arrayElemAt: ["$company_owner.display_name", 0] }, industry_type: { $arrayElemAt: ["$industry_type.name", 0] }, plan_assign_details: 1, status: 1, created_at: 1, updated_at: 1, company_name: 1, access: 1, category: 1, company_code: 1, phone_number_1: 1, country: 1, state: { $arrayElemAt: ["$state.state", 0] }, city: { $arrayElemAt: ["$city.city", 0] } }
            },

            { $match: searchStr },
            { $sort: sortJson },
            {
                $facet: {
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                    info: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            },
            {
                $project: {
                    paginatedResults: '$data',
                    totalRecords: { $first: '$info.count' }
                }
            }
        ])

        let total_pages = Math.ceil(parseInt(company_list_details[0].totalRecords) / parseInt(limit));


        if (!company_list_details) {
            return false;
        }

        let data = {
            totalRecords: company_list_details[0].totalRecords,
            totalPages: total_pages,
            // totalfilteredRecords: company_list_details[0].totalCount,
            company_list_details: company_list_details[0].paginatedResults
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
* All comapny List names only
*/
exports.companylistNames = async (reqbody) => {
    try {

        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;

        let status = reqbody.status;
        let bdm_id = reqbody.bdm_id;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let filter_condition = { deleted: false };

        if (status != '' && status != undefined) {
            filter_condition.status = status
        }

        if (bdm_id != '' && bdm_id != undefined) {
            filter_condition.assigned_to_bdm = { $in: [mongoose.Types.ObjectId(bdm_id)] }
        }
        // console.log('filter_condition', filter_condition)
        let company_list_details = await CompanyModel.aggregate([
            { $match: filter_condition },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'company_owner',
                    foreignField: '_id',
                    as: 'company_owner'
                }
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'industry_type',
                    foreignField: 'code',
                    as: 'industry_type'
                },
            },
            {
                $lookup:
                {
                    from: 'states',
                    localField: 'state',
                    foreignField: 'code',
                    as: 'state'
                }
            },
            {
                $lookup:
                {
                    from: 'cities',
                    localField: 'city',
                    foreignField: 'code',
                    as: 'city'
                }
            },
            {
                $lookup:
                {
                    from: 'plan_assigns',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$company_id', '$$id'] },
                                        { $eq: ['$plan_assign_status', 'Active'] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'plan_assign_details'
                }
            },

            {
                $project: { company_owner: { $arrayElemAt: ["$company_owner.display_name", 0] }, industry_type: { $arrayElemAt: ["$industry_type.name", 0] }, status: 1, created_at: 1, updated_at: 1, company_name: 1, access: 1, category: 1, company_code: 1, }
            },


            { $sort: sortJson },



        ])



        if (!company_list_details) {
            return false;
        }

        return company_list_details;

    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  User Profile Details By Id
*/
exports.get = async (reqbody) => {
    try {
        // let user_profile_details = await CompanyModel.findOne({ _id: id },{created_at:0,updated_at:0}).populate('company_owner','display_name').lean();

        let obj = {}
        if (reqbody.contact_id != "") {
            var contact_id = reqbody.contact_id
        }

        let user_profile_details = await CompanyModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(reqbody.company_id) } },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'company_owner',
                    foreignField: '_id',
                    as: 'company_owner'
                }
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'industry_type',
                    foreignField: 'code',
                    as: 'industry_type'
                },
            },
            {
                $lookup:
                {
                    from: 'states',
                    localField: 'state',
                    foreignField: 'code',
                    as: 'state'
                }
            },
            {
                $lookup:
                {
                    from: 'cities',
                    localField: 'city',
                    foreignField: 'code',
                    as: 'city'
                }
            },
            // {
            //     $lookup:
            //     {
            //         from: 'contacts',
            //         let: { id: '$_id' },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             { $eq: ['$deleted', false] },
            //                             { $eq: ['$company_id', '$$id'] },
            //                             { $eq: ['$_id', mongoose.Types.ObjectId(contact_id)] },
            //                         ]
            //                     }
            //                 }
            //             }
            //         ],
            //         // localField: 'city',
            //         // foreignField: 'code',
            //         as: 'contacts_details'
            //     }
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'plan_assigns',
            //         let: { id: '$_id' },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             { $eq: ['$deleted', false] },
            //                             { $eq: ['$company_id', '$$id'] },
            //                             { $eq: ['$plan_assign_status', 'Active'] },
            //                         ]
            //                     }
            //                 }
            //             }
            //         ],
            //         as: 'plan_assign_details'
            //     }
            // },
            { $project: { "company_owner._id": 1, "company_owner.display_name": 1, "industry_type.code": 1, "industry_type.name": 1, product_services: 1, employee_strength: 1, status: 1, company_name: 1, access: 1, category: 1, website: 1, company_code: 1, phone_number_1: 1, phone_number_2: 1, country: 1, is_email_send: 1, "state.code": 1, "state.state": 1, "city.code": 1, "city.city": 1, street: 1, zip_code: 1, fax: 1, email_1: 1, email_2: 1, description: 1, created_at: 1, updated_at: 1, updated_by: 1, assigned_to_bdm: 1 } }

        ])

        let contact_person_details = await ContactModel.findOne({ _id: mongoose.Types.ObjectId(contact_id) }).lean();


        if (!user_profile_details) {
            return false;
        }

        if (contact_person_details != null) {
            obj["user_detail"] = user_profile_details[0]
            obj['contact_person_details'] = contact_person_details;
            return obj
        } else {
            obj["user_detail"] = user_profile_details[0]
            return obj;
        }
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_user = async (id) => {
    try {
        let user_exist = await CompanyModel.findOne({ _id: id }).lean();
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

        // hashpassword = await commonFunctions.hashPassword(reqbody.password);
        let update_company_profile = {};

        update_company_profile.company_name = reqbody.company_name,
            update_company_profile.access = reqbody.access,
            update_company_profile.company_owner = reqbody.company_owner || null,
            update_company_profile.category = reqbody.category,
            update_company_profile.website = reqbody.website || null,
            update_company_profile.status = reqbody.status,
            update_company_profile.company_code = reqbody.company_code,
            update_company_profile.phone_number_1 = reqbody.phone_number_1 || null,
            update_company_profile.phone_number_2 = reqbody.phone_number_2 || null,
            update_company_profile.country = reqbody.country,
            update_company_profile.state = reqbody.state,
            update_company_profile.city = reqbody.city,
            update_company_profile.street = reqbody.street || null,
            update_company_profile.zip_code = reqbody.zip_code || null,
            update_company_profile.fax = reqbody.fax || null,
            update_company_profile.email_1 = reqbody.email_1,
            update_company_profile.email_2 = reqbody.email_2 || null,
            update_company_profile.description = reqbody.description || null,
            update_company_profile.industry_type = reqbody.industry_type,
            update_company_profile.employee_strength = reqbody.employee_strength,
            update_company_profile.product_services = reqbody.product_services || null,
            update_company_profile.updated_at = Date.now(),
            update_company_profile.updated_by = user,
            update_company_profile.assigned_to_bdm = reqbody.assigned_to_bdm,
            update_company_profile.is_email_send = reqbody.is_email_send

        return await CompanyModel.updateOne({ _id: id }, update_company_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
    try {

        let user_update_token = await CompanyModel.updateOne({ email_1: email }, token_data).lean();
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
        let is_exist_user_token = await CompanyModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

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
exports.user_password_reset = async (reqbody) => {
    try {
        //password covert into hash
        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        let update_user_password_reset = {
            password: hashpassword,
            updated_at: Date.now(),
            // updated_by : user
        };

        // user_password_reset
        let reset_password = await CompanyModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

        if (!reset_password) {
            return false;
        }
        return reset_password;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Delete Company Profile
*/
exports.delete = async (id, user) => {
    try {

        let check_user_exist = await CompanyModel.findOne({ _id: id }).lean();

        if (!check_user_exist) {
            return false;
        }

        const userUpdate = await CompanyModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        return CompanyModel.removeOne({ _id: id });

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


/*
 *   List of Company Name bdm id wise used in job opening account name dropdown
*/
exports.account_name_list = async (reqbody) => {
    try {

        const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_bdm: { $in: [mongoose.Types.ObjectId(reqbody.bdm_id)] } }] });
        const openingIdsArr = openingIds.map(item => item.opening_id)

        let assigned_bdm_job = await JobOpeningModel.distinct('account_name', { opening_id: { $in: openingIdsArr }, deleted: false }).lean();
        let company_name_list = await CompanyModel.find({ _id: { $in: assigned_bdm_job } }, { company_name: 1 }).lean();

        if (!company_name_list) {
            return false;
        }
        return company_name_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *   List of Company Name  recruiter id wise used in job opening account name dropdown
*/
exports.company_name_list_recruiter_wise = async (reqbody) => {
    try {

        const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_recruiter: { $in: [mongoose.Types.ObjectId(reqbody.recruiter_id)] } }] });
        const openingIdsArr = openingIds.map(item => item.opening_id)

        let assigned_recruiter_job = await JobOpeningModel.distinct('account_name', { opening_id: { $in: openingIdsArr }, deleted: false }).lean();

        let company_name_list = await CompanyModel.find({ _id: { $in: assigned_recruiter_job } }, { company_name: 1 }).lean();

        if (!company_name_list) {
            return false;
        }
        return company_name_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 * Company Password Change
*/

exports.change_company_password = async (reqbody, user) => {
    try {

        let hashpassword = await commonFunctions.hashPassword(reqbody.new_password);
        const company_password_changed = await CompanyModel.updateOne({ _id: reqbody.company_id }, { password: hashpassword, updated_at: Date.now(), updated_by: user }).lean();
        if (!company_password_changed) {
            return false;
        }
        return company_password_changed;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 * Candidate Submission List by bdm showing to Company
*/

exports.candidte_submission_list_for_company = async (reqbody, user) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let submission_status = reqbody.status;
        let category = reqbody.category;
        let company_id = reqbody.company_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;

        let submission_status_query = {
            $and: [
                { $eq: ['$company_id', '$$id'] },
                { $eq: ['$deleted', false] },
                { $eq: ['$candidate_select_by_bdm', 1] },
            ]
        }

        let job_opening_category_query = {
            $and: [
                { $eq: ['$deleted', false] },
                { $eq: ['$opening_id', '$$id'] },

            ]
        }

        if (reqbody.dateRange != undefined && reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];

            submission_status_query["$and"].push(
                { "$gte": ["$created_at", new Date(fromDate)] },
                { "$lte": ["$created_at", new Date(toDate + "T23:59:59.999Z")] })

        }

        let submission_second_status_query = {
            $and: [
                { $eq: ['$deleted', false] },
                { $eq: ['$candidate_id', '$$id'] },
                { $eq: ['$candidate_select_by_bdm', 1] },
                { $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] },
            ]
        }

        if (submission_status != "") {
            submission_status_query["$and"].push({ $eq: ['$submission_status', submission_status] })
            submission_second_status_query["$and"].push({ $eq: ['$submission_status', submission_status] })
        }

        if (opening_id != "") {
            submission_status_query["$and"].push({ $eq: ['$opening_id', opening_id] })
        }

        if (category != "") {
            job_opening_category_query["$and"].push({ $eq: ['$category', category] })
        }

        //Return count of Total Records and Total Pages
        let candidate_submission_list_total_pages = await CompanyModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(company_id), deleted: false } },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: submission_status_query
                            }
                        },


                    ],
                    as: 'candidate_submissions'
                }
            },

            {
                $lookup:
                {
                    from: 'candidates',
                    let: { candidate_id: '$candidate_submissions.candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $in: ["$_id", "$$candidate_id"] }

                                    ]
                                }
                            }
                        },

                        {
                            $lookup:
                            {
                                from: 'candidate_submissions',
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: submission_second_status_query
                                            /*{
                                            $and: [
                                                { $eq: ['$deleted', false] },
                                                { $eq: ['$candidate_id', '$$id'] },
                                                { $eq: ['$candidate_select_by_bdm', 1] },
                                                { $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] },
                                            ]
                                        }*/
                                        }
                                    },
                                ],
                                as: 'opening_details'
                            },

                        },

                        {
                            $unwind: {
                                path: "$opening_details",
                                "preserveNullAndEmptyArrays": true
                            }
                        },


                    ],
                    as: 'candidate_details'
                },


            },

            { $addFields: { candidateCount: { $size: "$candidate_details" } } },

        ]);

        //Return Paginated Data
        let candidate_submission_list_for_company = await CompanyModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(company_id), deleted: false } },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: submission_status_query
                                //  {
                                //     $and: [
                                //         { $eq: ['$company_id', '$$id'] },
                                //         { $eq: ['$deleted', false] },
                                //         { $eq: ['$candidate_select_by_bdm', 1] },
                                //         // { $eq: ['$submission_status', 'Old'] },
                                //     ],
                                //     // $or:[{$eq:['$submission_status','placed']}]
                                // }
                            }
                        },

                        //{ $sort:{updated_at:-1} }

                    ],
                    as: 'candidate_submissions'
                }
            },

            {
                $lookup:
                {
                    from: 'candidates',
                    //   localField: 'candidate_submissions.candidate_id',
                    //   foreignField: '_id',
                    let: { candidate_id: '$candidate_submissions.candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $in: ["$_id", "$$candidate_id"] },
                                    ]
                                }
                            }
                        },
                        //{ $sort:{updated_at:-1} },

                        {
                            $lookup:
                            {
                                from: 'employees',
                                let: { id: '$_id' },
                                pipeline: [
                                    // {
                                    //     $limit: 1
                                    // },
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $in: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$deleted', false] },
                                                    { $eq: ['$is_current_company', true] },
                                                ]
                                            }
                                        }
                                    },
                                    { $limit: 1 }
                                ],
                                as: 'employess'
                            },

                        },
                        {
                            $lookup: {
                                from: "interviewschedules",
                                let: { id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$candidate_id", "$$id"] },
                                                    { $eq: ["$deleted", false] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: "interviewschedules",
                            },
                        },
                        {
                            $lookup:
                            {
                                from: 'candidate_qualifications',
                                //   localField: '_id',
                                //   foreignField: 'candidate_id',
                                let: { id: '$_id' },
                                pipeline: [

                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$deleted', false] },
                                                    { $eq: ["$candidate_id", "$$id"] },

                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: 'candidate_qualifications'
                            }
                        },

                        {
                            $lookup:
                            {
                                from: 'candidate_submissions',
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: submission_second_status_query,
                                            /*  {
                                              $and: [
                                                  { $eq: ['$deleted', false] },
                                                  { $eq: ['$candidate_id', '$$id'] },
                                                  { $eq: ['$candidate_select_by_bdm', 1] },
                                                  // { $eq: ['$submission_status', 'submit'] },
                                                           { $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] },
                                         // { $eq: ['$opening_id',reqbody.opening_id] },
                                                  // {$eq :['$submission_status','placed']}
                                              ],
                                              // $or: [{'$submission_status':"placed"}]
                                          }*/
                                        }
                                    },

                                    //{ $sort:{updated_at:-1} },

                                    {
                                        $lookup:
                                        {
                                            from: 'jobopenings',
                                            let: { id: '$opening_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: job_opening_category_query
                                                    }
                                                },
                                            ],
                                            as: 'job_opening_details'
                                        },

                                    },

                                    { $sort: { updated_at: -1 } },
                                ],
                                as: 'opening_details'
                            },

                        },

                        {
                            $unwind: {
                                path: "$opening_details",
                                "preserveNullAndEmptyArrays": true
                            }
                        },

                        {
                            $project: {
                                email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                "interviewschedules": 1, "employess": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details._id": 1, "opening_details.job_opening_details.required_skills": 1, "opening_details.job_opening_details.opening_title": 1, "opening_details.job_opening_details.opening_id": 1, "opening_details.job_opening_details.required_experience": 1, "opening_details.job_opening_details.category": 1, "opening_details.job_opening_details.job_description": 1,
                                "opening_details.job_opening_details.short_description": 1, "opening_details.job_opening_details.salary_range_from": 1, "opening_details.job_opening_details.salary_range_to": 1,
                                candidate_qualifications_details: {
                                    $filter: {
                                        input: "$candidate_qualifications",
                                        as: "item",
                                        cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                    }
                                }
                            }
                        },
                        { $sort: { "opening_details.updated_at": -1 } },
                        { $skip: Number(offset) }, { $limit: Number(limit) }
                    ],
                    as: 'candidate_details'
                },
            },
        ]);

        let data = {};

        if (candidate_submission_list_total_pages.length > 0) {

            let total_pages = Math.ceil(parseInt(candidate_submission_list_total_pages[0].candidateCount) / parseInt(limit));

            data.totalRecords = candidate_submission_list_total_pages[0].candidateCount
            data.totalPages = total_pages
        } else {
            data.totalRecords = 0
            data.totalPages = 0
            data.candidate_submission_listing = []
        }

        if (candidate_submission_list_for_company.length > 0) {

            // data.candidate_submission_listing = candidate_submission_list_for_company[0].candidate_details
            data.candidate_submission_listing = candidate_submission_list_for_company[0].candidate_details

        }
        return data



    } catch (error) {
        console.error("Error : ", error);
    }
};



//All State List
exports.state_list = async () => {
    try {

        let all_state_list = await StateModel.find({ "state": { $ne: "Remote" } }, { _id: 0 }).sort({ state: 1 }).lean();
        if (!all_state_list) {
            return false;
        }
        let addRemoteObj = {};
        addRemoteObj = {
            "code": 3980,
            "state": "Remote"
        };

        all_state_list.unshift(addRemoteObj)
        return all_state_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};


//All City List
exports.city_list = async (reqbody) => {
    try {

        let city_list = await CityModel.find({ state_id: reqbody.state_id }, { _id: 0, state_id: 0 }).sort({ city: 1 }).lean();
        if (!city_list) {
            return false;
        }
        return city_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};

//Add State
exports.state_add = async (reqbody) => {
    try {

        let name = reqbody.name;

        let getlaststate = await StateModel.findOne({}).sort('-code').lean();

        if (getlaststate) {

            let saveStateObject = {};
            let Lastcode = getlaststate.code;
            saveStateObject.code = Lastcode + 1;
            saveStateObject.state = name;

            let saveState = await StateModel.create(saveStateObject);
            if (!saveState) {
                return false;
            }
            return saveState;

        } else {
            return false;
        }


    } catch (error) {
        console.error("Error : ", error);
    }
};

//Check state is exists or not
exports.check_state_exists = async (reqbody) => {
    try {

        let name = reqbody.name;

        let checkStateexists = await StateModel.find({ state: name }, { _id: 0 }).lean();

        if (!checkStateexists) {
            return false;
        }
        return checkStateexists;

    } catch (error) {
        console.error("Error : ", error);
    }
};

//Check state is exists or not
exports.check_state_exists_by_id = async (reqbody) => {
    try {

        let state_id = reqbody.state_id;

        let checkStateexists = await StateModel.find({ code: state_id }, { _id: 0 }).lean();

        if (!checkStateexists) {
            return false;
        }
        return checkStateexists;

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.city_add = async (reqbody) => {
    try {

        let name = reqbody.name;
        let state_id = reqbody.state_id;
        let saveCity = {};
        let SaveCityArray = [];
        for (city of name) {

            let checkCityExist = await CityModel.findOne({ "city": city }).lean();
            if (!checkCityExist) {
                let getlastcity = await CityModel.findOne({}).sort('-code').lean();
                if (getlastcity) {
                    let LastCode = getlastcity.code;
                    let saveCityObject = {};
                    saveCityObject.code = LastCode + 1;
                    saveCityObject.state_id = state_id;
                    saveCityObject.city = city;
                    saveCity = await CityModel.create(saveCityObject);
                    SaveCityArray.push(saveCity);
                }
            }
        }

        if (!SaveCityArray) {
            return false;
        }
        return SaveCityArray;

    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Get BDM Selected Candidate Details By id For Company
*/
exports.candidate_details = async (reqbody) => {
    try {

        let candidate = await CandidateModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(reqbody.candidate_id), deleted: false } },

            {
                $lookup:
                {
                    from: 'candidate_qualifications',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$candidate_id', '$$id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0, course: 1, course_type: 1, passing_year: 1, qualification: 1, specialization: 1, university: 1
                            }
                        }
                    ],
                    as: 'candidate_qualifications'
                },
            },
            {
                $lookup:
                {
                    from: 'employees',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$candidate_id', '$$id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0, __v: 0, created_at: 0, updated_at: 0, deleted: 0, deleted_by: 0
                            }
                        }
                    ],
                    as: 'employees'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    let: { job_category: '$job_category' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$code', '$$job_category'] },
                                        //   { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'job_category'
                },
            },
            {
                $lookup: {
                    from: 'candidate_it_skills',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$candidate_id', '$$id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_it_skills',

                }
            },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$candidate_id', '$$id'] },
                                        { $eq: ['$candidate_select_by_bdm', 1] },
                                        { $eq: ['$opening_id', reqbody.opening_id] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'candidate_submission'
                },
            },

            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'candidate_submission.opening_id',
                    foreignField: 'opening_id',
                    // pipeline: [{
                    //     $project: { _id: 0, salary_range_from: 1, salary_range_to: 1, title: 1 }
                    // }],
                    as: 'job_opening_details'
                },
            },
            {

                $project: {
                    attachments: 1,
                    created_at: 1,
                    email: 1,
                    first_name: 1,
                    last_name: 1,
                    middle_name: 1,
                    mobile: 1,
                    notes: 1,
                    profile_strength: 1,
                    status: 1,
                    total_work_exp_month: 1,
                    total_work_exp_year: 1,
                    profile_image: 1,
                    employees: 1,
                    job_category: 1,
                    current_location: 1,
                    date_of_birth: 1,
                    permanent_address: 1,
                    gender: 1,
                    home_town: 1,
                    role: 1,
                    current_ctc: 1,
                    desired_employment_type: 1,
                    profile_summary: 1,
                    area_pin_code: 1,
                    desired_job_type: 1,
                    desired_shift: 1,
                    desired_location: 1,
                    candidate_it_skills: 1,
                    candidate_qualifications: 1,
                    job_opening_details: { $arrayElemAt: ['$job_opening_details', 0] },
                    candidate_submission: { $arrayElemAt: ['$candidate_submission', 0] }
                }
            }


        ]);

        return candidate;
    } catch (error) {
        console.error("Error : ", error);
    }
};


//Get CompanyWise Job Opening Id List dropdown
exports.company_opening_id_list = async (reqbody) => {
    try {

        // let opening_id_title_list = await JobOpeningModel.find({ account_name: reqbody.company_id }, { opening_id:1,opening_title:1 }).lean();
        let opening_id = await CandidateSubmissionModel.distinct("opening_id", { company_id: reqbody.company_id, deleted: false }).lean();

        let opening_details = await JobOpeningModel.find({ opening_id: { $in: opening_id } }, { opening_id: 1, opening_title: 1 })

        let opening_detail_list = [];

        for (var i = 0; i < opening_details.length; i++) {

            let obj = {};
            obj["opening_id"] = opening_details[i].opening_id;
            obj["opening_title"] = opening_details[i].opening_title;
            opening_detail_list.push(obj);
        }

        let data = {
            opening_detail_list: opening_detail_list,

        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};


//Get Company Wise ShortList Candidate Category List dropdown
exports.company_category_list = async (reqbody) => {
    try {

        let opening_id = await CandidateSubmissionModel.distinct("opening_id", { company_id: reqbody.company_id, deleted: false }).lean();

        let category_details = await JobOpeningModel.distinct('category', { opening_id: { $in: opening_id }, deleted: false })

        let category_name = await CategoryModel.find({ code: { $in: category_details } }, { code: 1, name: 1, _id: 0 })


        return { category: category_name };
    } catch (error) {
        console.error("Error : ", error);
    }
};




//Company Status Change By Company Id
exports.company_status_change = async (id, reqbody, user) => {
    try {

        let update_company_status = {
            status: reqbody.status,
            updated_at: Date.now(),
            updated_by: user._id
        }

        return await CompanyModel.updateOne({ _id: id }, update_company_status).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.count_jobopen_status = async (reqbody) => {
    try {
        let from_date = '';
        let to_date = '';
        let daterange = reqbody.dateRange;
        let id = mongoose.Types.ObjectId(reqbody.id);
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
                account_name: { $eq: id },
                created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
            };
        } else {
            BdmDateFilterConditions = { deleted: false, account_name: { $eq: id } };
        }

        if (status) {
            BdmDateFilterConditions.status = status;
        }
        if (bdm_id) {
            BdmDateFilterConditions.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
        }
        if (opening_id) {
            BdmDateFilterConditions.opening_id = opening_id;
        }
        if (opening_title) {
            BdmDateFilterConditions.opening_title = opening_title;
        }
        if (recruiter_id) {
            BdmDateFilterConditions.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
        }
        if (company_id) {
            BdmDateFilterConditions.account_name = mongoose.Types.ObjectId(company_id);
        }

        if (freelance_id) {
            BdmDateFilterConditions.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
        }


        let companyJobCount = {};
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
                companyJobCount[job._id] = job.count;
            }
        }

        //Candidate submission count
        let candidateDateFilterConditions = {};
        if (
            from_date != undefined &&
            to_date != undefined &&
            from_date != "" &&
            to_date != ""
        ) {
            candidateDateFilterConditions = {
                deleted: false,
                company_id: { $eq: id },
                candidate_select_by_bdm: 1,
                created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
            };
        } else {
            candidateDateFilterConditions = {
                deleted: false,
                candidate_select_by_bdm: 1,
                company_id: { $eq: id },
            };
        }
        if (status) {
            candidateDateFilterConditions.submission_status = status;
        }
        if (bdm_id) {
            candidateDateFilterConditions.bdm_id = mongoose.Types.ObjectId(bdm_id);
        }
        if (opening_id) {
            candidateDateFilterConditions.opening_id = opening_id;
        }
        if (opening_title) {
            candidateDateFilterConditions.opening_title = opening_title;
        }
        if (recruiter_id) {
            candidateDateFilterConditions.recruiter_id = mongoose.Types.ObjectId(recruiter_id);
        }
        if (company_id) {
            candidateDateFilterConditions.company_id = mongoose.Types.ObjectId(company_id);
        }
        if (freelance_id) {
            candidateDateFilterConditions.freelancer_recruiter_id = mongoose.Types.ObjectId(freelance_id);
        }

        let candidateJobCount = {};
        const cntjobsCandidateStatus = await CandidateSubmissionModel.aggregate([
            {
                $match: candidateDateFilterConditions,
            },
            {
                $group: {
                    _id: "$submission_status",
                    count: { $sum: 1 },
                },
            },
        ]);

        if (cntjobsCandidateStatus) {
            for (job of cntjobsCandidateStatus) {
                candidateJobCount[job._id] = job.count;
            }
        }


        return {
            companyJobCount,
            candidateJobCount
        };
    } catch (error) {
        console.error("Error", error);
    }
};

exports.candidte_submission_list_by_company = async (reqbody, user) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let submission_status = reqbody.status;
        let category = reqbody.category;
        let company_id = reqbody.company_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;

        let submission_status_query = {
            $and: [
                // { $eq: ['$company_id', '$$id'] },
                { $eq: ['$deleted', false] },
                { $eq: ['$candidate_select_by_bdm', 1] },
            ]
        }

        let job_opening_category_query = {
            $and: [
                { $eq: ['$deleted', false] },
                { $eq: ['$opening_id', '$$id'] },
            ]
        }

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];

            submission_status_query["$and"].push(
                { "$gte": ["$created_at", new Date(fromDate)] },
                { "$lte": ["$created_at", new Date(toDate + "T23:59:59.999Z")] })

        }

        if (submission_status != "") {
            submission_status_query["$and"].push({ $eq: ['$submission_status', submission_status] })
        }

        if (opening_id != "") {
            submission_status_query["$and"].push({ $eq: ['$opening_id', opening_id] })
        }

        if (category != "") {
            job_opening_category_query["$and"].push({ $eq: ['$category', category] })
        }

        let candidateSubmissionCondition = {
            $and: [
                { $eq: ['$deleted', false] },
                { $eq: ['$candidate_id', '$$id'] },
                { $eq: ['$candidate_select_by_bdm', 1] },
            ]
        }
        if (company_id && company_id != undefined && company_id != '') {
            submission_status_query["$and"].push({ $eq: ['$company_id', '$$id'] })

            candidateSubmissionCondition["$and"].push({ $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] })
        }

        if (submission_status != '' && submission_status != undefined) {
            candidateSubmissionCondition["$and"].push({ $eq: ['$submission_status', submission_status] })
        }

        let matchoneConditions = { deleted: false };
        if (company_id != '' && company_id != undefined) {
            matchoneConditions._id = mongoose.Types.ObjectId(company_id);
        }

        //Return Paginated Data
        let candidate_submission_list_for_company = await CompanyModel.aggregate([
            { $match: matchoneConditions },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: submission_status_query

                            }
                        },

                    ],
                    as: 'candidate_submissions'
                }
            },

            {
                $lookup:
                {
                    from: 'candidates',
                    //   localField: 'candidate_submissions.candidate_id',
                    //   foreignField: '_id',
                    let: { candidate_id: '$candidate_submissions.candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $in: ["$_id", "$$candidate_id"] },
                                    ]
                                }
                            },
                        },

                        {
                            $lookup:
                            {
                                from: 'employees',
                                let: { id: '$_id' },
                                pipeline: [
                                    // {
                                    //     $limit: 1
                                    // },
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $in: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$deleted', false] },
                                                    { $eq: ['$is_current_company', true] },
                                                ]
                                            }
                                        }
                                    },
                                    { $limit: 1 }
                                ],
                                as: 'employess'
                            },

                        },

                        {
                            $lookup:
                            {
                                from: 'candidate_qualifications',
                                //   localField: '_id',
                                //   foreignField: 'candidate_id',
                                let: { id: '$_id' },
                                pipeline: [

                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$deleted', false] },
                                                    { $eq: ["$candidate_id", "$$id"] },

                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: 'candidate_qualifications'
                            }
                        },

                        {
                            $lookup:
                            {
                                from: 'candidate_submissions',
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: candidateSubmissionCondition
                                            /*  $expr: {
                                                  $and: [
                                                      { $eq: ['$deleted', false] },
                                                      { $eq: ['$candidate_id', '$$id'] },
                                                      { $eq: ['$candidate_select_by_bdm', 1] },
                                                      { $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] },
                                                  ],
                                              }*/
                                        }
                                    },


                                    {
                                        $lookup:
                                        {
                                            from: 'jobopenings',
                                            let: { id: '$opening_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: job_opening_category_query
                                                    }
                                                },
                                            ],
                                            as: 'job_opening_details'
                                        },

                                    },

                                    // {
                                    //     "$sort": { updated_at: -1 }
                                    // },



                                    // { $limit: 1 }
                                ],
                                as: 'opening_details'
                            },

                        },

                        {
                            $unwind: {
                                path: "$opening_details",
                                "preserveNullAndEmptyArrays": true
                            }
                        },

                        { "$sort": { "opening_details.updated_at": -1 } },
                        {
                            $project: {
                                email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                "employess": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details._id": 1, "opening_details.job_opening_details.required_skills": 1, "opening_details.job_opening_details.opening_title": 1, "opening_details.job_opening_details.opening_id": 1, "opening_details.job_opening_details.required_experience": 1, "opening_details.job_opening_details.category": 1, "opening_details.job_opening_details.job_description": 1,
                                "opening_details.job_opening_details.short_description": 1, "opening_details.job_opening_details.salary_range_from": 1, "opening_details.job_opening_details.salary_range_to": 1,
                                candidate_qualifications_details: {
                                    $filter: {
                                        input: "$candidate_qualifications",
                                        as: "item",
                                        cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                    }
                                }
                            }
                        },
                        // {
                        //     "$sort": { updated_at: -1 }
                        // }
                    ],
                    as: 'candidate_details'


                },




            },


        ]);


        let data = {};


        if (candidate_submission_list_for_company.length > 0) {

            // data.candidate_submission_listing = candidate_submission_list_for_company[0].candidate_details
            data.candidate_submission_listing = candidate_submission_list_for_company[0].candidate_details

        }
        return data



    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.update_job_submission_view_status_by_company = async (reqbody) => {

    try {
        let company_id = mongoose.Types.ObjectId(reqbody.company_id);
        let opening_id = reqbody.opening_id;

        let result = await CandidateSubmissionModel.updateMany({ company_id: company_id, opening_id: opening_id }, { is_company_view_submission: 0 }).lean();

        return result

    } catch (error) {
        console.error("Error : ", error);
    }


};

exports.saveInterviewSchedule = async (reqbody) => {
    try {

        let saveupdate = 0;
        if (reqbody.submission_id != '' && reqbody.submission_id != undefined) {
            let sub_id = mongoose.Types.ObjectId(reqbody.submission_id);
            let result = await InterviewscheduleModel.find({ deleted: false, submission_id: sub_id }).lean();
            if (result.length > 0) {
                saveupdate = 1;
            }
        }

        let interview_schedule = {};

        if (reqbody.comment != '' && reqbody.comment != undefined) {
            interview_schedule.comment = reqbody.comment
        }

        if (reqbody.status != '' && reqbody.status != undefined) {
            interview_schedule.status = reqbody.status
        }

        if (reqbody.opening_id != '' && reqbody.opening_id != undefined) {
            interview_schedule.opening_id = reqbody.opening_id
        }

        if (reqbody.candidate_id != '' && reqbody.candidate_id != undefined) {
            interview_schedule.candidate_id = reqbody.candidate_id
        }

        if (reqbody.bdm_id != '' && reqbody.bdm_id != undefined) {
            interview_schedule.bdm_id = reqbody.bdm_id
        }

        if (reqbody.company_id != '' && reqbody.company_id != undefined) {
            interview_schedule.company_id = reqbody.company_id
        }

        if (reqbody.recruiter_id != '' && reqbody.recruiter_id != undefined) {
            interview_schedule.recruiter_id = reqbody.recruiter_id
        }

        if (reqbody.freelancer_recruiter_id != '' && reqbody.freelancer_recruiter_id != undefined) {
            interview_schedule.freelancer_recruiter_id = reqbody.freelancer_recruiter_id
        }
        if (reqbody.message != '' && reqbody.message != undefined) {
            interview_schedule.message = reqbody.message
        } else {
            interview_schedule.message = "Interview has been scheduled at " + reqbody.date_of_interview
        }
        interview_schedule.date_of_interview = reqbody.date_of_interview,
            interview_schedule.duration = reqbody.duration,
            interview_schedule.interview_type = reqbody.interview_type || null,
            interview_schedule.time_of_interview = reqbody.time_of_interview,
            interview_schedule.submission_id = reqbody.submission_id || null,

            interview_schedule.created_at = Date.now()
        interview_schedule.updated_at = Date.now()

        if (saveupdate == 0) {
            const company_data = await this.get({ company_id: reqbody.company_id });

            reqbody.title = 'Interview Scheduled';
            reqbody.message = "Interview has been scheduled at " + reqbody.date_of_interview + " by " + company_data.user_detail.company_name;
            const res = await messageServices.save(reqbody);
            return await InterviewscheduleModel.create(interview_schedule);

        }
        else {
            let subm_id = mongoose.Types.ObjectId(reqbody.submission_id);
            return await InterviewscheduleModel.updateOne({ submission_id: subm_id }, interview_schedule);
        }
        //return await InterviewscheduleModel.create(interview_schedule);
    } catch (error) {
        console.error("Error : ", error);
    }
};