const JobOpeningModel = require("./jobopening.model");
const UserModel = require("../users/users.model");
const CompanyModel = require("../company/company.model");
const BdmModel = require("../bdm/bdm.model");
const RoleModel = require("../roles/roles.model");
const RecruiterModel = require("../recruiter/recruiter.model");
const CategoryModel = require("./category.model");
const SubCategoryModel = require("./subcategory.model");
const VisaTypeModel = require("./visatype.model");
const MessageModel = require("../message/message.model");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const isEmpty = require("../../validations/is-empty");
const { commonResponse } = require("../../helper");
const mongoose = require("mongoose");
const ContactModel = require("../contact/contact.model");
const CandidateSubmissionModel = require("./submission.model");
const CandidateModel = require("../candidate/candidate.model");
const JobActivityModel = require("./jobactivity.model");
const PlanAssignModel = require("../planassign/planassign.model");
const ContactActivityModel = require("../contact/contactactivity.model");
const moment = require("moment");
const { cleanLogs } = require("forever/lib/forever/cli");
const BdmAssignment = require("./bdmassignment.model");
const mail = require("../../helper/email/index");
const EmailTemplate = require("../emailtemplate/emailtemplate.model");
const EmailActivity = require("../emailactivity/emailactivity.model");
const JobOpenings = require("./jobopening.model");
/*
*  Check Opening Id Exist
*/
exports.is_exist = async (opening_id) => {
    try {
        let opening_id_exist = await JobOpeningModel.findOne({ opening_id: opening_id }).lean();
        if (!opening_id_exist) {
            return false;
        }
        return opening_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Company Job Opening Count
*/
exports.company_job_opening_count = async (company_id) => {
    try {
        let company_id_exist = await PlanAssignModel.findOne({ company_id: company_id }, { company_job_opening_count: 1 }).lean();
        if (!company_id_exist) {
            return false;
        }
        return company_id_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Admin,BDM,Recruiter Create New Job Opening 
*/
exports.save = async (reqbody, user) => {
    try {
        if (!isEmpty(reqbody.attachments)) {
            var matches = reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            var imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            var extension = mime.getExtension(type);

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|GIF|gif|PDF|pdf/;
            var check_image = !filetypes.test(extension);

            if (check_image) {
                errors.attachments = "Only image and files are allowed";
            }

        }
        var job_filename;
        if (!isEmpty(reqbody.attachments)) {
            var filepath = "/upload/job_opening/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;
            fse.mkdirsSync(storepath);
            var job_opening_filename = Date.now() + "-job_opening" + "." + extension;


            fs.writeFileSync(storepath + job_opening_filename, imageBuffer, "utf8");
            job_filename = job_opening_filename;

        }

        reqbody.salary_range = reqbody.salary_range.split('-');

        const jobopening = new JobOpeningModel({

            account_name: reqbody.account_name,
            contact_name: reqbody.contact_name || null,
            opening_title: reqbody.opening_title,
            opening_id: reqbody.opening_id,
            // account_owner: reqbody.account_owner,
            // account_primary_recruit: reqbody.account_primary_recruit,
            // access: reqbody.access,
            // assign_more_recruits: reqbody.assign_more_recruits,
            // end_client: reqbody.end_client,
            required_skills: reqbody.required_skills,
            required_experience: reqbody.required_experience,
            // bill_rate: reqbody.bill_rate,
            // bill_currency: reqbody.bill_currency,
            // bill_type: reqbody.bill_type || null,
            // pay_rate: reqbody.pay_rate,
            pay_currency: reqbody.pay_currency,
            pay_type: reqbody.pay_type || null,
            country: reqbody.country,
            state: reqbody.state,
            city: reqbody.city,
            zip_code: reqbody.zip_code,
            number_of_openings: reqbody.number_of_openings,
            max_resumes_allowed: reqbody.max_resumes_allowed,
            local_indicator: reqbody.local_indicator,
            security_clearance: reqbody.security_clearance || null,
            job_description: reqbody.job_description,
            short_description: reqbody.short_description || null,
            duration: reqbody.duration || null,
            category: reqbody.category,
            sub_category: reqbody.sub_category || null,
            employment_type: reqbody.employment_type,
            status: reqbody.status,
            experience_level: reqbody.experience_level,
            // position_type: reqbody.position_type || null,
            interview_type: reqbody.interview_type,
            visa_type: reqbody.visa_type,
            project_start_date: reqbody.project_start_date,
            project_close_date: reqbody.project_close_date,
            notes: reqbody.notes || null,
            attachments: job_filename || null,
            role: reqbody.role,
            salary_range_from: reqbody.salary_range[0] * 1,
            salary_range_to: reqbody.salary_range[1] * 1,
            currency: reqbody.currency,
            salary_type: reqbody.salary_type,
            // user: user._id,
            created_by: user._id,
            updated_by: user._id,
            // created_by_user_name:user.company_name,
            // updated_by_user_name:user.company_name
            created_at: Date.now(),
            updated_at: Date.now()
        });
        let job_opening_create = await jobopening.save();

        if (job_opening_create) {
            const jobactivity = new JobActivityModel({
                company_id: reqbody.account_name,
                opening_id: reqbody.opening_id,
                created_by: user._id,
                updated_by: user._id,
                activity_log: user.company_name ? `Opening Created By ${user.company_name}` : `Opening Created By ${user.display_name}, ${reqbody.company_name}`,
                created_at: Date.now(),
                updated_at: Date.now()
                // created_by_user_name:user.company_name,
                // updated_by_user_name:user.company_name
            });

            let job_activity_create = await jobactivity.save();

            let company_job_opening_count = await PlanAssignModel.updateOne({ company_id: reqbody.account_name }, { $inc: { company_job_opening_count: -1 } })

            // not for company itself but for bdm /admin

            // let is_user_conatct_person = await ContactModel.findOne({_id:user._id}).lean();

            // if(is_user_conatct_person != null){

            //     const contact_activity = new ContactActivityModel({
            //         opening_id: reqbody.opening_id,
            //         contact_id : user._id, 
            //         created_by: user._id,
            //         updated_by: user._id,
            //         activity_log: `Opening Created By ${is_user_conatct_person.display_name}`,
            //         created_at  : Date.now(),
            //         updated_at  : Date.now()
            //         // created_by_user_name:user.company_name,
            //         // updated_by_user_name:user.company_name
            //     });

            //     let contact_activity_create = await contact_activity.save();
            // }
        }
        if (job_opening_create) {
            const messageData = new MessageModel({
                title: "Opening Created",
                message: user.company_name ? `Opening Created By ${user.company_name}` : `Opening Created By ${user.display_name}, ${reqbody.company_name}`,
                company_id: reqbody.account_name,
                opening_id: reqbody.opening_id,
                user_id: user._id,
            });
            let message_create = await messageData.save();
        }

        return job_opening_create
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Admin,BDM,Recruiter Listing Job Opening 
*/
exports.list2 = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'created_at'
        let sort_order = reqbody.order_direction || 'desc';
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let company_id = reqbody.company_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_id = reqbody.freelance_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        /** check for object id */
        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        // let ObjectId = checkForHexRegExp.test(reqbody.id)

        let searchStr = { deleted: false };

        if (categories != '') {
            searchStr.category = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
        }

        let searchStatus = {};

        if (status != '') {
            //var regex_status = new RegExp(status, "i")
            searchStr.status = status
        }

        if (company_id != '' && company_id != undefined) {
            searchStr.account_name = mongoose.Types.ObjectId(company_id)
        }
        // if (bdm_id != '' && bdm_id != undefined) {
        //     searchStr.assigned_bdm = mongoose.Types.ObjectId(bdm_id)
        // }

        if (opening_id != '' && opening_id != undefined) {
            searchStr.opening_id = opening_id
        }
        if (opening_title != '' && opening_title != undefined) {
            searchStr.opening_title = new RegExp(opening_title, "i")
        }

        // if (reqbody.company_name != '') {
        //     filter_condition.account_name = mongoose.Types.ObjectId(reqbody.company_name);
        // }

        // if(bdm_id != '' && bdm_id != undefined ){
        //     searchStr.account_owner = mongoose.Types.ObjectId(bdm_id) 
        // }

        // if(recruiter_id != '' && recruiter_id != undefined ){
        //     searchStr['$or'] = [
        //         {"account_owner": mongoose.Types.ObjectId(recruiter_id)},
        //         {"account_primary_recruit": mongoose.Types.ObjectId(recruiter_id)},
        //         {"assign_more_recruits": mongoose.Types.ObjectId(recruiter_id)}
        //       ];
        // }

        let filter_condition = {};

        if (reqbody.dateRange.length == 0) {
            filter_condition = {
                $match: { '$and': [searchStr, searchStatus] }
            }
        }

        if (reqbody.dateRange.length != 0) {

            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];


            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
            // let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(endDate) }
            // let searchDate = {"created_at": { "$gte": new Date(fromDate), "$lte": new Date(endDate) }}
            // filter_condition = {
            //                      $match: { '$and': [searchDate,searchStr, searchStatus] },
            //                    }       
            searchStr.created_at = searchDate

        }

        let count_condition = { deleted: false };

        if (filter_value != "") {
            let regex_filter_value = new RegExp(filter_value, "i");
            searchStr["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];

            count_condition["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];
        }
        let totalRecords;

        if (company_id != '' && company_id != undefined) {
            count_condition.account_name = mongoose.Types.ObjectId(company_id)
        }

        // totalRecords = await JobOpeningModel.countDocuments(count_condition);

        totalRecords = (await JobOpeningModel.aggregate([
            {
                $match: { '$and': [{ ...count_condition, ...searchStr }, searchStatus] }
            }
        ])).length;

        const jobOpnArr = [
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { account_name: '$account_name' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$account_name'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'account_name'
                },
            },
            {
                $lookup:
                {
                    from: 'contacts',
                    localField: 'contact_name',
                    foreignField: '_id',
                    // let: { contact_name: '$contact_name' },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             $expr: {
                    //                 $and: [
                    //                     { $eq: ['$_id', '$$contact_name'] },
                    //                     // { $eq: ['$deleted', false] },
                    //                 ]
                    //             }
                    //         }
                    //     }
                    // ],
                    as: 'contact_name'
                },
            },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$opening_id'] },
                                        { $eq: ['$candidate_select_by_bdm', 1] },
                                    ]
                                }
                            }
                        },
                        // {
                        //     $count: "total_candidate_submit"
                        // }
                    ],
                    as: 'candidate_submission_details'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'code',
                    as: 'category'
                },
            },
            // {
            //     $lookup: {
            //         from: 'bdm_assignments',

            //         let: { bdm_id: bdm_id },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             { $in: ['$bdm_id', '$assigned_bdm'] }
            //                         ]
            //                     }
            //                 }
            //             }
            //         ],
            //         as: 'bdm_assignments'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'account_owner',
            //         foreignField: '_id',
            //         as: 'account_owner'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'account_primary_recruit',
            //         foreignField: '_id',
            //         as: 'account_primary_recruit'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'assign_more_recruits',
            //         foreignField: '_id',
            //         as: 'assign_more_recruits'
            //     },
            // },

            //contact_name: { $concat: [{ $arrayElemAt: ["$contact_name.first_name", 0] }, " ", { $arrayElemAt: ["$contact_name.last_name", 0] }] },candidate_submission_details:1, category: { $arrayElemAt: ["$category.name", 0] }
            // { $project: {account_name:{$arrayElemAt:["$account_name.company_name",0]},contact_name:{$arrayElemAt:["$contact_name.first_name",0]},account_owner:{$arrayElemAt:["$account_owner.display_name",0]},account_primary_recruit:{$arrayElemAt:["$account_primary_recruit.display_name",0]},assign_more_recruits:"$assign_more_recruits.display_name",_id:1,opening_title:1,opening_id:1,category:1,status:1,created_at:1,updated_at:1}},
            { $sort: sortJson },
        ]

        // if (bdm_id) jobOpnArr.push({
        //     $project: {
        //         "account_name._id": 1, "account_name.company_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1,
        //         candidate_submission_details: {
        //             $filter: {
        //                 input: "$candidate_submission_details",
        //                 as: "item",
        //                 cond: {
        //                     $eq: ["$$item.bdm_id", mongoose.Types.ObjectId(bdm_id)]
        //                 }
        //             }
        //         }
        //     }
        // });

        // else
        jobOpnArr.push({
            $project: {
                "account_name._id": 1, "account_name.company_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1,
                candidate_submission_details: 1
            }
        });

        jobOpnArr.push({
            $facet: {
                totalCount: [
                    {
                        $count: 'filteredRecords'
                    }
                ],
                paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

            }
        });

        const job_opening_listing = await JobOpeningModel.aggregate(
            jobOpnArr
        );

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));
        if (!job_opening_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // filteredRecords: job_opening_listing[0].totalCount,
            job_opening_listing: job_opening_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.list = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'created_at'
        let sort_order = reqbody.order_direction || 'desc';
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let company_id = reqbody.company_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_id = reqbody.freelance_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        // console.log("sortJson::",sortJson)

        /** check for object id */
        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        // let ObjectId = checkForHexRegExp.test(reqbody.id)

        let searchStr = { deleted: false };

        if (categories != '') {
            searchStr.category = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
        }

        let searchStatus = {};

        if (status != '') {
            //var regex_status = new RegExp(status, "i")
            searchStr.status = status
        }

        if (company_id != '' && company_id != undefined) {
            searchStr.account_name = mongoose.Types.ObjectId(company_id)
        }

        if (opening_id != '' && opening_id != undefined) {
            searchStr.opening_id = opening_id
        }
        if (opening_title != '' && opening_title != undefined) {
            searchStr.opening_title = new RegExp(opening_title, "i")
        }

        // if (reqbody.company_name != '') {
        //     filter_condition.account_name = mongoose.Types.ObjectId(reqbody.company_name);
        // }

        // if(bdm_id != '' && bdm_id != undefined ){
        //     searchStr.account_owner = mongoose.Types.ObjectId(bdm_id) 
        // }

        // if(recruiter_id != '' && recruiter_id != undefined ){
        //     searchStr['$or'] = [
        //         {"account_owner": mongoose.Types.ObjectId(recruiter_id)},
        //         {"account_primary_recruit": mongoose.Types.ObjectId(recruiter_id)},
        //         {"assign_more_recruits": mongoose.Types.ObjectId(recruiter_id)}
        //       ];
        // }

        let filter_condition = {};

        if (reqbody.dateRange.length == 0) {
            filter_condition = {
                $match: { '$and': [searchStr, searchStatus] }
            }
        }

        if (reqbody.dateRange.length != 0) {

            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];
            // console.log("date   YYyYY:",new Date(toDate + "T23:59:59.999Z"));
            // let to = new Date(toDate).setHours(23,59,59,999);

            // let endDate  = new Date(toDate).setHours((toDate.split(' ')[1]).split(':')[0],(toDate.split(' ')[1]).split(':')[1],59,999);

            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
            // let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(endDate) }
            // let searchDate = {"created_at": { "$gte": new Date(fromDate), "$lte": new Date(endDate) }}
            // filter_condition = {
            //                      $match: { '$and': [searchDate,searchStr, searchStatus] },
            //                    }       
            searchStr.created_at = searchDate
        }

        let count_condition = { deleted: false };

        if (filter_value != "") {
            var regex_filter_value = new RegExp(filter_value, "i");
            searchStr["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];

            count_condition["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];
        }

        const jobOpnArr = [
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { account_name: '$account_name' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$account_name'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'account_name'
                },
            },
            {
                $lookup:
                {
                    from: 'contacts',
                    localField: 'contact_name',
                    foreignField: '_id',
                    // let: { contact_name: '$contact_name' },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             $expr: {
                    //                 $and: [
                    //                     { $eq: ['$_id', '$$contact_name'] },
                    //                     // { $eq: ['$deleted', false] },
                    //                 ]
                    //             }
                    //         }
                    //     }
                    // ],
                    as: 'contact_name'
                },
            },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$opening_id'] },
                                        { $eq: ['$candidate_select_by_bdm', 1] },
                                    ]
                                }
                            }
                        },
                        {
                            $count: "total_candidate_submit"
                        }
                    ],
                    as: 'candidate_submission_details'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'code',
                    as: 'category'
                },
            },
            // {
            //     $lookup: {
            //         from: 'bdm_assignments',
            //         let: {
            //             bdm_id: bdm_id,
            //             // assigned_bdm: "$assigned_bdm"
            //         },
            //         as: 'test',
            //         pipeline: [{
            //             $match: {
            //                 $expr: {
            //                     // $and: [
            //                     //     { $eq: ['$deleted', false] },
            //                     //     { $eq: ['$opening_id', '$$opening_id'] },
            //                     //     { $eq: ['$candidate_select_by_bdm', 1] },
            //                     // ]
            //                     $in: [bdm_id, '$assigned_bdm']
            //                 }
            //             }
            //         }],

            //     }
            // },
            { $sort: sortJson },
        ];

        if (bdm_id) jobOpnArr.push({
            $project: {
                "test": 1, "account_name._id": 1, "account_name.company_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1,
                candidate_submission_details: {
                    $filter: {
                        input: "$candidate_submission_details",
                        as: "item",
                        cond: {
                            $eq: ["$$item.bdm_id", mongoose.Types.ObjectId(bdm_id)]
                        }
                    }
                }
            }
        });
        // else
        jobOpnArr.push({
            $project: {
                "test": 1, "account_name._id": 1, "account_name.company_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1,
                candidate_submission_details: 1
            }
        });

        jobOpnArr.push({
            $facet: {
                totalCount: [
                    {
                        $group: { _id: null, count: { $sum: 1 } }
                    }
                ],
                data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
            }
        });

        jobOpnArr.push({
            $project: {
                totalRecords: { $first: '$totalCount.count' },
                paginatedResults: '$data'
            }

        })

        let job_opening_listing = await JobOpeningModel.aggregate(
            jobOpnArr
        );

        let total_pages = Math.ceil(parseInt(job_opening_listing[0].totalRecords) / parseInt(limit));

        if (!job_opening_listing) {
            return false;
        }
        const data = {
            totalRecords: job_opening_listing[0].totalRecords,
            totalPages: total_pages,
            job_opening_listing: job_opening_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.log("Error : ", error);
    }
};

exports.list4 = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'created_at'
        let sort_order = reqbody.order_direction || 'desc';
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let company_id = reqbody.company_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_id = reqbody.freelance_id;
        let opening_id = reqbody.opening_id;
        let opening_title = reqbody.opening_title;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        // console.log("sortJson::",sortJson)

        /** check for object id */
        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        // let ObjectId = checkForHexRegExp.test(reqbody.id)

        let searchStr = { deleted: false };

        if (categories != '') {
            searchStr.category = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
        }

        let searchStatus = {};

        if (status != '') {
            //var regex_status = new RegExp(status, "i")
            searchStr.status = status
        }

        if (company_id != '' && company_id != undefined) {
            searchStr.account_name = mongoose.Types.ObjectId(company_id)
        }
        if (bdm_id != '' && bdm_id != undefined) {
            searchStr.assigned_bdm = mongoose.Types.ObjectId(bdm_id)
        }
        if (recruiter_id != '' && recruiter_id != undefined) {
            searchStr.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id)
        }
        if (opening_id != '' && opening_id != undefined) {
            searchStr.opening_id = opening_id
        }
        if (opening_title != '' && opening_title != undefined) {
            searchStr.opening_title = new RegExp(opening_title, "i")
        }

        if (freelance_id != "" && freelance_id != undefined) {
            searchStr.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
        }

        // if (reqbody.company_name != '') {
        //     filter_condition.account_name = mongoose.Types.ObjectId(reqbody.company_name);
        // }


        // if(bdm_id != '' && bdm_id != undefined ){
        //     searchStr.account_owner = mongoose.Types.ObjectId(bdm_id) 
        // }

        // if(recruiter_id != '' && recruiter_id != undefined ){
        //     searchStr['$or'] = [
        //         {"account_owner": mongoose.Types.ObjectId(recruiter_id)},
        //         {"account_primary_recruit": mongoose.Types.ObjectId(recruiter_id)},
        //         {"assign_more_recruits": mongoose.Types.ObjectId(recruiter_id)}
        //       ];
        // }

        let filter_condition = {};

        if (reqbody.dateRange.length == 0) {
            filter_condition = {
                $match: { '$and': [searchStr, searchStatus] }
            }
        }

        if (reqbody.dateRange.length != 0) {

            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];
            // console.log("date   YYyYY:",new Date(toDate + "T23:59:59.999Z"));
            // let to = new Date(toDate).setHours(23,59,59,999);

            // let endDate  = new Date(toDate).setHours((toDate.split(' ')[1]).split(':')[0],(toDate.split(' ')[1]).split(':')[1],59,999);


            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
            // let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(endDate) }
            // let searchDate = {"created_at": { "$gte": new Date(fromDate), "$lte": new Date(endDate) }}
            // filter_condition = {
            //                      $match: { '$and': [searchDate,searchStr, searchStatus] },
            //                    }       
            searchStr.created_at = searchDate

        }

        let count_condition = { deleted: false };

        if (filter_value != "") {
            var regex_filter_value = new RegExp(filter_value, "i");
            searchStr["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];

            count_condition["$or"] = [
                { opening_title: regex_filter_value },
                { opening_id: regex_filter_value },
            ];
        }

        let totalRecords;

        // let totalRecords = await JobOpeningModel.countDocuments({ deleted: false });

        if (company_id != '' && company_id != undefined) {

            count_condition.account_name = mongoose.Types.ObjectId(company_id)
            totalRecords = await JobOpeningModel.countDocuments(count_condition);

        } else if (bdm_id != '' && bdm_id != undefined) {

            count_condition.assigned_bdm = mongoose.Types.ObjectId(bdm_id)
            totalRecords = await JobOpeningModel.countDocuments(count_condition);
        }
        else if (recruiter_id != '' && recruiter_id != undefined) {

            count_condition.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id)
            totalRecords = await JobOpeningModel.countDocuments(count_condition);
        } else if (freelance_id != "" && freelance_id != undefined) {
            count_condition.assigned_freelancer =
                mongoose.Types.ObjectId(freelance_id);
            totalRecords = await JobOpeningModel.countDocuments(count_condition);
        }
        else {

            totalRecords = await JobOpeningModel.countDocuments(count_condition);
        }


        var job_opening_listing = await JobOpeningModel.aggregate([
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { account_name: '$account_name' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$account_name'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'account_name'
                },
            },
            {
                $lookup:
                {
                    from: 'contacts',
                    localField: 'contact_name',
                    foreignField: '_id',
                    // let: { contact_name: '$contact_name' },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             $expr: {
                    //                 $and: [
                    //                     { $eq: ['$_id', '$$contact_name'] },
                    //                     // { $eq: ['$deleted', false] },
                    //                 ]
                    //             }
                    //         }
                    //     }
                    // ],
                    as: 'contact_name'
                },
            },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$opening_id'] },
                                        { $eq: ['$candidate_select_by_bdm', 1] },
                                    ]
                                }
                            }
                        },
                        {
                            $count: "total_candidate_submit"
                        }
                    ],
                    as: 'candidate_submission_details'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'code',
                    as: 'category'
                },
            },

            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'account_owner',
            //         foreignField: '_id',
            //         as: 'account_owner'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'account_primary_recruit',
            //         foreignField: '_id',
            //         as: 'account_primary_recruit'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'assign_more_recruits',
            //         foreignField: '_id',
            //         as: 'assign_more_recruits'
            //     },
            // },

            //contact_name: { $concat: [{ $arrayElemAt: ["$contact_name.first_name", 0] }, " ", { $arrayElemAt: ["$contact_name.last_name", 0] }] },candidate_submission_details:1, category: { $arrayElemAt: ["$category.name", 0] }
            // { $project: {account_name:{$arrayElemAt:["$account_name.company_name",0]},contact_name:{$arrayElemAt:["$contact_name.first_name",0]},account_owner:{$arrayElemAt:["$account_owner.display_name",0]},account_primary_recruit:{$arrayElemAt:["$account_primary_recruit.display_name",0]},assign_more_recruits:"$assign_more_recruits.display_name",_id:1,opening_title:1,opening_id:1,category:1,status:1,created_at:1,updated_at:1}},
            { $project: { "account_name._id": 1, "account_name.company_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, candidate_submission_details: 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1 } },
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


        ]);


        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));



        if (!job_opening_listing) {
            return false;
        }
        var data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // filteredRecords: job_opening_listing[0].totalCount,
            job_opening_listing: job_opening_listing[0].paginatedResults
        }
        return data;
    } catch (error) {
        console.log("Error : ", error);
    }
};

exports.listBDM = async (reqbody) => {
    try {

        const order_column = reqbody.order || 'updated_at'
        const sort_order = reqbody.order_direction;
        const sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        const status = reqbody.status;
        const bdm_id = reqbody.bdm_id;
        const filter_value = reqbody.search;

        const filter_condition = { deleted: false };
        filter_condition.created_by = mongoose.Types.ObjectId(bdm_id);

        if (status != '' && status != undefined) filter_condition.status = status;

        if (filter_value != "") {
            var regex_filter_value = new RegExp(filter_value, "i")
            filter_condition["$or"] = [{ opening_title: regex_filter_value }, { opening_id: regex_filter_value }]
        }

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];
            let searchDate = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate + "T23:59:59.999Z"),
            };

            filter_condition.created_at = searchDate;
        }

        const joblist = await JobOpeningModel.aggregate([
            { $match: filter_condition },

            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { account_name: '$account_name' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$account_name'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'account_name'
                },
            },

            { $sort: sortJson },
            // {
            //     $lookup:
            //     {
            //         from: 'jobopenings',
            //         let: { company_id: '$_id' },
            //         pipeline: [
            //             {
            //                 $match: {
            //                     deleted: false,

            //                 }
            //             },
            //             // {
            //             //     $count: "total_candidate_submit"
            //             // }
            //         ],
            //         as: 'jobopenings'
            //     }
            // },

            // {
            //     $project: { created_by: 1, jobopenings: 1 }
            // }

            // {
            //     $project: { company_owner: { $arrayElemAt: ["$company_owner.display_name", 0] }, industry_type: { $arrayElemAt: ["$industry_type.name", 0] }, status: 1, created_at: 1, updated_at: 1, company_name: 1, access: 1, category: 1, company_code: 1, }
            // },

            {
                $lookup: {
                    from: "candidate_submissions",
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: "$opening_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$opening_id", "$$opening_id"] },
                                        // { $eq: ["$candidate_select_by_bdm", 1] },
                                    ],
                                },
                            },
                        },
                        {
                            $count: "total_candidate_submit",
                        },
                    ],
                    as: "candidate_submission_details",
                },
            },
        ])

        if (!joblist) {
            return false;
        }

        return { job_opening_listing: joblist, totalRecords: joblist.length };
    }
    catch (error) {
        console.error("Error : ", error)
    }
}

/*
*  Admin,BDM,Recruiter Job Opening Details By Id
*/
exports.get = async (id) => {
    try {

        let job_opening_details = await JobOpeningModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { account_name: '$account_name' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$account_name'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'account_name'
                },
            },
            {
                $lookup:
                {
                    from: 'contacts',
                    localField: 'contact_name',
                    foreignField: '_id',
                    // let: { contact_name: '$contact_name' },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             $expr: {
                    //                 $and: [
                    //                     { $eq: ['$_id', '$$contact_name'] },
                    //                     { $eq: ['$deleted', false] },
                    //                 ]
                    //             }
                    //         }
                    //     }
                    // ],
                    as: 'contact_name'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'code',
                    as: 'category'
                },
            },
            {
                $lookup:
                {
                    from: 'visa_types',
                    localField: 'visa_type',
                    foreignField: 'value',
                    as: 'visa_type'
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
            //         from: 'users',
            //         localField: 'account_owner',
            //         foreignField: '_id',
            //         as: 'account_owner'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'account_primary_recruit',
            //         foreignField: '_id',
            //         as: 'account_primary_recruit'
            //     },
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'assign_more_recruits',
            //         foreignField: '_id',
            //         as: 'assign_more_recruits'
            //     },
            // },
            // {
            //     $project: {
            //         'account_name._id': 1, 'account_name.company_name': 1, 'account_name.website': 1, 'account_name.description': 1, "contact_name._id": 1, "contact_name.display_name": 1,
            //         // "contact_name": {
            //         //     "$map": {
            //         //         "input": "$contact_name",
            //         //         "as": "u",
            //         //         "in": {
            //         //             "_id": "$$u._id",
            //         //             "name": { "$concat": ["$$u.first_name", " ", "$$u.last_name"] },

            //         //         }
            //         //     }
            //         // },
            //         // name: { $concat : [ "$contact_name.first_name", " ", "$contact_name.last_name" ] },
            //         "assigned_bdm": 1, "assigned_bdm.display_name": 1, "visa_type.label": 1, "visa_type.value": 1, "assigned_recruiter": 1, "assigned_freelancer": 1,
            //         "state.code": 1, "state.state": 1, "city.code": 1, "city.city": 1, required_skills: 1, status: 1, opening_title: 1, opening_id: 1, required_experience: 1, pay_currency: 1, pay_type: 1, country: 1, zip_code: 1, number_of_openings: 1, max_resumes_allowed: 1, local_indicator: 1, security_clearance: 1, job_description: 1, short_description: 1, duration: 1, "category.code": 1, "category.name": 1, sub_category: 1, employment_type: 1, experience_level: 1, interview_type: 1, project_start_date: 1, project_close_date: 1, notes: 1, attachments: 1, role: 1, salary_range_from: 1, salary_range_to: 1, currency: 1, salary_type: 1, user: 1, created_at: 1, updated_at: 1
            //     }
            // },

        ]);

        // let job_opening_details1 = await JobOpeningModel.findOne({ _id: id },{created_at:0,updated_at:0}).populate('account_name','company_name').lean();

        if (!job_opening_details) {
            return false;
        }
        return job_opening_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};


/*
*  Check Job Opening Exist
*/
exports.is_exist_job_opening = async (id) => {
    try {
        let job_opening_exist = await JobOpeningModel.findOne({ _id: id }).lean();
        if (!job_opening_exist) {
            return false;
        }
        return job_opening_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Admin,BDM,Recruiter Update Job Opening 
*/
exports.update = async (id, reqbody, is_exist_job_opening, user) => {
    try {
        let update_job_opening = {};

        if (!isEmpty(reqbody.attachments && reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var matches = reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            var imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            var extension = mime.getExtension(type);

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|GIF|gif|PDF|pdf/;
            var check_image = !filetypes.test(extension);

            if (check_image) {
                errors.attachments = "Only image and files are allowed";
            }


        }
        var job_filename;
        if (!isEmpty(reqbody.attachments && reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var filepath = "/upload/job_opening/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;
            fse.mkdirsSync(storepath);
            var job_opening_filename = Date.now() + "-job_opening" + "." + extension;


            fs.writeFileSync(storepath + job_opening_filename, imageBuffer, "utf8");
            update_job_opening.attachments = job_opening_filename;


            if (is_exist_job_opening.attachments) {

                old_file = storepath + is_exist_job_opening.attachments;
                fs.unlink(old_file, (err) => {
                    if (err) {
                        console.error(err)
                    }
                });

            }
        } else {
            update_job_opening.attachments = reqbody.attachments;
        }

        reqbody.salary_range = reqbody.salary_range.split('-');

        update_job_opening.account_name = reqbody.account_name,
            update_job_opening.contact_name = reqbody.contact_name || null,
            update_job_opening.opening_title = reqbody.opening_title,
            update_job_opening.opening_id = reqbody.opening_id,
            // update_job_opening.account_owner = reqbody.account_owner,
            // update_job_opening.account_primary_recruit = reqbody.account_primary_recruit,
            // update_job_opening.access = reqbody.access,
            // update_job_opening.assign_more_recruits = reqbody.assign_more_recruits,
            // update_job_opening.end_client = reqbody.end_client,
            update_job_opening.required_skills = reqbody.required_skills,
            update_job_opening.required_experience = reqbody.required_experience,
            // update_job_opening.bill_rate = reqbody.bill_rate,
            // update_job_opening.bill_currency = reqbody.bill_currency,
            // update_job_opening.bill_type = reqbody.bill_type || null,
            // update_job_opening.pay_rate = reqbody.pay_rate,
            update_job_opening.pay_currency = reqbody.pay_currency,
            update_job_opening.pay_type = reqbody.pay_type || null,
            update_job_opening.country = reqbody.country,
            update_job_opening.state = reqbody.state,
            update_job_opening.city = reqbody.city,
            update_job_opening.zip_code = reqbody.zip_code,
            update_job_opening.number_of_openings = reqbody.number_of_openings,
            update_job_opening.max_resumes_allowed = reqbody.max_resumes_allowed,
            update_job_opening.local_indicator = reqbody.local_indicator,
            update_job_opening.security_clearance = reqbody.security_clearance || null,
            update_job_opening.job_description = reqbody.job_description,
            update_job_opening.short_description = reqbody.short_description || null,
            update_job_opening.duration = reqbody.duration || null,
            update_job_opening.category = reqbody.category,
            update_job_opening.sub_category = reqbody.sub_category || null,
            update_job_opening.employment_type = reqbody.employment_type,
            update_job_opening.status = reqbody.status,
            update_job_opening.experience_level = reqbody.experience_level,
            // update_job_opening.position_type = reqbody.position_type || null,
            update_job_opening.interview_type = reqbody.interview_type,
            update_job_opening.visa_type = reqbody.visa_type,
            update_job_opening.project_start_date = reqbody.project_start_date,
            update_job_opening.project_close_date = reqbody.project_close_date,
            update_job_opening.notes = reqbody.notes || null,
            update_job_opening.role = reqbody.role,
            // update_job_opening.user = user,
            update_job_opening.salary_range_from = reqbody.salary_range[0],
            update_job_opening.salary_range_to = reqbody.salary_range[1],
            update_job_opening.currency = reqbody.currency,
            update_job_opening.salary_type = reqbody.salary_type,
            update_job_opening.updated_at = Date.now()
        update_job_opening.updated_by = user
        // update_job_opening.updated_by_user_name = user.company_name


        return await JobOpeningModel.updateOne({ _id: id }, update_job_opening).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Update Job Opening Status By id
*/
exports.update_job_opening_status = async (id, reqbody, user) => {
    try {

        let update_job_opening_status = {
            status: reqbody.status,
            updated_at: Date.now(),
            updated_by: user._id
        }
        return await JobOpeningModel.updateOne({ _id: id }, update_job_opening_status).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


exports.listCategory = async () => {
    try {
        let category_listing = await CategoryModel.find({}, { _id: 0 }).lean();
        if (!category_listing) {
            return false;
        }
        return category_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.listSubCategory = async (reqbody) => {
    try {
        let sub_category_listing = await SubCategoryModel.find({ category_code: reqbody }).lean();
        if (!sub_category_listing) {
            return false;
        }
        return sub_category_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Delete Job Opening 
*/
exports.delete = async (id, user, check_jobopening_exist) => {
    try {
        var filepath = "/upload/job_opening/";
        var publicpath = process.cwd() + '/public';
        var storepath = publicpath + filepath;
        old_file = storepath + check_jobopening_exist.attachments;
        fs.unlink(old_file, (err) => {
            if (err) {
                console.error(err);
            }
        });

        const jobopeningUpdate = await JobOpeningModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        return JobOpeningModel.removeOne({ _id: id });

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Account Name List showing Company data 
*/
exports.account_name = async () => {
    try {
        let account_name_listing = await UserModel.find({ profile: 'company' }, { display_name: 1 }).lean();
        if (!account_name_listing) {
            return false;
        }
        return account_name_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *  All List Visa Type
*/
exports.visa_type_list = async () => {
    try {
        let visa_type_listing = await VisaTypeModel.find({}, { _id: 0, deleted: 0 }).lean();
        if (!visa_type_listing) {
            return false;
        }
        return visa_type_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Contact List for dropdown with first_name and last_name
*/
exports.contact_profile_list = async (reqbody) => {
    try {

        let user_exist = await ContactModel.find({ company_id: mongoose.Types.ObjectId(reqbody.company_id) }, { display_name: 1 }).lean();

        let defaultConatct = await ContactModel.find(
            { type: "default" },
            { display_name: 1 }
        ).lean();

        if (user_exist) {
            Array.prototype.push.apply(user_exist, defaultConatct);
        } else {
            user_exist = defaultConatct;
        }

        if (!user_exist) {
            return false;
        }
        return user_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Account Owner List 
*/
exports.account_owner = async (reqbody) => {
    try {
        let account_owner_listing = await UserModel.find({ reporting_manager: reqbody.company_id, role: 'bdm' }, { display_name: 1 }).lean();
        if (!account_owner_listing) {
            return false;
        }
        return account_owner_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Primary Recruit List 
*/
exports.primary_recruit = async (reqbody) => {
    try {
        let primary_recruit_listing = await RecruiterModel.find({ reporting_manager: reqbody.bdm_id, role: 'recruiter' }, { display_name: 1 }).lean();
        if (!primary_recruit_listing) {
            return false;
        }
        return primary_recruit_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  All Job Opning List with candidate skills wise
*/
exports.job_opening_candidate_skill = async (user) => {
    try {
        var keywords = ["xd", "sd", "ad"];
        let array_skills = user.skills.split(',').join("|");


        let job_opening_listing = await JobOpeningModel.find({ opening_title: { "$regex": array_skills, "$options": "i" } }).lean();
        // let job_opening_listing = await JobOpeningModel.find({ opening_title:{"$regex": /a/i}}).lean();

        if (!job_opening_listing) {
            return false;
        }
        return job_opening_listing;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Category List User wise
*/
exports.category_list_user_wise = async (reqbody) => {
    try {
        let company_id = reqbody.company_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;

        let searchStr = { deleted: false };

        if (company_id != '' && company_id != undefined) {
            searchStr.account_name = mongoose.Types.ObjectId(company_id)
        }

        if (bdm_id != '' && bdm_id != undefined) {
            searchStr.account_owner = mongoose.Types.ObjectId(bdm_id)
        }

        if (recruiter_id != '' && recruiter_id != undefined) {
            searchStr['$or'] = [
                { "account_owner": mongoose.Types.ObjectId(recruiter_id) },
                { "account_primary_recruit": mongoose.Types.ObjectId(recruiter_id) },
                { "assign_more_recruits": mongoose.Types.ObjectId(recruiter_id) }
            ];
        }

        // let category_listing_user_wise = await JobOpeningModel.find(searchStr).distinct("category");
        let category_listing_user_wise = await JobOpeningModel.distinct(
            "category",
            searchStr
        );

        let category_list = [];

        for (let i = 0; i < category_listing_user_wise.length; i++) {
            let obj = {};
            obj["code"] = category_listing_user_wise[i];
            obj["name"] = category_listing_user_wise[i];
            category_list.push(obj);
        }

        if (!category_listing_user_wise) {
            return false;
        }
        return category_list;

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  All Job Opning Assign bem
*/
exports.admin_job_assign = async (reqbody, user) => {
    try {
        let job_opening_assign_by_admin = '';
        let job_activity_log = {
            opening_id: reqbody.opening_id,
            company_id: reqbody.company_id,
            created_at: Date.now(),
            updated_at: Date.now(),
            created_by: user,
            updated_by: user
        }
        let job_opening_assign = {
            created_by: user,
            updated_at: Date.now()
        }

        let job_activity_log_array = [];

        if (reqbody.bdm_id.length > 0) {

            if (typeof (reqbody.bdm_id) === 'string') reqbody.bdm_id = reqbody.bdm_id.split(' , ');
            let job_opening_assign_array = [];
            await Promise.all(
                reqbody.bdm_id.map(async (id) => {

                    const bdm_name = await UserModel.findOne({ _id: id }, { display_name: 1 })

                    // //assign to bdm
                    const filter = {
                        title: "Opening Assign",
                        message: `Opening Assign to BDM - ${bdm_name.display_name}`,
                        company_id: reqbody.company_id,
                        opening_id: reqbody.opening_id,
                        user_role: "bdm",
                        user_id: id,
                    };

                    const messageData = {
                        ...filter,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    }
                    const message_create = await MessageModel.updateOne(filter, messageData, { upsert: true });

                    job_activity_log_array.push({ bdm_id: id, ...job_activity_log, activity_log: `Opening Assign to BDM - ${bdm_name.display_name}` });
                    job_opening_assign_array.push(id);

                })
            );
            job_opening_assign.assigned_bdm = job_opening_assign_array;
        }

        if (reqbody.freelance_id.length > 0) {
            let job_opening_assign_array = [];
            await Promise.all(
                reqbody.freelance_id.map(async (id) => {

                    const freelance_name = await UserModel.findOne({ _id: id }, { display_name: 1 });

                    const filter = {
                        title: "Opening Assign",
                        message: `Opening Assign to Freelance - ${freelance_name.display_name}`,
                        company_id: reqbody.company_id,
                        opening_id: reqbody.opening_id,
                        user_role: "freelance",
                        user_id: id,
                    };

                    const messageData = {
                        ...filter,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    }

                    const message_create = await MessageModel.updateOne(filter, messageData, { upsert: true });

                    job_activity_log_array.push({ freelance_id: id, ...job_activity_log, activity_log: `Opening Assign to Freelance - ${freelance_name.display_name}` });
                    job_opening_assign_array.push(id);
                })
            );
            job_opening_assign.assigned_freelancer = job_opening_assign_array;
        }

        if (reqbody.recruiter_id.length > 0) {

            let job_opening_assign_array = [];
            await Promise.all(
                reqbody.recruiter_id.map(async (id) => {
                    const recruiter_name = await UserModel.findOne({ _id: id }, { display_name: 1 });

                    const filter = {
                        title: "Opening Assign",
                        message: `Opening Assign to Recruiter - ${recruiter_name.display_name}`,
                        company_id: reqbody.company_id,
                        opening_id: reqbody.opening_id,
                        user_role: "recruiter",
                        user_id: id,
                    };

                    const messageData = {
                        ...filter,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    };

                    const message_create = await MessageModel.updateOne(filter, messageData, { upsert: true });

                    job_activity_log_array.push({ recruiter_id: id, ...job_activity_log, activity_log: `Opening Assign to Recruiter - ${recruiter_name.display_name}` });
                    job_opening_assign_array.push(id);
                })
            );
            job_opening_assign.assigned_recruiter = job_opening_assign_array;
        }

        job_opening_assign_by_admin = await BdmAssignment.updateOne({ opening_id: reqbody.opening_id, created_by: user }, job_opening_assign, { upsert: true });

        await JobOpenings.updateOne({ opening_id: reqbody.opening_id }, { updated_at: Date.now() })
        await Promise.all(job_activity_log_array.map(async (e) => await JobActivityModel.updateOne({ activity_log: e.activity_log }, e, { upsert: true })));

        if (!job_opening_assign_by_admin) {
            return false;
        }
        return job_opening_assign_by_admin;
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  All Bdm list which profile is bdm
*/
exports.all_bdm_list = async () => {
    try {
        let bdm_role_id = await RoleModel.findOne({ role_name: "bdm" }, { role_name: 1 }).lean();

        let all_bdm_user_list = await UserModel.find({ assigned_role: bdm_role_id._id }, { display_name: 1 }).lean();
        if (!all_bdm_user_list) {
            return false;
        }
        return all_bdm_user_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  All Recruiter list which profile is recruiter
*/
exports.all_recruiter_list = async () => {
    try {
        let recruiter_role_id = await RoleModel.findOne({ role_name: "recruiter" }, { role_name: 1 }).lean();

        let all_recruiter_user_list = await UserModel.find({ assigned_role: recruiter_role_id._id }, { display_name: 1 }).lean();
        if (!all_recruiter_user_list) {
            return false;
        }
        return all_recruiter_user_list;
    } catch (error) {
        console.error("Error : ", error);
    }
};




/*
 *   Visa Type Create
*/
exports.save_visa_type = async (reqbody) => {
    try {

        const visatype = new VisaTypeModel({
            label: reqbody.label,
            value: reqbody.value,
            created_at: Date.now(),
            updated_at: Date.now()
        })

        return await visatype.save();

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Visa Type Details By Id
*/
exports.get_details_visa_type = async (id) => {
    try {
        let visa_type_details = await VisaTypeModel.findOne({ _id: id }).lean();
        if (!visa_type_details) {
            return false;
        }
        return visa_type_details;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Update Visa Type Details
*/
exports.update_visa_type_details = async (id, reqbody) => {
    try {

        let visatype_update = {
            label: reqbody.label,
            value: reqbody.value,
            updated_at: Date.now()
        }

        return await VisaTypeModel.updateOne({ _id: id }, visatype_update);
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
 *   Create Candidate Submission by recruiter
*/
exports.candidate_submission_by_recruiter_old = async (reqbody) => {
    try {

        let recruiter_name = await UserModel.findOne({ _id: reqbody.candidate_submission_by_recruiter[0].recruiter_id }, { display_name: 1 })


        let candidate_submission_by_recruiter = [];
        for (let i = 0; i < reqbody.candidate_submission_by_recruiter.length; i++) {

            let data = {
                opening_id: reqbody.candidate_submission_by_recruiter[i].opening_id,
                candidate_id: reqbody.candidate_submission_by_recruiter[i].candidate_id,
                recruiter_id: reqbody.candidate_submission_by_recruiter[i].recruiter_id,
                // candidate_select_by_bdm: 0,
                submission_status: reqbody.candidate_submission_by_recruiter[i].submission_status,
                // is_candidate_recruiter_by:0,
                created_at: Date.now(),
                updated_at: Date.now()
            };
            candidate_submission_by_recruiter.push(data);

        }

        let candidate_submit_by_recruiter = await CandidateSubmissionModel.insertMany(candidate_submission_by_recruiter);

        let recruiter_activity = [];

        let data_activity = {
            opening_id: reqbody.candidate_submission_by_recruiter[0].opening_id,
            // company_id:'60a7418e1dc8ba22545904d6',
            company_id: reqbody.candidate_submission_by_recruiter[0].company_id,
            recruiter_id: reqbody.candidate_submission_by_recruiter[0].recruiter_id,
            activity_log: `Candidate Shortlist by Recruiter - ${recruiter_name.display_name}`,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        recruiter_activity.push(data_activity);

        let job_activity_log_create = await JobActivityModel.create(data_activity);
        return { candidate_submission_details: candidate_submit_by_recruiter }

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.candidate_submission_by_recruiter = async (reqbody) => {
    try {
        let recruiter_name = '';
        let submissionby = '';

        if (reqbody.candidate_submission_by_recruiter[0].freelancer_recruiter_id != undefined) {
            recruiter_name = await
                UserModel.findOne(
                    { _id: reqbody.candidate_submission_by_recruiter[0].freelancer_recruiter_id },
                    { display_name: 1 }
                );
            submissionby = 'freelancer';
        } else {
            recruiter_name = await
                UserModel.findOne(
                    { _id: reqbody.candidate_submission_by_recruiter[0].recruiter_id },
                    { display_name: 1 }
                );
            submissionby = 'recruiter';
        }


        let candidate_submission_by_recruiter = [];

        if (submissionby == 'recruiter') {

            for (let i = 0; i < reqbody.candidate_submission_by_recruiter.length; i++) {
                let data = {
                    opening_id: reqbody.candidate_submission_by_recruiter[i].opening_id,
                    candidate_id: reqbody.candidate_submission_by_recruiter[i].candidate_id,
                    recruiter_id: reqbody.candidate_submission_by_recruiter[i].recruiter_id,
                    bdm_id: reqbody.candidate_submission_by_recruiter[i].bdm_id,
                    freelancer_recruiter_id:
                        reqbody.candidate_submission_by_recruiter[i].freelancer_recruiter_id,
                    // candidate_select_by_bdm: 0,
                    submission_status:
                        reqbody.candidate_submission_by_recruiter[i].submission_status,
                    // is_candidate_recruiter_by:0,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                };
                if (data.bdm_id == data.recruiter_id) data.candidate_select_by_bdm = 1;
                candidate_submission_by_recruiter.push(data);
            }
        } else {
            for (let i = 0; i < reqbody.candidate_submission_by_recruiter.length; i++) {
                let data = {
                    opening_id: reqbody.candidate_submission_by_recruiter[i].opening_id,
                    candidate_id: reqbody.candidate_submission_by_recruiter[i].candidate_id,
                    freelancer_recruiter_id: reqbody.candidate_submission_by_recruiter[i].freelancer_recruiter_id,
                    bdm_id: reqbody.candidate_submission_by_recruiter[i].bdm_id,
                    submission_status:
                        reqbody.candidate_submission_by_recruiter[i].submission_status,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                };
                if (data.bdm_id == data.recruiter_id) data.candidate_select_by_bdm = 1;
                candidate_submission_by_recruiter.push(data);
            }
        }

        let candidate_submit_by_recruiter =
            await CandidateSubmissionModel.insertMany(
                candidate_submission_by_recruiter
            );

        let data_activity = {};
        let data_activity_com = {};
        let data_activity_arr = [];
        let data_messages = {};
        let data_messages_com = {};
        let data_messages_arr = [];

        let Jobtitle = await JobOpeningModel.findOne(
            { opening_id: reqbody.candidate_submission_by_recruiter[0].opening_id },
            { opening_title: 1 }
        );

        data_activity_com = {
            opening_id: reqbody.candidate_submission_by_recruiter[0].opening_id,
            company_id: reqbody.candidate_submission_by_recruiter[0].company_id,
            created_at: Date.now(),
            updated_at: Date.now()
        }

        data_messages_com = {
            title: "Candidate Shortlist",
            company_id: reqbody.candidate_submission_by_recruiter[0].company_id,
            opening_id: reqbody.candidate_submission_by_recruiter[0].opening_id,
            candidate_id: reqbody.candidate_submission_by_recruiter[0].candidate_id
        }

        for (let i = 0; i < reqbody.candidate_submission_by_recruiter.length; i++) {

            let CandidateName = await CandidateModel.findOne(
                { _id: reqbody.candidate_submission_by_recruiter[i].candidate_id },
                { first_name: 1, last_name: 1 }
            );
            let fullName = CandidateName.first_name + " " + CandidateName.last_name;

            if (submissionby == 'recruiter') {
                data_activity = {
                    recruiter_id: reqbody.candidate_submission_by_recruiter[i].recruiter_id,
                    freelancer_recruiter_id: candidate_submission_by_recruiter[i].freelancer_recruiter_id,
                    activity_log: `Candidate Shortlist by Recruiter - ${recruiter_name.display_name}`,
                };

                data_messages = {
                    message: `${fullName} Shortlist for ${Jobtitle.opening_title} by Recruiter - ${recruiter_name.display_name}`,
                    user_role: "recruiter",
                    user_id: reqbody.candidate_submission_by_recruiter[i].recruiter_id,
                    bdm_id: reqbody.candidate_submission_by_recruiter[i].bdm_id
                };
            } else {
                data_activity = {
                    freelancer_recruiter_id: reqbody.candidate_submission_by_recruiter[i].freelancer_recruiter_id,
                    activity_log: `Candidate Shortlist by Freelancer - ${recruiter_name.display_name}`,
                };

                data_messages = {
                    message: `${fullName} Shortlist for ${Jobtitle.opening_title} by Freelancer - ${recruiter_name.display_name}`,
                    user_role: "freelancer",
                    user_id: reqbody.candidate_submission_by_recruiter[i].freelancer_recruiter_id,
                    bdm_id: reqbody.candidate_submission_by_recruiter[i].bdm_id
                };
            }

            data_activity_arr.push({ ...data_activity_com, ...data_activity });
            data_messages_arr.push({ ...data_messages_com, ...data_messages });
        }

        let message_create = await MessageModel.insertMany(data_messages_arr);
        let job_activity_log_create = await JobActivityModel.insertMany(data_activity_arr);

        return { candidate_submission_details: candidate_submit_by_recruiter };
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *   Create Candidate Submission by bdm
*/
exports.candidate_submission_by_bdm = async (reqbody) => {
    try {

        let bdm_name = await UserModel.findOne({ _id: reqbody.candidate_submission_by_bdm[0].bdm_id }, { display_name: 1 })


        let candidate_submit_by_bdm;
        let candidate_submission_by_bdm = [];
        for (let i = 0; i < reqbody.candidate_submission_by_bdm.length; i++) {

            let data = {
                bdm_id: reqbody.candidate_submission_by_bdm[i].bdm_id,
                company_id: reqbody.candidate_submission_by_bdm[i].company_id,
                candidate_select_by_bdm: reqbody.candidate_submission_by_bdm[i].candidate_select_by_bdm,
                // candidate_select_by_bdm: 1,
                submission_status: reqbody.candidate_submission_by_bdm[i].submission_status,
                created_at: Date.now(),
                updated_at: Date.now()
            };
            candidate_submission_by_bdm.push(data);

            candidate_submit_by_bdm = await CandidateSubmissionModel.updateOne({ _id: reqbody.candidate_submission_by_bdm[i]._id }, data)
        }

        let candidateName = "Candidate";
        let SubmissionDetails = await CandidateSubmissionModel.findOne({ _id: reqbody.candidate_submission_by_bdm[0]._id }).lean();

        if (SubmissionDetails) {
            let canDetails = await CandidateModel.findOne({ _id: SubmissionDetails.candidate_id }).lean();
            if (canDetails) {
                candidateName = canDetails.first_name + ' ' + canDetails.last_name;
            }
        }
        let job_activity_array = [];

        //   for(let i = 0; i < reqbody.candidate_submission_by_bdm.length; i++) {

        let status_submission;
        let titleMessage = "";
        let message = "";
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'submit') {
            status_submission = 'Candidate Shortlist by Bdm'
            titleMessage = "Candidate Shortlist";
            message = candidateName + " Shortlist by Bdm";
        }
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'reject') {
            status_submission = 'Candidate Reject by Bdm'
            titleMessage = "Candidate Reject";
            message = candidateName + " Reject by Bdm";
        }
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'oh') {
            status_submission = 'Candidate Hold by Bdm'
            titleMessage = "Candidate Hold";
            message = candidateName + " Hold by Bdm";
        }
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'I') {
            status_submission = 'Candidate Interview by Bdm'
            titleMessage = "Candidate Interview";
            message = candidateName + " Interview by Bdm";
        }
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'client_review') {
            status_submission = 'Candidate Client Review by Bdm'
            titleMessage = "Candidate Client Review";
            message = candidateName + " Client Review by Bdm";
        }
        if (reqbody.candidate_submission_by_bdm[0].submission_status == 'placed') {
            status_submission = 'Candidate Place by Bdm'
            titleMessage = "Candidate Place";
            message = candidateName + " Place by Bdm";
        }

        let job_activity_data = {

            opening_id: reqbody.candidate_submission_by_bdm[0].opening_id,
            bdm_id: reqbody.candidate_submission_by_bdm[0].bdm_id,
            company_id: reqbody.candidate_submission_by_bdm[0].company_id,


            activity_log: `${status_submission} - ${bdm_name.display_name}`,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        job_activity_array.push(job_activity_data);


        let job_activity_log_create = await JobActivityModel.create(job_activity_data);

        const messageData = new MessageModel({
            title: `${titleMessage}`,
            message: `${message} - ${bdm_name.display_name}`,
            company_id: reqbody.candidate_submission_by_bdm[0].company_id,
            opening_id: reqbody.candidate_submission_by_bdm[0].opening_id,
            user_role: "bdm",
            user_id: reqbody.candidate_submission_by_bdm[0].bdm_id,
        });
        let message_create = await messageData.save();

        return candidate_submit_by_bdm;

    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
 *  Candidate Submission List for recruiter
*/
exports.candidate_submission_listing = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5

        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        // let filter_value = reqbody.search;

        let opening_id = reqbody.opening_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_recruiter_id = reqbody.freelancer_recruiter_id;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr = { deleted: false };

        if (bdm_id != '' && bdm_id != undefined) {

            searchStr.opening_id = opening_id,
                // searchStr.submission_status = "submit"
                searchStr.candidate_select_by_bdm = 1
            searchStr.bdm_id = mongoose.Types.ObjectId(bdm_id)
        }

        if (recruiter_id != '' && recruiter_id != undefined) {
            searchStr.opening_id = opening_id
            searchStr.recruiter_id = mongoose.Types.ObjectId(recruiter_id)
        }

        if (freelance_recruiter_id != "" && freelance_recruiter_id != undefined) {
            searchStr.opening_id = opening_id;
            searchStr.freelancer_recruiter_id = mongoose.Types.ObjectId(freelance_recruiter_id);
        }

        let totalRecords;

        let count_condition = { deleted: false };

        if (bdm_id != '' && bdm_id != undefined) {
            count_condition.bdm_id = mongoose.Types.ObjectId(bdm_id)
            count_condition.opening_id = opening_id
            count_condition.candidate_select_by_bdm = 1
            totalRecords = await CandidateSubmissionModel.countDocuments(count_condition);
        }

        if (recruiter_id != '' && recruiter_id != undefined) {
            count_condition.opening_id = opening_id
            count_condition.recruiter_id = mongoose.Types.ObjectId(recruiter_id)
            totalRecords = await CandidateSubmissionModel.countDocuments(count_condition);

        }

        if (freelance_recruiter_id != '' && freelance_recruiter_id != undefined) {
            count_condition.opening_id = opening_id;
            count_condition.freelancer_recruiter_id = mongoose.Types.ObjectId(freelance_recruiter_id);
            totalRecords = await CandidateSubmissionModel.countDocuments(
                count_condition
            );
        }

        let candidate_submission_listing = await CandidateSubmissionModel.aggregate([
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_id'
                },
            },
            {
                $unwind: {
                    path: "$candidate_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            { $sort: sortJson },
            {
                $facet: {
                    // totalCount: [
                    //     {
                    //         $count: 'filteredRecords'
                    //     }
                    // ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                }
            }
        ]);

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        var data;

        if ((opening_id == "" && recruiter_id == "") || (opening_id == "" && bdm_id == "") || (opening_id == "" && freelance_recruiter_id == "")) {
            data = {
                totalRecords: 0,
                totalPages: 0,
                candidate_submission_listing: []
            }
        } else {
            data = {
                totalRecords: totalRecords,
                totalPages: total_pages,
                candidate_submission_listing: candidate_submission_listing[0].paginatedResults
            }
        }
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.candidate_submission_listing_other_bdm = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 10

        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;

        let opening_id = reqbody.opening_id;

        let searchStr = {
            deleted: false,
            candidate_select_by_bdm: 1,
            opening_id: opening_id,
            bdm_id: { $ne: mongoose.Types.ObjectId(reqbody.currentbdm) }
        };

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let candidate_submission_listing = await CandidateSubmissionModel.aggregate([
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidates'
                }
            },

            {
                $lookup:
                {
                    from: 'users',
                    localField: 'bdm_id',
                    foreignField: '_id',
                    as: 'bdm'
                },
            },

            { $sort: sortJson },

            {
                $project: {
                    candidate_details: { $arrayElemAt: ["$candidates", 0] },
                    bdm_details: { $arrayElemAt: ["$bdm", 0] },
                    opening_id: 1,
                    submission_status: 1,
                    updated_at: 1,
                    created_at: 1
                }
            },
            {
                $facet: {
                    datainfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                }
            }, {
                $project: {
                    paginatedResults: '$data',
                    totalCount: { $first: "$datainfo.count" }
                }
            }
        ]);

        return candidate_submission_listing[0];
    }
    catch (err) {
        console.error('Error in candidate submission by other bdm', err)
    }
}


/*
 *  All Candidate List for Submission e.g. if candidate already submit so it's not showing in this list
*/
exports.all_candidate_list_submission = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let status = reqbody.status;
        let opening_id = reqbody.opening_id;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let candidate_list = await CandidateSubmissionModel.find({ opening_id: reqbody.opening_id }, { candidate_id: 1, _id: 0 });

        const totalRecordsArrFilter = { deleted: false, _id: { "$nin": candidate_list.map(function (candidate_id) { return mongoose.Types.ObjectId(candidate_id.candidate_id); }) } };

        let searchStr = { deleted: false, _id: { "$nin": candidate_list.map(function (candidate_id) { return mongoose.Types.ObjectId(candidate_id.candidate_id); }) } };

        if (reqbody.created_by !== '' && reqbody.created_by !== undefined) {
            searchStr.created_by = mongoose.Types.ObjectId(reqbody.created_by);
            totalRecordsArrFilter.created_by = mongoose.Types.ObjectId(reqbody.created_by);
        }

        if (filter_value != "") {
            let regex_filter_value = new RegExp(filter_value, "i")
            searchStr["$or"] = [{ first_name: regex_filter_value }, { last_name: regex_filter_value }]
        }
        const candidate_listing = await CandidateModel.aggregate([
            { $match: searchStr },
            // { $match:  {deleted:false,_id : { "$nin": candidate_list.map(function (candidate_id) { return mongoose.Types.ObjectId(candidate_id.candidate_id); }) }}},
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
                                        { $eq: ["$candidate_id", "$$id"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_qualifications'
                }
            },
            {
                $project: {
                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, notes: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                    "employess": 1,
                    candidate_qualifications_details: {
                        $filter: {
                            input: "$candidate_qualifications",
                            as: "item",
                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                        }
                    }
                }
            },
            { $sort: sortJson },
            {
                $facet: {
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                    datainfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            },
            {
                $project: {
                    paginatedResults: '$data',
                    totalRecords: { $first: '$datainfo.count' }
                }
            }
        ]);

        const total_pages = Math.ceil(parseInt(candidate_listing[0].totalRecords) / parseInt(limit));

        const data = {
            totalRecords: candidate_listing[0].totalRecords,
            totalPages: total_pages,
            candidate_submission_listing: candidate_listing[0].paginatedResults
        }
        return data;

    } catch (error) {
        console.error("Error : ", error);
    }
};

const generateArr = async () => {
    const roleId = await RoleModel.find({ role_name: "admin" }, { _id: 1 });
    const adminId = await UserModel.find({ assigned_role: roleId }, { _id: 1 });
    return [{ created_by: { $in: adminId } }]
}

/*
*   Job Activity List by Opening_id
*/
exports.job_activity_log_list = async (reqbody, user) => {
    try {
        const freelance_id = reqbody.freelance_id;
        const bdm_id = reqbody.bdm_id;
        const recruiter_id = reqbody.recruiter_id;

        let searchArr = [];

        const defaultObj = {
            opening_id: reqbody.opening_id,
            deleted: false
        };

        if (bdm_id != '' && bdm_id != undefined) {
            const bdmOI = mongoose.Types.ObjectId(bdm_id);
            defaultObj.bdm_id = bdmOI;
            searchArr = await generateArr();
            searchArr.push({ bdm_id: bdmOI });
        }
        if (recruiter_id != '' && recruiter_id != undefined) {
            const recruiterOI = mongoose.Types.ObjectId(recruiter_id);
            defaultObj.recruiter_id = recruiterOI;
            searchArr = await generateArr();
            searchArr.push({ recruiter_id: recruiterOI });
        }
        if (freelance_id != '' && freelance_id != undefined) {
            const freelanceOI = mongoose.Types.ObjectId(freelance_id);
            defaultObj.freelancer_recruiter_id = freelanceOI;
            searchArr = await generateArr();
            searchArr.push({ freelance_id: freelanceOI });
        }
        else {
            searchArr.push({ deleted: false })
        }

        const job_activity_log = await JobActivityModel.find(
            { opening_id: reqbody.opening_id, $or: searchArr },
            { activity_log: 1, created_at: 1, _id: 0 }
        ).sort({ created_at: -1 });


        const candidate_submission_all_count = await CandidateSubmissionModel.countDocuments(defaultObj);

        const candidate_submission_by_bdm_count = await CandidateSubmissionModel.countDocuments({
            ...defaultObj,
            candidate_select_by_bdm: 1,
            submission_status: "submit",
        });

        const rejectedObj = {
            ...defaultObj,
            submission_status: "reject",
        };
        if (user.company_code) {
            rejectedObj.candidate_select_by_bdm = 1;
        }
        const candidate_submission_reject_by_bdm_count = await CandidateSubmissionModel.countDocuments(
            rejectedObj
        );

        const candidate_submission_client_review_by_bdm_count = await CandidateSubmissionModel.countDocuments({
            ...defaultObj,
            submission_status: "client_review",
        });

        const candidate_submission_placed_by_bdm_count = await CandidateSubmissionModel.countDocuments({
            ...defaultObj,
            submission_status: "placed",
        });

        const candidate_submission_interview_by_bdm_count = await CandidateSubmissionModel.countDocuments({
            ...defaultObj,
            submission_status: "I",
        });

        const data = {
            job_activity_log: job_activity_log,
            total_candidate_submission: candidate_submission_all_count,
            total_candidate_submitted: candidate_submission_by_bdm_count,
            total_candidate_rejected: candidate_submission_reject_by_bdm_count,
            total_client_review: candidate_submission_client_review_by_bdm_count,
            total_candidate_interview: candidate_submission_interview_by_bdm_count,
            total_candidate_placed: candidate_submission_placed_by_bdm_count,
        };

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};
/*
 *  Reject Candidate Submission List by Bdm 
 */
exports.reject_candidate_list_bdm = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at';
        let sort_order = reqbody.order_direction;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let totalRecords = await CandidateSubmissionModel.countDocuments({ deleted: false, bdm_id: mongoose.Types.ObjectId(reqbody.bdm_id), opening_id: reqbody.opening_id, submission_status: "reject" });

        let reject_candidate_listing = await CandidateSubmissionModel.aggregate([
            { $match: { deleted: false, bdm_id: mongoose.Types.ObjectId(reqbody.bdm_id), opening_id: reqbody.opening_id, submission_status: "reject" } },
            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_id'
                },
            },
            {
                $unwind: {
                    path: "$candidate_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            { $sort: sortJson },
            {
                $facet: {
                    // totalCount: [
                    //     {
                    //         $count: 'filteredRecords'
                    //     }
                    // ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }

        ]);

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            reject_candidate_list: reject_candidate_listing[0].paginatedResults
        };


        return data


    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
 *  Hold Candidate Submission List by Bdm 
*/
exports.hold_candidate_list_bdm = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction || 'desc';

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }



        //Return count of Total Records and Total Pages 
        let hold_candidate_submission_total_pages = await UserModel.aggregate([
            { $match: { deleted: false, _id: mongoose.Types.ObjectId(reqbody.bdm_id) } },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$bdm_id', '$$id'] },
                                        { $eq: ['$submission_status', 'oh'] },
                                        { $eq: ['$opening_id', reqbody.opening_id] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_submissions'
                }
            },


            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_submissions.candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_submissions.candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        // { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] },
                                        { $in: ["$_id", "$$candidate_id"] }
                                    ]
                                }
                            }
                        },

                        // {
                        //     $lookup:
                        //     {
                        //         from: 'employees',
                        //         let: { id: '$_id' },
                        //         pipeline: [
                        //             {
                        //                 $match: {
                        //                     $expr: {
                        //                         $and: [
                        //                             // { $in: ['$candidate_id', '$$id'] },
                        //                             { $eq: ['$candidate_id', '$$id'] },
                        //                             { $eq: ['$deleted', false] },
                        //                             { $eq: ['$is_current_company', true] },
                        //                         ]
                        //                     }
                        //                 }
                        //             },
                        //             { $limit: 1 }
                        //         ],
                        //         as: 'employess'
                        //     },

                        // },

                        // {
                        //     $lookup:
                        //     {
                        //         from: 'candidate_qualifications',
                        //         //   localField: '_id',
                        //         //   foreignField: 'candidate_id',
                        //         let: { id: '$_id' },
                        //         pipeline: [

                        //             {
                        //                 $match: {
                        //                     $expr: {
                        //                         $and: [
                        //                             // { $eq: ['$candidate_id', '$$id'] },
                        //                             { $eq: ['$deleted', false] },
                        //                             { $eq: ["$candidate_id", "$$id"] }
                        //                         ]
                        //                     }
                        //                 }
                        //             }
                        //         ],
                        //         as: 'candidate_qualifications'
                        //     },


                        // },

                        // {
                        //     $project: {
                        //         email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1,  profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                        //        "employess": 1,
                        //         candidate_qualifications_details: {
                        //             $filter: {
                        //                 input: "$candidate_qualifications",
                        //                 as: "item",
                        //                 cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                        //             }
                        //         }
                        //     }
                        // },


                        // { $skip: Number(offset) }, { $limit: Number(limit) }
                    ],
                    as: 'candidate_details',


                },


            },

            { $addFields: { candidateCount: { $size: "$candidate_details" } } },

        ]);


        //Return Paginated Data
        let hold_candidate_submission_listing = await UserModel.aggregate([
            { $match: { deleted: false, _id: mongoose.Types.ObjectId(reqbody.bdm_id) } },
            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$bdm_id', '$$id'] },
                                        { $eq: ['$submission_status', 'oh'] },
                                        { $eq: ['$opening_id', reqbody.opening_id] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_submissions'
                }
            },


            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_submissions.candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_submissions.candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        // { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] },
                                        { $in: ["$_id", "$$candidate_id"] }
                                    ]
                                }
                            }
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
                                                    { $eq: ["$candidate_id", "$$id"] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: 'candidate_qualifications'
                            },


                        },

                        {
                            $project: {
                                email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                "employess": 1,
                                candidate_qualifications_details: {
                                    $filter: {
                                        input: "$candidate_qualifications",
                                        as: "item",
                                        cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                    }
                                }
                            }
                        },
                        // { $sort: sortJson },

                        { $skip: Number(offset) }, { $limit: Number(limit) }
                    ],
                    as: 'candidate_details',


                },


            },


        ]);


        let hold_candidate_listing = await CandidateSubmissionModel.aggregate([
            { $match: { deleted: false, bdm_id: mongoose.Types.ObjectId(reqbody.bdm_id), opening_id: reqbody.opening_id, submission_status: "oh" } },
            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_id'
                },
            },
            {
                $unwind: {
                    path: "$candidate_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $facet: {
                    // totalCount: [
                    //     {
                    //         $count: 'filteredRecords'
                    //     }
                    // ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }

        ]);

        let data = {};

        if (hold_candidate_submission_total_pages.length > 0) {

            let total_pages = Math.ceil(parseInt(hold_candidate_submission_total_pages[0].candidateCount) / parseInt(limit));

            data.totalRecords = hold_candidate_submission_total_pages[0].candidateCount
            data.totalPages = total_pages

        } else {
            data.totalRecords = 0
            data.totalPages = 0
            data.hold_candidate_list = []
        }

        if (hold_candidate_listing.length > 0) {

            data.hold_candidate_list = hold_candidate_listing[0].paginatedResults
            // data.hold_candidate_list = hold_candidate_submission_listing[0].candidate_details

        }
        return data

    } catch (error) {
        console.error("Error : ", error);
    }
};





/*
  *   Submit Candidate List Opening Id Wise e.g. Candidate Select By Bdm
 */
exports.submit_candidate_opening_id_wise = async (reqbody, user) => {
    try {
        let offset =
            parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
        let limit = parseInt(reqbody.per_page) || 5;
        let status = reqbody.status;
        let bdm_id = reqbody.bdm_id;
        let freelance_id = reqbody.freelance_id;

        let firstCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
                //  { $eq: ["$company_id", "$$id"] },
                { $eq: ["$opening_id", reqbody.opening_id] },
            ],
        }

        let secondCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
                { $eq: ["$candidate_id", "$$id"] },
                /* {
                     $eq: [
                         "$company_id",
                         mongoose.Types.ObjectId(reqbody.company_id),
                     ],
                 },*/
                { $eq: ["$opening_id", reqbody.opening_id] },
            ],
        }

        if (bdm_id != '' && bdm_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
        }

        if (freelance_id != '' && freelance_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
        }


        if (status != '' && status != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })
            if (status != 'reject') {
                firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
                secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            }
        } else {
            // firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            // secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
        }

        if (user.company_code) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
        }

        // let candidate_submission_list_total_pages = await CompanyModel.aggregate([
        //     {
        //         $match: {
        //             //  _id: mongoose.Types.ObjectId(reqbody.company_id),
        //             deleted: false,
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "candidate_submissions",
        //             //   localField: '_id',
        //             //   foreignField: 'company_id',
        //             let: { id: "$_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: firstCandidateSubmissionCond
        //                     },
        //                 },
        //             ],
        //             as: "candidate_submissions",
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "candidates",
        //             //   localField: 'candidate_submissions.candidate_id',
        //             //   foreignField: '_id',
        //             let: { candidate_id: "$candidate_submissions.candidate_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$deleted", false] },
        //                                 { $in: ["$_id", "$$candidate_id"] },
        //                             ],
        //                         },
        //                     },
        //                 },

        //                 {
        //                     $lookup: {
        //                         from: "employees",
        //                         let: { id: "$_id" },
        //                         pipeline: [
        //                             {
        //                                 $match: {
        //                                     $expr: {
        //                                         $and: [
        //                                             // { $in: ['$candidate_id', '$$id'] },
        //                                             { $eq: ["$candidate_id", "$$id"] },
        //                                             { $eq: ["$deleted", false] },
        //                                             { $eq: ["$is_current_company", true] },
        //                                         ],
        //                                     },
        //                                 },
        //                             },
        //                             { $limit: 1 },
        //                         ],
        //                         as: "employess",
        //                     },
        //                 },

        //                 {
        //                     $lookup: {
        //                         from: "candidate_qualifications",
        //                         //   localField: '_id',
        //                         //   foreignField: 'candidate_id',
        //                         let: { id: "$_id" },
        //                         pipeline: [
        //                             {
        //                                 $match: {
        //                                     $expr: {
        //                                         $and: [
        //                                             // { $eq: ['$candidate_id', '$$id'] },
        //                                             { $eq: ["$deleted", false] },
        //                                             { $eq: ["$candidate_id", "$$id"] },
        //                                         ],
        //                                     },
        //                                 },
        //                             },
        //                         ],
        //                         as: "candidate_qualifications",
        //                     },
        //                 },

        //                 {
        //                     $lookup: {
        //                         from: "candidate_submissions",
        //                         let: { id: "$_id" },
        //                         pipeline: [
        //                             {
        //                                 $match: {
        //                                     $expr: secondCandidateSubmissionCond
        //                                 },
        //                             },

        //                             {
        //                                 $lookup: {
        //                                     from: "jobopenings",
        //                                     let: { id: "$opening_id" },
        //                                     pipeline: [
        //                                         {
        //                                             $match: {
        //                                                 $expr: {
        //                                                     $and: [
        //                                                         { $eq: ["$deleted", false] },
        //                                                         { $eq: ["$opening_id", reqbody.opening_id] },
        //                                                         { $eq: ["$opening_id", "$$id"] },
        //                                                     ],
        //                                                 },
        //                                             },
        //                                         },
        //                                     ],
        //                                     as: "job_opening_details",
        //                                 },
        //                             },

        //                             // { $limit: 1 }
        //                         ],
        //                         as: "opening_details",
        //                     },
        //                 },

        //                 {
        //                     $unwind: {
        //                         path: "$opening_details",
        //                         preserveNullAndEmptyArrays: true,
        //                     },
        //                 },


        //             ],
        //             as: "candidate_details",
        //         },
        //     },
        //     { $addFields: { candidateCount: { $size: "$candidate_details" } } },
        // ]);

        //return total data
        let candidate_submission_list_job_opening_wise = await CompanyModel.aggregate([
            {
                $match: {
                    // _id: mongoose.Types.ObjectId(reqbody.company_id),
                    deleted: false,
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: firstCandidateSubmissionCond
                                /*$expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$company_id", "$$id"] },
                                        { $eq: ["$opening_id", reqbody.opening_id] },
                                        { $eq: ["$candidate_select_by_bdm", 1] },
                                    ],
                                },*/
                            },
                        },
                    ],
                    as: "candidate_submissions",
                },
            },
            { $sort: { updated_at: -1 } },
            {
                $lookup: {
                    from: "candidates",
                    //   localField: 'candidate_submissions.candidate_id',
                    //   foreignField: '_id',
                    let: { candidate_id: "$candidate_submissions.candidate_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $in: ["$_id", "$$candidate_id"] },
                                    ],
                                },
                            },
                        },

                        {
                            $lookup: {
                                from: "employees",
                                let: { id: "$_id" },
                                pipeline: [
                                    // {
                                    //     $limit: 1
                                    // },
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $in: ['$candidate_id', '$$id'] },
                                                    { $eq: ["$candidate_id", "$$id"] },
                                                    { $eq: ["$deleted", false] },
                                                    { $eq: ["$is_current_company", true] },
                                                ],
                                            },
                                        },
                                    },
                                    { $limit: 1 },
                                ],
                                as: "employess",
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
                                                    { $eq: ["$opening_id", reqbody.opening_id] },
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
                            $lookup: {
                                from: "candidate_qualifications",
                                //   localField: '_id',
                                //   foreignField: 'candidate_id',
                                let: { id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ["$deleted", false] },
                                                    { $eq: ["$candidate_id", "$$id"] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: "candidate_qualifications",
                            },
                        },

                        {
                            $lookup: {
                                from: "candidate_submissions",
                                let: { id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: secondCandidateSubmissionCond
                                            /* $expr: {
                                                 $and: [
                                                     { $eq: ["$deleted", false] },
                                                     { $eq: ["$candidate_id", "$$id"] },
                                                     { $eq: ["$candidate_select_by_bdm", 1] },
                                                     // { $eq: ['$submission_status', 'submit'] },
                                                     {
                                                         $eq: [
                                                             "$company_id",
                                                             mongoose.Types.ObjectId(reqbody.company_id),
                                                         ],
                                                     },
                                                     { $eq: ["$opening_id", reqbody.opening_id] },
                                                     // { $eq: ['$opening_id',reqbody.opening_id] },
                                                     // {$eq :['$submission_status','placed']}
                                                 ],
                                                 // $or: [{'$submission_status':"placed"}]
                                             },*/
                                        },
                                    },
                                    { $sort: { updated_at: -1 } },
                                    {
                                        $lookup: {
                                            from: "jobopenings",
                                            let: { id: "$opening_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$deleted", false] },
                                                                { $eq: ["$opening_id", reqbody.opening_id] },
                                                                { $eq: ["$opening_id", "$$id"] },
                                                            ],
                                                        },
                                                    },
                                                },
                                            ],
                                            as: "job_opening_details",
                                        },
                                    },

                                    // { $limit: 1 }
                                ],
                                as: "opening_details",
                            },
                        },

                        {
                            $unwind: {
                                path: "$opening_details",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                email: 1,
                                mobile: 1,
                                candidate_category: 1,
                                job_category: 1,
                                total_work_exp_year: 1,
                                total_work_exp_month: 1,
                                desired_employment_type: 1,
                                desired_job_type: 1,
                                key_skills: 1,
                                current_location: 1,
                                desired_location: 1,
                                current_ctc_in_lacs: 1,
                                current_ctc_in_thousand: 1,
                                profile_image: 1,
                                status: 1,
                                created_at: 1,
                                updated_at: 1,
                                name: { $concat: ["$first_name", " ", "$last_name"] },
                                employess: 1,
                                interviewschedules: 1,
                                "opening_details.opening_id": 1,
                                "opening_details.submission_status": 1,
                                "opening_details.updated_at": 1,
                                "opening_details.job_opening_details._id": 1,
                                "opening_details.job_opening_details.required_skills": 1,
                                "opening_details.job_opening_details.opening_title": 1,
                                "opening_details.job_opening_details.opening_id": 1,
                                "opening_details.job_opening_details.required_experience": 1,
                                "opening_details.job_opening_details.category": 1,
                                "opening_details.job_opening_details.job_description": 1,
                                "opening_details.job_opening_details.short_description": 1,
                                "opening_details.job_opening_details.salary_range": 1,
                                candidate_qualifications_details: {
                                    $filter: {
                                        input: "$candidate_qualifications",
                                        as: "item",
                                        cond: {
                                            $eq: [
                                                "$$item.passing_year",
                                                { $max: "$candidate_qualifications.passing_year" },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                        { $sort: { "opening_details.updated_at": -1 } },
                        { $skip: Number(offset) }, { $limit: Number(limit) },
                    ],
                    as: "candidate_details",
                },
            },
            { $addFields: { candidateCount: { $size: "$candidate_details" } } },

        ]);

        let data = {};
        if (candidate_submission_list_job_opening_wise[0].candidateCount > 0) {
            let total_pages = Math.ceil(parseInt(candidate_submission_list_job_opening_wise[0].candidateCount) / parseInt(limit));
            data.totalRecords = candidate_submission_list_job_opening_wise[0].candidateCount
            data.totalPages = total_pages
        } else {
            data.totalRecords = 0
            data.totalPages = 0
            data.candidate_submit_list = []
        }

        if (candidate_submission_list_job_opening_wise.length > 0) {
            data.candidate_submit_list = candidate_submission_list_job_opening_wise[0].candidate_details
        }
        /* return {
           candidate_submit_list:
             candidate_submission_list_job_opening_wise[0].candidate_details,
         };*/

        return data;
    } catch (error) {
        console.log("Error : ", error);
    }
};


/*
 *  Recruiter through Submission Candidate List for Bdm 
*/
exports.recruiter_submission_candidate_list = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        let opening_id = reqbody.opening_id;
        let bdm_id = reqbody.bdm_id;
        // let recruiter_id = reqbody.recruiter_id;
        // let freelancer_recruiter_id = reqbody.freelancer_recruiter_id;


        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr = {
            deleted: false, submission_status: "submission"
        };
        if (bdm_id !== '') {
            searchStr.bdm_id = mongoose.Types.ObjectId(bdm_id)
        }

        if (opening_id !== '') {
            searchStr.opening_id = opening_id;
        }


        // if (recruiter_id != '' && recruiter_id != undefined) {
        //     if (freelancer_recruiter_id == '' || freelancer_recruiter_id == undefined) {
        //         searchStr.submission_status = "submission"
        //         searchStr.opening_id = opening_id
        //         searchStr.recruiter_id = mongoose.Types.ObjectId(recruiter_id)
        //     } else {
        //         let addcond = {
        //             $and: [
        //                 { submission_status: "submission", opening_id: opening_id, deleted: false },
        //                 {
        //                     $or: [{
        //                         recruiter_id: mongoose.Types.ObjectId(recruiter_id),
        //                     }, {
        //                         freelancer_recruiter_id: mongoose.Types.ObjectId(freelancer_recruiter_id),
        //                     }
        //                     ]
        //                 }
        //             ]
        //         };

        //         searchStr = { ...searchStr, ...addcond };

        //     }
        // }

        // if (recruiter_id == "" || recruiter_id == undefined) {
        //     if (freelancer_recruiter_id != '' || freelancer_recruiter_id != undefined) {
        //         searchStr.submission_status = "submission";
        //         searchStr.opening_id = opening_id;
        //         searchStr.freelancer_recruiter_id = mongoose.Types.ObjectId(freelancer_recruiter_id);
        //     }
        // }

        let totalRecords;

        // let count_condition = { deleted: false };
        // if (recruiter_id != '' && recruiter_id != undefined) {
        //     if (freelancer_recruiter_id == '' || freelancer_recruiter_id == undefined) {
        //         count_condition.opening_id = opening_id
        //         count_condition.submission_status = "submission"
        //         count_condition.recruiter_id = mongoose.Types.ObjectId(recruiter_id)
        //     } else {
        //         let addcondCount = {
        //             $and: [
        //                 { submission_status: "submission", opening_id: opening_id, deleted: false },
        //                 {
        //                     $or: [{
        //                         recruiter_id: mongoose.Types.ObjectId(recruiter_id),
        //                     }, {
        //                         freelancer_recruiter_id: mongoose.Types.ObjectId(freelancer_recruiter_id),
        //                     }
        //                     ]
        //                 }
        //             ]
        //         };

        //         count_condition = { ...count_condition, ...addcondCount };
        //     }



        // }

        // if (recruiter_id == "" || recruiter_id == undefined) {
        //     if (freelancer_recruiter_id != '' || freelancer_recruiter_id != undefined) {
        //         count_condition.submission_status = "submission";
        //         count_condition.opening_id = opening_id;
        //         count_condition.freelancer_recruiter_id = mongoose.Types.ObjectId(freelancer_recruiter_id);
        //     }
        // }
        totalRecords = await CandidateSubmissionModel.countDocuments(searchStr);
        let candidate_submission_listing = await CandidateSubmissionModel.aggregate([
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'candidates',
                    // localField: 'candidate_id',
                    // foreignField: '_id',
                    let: { candidate_id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$candidate_id'] },
                                        { $eq: ['$deleted', false] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'candidate_id'
                },
            },
            {
                $unwind: {
                    path: "$candidate_id",
                    "preserveNullAndEmptyArrays": true
                }
            },
            { $sort: sortJson },
            {
                $facet: {
                    // totalCount: [
                    //     {
                    //         $count: 'filteredRecords'
                    //     }
                    // ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],

                }
            }

        ]);

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            candidate_list_for_bdm: candidate_submission_listing[0].paginatedResults
        }
        return data

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
  *  Candidate Re-Sent to Recruiter Candidate List By BDM
 */
exports.resend_candidate_recruiter = async (reqbody) => {
    try {

        let bdm_name = await UserModel.findOne({ _id: reqbody.candidate_submission_by_bdm[0].bdm_id }, { display_name: 1 })



        let candidate_submit_by_bdm;
        let candidate_submission_by_bdm = [];
        for (let i = 0; i < reqbody.candidate_submission_by_bdm.length; i++) {

            let data = {
                bdm_id: reqbody.candidate_submission_by_bdm[i].bdm_id,
                company_id: reqbody.candidate_submission_by_bdm[i].company_id,
                candidate_select_by_bdm: 0,
                // candidate_select_by_bdm: 1,
                submission_status: 'submission',
                // submission_status: 're-submission',
                created_at: Date.now(),
                updated_at: Date.now()
            };
            candidate_submission_by_bdm.push(data);

            candidate_submit_by_bdm = await CandidateSubmissionModel.updateOne({ _id: reqbody.candidate_submission_by_bdm[i]._id }, data)
        }

        let job_activity_array = [];


        let job_activity_data = {
            opening_id: reqbody.candidate_submission_by_bdm[0].opening_id,
            bdm_id: reqbody.candidate_submission_by_bdm[0].bdm_id,
            company_id: reqbody.candidate_submission_by_bdm[0].company_id,
            activity_log: `Candidate Resubmission by Bdm - ${bdm_name.display_name}`,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        job_activity_array.push(job_activity_data);

        let job_activity_log_create = await JobActivityModel.create(job_activity_data);

        const messageData = new MessageModel({
            title: "Candidate Resubmission",
            message: `Candidate Resubmission by Bdm - ${bdm_name.display_name}`,
            company_id: reqbody.candidate_submission_by_bdm[0].company_id,
            opening_id: reqbody.candidate_submission_by_bdm[0].opening_id,
            user_role: "bdm",
            user_id: reqbody.candidate_submission_by_bdm[0].bdm_id,
        });
        let message_create = await messageData.save();

        return candidate_submit_by_bdm;

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
  *  Candidate Re-Sent to All Candidate List By Recruiter
*/
exports.resend_candidate_to_all_candidate_list = async (reqbody) => {
    try {

        let recruiter_name = '';
        let type = '';

        if (reqbody.candidate_withdraw_by_recruiter[0].recruiter_id != undefined) {
            recruiter_name = await UserModel.findOne(
                { _id: reqbody.candidate_withdraw_by_recruiter[0].recruiter_id },
                { display_name: 1 }
            );
            type = 'recruiter';
        } else {
            recruiter_name = await UserModel.findOne(
                { _id: reqbody.candidate_withdraw_by_recruiter[0].freelancer_recruiter_id },
                { display_name: 1 }
            );
            type = 'freelancer';
        }



        let candidate_return_by_recruiter;
        let candidate_submission_by_bdm = [];
        for (let i = 0; i < reqbody.candidate_withdraw_by_recruiter.length; i++) {
            candidate_return_by_recruiter = await CandidateSubmissionModel.removeOne({ _id: reqbody.candidate_withdraw_by_recruiter[i]._id });
        }

        let job_activity_data = {};
        if (type == 'recruiter') {
            job_activity_data = {
                opening_id: reqbody.candidate_withdraw_by_recruiter[0].opening_id,
                recruiter_id: reqbody.candidate_withdraw_by_recruiter[0].recruiter_id,
                activity_log: `Candidate Withdraw by Recruiter - ${recruiter_name.display_name}`,
                created_at: Date.now(),
                updated_at: Date.now()
            };
        } else {
            job_activity_data = {
                opening_id: reqbody.candidate_withdraw_by_recruiter[0].opening_id,
                recruiter_id: reqbody.candidate_withdraw_by_recruiter[0].freelancer_recruiter_id,
                activity_log: `Candidate Withdraw by Freelancer - ${recruiter_name.display_name}`,
                created_at: Date.now(),
                updated_at: Date.now(),
            };
        }



        let job_activity_log_create = await JobActivityModel.create(job_activity_data);

        return candidate_return_by_recruiter;

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.reportDownloadlistOld = async (reqbody) => {
    try {

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

        let sortJson = {};

        if (sort_order == "asc") {
            sortJson[order_column] = 1;
        } else {
            sortJson[order_column] = -1;
        }

        /** check for object id */
        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        let searchStr = { deleted: false };

        if (categories != "") {
            searchStr.category = {
                $in: categories.map((category) => {
                    return new RegExp(category, "i");
                }),
            };
        }

        let searchStatus = {};

        if (status != "") {
            var regex_status = new RegExp(status, "i");
            searchStr.status = regex_status;
        }

        if (company_id != "" && company_id != undefined) {
            searchStr.account_name = mongoose.Types.ObjectId(company_id);
        }
        if (bdm_id != "" && bdm_id != undefined) {
            searchStr.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
        }
        if (recruiter_id != "" && recruiter_id != undefined) {
            searchStr.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
        }
        if (opening_id != "" && opening_id != undefined) {
            searchStr.opening_id = opening_id;
        }
        if (opening_title != "" && opening_title != undefined) {
            searchStr.opening_title = new RegExp(opening_title, "i");
        }

        let filter_condition = {};

        if (reqbody.dateRange.length == 0) {
            filter_condition = {
                $match: { $and: [searchStr, searchStatus] },
            };
        }

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];
            let searchDate = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate + "T23:59:59.999Z"),
            };

            searchStr.created_at = searchDate;
        }

        var job_opening_listing = await JobOpeningModel.aggregate([
            { $match: searchStr },
            {
                $lookup: {
                    from: "companies",
                    let: { account_name: "$account_name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$account_name"] },
                                        { $eq: ["$deleted", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "account_name",
                },
            },
            {
                $lookup: {
                    from: "contacts",
                    localField: "contact_name",
                    foreignField: "_id",
                    as: "contact_name",
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: "$opening_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$opening_id", "$$opening_id"] },
                                        { $eq: ["$candidate_select_by_bdm", 1] },
                                    ],
                                },
                            },
                        },
                        {
                            $count: "total_candidate_submit",
                        },
                    ],
                    as: "candidate_submission_details",
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "code",
                    as: "category",
                },
            },
            {
                $project: {
                    "account_name._id": 1,
                    "account_name.company_name": 1,
                    "contact_name._id": 1,
                    "contact_name.display_name": 1,
                    candidate_submission_details: 1,
                    _id: 1,
                    opening_title: 1,
                    opening_id: 1,
                    status: 1,
                    created_at: 1,
                    updated_at: 1,
                },
            },
            { $sort: sortJson },
        ]);

        // let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        if (!job_opening_listing) {
            return false;
        }
        var data = {
            job_opening_listing: job_opening_listing,
        };
        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.reportDownloadlist = async (reqbody) => {
    try {

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
        let submission_status = reqbody.submission_status;
        let freelance_id = reqbody.freelance_id;

        let role = reqbody.role;

        let sortJson = {};

        if (sort_order == "asc") {
            sortJson[order_column] = 1;
        } else {
            sortJson[order_column] = -1;
        }

        /** check for object id */
        let checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

        let searchStr = { deleted: false };

        if (categories != "") {
            searchStr.category = {
                $in: categories.map((category) => {
                    return new RegExp(category, "i");
                }),
            };
        }

        let searchStatus = {};

        if (status != "") {
            //  var regex_status = new RegExp(status, "i");
            searchStr.status = status;
        }

        if (opening_title != "" && opening_title != undefined) {
            searchStr.opening_title = new RegExp(opening_title, "i");
        }

        let filter_condition = {};

        if (reqbody.dateRange.length == 0) {
            filter_condition = {
                $match: { $and: [searchStr, searchStatus] },
            };
        }

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];
            let searchDate = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate + "T23:59:59.999Z"),
            };
            searchStr.created_at = searchDate;
        }

        if (company_id != "" && company_id != undefined) {
            //candidateSubmissionCondition["$and"].push({ $eq: ['$company_id',  mongoose.Types.ObjectId(company_id)] })
            searchStr.account_name = mongoose.Types.ObjectId(company_id);
        }

        // assigned opening ids
        let assignedOpeningIds = [];
        let openingIds = [];
        let assignmentObj = {};

        if (bdm_id != "" && bdm_id != undefined) {
            assignmentObj.assigned_bdm = { $in: [mongoose.Types.ObjectId(bdm_id)] };
        }

        if (recruiter_id != "" && recruiter_id != undefined) {
            assignmentObj.assigned_recruiter = { $in: [mongoose.Types.ObjectId(recruiter_id)] };
        }

        if (freelance_id != "" && freelance_id != undefined) {
            assignmentObj.assigned_freelancer = { $in: [mongoose.Types.ObjectId(freelance_id)] };
        }

        if (Object.keys(assignmentObj).length) {
            openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, assignmentObj] }, { opening_id: 1 });

            if (openingIds) {
                assignedOpeningIds = openingIds.map(item => item.opening_id);
                searchStr.opening_id = { $in: assignedOpeningIds };
            }
        }

        const job_opening_listing = await JobOpeningModel.aggregate([
            { $match: searchStr },
            {
                $lookup: {
                    from: "companies",
                    let: { account_name: "$account_name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$account_name"] },
                                        { $eq: ["$deleted", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "account_name",
                },
            },
            {
                $lookup: {
                    from: "contacts",
                    localField: "contact_name",
                    foreignField: "_id",
                    as: "contact_name",
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: "$opening_id" },
                    pipeline: [
                        {
                            $match: {
                                /// $expr: candidateSubmissionCondition
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$opening_id", "$$opening_id"] },
                                        { $eq: ["$candidate_select_by_bdm", 1] },

                                    ],
                                },
                            },
                        },
                        {
                            $count: "total_candidate_submit",
                        },
                    ],
                    as: "candidate_submission_details",
                },
            },
            //    { "$match": { "candidate_submission_details": { $exists: true, $ne: [] } }},
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "code",
                    as: "category",
                },
            },
            {
                $project: {
                    "account_name._id": 1,
                    "account_name.company_name": 1,
                    "contact_name._id": 1,
                    "contact_name.display_name": 1,
                    candidate_submission_details: 1,
                    _id: 1,
                    opening_title: 1,
                    opening_id: 1,
                    status: 1,
                    created_at: 1,
                    updated_at: 1,
                },
            },
            { $sort: sortJson },
        ]);


        if (!job_opening_listing) {
            return false;
        }
        return { job_opening_listing };
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.submit_candidate_bdm_recruiter_freelance_id_wisOLDe = async (reqbody) => {
    try {
        let offset =
            parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
        let limit = parseInt(reqbody.per_page) || 5;
        let status = reqbody.status;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_id = reqbody.freelance_id;



        let firstCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
                { $eq: ["$company_id", "$$id"] },
                { $eq: ["$opening_id", reqbody.opening_id] },
                //   { $eq: ["$candidate_select_by_bdm", 1] },

            ],
        }

        let secondCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
                { $eq: ["$candidate_id", "$$id"] },
                //   { $eq: ["$candidate_select_by_bdm", 1] },
                {
                    $eq: [
                        "$company_id",
                        mongoose.Types.ObjectId(reqbody.company_id),
                    ],
                },
                { $eq: ["$opening_id", reqbody.opening_id] },
            ],
        }

        if (bdm_id != '' && bdm_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
        }

        if (recruiter_id != '' && recruiter_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$recruiter_id', mongoose.Types.ObjectId(recruiter_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$recruiter_id', mongoose.Types.ObjectId(recruiter_id)] })
        }

        if (freelance_id != '' && freelance_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
        }

        if (status != '' && status != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })
            if (status != 'reject') {
                firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
                secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            }
        } else {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
        }

        //return total pages
        let candidate_submission_list_total_pages = await CompanyModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(reqbody.company_id),
                    deleted: false,
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: firstCandidateSubmissionCond
                            },
                        },
                    ],
                    as: "candidate_submissions",
                },
            },
            {
                $lookup: {
                    from: "candidates",
                    //   localField: 'candidate_submissions.candidate_id',
                    //   foreignField: '_id',
                    let: { candidate_id: "$candidate_submissions.candidate_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $in: ["$_id", "$$candidate_id"] },
                                    ],
                                },
                            },
                        },

                        {
                            $lookup: {
                                from: "employees",
                                let: { id: "$_id" },
                                pipeline: [
                                    // {
                                    //     $limit: 1
                                    // },
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $in: ['$candidate_id', '$$id'] },
                                                    { $eq: ["$candidate_id", "$$id"] },
                                                    { $eq: ["$deleted", false] },
                                                    { $eq: ["$is_current_company", true] },
                                                ],
                                            },
                                        },
                                    },
                                    { $limit: 1 },
                                ],
                                as: "employess",
                            },
                        },

                        {
                            $lookup: {
                                from: "candidate_qualifications",
                                //   localField: '_id',
                                //   foreignField: 'candidate_id',
                                let: { id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    // { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ["$deleted", false] },
                                                    { $eq: ["$candidate_id", "$$id"] },
                                                ],
                                            },
                                        },
                                    },
                                ],
                                as: "candidate_qualifications",
                            },
                        },

                        {
                            $lookup: {
                                from: "candidate_submissions",
                                let: { id: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: secondCandidateSubmissionCond
                                        },
                                    },

                                    {
                                        $lookup: {
                                            from: "jobopenings",
                                            let: { id: "$opening_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$deleted", false] },
                                                                { $eq: ["$opening_id", reqbody.opening_id] },
                                                                { $eq: ["$opening_id", "$$id"] },
                                                            ],
                                                        },
                                                    },
                                                },
                                            ],
                                            as: "job_opening_details",
                                        },
                                    },

                                    // { $limit: 1 }
                                ],
                                as: "opening_details",
                            },
                        },

                        {
                            $unwind: {
                                path: "$opening_details",
                                preserveNullAndEmptyArrays: true,
                            },
                        },


                    ],
                    as: "candidate_details",
                },
            },
            { $addFields: { candidateCount: { $size: "$candidate_details" } } },
        ]);

        //return total data
        let candidate_submission_list_job_opening_wise =
            await CompanyModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(reqbody.company_id),
                        deleted: false,
                    },
                },
                {
                    $lookup: {
                        from: "candidate_submissions",
                        //   localField: '_id',
                        //   foreignField: 'company_id',
                        let: { id: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: firstCandidateSubmissionCond
                                    /*$expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $eq: ["$company_id", "$$id"] },
                                            { $eq: ["$opening_id", reqbody.opening_id] },
                                            { $eq: ["$candidate_select_by_bdm", 1] },
    
                                        ],
                                    },*/
                                },
                            },
                        ],
                        as: "candidate_submissions",
                    },
                },

                {
                    $lookup: {
                        from: "candidates",
                        //   localField: 'candidate_submissions.candidate_id',
                        //   foreignField: '_id',
                        let: { candidate_id: "$candidate_submissions.candidate_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $in: ["$_id", "$$candidate_id"] },
                                        ],
                                    },
                                },
                            },

                            {
                                $lookup: {
                                    from: "employees",
                                    let: { id: "$_id" },
                                    pipeline: [
                                        // {
                                        //     $limit: 1
                                        // },
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        // { $in: ['$candidate_id', '$$id'] },
                                                        { $eq: ["$candidate_id", "$$id"] },
                                                        { $eq: ["$deleted", false] },
                                                        { $eq: ["$is_current_company", true] },
                                                    ],
                                                },
                                            },
                                        },
                                        { $limit: 1 },
                                    ],
                                    as: "employess",
                                },
                            },

                            {
                                $lookup: {
                                    from: "candidate_qualifications",
                                    //   localField: '_id',
                                    //   foreignField: 'candidate_id',
                                    let: { id: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        // { $eq: ['$candidate_id', '$$id'] },
                                                        { $eq: ["$deleted", false] },
                                                        { $eq: ["$candidate_id", "$$id"] },
                                                    ],
                                                },
                                            },
                                        },
                                    ],
                                    as: "candidate_qualifications",
                                },
                            },

                            {
                                $lookup: {
                                    from: "candidate_submissions",
                                    let: { id: "$_id" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: secondCandidateSubmissionCond
                                                /* $expr: {
                                                     $and: [
                                                         { $eq: ["$deleted", false] },
                                                         { $eq: ["$candidate_id", "$$id"] },
                                                         { $eq: ["$candidate_select_by_bdm", 1] },
                                                         // { $eq: ['$submission_status', 'submit'] },
                                                         {
                                                             $eq: [
                                                                 "$company_id",
                                                                 mongoose.Types.ObjectId(reqbody.company_id),
                                                             ],
                                                         },
                                                         { $eq: ["$opening_id", reqbody.opening_id] },
                                                         // { $eq: ['$opening_id',reqbody.opening_id] },
                                                         // {$eq :['$submission_status','placed']}
                                                     ],
                                                     // $or: [{'$submission_status':"placed"}]
                                                 },*/
                                            },
                                        },

                                        {
                                            $lookup: {
                                                from: "jobopenings",
                                                let: { id: "$opening_id" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ["$deleted", false] },
                                                                    { $eq: ["$opening_id", reqbody.opening_id] },
                                                                    { $eq: ["$opening_id", "$$id"] },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                ],
                                                as: "job_opening_details",
                                            },
                                        },

                                        // { $limit: 1 }
                                    ],
                                    as: "opening_details",
                                },
                            },

                            {
                                $unwind: {
                                    path: "$opening_details",
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                            {
                                $project: {
                                    email: 1,
                                    mobile: 1,
                                    candidate_category: 1,
                                    job_category: 1,
                                    total_work_exp_year: 1,
                                    total_work_exp_month: 1,
                                    desired_employment_type: 1,
                                    desired_job_type: 1,
                                    key_skills: 1,
                                    current_location: 1,
                                    desired_location: 1,
                                    current_ctc_in_lacs: 1,
                                    current_ctc_in_thousand: 1,
                                    profile_image: 1,
                                    status: 1,
                                    created_at: 1,
                                    updated_at: 1,
                                    name: { $concat: ["$first_name", " ", "$last_name"] },
                                    employess: 1,
                                    "opening_details.opening_id": 1,
                                    "opening_details.submission_status": 1,
                                    "opening_details.job_opening_details._id": 1,
                                    "opening_details.job_opening_details.required_skills": 1,
                                    "opening_details.job_opening_details.opening_title": 1,
                                    "opening_details.job_opening_details.opening_id": 1,
                                    "opening_details.job_opening_details.required_experience": 1,
                                    "opening_details.job_opening_details.category": 1,
                                    "opening_details.job_opening_details.job_description": 1,
                                    "opening_details.job_opening_details.short_description": 1,
                                    "opening_details.job_opening_details.salary_range_from": 1,
                                    "opening_details.job_opening_details.salary_range_to": 1,
                                    candidate_qualifications_details: {
                                        $filter: {
                                            input: "$candidate_qualifications",
                                            as: "item",
                                            cond: {
                                                $eq: [
                                                    "$$item.passing_year",
                                                    { $max: "$candidate_qualifications.passing_year" },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            { $skip: Number(offset) }, { $limit: Number(limit) },
                        ],
                        as: "candidate_details",
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
            data.candidate_submit_list = []
        }

        if (candidate_submission_list_job_opening_wise.length > 0) {
            data.candidate_submit_list = candidate_submission_list_job_opening_wise[0].candidate_details
        }
        /* return {
           candidate_submit_list:
             candidate_submission_list_job_opening_wise[0].candidate_details,
         };*/

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.submit_candidate_bdm_recruiter_freelance_id_wise = async (reqbody) => {
    try {
        let offset =
            parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
        let limit = parseInt(reqbody.per_page) || 5;
        let status = reqbody.status;
        let bdm_id = reqbody.bdm_id;
        let recruiter_id = reqbody.recruiter_id;
        let freelance_id = reqbody.freelance_id;
        let company_id = reqbody.company_id;
        let opening_id = reqbody.opening_id;

        let firstCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
                //  { $eq: ["$candidate_id", "$$id"] }
            ],
        }

        let secondCandidateSubmissionCond = {
            $and: [
                { $eq: ["$deleted", false] },
            ],
        }

        if (opening_id != '' && opening_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$opening_id', opening_id] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$opening_id', opening_id] })
        }

        if (bdm_id != '' && bdm_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
        }

        if (recruiter_id != '' && recruiter_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$recruiter_id', mongoose.Types.ObjectId(recruiter_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$recruiter_id', mongoose.Types.ObjectId(recruiter_id)] })
        }

        if (freelance_id != '' && freelance_id != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelance_id)] })
        }

        if (status != '' && status != undefined) {
            firstCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })
            secondCandidateSubmissionCond["$and"].push({ $eq: ['$submission_status', status] })

        } else {
            //firstCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
            // secondCandidateSubmissionCond["$and"].push({ $eq: ['$candidate_select_by_bdm', 1] })
        }

        let candidate_submission_list_total_pages = await CandidateSubmissionModel.aggregate([
            {
                $match: {
                    $expr: firstCandidateSubmissionCond
                },
            },

            {
                $lookup: {
                    from: "candidates",
                    let: { id: "$candidate_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$_id", "$$id"] },
                                    ],
                                }
                            },
                        },
                    ],
                    as: "candidates",
                },
            },
            {
                $match: { "candidates.0": { $exists: true } },
            },

        ]);

        //return total data
        let candidate_submission_list_job_opening_wise =
            await CandidateSubmissionModel.aggregate([
                {
                    $match: {
                        $expr: firstCandidateSubmissionCond
                    },
                },
                { $sort: { updated_at: -1 } },
                {
                    $lookup: {
                        from: "candidates",
                        let: { id: "$candidate_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $eq: ["$_id", "$$id"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $addFields: {
                                    key_skills: { $ifNull: ["$key_skills", []] }
                                }
                            }
                        ],
                        as: "candidates",
                    },
                },

                // {
                //     $match: { "candidates.0": { $exists: true } },
                // },
                {
                    $lookup: {
                        from: "candidate_qualifications",
                        let: { id: "$candidate_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $eq: ["$candidate_id", "$$id"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "candidate_qualifications",
                    },
                },
                {
                    $lookup: {
                        from: "employees",
                        let: { id: "$candidate_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $eq: ["$candidate_id", "$$id"] },
                                            { $eq: ["$is_current_company", true] },
                                        ],
                                    },
                                },
                            },
                            { $limit: 1 },
                        ],
                        as: "employess",
                    },
                },
                {
                    $lookup: {
                        from: "interviewschedules",
                        let: { id: "$candidate_id" },
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
                    $lookup: {
                        from: "jobopenings",
                        let: { id: "$opening_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$deleted", false] },
                                            { $eq: ["$opening_id", "$$id"] },

                                        ],
                                    },
                                },
                            },

                        ],
                        as: "job_opening_details",
                    },
                },
                { $sort: { updated_at: -1 } },
                { $skip: Number(offset) }, { $limit: Number(limit) },

            ]);

        let totalRec = candidate_submission_list_total_pages.length;

        let data = {};
        if (candidate_submission_list_total_pages.length > 0) {
            let total_pages = Math.ceil(parseInt(totalRec) / parseInt(limit));
            data.totalRecords = totalRec
            data.totalPages = total_pages
        } else {
            data.totalRecords = 0
            data.totalPages = 0
            data.candidate_submit_list = []
        }

        if (candidate_submission_list_job_opening_wise.length > 0) {
            data.candidate_submit_list = candidate_submission_list_job_opening_wise
        }
        /* return {
           candidate_submit_list:
             candidate_submission_list_job_opening_wise[0].candidate_details,
         };*/

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};


exports.assignmentList = async (reqbody) => {

    const opening_id = reqbody.opening_id;
    const recruiter_id = reqbody.recruiter_id;
    const freelancer_id = reqbody.freelancer_id;
    let filter = { deleted: false };

    if (reqbody.created_by != '' && reqbody.created_by != undefined) {
        filter.created_by = mongoose.Types.ObjectId(reqbody.created_by)
    }

    if (opening_id != '' && opening_id != undefined) {
        filter.opening_id = opening_id;
    }

    if (recruiter_id != '' && recruiter_id != undefined) {
        filter.assigned_recruiter = { $in: [mongoose.Types.ObjectId(recruiter_id)] };
    }

    if (freelancer_id != '' && freelancer_id != undefined) {
        filter.assigned_freelancer = { $in: [mongoose.Types.ObjectId(freelancer_id)] };
    }

    // if (reqbody.notforbdm != '' && reqbody.notforbdm == 1) {
    //     filter['$or'] = [
    //         { assigned_recruiter: { $exists: true, $not: { $size: 0 } } },
    //         { assigned_freelancer: { $exists: true, $not: { $size: 0 } } },
    //     ];
    // }
    return await BdmAssignment.find(filter);
}


exports.assignedBDMList = async (reqbody) => {

    let offset = parseInt(reqbody.per_page || 10) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 10;

    let order_column = reqbody.order || 'updated_at'
    let sort_order = reqbody.order_direction;
    let categories = reqbody.categories;
    let company_id = reqbody.company_id;
    let status = reqbody.status;

    let sortJson = {};

    if (sort_order == 'asc') {
        sortJson[order_column] = 1
    } else {
        sortJson[order_column] = -1;
    }

    let searchStr = { deleted: false };

    const bdm_id = reqbody.bdm_id;
    const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_bdm: { $in: [mongoose.Types.ObjectId(bdm_id)] } }] }, { _id: 0, opening_id: 1 });

    if (status != '' && status !== undefined) {
        //var regex_status = new RegExp(status, "i")
        searchStr.status = status
    }

    const openingIdsArr = openingIds.map(item => item.opening_id)
    searchStr.opening_id = { $in: openingIdsArr };

    if (reqbody.dateRange !== undefined && reqbody.dateRange.length != 0) {
        let fromDate = reqbody.dateRange[0];
        let toDate = reqbody.dateRange[1];

        let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
        searchStr.created_at = searchDate
    }

    if (categories !== undefined && categories.length) {
        searchStr.category = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
    }

    if (company_id !== '' && company_id !== undefined) {
        searchStr.account_name = mongoose.Types.ObjectId(company_id);
    }

    const jobOpeningsAssignToBdm = await JobOpeningModel.aggregate(
        [
            {
                $match: searchStr,
            },
            {
                $lookup: {
                    from: "companies",
                    let: { account_name: "$account_name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$account_name"] },
                                        { $eq: ["$deleted", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "account_name",
                },
            },

            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$opening_id'] },
                                        { $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] }
                                    ]
                                }
                            }
                        },
                        // {
                        //     $count: "total_candidate_submit"
                        // }
                    ],
                    as: 'candidate_submission_details'
                },
            },
            { $sort: { created_at: -1 } },
            {
                $facet: {
                    // totalCount: [
                    //     {
                    //         $count: 'filteredRecords'
                    //     }
                    // ],
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                    datainfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            },
            {
                $project: {
                    paginatedResults: '$paginatedResults',
                    "account_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1,
                    candidate_submission_details: 1,
                    //  {
                    //     $filter: {
                    //         input: "$candidate_submission_details",
                    //         as: "item",
                    //         cond: {
                    //             $eq: ["$$item.bdm_id", mongoose.Types.ObjectId(bdm_id)]
                    //         }
                    //     }
                    // },
                    totalCount: { $first: "$datainfo.count" }
                }
            }
        ]
    )
    // const x = paginatedResults[0]
    return { job_opening_listing: jobOpeningsAssignToBdm[0].paginatedResults, totalPages: 1, totalRecords: jobOpeningsAssignToBdm[0].totalCount }
    // return [lastest5JobOpeningsAssignToBdm, openingIds.length]
}

exports.assignedRecruitersList = async (reqbody) => {

    const recruiter_id = reqbody.recruiter_id;
    const freelance_id = reqbody.freelance_id;
    const status = reqbody.status;

    let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
    let limit = parseInt(reqbody.per_page) || 5
    let order_column = reqbody.order || 'updated_at'
    let sort_order = reqbody.order_direction;
    let categories = reqbody.categories;
    const company_id = reqbody.company_id;
    const bdm_id = reqbody.bdm_id;
    const filter_value = reqbody.search;
    let sortJson = {};

    if (sort_order == 'asc') {
        sortJson[order_column] = 1
    } else {
        sortJson[order_column] = -1;
    }

    let searchStr = { deleted: false };

    let obj = {};
    if (recruiter_id != '' && recruiter_id !== undefined) {
        obj.assigned_recruiter = { $in: [mongoose.Types.ObjectId(recruiter_id)] }
    }

    if (freelance_id != '' && freelance_id !== undefined) {
        obj.assigned_freelancer = { $in: [mongoose.Types.ObjectId(freelance_id)] }
    }

    if (status != '' && status !== undefined) {
        //var regex_status = new RegExp(status, "i")
        searchStr.status = status
    }

    if (company_id !== '' && company_id !== undefined) {
        searchStr.account_name = mongoose.Types.ObjectId(company_id);
    }

    const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, obj] }, { _id: 0, opening_id: 1 });

    const openingIdsArr = openingIds.map(item => item.opening_id);
    searchStr.opening_id = { $in: openingIdsArr };

    if (reqbody.dateRange !== undefined && reqbody.dateRange.length != 0) {
        let fromDate = reqbody.dateRange[0];
        let toDate = reqbody.dateRange[1];

        let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
        searchStr.created_at = searchDate
    }

    if (categories !== undefined && categories.length) {
        searchStr.category = { $in: categories.map((category) => { return new RegExp(category, "i"); }) };
    }

    if (filter_value != "") {
        var regex_filter_value = new RegExp(filter_value, "i");
        searchStr["$or"] = [
            { opening_title: regex_filter_value },
            { opening_id: regex_filter_value },
        ];
    }

    const jobOpeningsAssignToBdm = await JobOpeningModel.aggregate(
        [
            {
                $match: searchStr,
            },
            {
                $lookup: {
                    from: "companies",
                    let: { account_name: "$account_name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$account_name"] },
                                        { $eq: ["$deleted", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "account_name",
                },
            },

            {
                $lookup:
                {
                    from: 'candidate_submissions',
                    // localField: 'contact_name',
                    // foreignField: '_id',
                    let: { opening_id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$opening_id'] }
                                    ]
                                }
                            }
                        },
                        // {
                        //     $count: "total_candidate_submit"
                        // }
                    ],
                    as: 'candidate_submission_details'
                },
            },
            {
                $lookup:
                {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'code',
                    as: 'category'
                },
            },
            { $sort: sortJson },
            {
                $facet: {
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                    datainfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            },
            {
                $project: {
                    "account_name": 1, "contact_name._id": 1, "contact_name.display_name": 1, _id: 1, opening_title: 1, opening_id: 1, status: 1, created_at: 1, updated_at: 1, candidate_submission_details: 1,
                    // candidate_submission_details: {
                    //     $filter: {
                    //         input: "$candidate_submission_details",
                    //         as: "item",
                    //         cond: {
                    //             $eq: ["$$item.bdm_id", mongoose.Types.ObjectId(bdm_id)]
                    //         }
                    //     }
                    // },
                    paginatedResults: '$data',
                    totalCount: { $first: "$datainfo.count" }
                }
            }
        ]
    )
    return { job_opening_listing: jobOpeningsAssignToBdm[0].paginatedResults, totalPages: 1, totalRecords: jobOpeningsAssignToBdm[0].totalCount }
}

