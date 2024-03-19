const JobSavedModel = require("./jobsaved.model");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");


/*
*  Check Opening Id and Candidate Exist
*/
exports.is_exist_Candidate_Opening_id = async (reqbody) => {
    try {
        let is_exist_Candidate_Opening_id = await JobSavedModel.findOne({ job_opening_id: reqbody.job_opening_id, candidate_id: reqbody.candidate_id }).lean();

        if (!is_exist_Candidate_Opening_id) {
            return false;
        }
        return is_exist_Candidate_Opening_id;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Candidate Job Saved
*/
exports.save = async (reqbody, user) => {
    try {

        const jobsave = new JobSavedModel({
            company_id: reqbody.company_id,
            job_opening_id: reqbody.job_opening_id,
            opening_title: reqbody.opening_title,
            candidate_id: reqbody.candidate_id,
            created_by: user,
            updated_by: user
        });
        return await jobsave.save();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Job Saved Candidate data
*/
exports.list = async (user) => {
    try {

        // let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        // let limit = parseInt(reqbody.per_page) || 10
        // let order_column = reqbody.order_column || 'updated_at'
        // let sort_order = reqbody.sort_order;
        // let filter_value = reqbody.filter_value
        // let sortJson = {};


        // if(sort_order == 'asc'){
        //     sortJson[order_column] = 1
        // }else{
        //     sortJson[order_column] = -1;
        // }

        // let searchStr;

        // if(filter_value != ''){
        //     searchStr = { $or: [{'job_opening_id.contact_name':filter_value},{'job_opening_id.required_skills':filter_value}] };
        // }else{
        //     searchStr={};
        // }

        let totalRecords = await JobSavedModel.countDocuments({ deleted: false });

        let job_saved_listing = await JobSavedModel.aggregate([
            { $match: { deleted: false, candidate_id: user } },
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
                $project: { created_at: 1, updated_at: 1, 'company_id.company_name': 1, 'job_opening_id.required_skills': 1, 'job_opening_id.opening_id': 1, 'job_opening_id.opening_title': 1, 'candidate_id.key_skills': 1, 'candidate_id.first_name': 1, 'recruiter_id.display_name': 1 }
            },

            // { $match : searchStr},
            // { $sort : sortJson},            
            // {
            //     $facet: {
            //         // totalCount: [
            //         //         {
            //         //         $count: 'filteredRecords'
            //         //         }
            //         //     ],
            //     paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

            //  }
            // }


        ])

        if (!job_saved_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            // filterRecords : job_applying_listing[0].totalCount,
            job_applying_listing: job_saved_listing
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

