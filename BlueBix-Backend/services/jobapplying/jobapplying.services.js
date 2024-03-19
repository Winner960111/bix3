const JobApplyingModel = require("./jobapplying.model");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");


/*
*  Check Opening Id and Candidate Exist
*/
exports.is_exist_Candidate_Opening_id = async (reqbody) => {
    try {
        let is_exist_Candidate_Opening_id = await JobApplyingModel.findOne({ job_opening_id: reqbody.job_opening_id, candidate_id: reqbody.candidate_id }).lean();

        if (!is_exist_Candidate_Opening_id) {
            return false;
        }
        return is_exist_Candidate_Opening_id;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Candidate Job Applying 
*/
exports.save = async (reqbody, user) => {
    try {

        const jobapplying = new JobApplyingModel({
            company_id: reqbody.company_id,
            job_opening_id: reqbody.job_opening_id,
            opening_title: reqbody.opening_title,
            candidate_id: reqbody.candidate_id,
            // candidate_id       : user,
            // recruiter_id       : reqbody.recruiter_id,
            profile_submit: 1,
            profile_shortlist: 0,
            interview_schedule: 0,
            created_by: user,
            updated_by: user
            // created_at              : Date.now(),
            // updated_at              : Date.now()
        });
        return await jobapplying.save();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Admin,BDM,Recruiter Listing Job Opening 
*/
exports.list = async (reqbody) => {
    try {

        // let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        // let limit = parseInt(reqbody.per_page) || 10
        // let order_column = reqbody.order_column || 'updated_at'
        // let sort_order = reqbody.sort_order;
        // let filter_value = reqbody.filter_value

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        let filter_value = reqbody.search;

        let sortJson = {};


        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr;

        if (filter_value != '') {
            searchStr = { $or: [{ 'job_opening_id.contact_name': filter_value }, { 'job_opening_id.required_skills': filter_value }, { 'recruiter_id.display_name': new RegExp(filter_value, "i") }] };
        } else {
            searchStr = {};
        }

        let totalRecords = await JobApplyingModel.countDocuments({ deleted: false });

        let job_applying_listing = await JobApplyingModel.aggregate([
            { $match: { deleted: false } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'job_opening_id',
                    foreignField: 'opening_id',
                    as: 'job_opening_id'
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    as: 'candidate_id'
                }
            },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'recruiter_id',
                    foreignField: '_id',
                    as: 'recruiter_id'
                }
            },
            {
                $project: { profile_submit: 1, profile_shortlist: 1, interview_schedule: 1, created_at: 1, updated_at: 1, company_name: { $arrayElemAt: ["$company_id.company_name", 0] }, 'job_opening_id.required_skills': 1, 'job_opening_id.opening_id': 1, 'candidate_id.key_skills': 1, 'candidate_id.first_name': 1, 'recruiter_id.display_name': 1 }
            },

            { $match: searchStr },
            { $sort: sortJson },
            {
                $facet: {
                    // totalCount: [
                    //         {
                    //         $count: 'filteredRecords'
                    //         }
                    //     ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }


        ])

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        if (!job_applying_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // filterRecords : job_applying_listing[0].totalCount,
            job_applying_listing: job_applying_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
 *  Candidate Job Applying Profile Short List By Recruiter 
*/
exports.candidate_profile_shortlist = async (reqbody, user) => {
    try {
        let candidate_profile_shortlist = await JobApplyingModel.updateOne({ job_opening_id: reqbody.job_opening_id, candidate_id: reqbody.candidate_id }, { profile_shortlist: 1, interview_schedule: 1 }).lean();

        if (!candidate_profile_shortlist) {
            return false;
        }
        return candidate_profile_shortlist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Job Applying Details By Id
*/
exports.get = async (id) => {
    try {
        // let job_opening_details = await JobOpeningModel.findOne({ _id: id }).lean();

        let job_applying_details = await JobApplyingModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'job_opening_id',
                    foreignField: 'opening_id',
                    as: 'job_opening_id'
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    as: 'candidate_id'
                }
            },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'recruiter_id',
                    foreignField: '_id',
                    as: 'recruiter_id'
                }
            },

            {
                $project: { profile_submit: 1, profile_shortlist: 1, interview_schedule: 1, created_at: 1, updated_at: 1, 'company_id.company_name': 1, 'job_opening_id.required_skills': 1, 'job_opening_id.opening_id': 1, 'candidate_id.key_skills': 1, 'candidate_id.first_name': 1, 'recruiter_id.display_name': 1 }
            }
        ]);


        if (!job_applying_details) {
            return false;
        }
        return job_applying_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
 *  Candidate Job Applying  List To Company 
*/
exports.jobapplied_candidate_list_company = async (reqbody, user) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        let limit = parseInt(reqbody.per_page) || 10
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
            searchStr = { $or: [{ 'job_opening_id.opening_id': filter_value }, { 'job_opening_id.opening_title': filter_value }] };
        } else {
            searchStr = {};
        }

        let totalRecords = await JobApplyingModel.countDocuments({ deleted: false });

        let job_applying_candidate_listing = await JobApplyingModel.aggregate([
            { $match: { $and: [{ deleted: false }, { company_id: user }] } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'job_opening_id',
                    foreignField: 'opening_id',
                    as: 'job_opening_id'
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.assign_more_recruits",
                    foreignField: "_id",
                    as: "assign_more_recruits_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_owner",
                    foreignField: "_id",
                    as: "account_owner_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_primary_recruit",
                    foreignField: "_id",
                    as: "account_primary_recruit_id"
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    as: 'candidate_id'
                }
            },
            // {
            //     $lookup:
            //     {
            //           from: 'users',
            //           localField: 'recruiter_id',
            //           foreignField: '_id',
            //           as: 'recruiter_id'
            //     }
            // },
            {
                $project: { created_at: 1, updated_at: 1, 'company_id._id': 1, 'company_id.company_name': 1, 'job_opening_id.opening_id': 1, 'job_opening_id.opening_title': 1, 'job_opening_id.assign_more_recruits': 1, 'assign_more_recruits_id._id': 1, 'assign_more_recruits_id.display_name': 1, 'account_owner_id._id': 1, 'account_owner_id.display_name': 1, 'account_primary_recruit_id._id': 1, 'account_primary_recruit_id.display_name': 1, 'candidate_id.first_name': 1 }
            },

            { $match: searchStr },
            { $sort: sortJson },
            {
                $facet: {
                    // totalCount: [
                    //         {
                    //         $count: 'filteredRecords'
                    //         }
                    //     ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }


        ])

        if (!job_applying_candidate_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            // filterRecords : job_applying_listing[0].totalCount,
            job_applying_listing: job_applying_candidate_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *  Candidate Job Applying List To Recruiter 
*/
exports.jobapplied_candidate_list_recruiter = async (reqbody, user) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        let limit = parseInt(reqbody.per_page) || 10
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
            searchStr = { $or: [{ 'job_opening_id.opening_id': filter_value }, { 'job_opening_id.opening_title': filter_value }] };
        } else {
            searchStr = {};
        }

        let all_recruiter_data = { $or: [{ 'job_opening_id.account_owner': user }, { 'job_opening_id.account_primary_recruit': user }, { 'job_opening_id.assign_more_recruits': user }] }

        let totalRecords = await JobApplyingModel.countDocuments({ deleted: false });

        let job_applying_candidate_listing = await JobApplyingModel.aggregate([
            { $match: { $and: [{ deleted: false }] } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'job_opening_id',
                    foreignField: 'opening_id',
                    as: 'job_opening_id'
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.assign_more_recruits",
                    foreignField: "_id",
                    as: "assign_more_recruits_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_owner",
                    foreignField: "_id",
                    as: "account_owner_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_primary_recruit",
                    foreignField: "_id",
                    as: "account_primary_recruit_id"
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    as: 'candidate_id'
                }
            },
            // {
            //     $lookup:
            //     {
            //           from: 'users',
            //           localField: 'recruiter_id',
            //           foreignField: '_id',
            //           as: 'recruiter_id'
            //     }
            // },
            {
                $project: { created_at: 1, updated_at: 1, 'company_id._id': 1, 'company_id.company_name': 1, 'job_opening_id.opening_id': 1, 'job_opening_id.opening_title': 1, 'job_opening_id.account_owner': 1, 'job_opening_id.account_primary_recruit': 1, 'job_opening_id.assign_more_recruits': 1, 'assign_more_recruits_id._id': 1, 'assign_more_recruits_id.display_name': 1, 'account_owner_id._id': 1, 'account_owner_id.display_name': 1, 'account_primary_recruit_id._id': 1, 'account_primary_recruit_id.display_name': 1, 'candidate_id.first_name': 1 }
            },
            { $match: { $and: [all_recruiter_data] } },

            { $match: searchStr },
            { $sort: sortJson },
            {
                $facet: {
                    totalCount: [
                        {
                            $count: 'filteredRecords'
                        }
                    ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }


        ])

        if (!job_applying_candidate_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            filterRecords: job_applying_candidate_listing[0].totalCount,
            job_applying_listing: job_applying_candidate_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *  Candidate Job Applying Candidate Wise Listing
*/
exports.jobapplied_candidate_wise_list = async (reqbody, user) => {
    try {

        let job_applying_candidate_wise_listing = await JobApplyingModel.aggregate([
            { $match: { $and: [{ deleted: false, candidate_id: user }] } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    localField: 'job_opening_id',
                    foreignField: 'opening_id',
                    as: 'job_opening_id'
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.assign_more_recruits",
                    foreignField: "_id",
                    as: "assign_more_recruits_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_owner",
                    foreignField: "_id",
                    as: "account_owner_id"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "job_opening_id.account_primary_recruit",
                    foreignField: "_id",
                    as: "account_primary_recruit_id"
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    as: 'candidate_id'
                }
            },
            {
                $project: { created_at: 1, updated_at: 1, company_name: { $arrayElemAt: ["$company_id.company_name", 0] }, 'job_opening_id.opening_id': 1, 'job_opening_id.opening_title': 1, assign_more_recruits: '$assign_more_recruits_id.display_name', account_owner: { $arrayElemAt: ["$account_owner_id.display_name", 0] }, account_primary_recruit: { $arrayElemAt: ["$account_primary_recruit_id.display_name", 0] }, candidate_name: { $arrayElemAt: ["$candidate_id.first_name", 0] } }
            }

        ])

        // let is_exist_Candidate_Opening_id = await JobApplyingModel.find({ job_opening_id: reqbody.job_opening_id,candidate_id:reqbody.candidate_id }).lean();

        if (!job_applying_candidate_wise_listing) {
            return false;
        }
        var data = {
            //   filterRecords : job_applying_candidate_wise_listing[0].totalCount,
            job_applying_candidate_wise_listing: job_applying_candidate_wise_listing
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};