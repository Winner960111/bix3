const { commonFunctions } = require("../../helper");
const UserModel = require("./users.model");
const RoleModel = require("../roles/roles.model");
const CandidateModel = require("../candidate/candidate.model");
const CandidateSubmissionModel = require("../jobopening/submission.model");
const CompanyModel = require("../company/company.model");
const RecruiterModel = require("../recruiter/recruiter.model");
const JobOpeningModel = require("../jobopening/jobopening.model");
const JobApplyingModel = require("../jobapplying/jobapplying.model");
const jobworkModel = require("../freelancerecruiter/jobwork.model");
const EmailTemplateModel = require("../emailtemplate/emailtemplate.model");
const SmtpModel = require("../smtp/smtp.model");
const InterviewscheduleModel = require("../company/interviewschedule.model");

const isEmpty = require("../../validations/is-empty");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const mongoose = require("mongoose");
const moment = require("moment");
const BdmAssignment = require("../jobopening/bdmassignment.model");
const axios = require('axios');
const qs = require('qs');
const MonsterCandidate = require("../candidate/monster.candidate.model");
const MonsterCandidateHist = require("../candidate/monster.candidate.hist.model");

// const puppeteer = require('puppeteer');

/*
*  Check Email Exist
*/
exports.is_exist_email = async (email) => {
    try {
        let user = await UserModel.findOne({ email: email }).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Email Exist
*/
exports.is_exist_login_email = async (login_email) => {
    try {

        let user_login_email = await UserModel.findOne({ login_email: login_email }).lean();
        if (!user_login_email) {
            return false;
        }
        return user_login_email;
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Check Email Exist
*/
exports.is_exist_role = async (email, profile) => {
    try {
        // let user = await UserModel.findOne({$or:[{login_email:email},{email: email}]}).lean();
        // let user = await UserModel.findOne({ $and: [{ profile: profile }, { status: "Active" }, { $or: [{ login_email: email }, { email: email }] }] }).lean();
        let user = await UserModel.findOne({ $and: [{ status: "Active" }, { $or: [{ login_email: email }, { email: email }] }] }).lean();

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

        if (!isEmpty(reqbody.password)) {
            hashpassword = await commonFunctions.hashPassword(reqbody.password);
        } else {
            hashpassword = await commonFunctions.hashPassword('bluebix#123');
        }

        if (!isEmpty(reqbody.profile_picture)) {
            var matches = reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            var imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            var extension = mime.getExtension(type);

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG/;
            var check_image = !filetypes.test(extension);




        }
        var profile_picture_filename;
        if (!isEmpty(reqbody.profile_picture)) {
            var filepath = "/upload/user/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;
            fse.mkdirsSync(storepath);
            var user_filename = Date.now() + "-user" + "." + extension;


            fs.writeFileSync(storepath + user_filename, imageBuffer, "utf8");
            profile_picture_filename = user_filename;

        }

        let user = {};
        user.first_name = reqbody.first_name,
            user.last_name = reqbody.last_name,
            user.display_name = reqbody.display_name,
            user.default = reqbody.default,
            user.login_email = reqbody.login_email,
            user.email = reqbody.email,
            user.alternate_email = reqbody.alternate_email || null,
            user.password = hashpassword,
            user.phone_home = reqbody.phone_home || null,
            user.phone_work = reqbody.phone_work || null,
            user.mobile = reqbody.mobile || null,
            user.reporting_manager = reqbody.reporting_manager || null
        user.profile = reqbody.profile,
            user.profile_picture = profile_picture_filename || null,
            user.assigned_role = reqbody.assigned_role,
            user.status = reqbody.status
        user.created_at = Date.now()
        user.updated_at = Date.now()



        return await UserModel.create(user);
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
* Reporting Manager User List
*/
exports.list_reporting_manager = async () => {
    try {
        let user_list_reporting_manager = await UserModel.find({ deleted: false }, { display_name: 1 }).lean();
        if (!user_list_reporting_manager) {
            return false;
        }
        return user_list_reporting_manager;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  User Role List
*/
exports.user_role_list = async () => {
    try {
        let list_user_role = await RoleModel.find({ role_name: { $ne: "candidate" } }, { _id: 1, role_name: 1 }).lean();
        if (!list_user_role) {
            return false;
        }
        return list_user_role;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  ALL User Profile List for dropdown only display _id and display_name
*/
exports.all_user_profile_list = async () => {
    try {
        let all_user_profile_list_details = await UserModel.find({}, { display_name: 1 }).lean();
        if (!all_user_profile_list_details) {
            return false;
        }
        return all_user_profile_list_details;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  All User List
*/
exports.user_list = async (reqbody, user) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'created_at'
        let sort_order = reqbody.order_direction || 'desc';
        let filter_value = reqbody.search;

        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let filter_condition = { deleted: false, _id: { $ne: user }, 'profile': { $nin: ['candidate'] } };

        if (reqbody.role && reqbody.role.length > 0) {
            filter_condition.assigned_role = { "$in": reqbody.role.map(function (role_id) { return mongoose.Types.ObjectId(role_id); }) };
        }

        if (reqbody.reporting_manager != '') {
            filter_condition.reporting_manager = mongoose.Types.ObjectId(reqbody.reporting_manager);
        }

        if (reqbody.status != '') {
            // var regex_status = new RegExp(reqbody.status, "i")
            filter_condition.status = reqbody.status
        }

        if (filter_value) {
            //var searchString = new RegExp("^" + reqbody.filter_value + "$", "i");
            var searchString = new RegExp(filter_value);

            filter_condition['$or'] = [
                { "display_name": { $regex: searchString } },
                { "login_email": { $regex: searchString } },
                { "email": { $regex: searchString } },
                { "first_name": { $regex: searchString } },
                { "last_name": { $regex: searchString } }
            ];
        }

        let totalRecords = await UserModel.aggregate([
            { $match: filter_condition }
        ]);


        let userlist_details = await UserModel.aggregate([
            { $match: filter_condition },
            {
                $lookup:
                {
                    from: 'users',
                    localField: 'reporting_manager',
                    foreignField: '_id',
                    // let: { reporting_manager: '$reporting_manager' },
                    // pipeline: [
                    //   {
                    //     $match: {
                    //       $expr: {
                    //         $and: [
                    //           { $eq: ['$_id', '$$reporting_manager'] },
                    //           { $eq: ['$deleted', false] }
                    //         ]
                    //       }
                    //     }
                    //   }
                    // ],
                    as: 'reporting_manager'

                }
            },
            {
                $lookup:
                {
                    from: 'roles',
                    localField: 'assigned_role',
                    foreignField: '_id',
                    as: 'assigned_role'
                }
            },
            {
                $project: { reporting_manager: '$reporting_manager.display_name', assigned_role: { $arrayElemAt: ["$assigned_role.role_name", 0] }, display_name: 1, login_email: 1, email: 1, profile: 1, status: 1, updated_at: 1, created_at: 1 }
            },
            { $sort: sortJson },
            {
                $facet: {
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }]
                }
            }
        ])

        if (!userlist_details) {
            return false;
        }

        let total_pages = Math.ceil(parseInt(totalRecords.length) / parseInt(limit));

        var data = {
            totalRecords: totalRecords.length,
            totalPages: total_pages,
            // totalfilteredRecords: userlist_details[0].totalCount,
            userlist_details: userlist_details[0].paginatedResults
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  ALL User List with different role wise 
*/
exports.dashbaord_list = async (reqbody, user) => {
    try {
        let lastweek = moment().subtract(7, 'd').format('YYYY-MM-DD');
        let lastfiveDays = moment().subtract(5, 'd').format('YYYY-MM-DD');
        let last30Days = moment().subtract(30, 'd').format('YYYY-MM-DD');

        if (reqbody.role == 'admin' || reqbody.role == '') {
            let admin_array = [];

            let searchStrWeek = { $and: [{ created_at: { $gte: lastweek } }, { account_name: mongoose.Types.ObjectId('609b9c303e3cd01a601918f1') }] }
            let searchStr30Days = { $and: [{ created_at: { $gte: last30Days } }, { account_name: mongoose.Types.ObjectId('609b9c303e3cd01a601918f1') }] }

            let totalCompanyRegistered = await CompanyModel.countDocuments({ deleted: false });
            let totalJobOpenings = await JobOpeningModel.countDocuments({ deleted: false })
            let totalUserRecords = await UserModel.countDocuments({ deleted: false, _id: { $ne: mongoose.Types.ObjectId(user._id) } });
            let totalActiveUserRecords = await UserModel.countDocuments({ $and: [{ deleted: false }, { status: "Active" }, { _id: { $ne: mongoose.Types.ObjectId(user._id) } }] });
            // let totalCandidateRecords = await CandidateModel.countDocuments({ deleted: false });

            let admin_obj = {};
            let admin_obj1 = {};
            let admin_obj2 = {};
            let admin_obj3 = {};

            admin_obj["title"] = "Total Company Registered";
            admin_obj["count"] = totalCompanyRegistered;
            admin_array.push(admin_obj);

            admin_obj1["title"] = "Total Jobs Posted";
            admin_obj1["count"] = totalJobOpenings;
            admin_array.push(admin_obj1);

            admin_obj2["title"] = "Total Users";
            admin_obj2["count"] = totalUserRecords;
            admin_array.push(admin_obj2);

            admin_obj3["title"] = "Total Active Users";
            admin_obj3["count"] = totalActiveUserRecords;
            admin_array.push(admin_obj3);



            // admin_array.push(totalCompanyRegistered, "Total Company Registered");
            // admin_array.push(totalJobOpenings, "Total Jobs Posted");
            // admin_array.push(totalUserRecords, "Total Users");
            // admin_array.push(totalActiveUserRecords, "Active Users");

            // let lastest5DaysJobOpeningsAdmin = await JobOpeningModel.find({ $and: [{ deleted: false }, { created_at: { $gte: lastfiveDays } }] }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1,short_description:1,required_skills:1 }).sort({ created_at: -1 }).limit(3)

            let admin_job_data = [];
            // var isExit_opening_title = admin_job_data.includes(data.opening_title)
            // let data_exist = admin_job_data.some((title) => {
            //                 return title.opening_title === data.opening_title;
            //             });

            let latestFiveRecords = await JobOpeningModel.aggregate([
                { $match: { deleted: false } },
                // {$sort: {created_at: -1}},
                // {$limit: 10},
                {
                    $group:
                    {
                        _id: { "opening_title": "$opening_title" },
                        title: { "$first": "$_id" },
                        short_description: { "$first": "$short_description" },
                        skills: { "$first": "$required_skills" },
                        time: { "$first": "$created_at" }
                    }
                },
                //   {
                //             $project: { _id: 1,  opening_title: { $arrayElemAt: ["$opening_title", 0] },skills:1,time: 1, short_description:1}
                //             // $project: { _id: 1, opening_title: 1, created_at: 1, opening_id: 1, job_description: 1 ,required_skills:1}
                // }
                { $sort: { time: -1 } },
                { $limit: 5 },
                { $project: { title: "$_id.opening_title", _id: "$title", short_description: 1, skills: 1, time: 1 } },

            ])

            latestFiveRecords.forEach((data, i) => {
                let obj = {};
                const today = moment();
                var date = moment(data.time).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.time).format('YYYY-MM-DD'), 'days');

                obj["_id"] = data._id;
                obj["time"] = inDaysCount == 0 ? 'Latest Post' : `${inDaysCount} days ago`;
                obj["opening_title"] = data.title;
                obj["description"] = data.short_description;
                obj["skills"] = data.skills;
                admin_job_data.push(obj);
            })


            let latest_five_candidate = await CandidateModel.aggregate([
                { $match: { deleted: false } },
                { $sort: { created_at: -1 } },
                { $limit: 5 },
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
                                            { $eq: ['$deleted', false] },
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
                        from: 'employees',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
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
                    }
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
                }, {
                    $lookup: {
                        from: "candidate_submissions",
                        let: { id: "$_id" },
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

                        ],
                        as: "opening_details",
                    },
                },
                {
                    $project: {
                        email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] }, "employess": 1, interviewschedules: 1, opening_details: 1,
                        candidate_qualifications_details: {
                            $filter: {
                                input: "$candidate_qualifications",
                                as: "item",
                                cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                            }
                        }
                    }
                }

            ]);




            let dataAdmin = {
                dashboard_statistics_count: admin_array,
                dashboard_statistics_data: admin_job_data,
                latest_five_candidate: latest_five_candidate


            }

            return dataAdmin;


        }

        if (reqbody.role == 'company') {
            let company_array = [];
            let searchStrWeek = { $and: [{ created_at: { $gte: lastweek } }, { account_name: mongoose.Types.ObjectId(reqbody.id) }] }
            let searchStr30Days = { $and: [{ created_at: { $gte: last30Days } }, { account_name: mongoose.Types.ObjectId(reqbody.id) }] }

            let totalJobOpeningsCompany = await JobOpeningModel.countDocuments({ $and: [{ deleted: false }, { account_name: mongoose.Types.ObjectId(reqbody.id) }] })
            let totalActiveJobOpeningCompanyRecords = await JobOpeningModel.countDocuments({ $and: [{ deleted: false }, { account_name: mongoose.Types.ObjectId(reqbody.id) }, { status: "Active" }] })

            let lastWeekCompanyJobOpenings = await JobOpeningModel.countDocuments({ $and: [{ deleted: false }, searchStrWeek] })
            let last30DaysCompanyJobOpenings = await JobOpeningModel.countDocuments({ $and: [{ deleted: false }, searchStr30Days] })

            let company_obj = {};
            let company_obj1 = {};
            let company_obj2 = {};
            let company_obj3 = {};

            company_obj["title"] = "Total Jobs Posted";
            company_obj["count"] = totalJobOpeningsCompany;
            company_array.push(company_obj);

            company_obj1["title"] = "Active Jobs";
            company_obj1["count"] = totalActiveJobOpeningCompanyRecords;
            company_array.push(company_obj1);

            company_obj2["title"] = "Job Posted This Week";
            company_obj2["count"] = lastWeekCompanyJobOpenings;
            company_array.push(company_obj2);

            company_obj3["title"] = "Job Posted Last 30 Days";
            company_obj3["count"] = last30DaysCompanyJobOpenings;
            company_array.push(company_obj3);


            let category = user.industry_type;

            // let lastest5DaysJobOpeningsCompany = await JobOpeningModel.find({ $and: [{ deleted: false }, { account_name: mongoose.Types.ObjectId(reqbody.id) }, { created_at: { $gte: lastfiveDays } }] }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1,short_description:1,required_skills:1 }).sort({ created_at: -1 })
            // let lastThreeRecordsOfJobOpening = await JobOpeningModel.find({ category: { "$regex": category, "$options": "i" } }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1,short_description:1,required_skills:1 }).sort({ created_at: -1 }).limit(3);

            //     var isExit_opening_title = company_job_data.includes(data.opening_title)
            //     if(isExit_opening_title == false){
            //         company_job_data.push(inDaysCount == 0 ? 'Latest Post':`${inDaysCount} days ago`);
            //         company_job_data.push(data.opening_title)
            //         company_job_data.push(data.job_description)
            //     }

            // let lastest3DaysJobOpeningsCompany = await JobOpeningModel.aggregate([
            //     {$match :{ $and: [{ deleted: false },{ account_name: mongoose.Types.ObjectId(reqbody.id) }] } },
            //     {$sort: {created_at: -1}},
            //     {$limit: 3},
            //     {
            //         $group: {
            //             _id: "$_id",
            //             short_description: { "$first": "$short_description" },
            //             skills: { "$first": "$required_skills" },
            //             time:{"$first": "$created_at"},
            //             // time: { "$first":(moment().diff(moment("2021-06-10").format('YYYY-MM-DD'), 'days'))},
            //             opening_title: { $addToSet: "$opening_title" }
            //         }
            //     },
            //     // {
            //     //     $unwind: "$opening_title"
            //     // },
            //     {
            //         $project: { _id: 1,  opening_title: { $arrayElemAt: ["$opening_title", 0] },skills:1,time: 1, opening_id: 1, short_description:1 ,required_skills:1}
            //         // $project: { _id: 1, opening_title: 1, created_at: 1, opening_id: 1, job_description: 1 ,required_skills:1}
            //     },

            //     // { $out: "dimen_genre" }
            // ]);

            let company_job_data = [];

            let latestFiveRecordsCompany = await JobOpeningModel.aggregate([
                { $match: { $and: [{ deleted: false }, { account_name: mongoose.Types.ObjectId(reqbody.id) }] } },
                // { $match: { $and: [{ deleted: false }, { account_name: mongoose.Types.ObjectId(reqbody.id) }, { category: { "$regex": category, "$options": "i" } }] } },
                // {$sort: {created_at: -1}},
                // {$limit: 10},
                {
                    $group:
                    {
                        _id: { "opening_title": "$opening_title" },
                        title: { "$first": "$_id" },
                        short_description: { "$first": "$short_description" },
                        skills: { "$first": "$required_skills" },
                        opening_id: { $first: "$opening_id" },
                        time: { "$first": "$created_at" }
                    }
                },
                //   {
                //             $project: { _id: 1,  opening_title: { $arrayElemAt: ["$opening_title", 0] },skills:1,time: 1, short_description:1}
                //             // $project: { _id: 1, opening_title: 1, created_at: 1, opening_id: 1, job_description: 1 ,required_skills:1}
                // }
                { $sort: { time: -1 } },
                { $limit: 5 },
                { $project: { title: "$_id.opening_title", _id: "$title", short_description: 1, skills: 1, time: 1, opening_id: 1, } },

            ])

            for (data of latestFiveRecordsCompany) {
                let obj = {};
                const today = moment();
                var date = moment(data.time).format("YYYY-MM-DD");
                var inDaysCount = today.diff(
                    moment(data.time).format("YYYY-MM-DD"),
                    "days"
                );
                let comId = mongoose.Types.ObjectId(reqbody.id);
                let openingIds = data.opening_id;
                obj["_id"] = data._id;
                obj["time"] =
                    inDaysCount == 0 ? "Latest Post" : `${inDaysCount} days ago`;
                obj["opening_title"] = data.title;
                obj["description"] = data.short_description;
                obj["skills"] = data.skills;
                obj["opening_id"] = data.opening_id;
                let totalCount = await CandidateSubmissionModel.find({ deleted: false, company_id: comId, opening_id: openingIds, is_company_view_submission: 1 });
                obj["total"] = totalCount.length;
                company_job_data.push(obj);
            }


            let latest_five_candidate = await CompanyModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(reqbody.id), deleted: false } },
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
                                            { $eq: ['$company_id', '$$id'] },
                                            { $eq: ['$deleted', false] },
                                            { $eq: ['$candidate_select_by_bdm', 1] }
                                            // { $eq: ['$submission_status', 'submit'] },
                                        ]
                                    }
                                }
                            },

                            { $sort: { updated_at: -1 } }, { $limit: 5 }

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
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$deleted', false] },
                                                        { $eq: ['$candidate_id', '$$id'] },
                                                        { $eq: ['$candidate_select_by_bdm', 1] },
                                                        // { $eq: ['$submission_status', 'submit'] },
                                                        { $eq: ['$company_id', mongoose.Types.ObjectId(reqbody.id)] },
                                                        // { $eq: ['$opening_id',reqbody.opening_id] },
                                                        // {$eq :['$submission_status',filter_value]}
                                                    ]
                                                }
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
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$deleted', false] },
                                                                    { $eq: ['$opening_id', '$$id'] },

                                                                ]
                                                            }
                                                        }
                                                    },
                                                ],
                                                as: 'job_opening_details'
                                            },

                                        },
                                    ],
                                    as: 'opening_details'
                                },

                            },
                            //    { $sort: {"opening_details.submission_status": -1,"opening_details.update_at": 1} },
                            {
                                $unwind: {
                                    path: "$opening_details",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            { $sort: { "opening_details.updated_at": -1 } },
                            {
                                $project: {
                                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                    "employess": 1, "interviewschedules": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details": 1,
                                    candidate_qualifications_details: {
                                        $filter: {
                                            input: "$candidate_qualifications",
                                            as: "item",
                                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                        }
                                    }
                                }
                            },
                            // { $skip: Number(offset) }, { $limit: Number(limit) }
                        ],
                        as: 'candidate_details'
                    },
                },
            ])

            let dataCompany = {
                dashboard_statistics_count: company_array,
                dashboard_statistics_data: company_job_data,
                latest_five_candidate: latest_five_candidate.length > 0 ? latest_five_candidate[0].candidate_details : []
            }
            return dataCompany;
        }

        if (reqbody.role == 'candidate') {
            let candidate_array = [];

            let searchStrWeek = { $and: [{ created_at: { $gte: lastweek } }, { candidate_id: mongoose.Types.ObjectId(user._id) }] }
            let searchStr30Days = { $and: [{ created_at: { $gte: last30Days } }, { user: mongoose.Types.ObjectId('609b9c303e3cd01a601918f1') }] }

            // let totalRelevantJobs  = await JobOpeningModel.countDocuments({$and:[{deleted:false},{status:'ac'}]})

            let array_skills = user.skills.split(',').join("|");

            let totalRelevantJobs = await JobOpeningModel.countDocuments({ deleted: false, opening_title: { "$regex": array_skills, "$options": "i" } }).sort({ created_at: -1 }).limit(10);
            let last10JobOpening = await JobOpeningModel.find({ opening_title: { "$regex": array_skills, "$options": "i" } }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1, short_description: 1, required_skills: 1 }).sort({ created_at: -1 }).limit(3);
            let totalAppliedJobs = await JobApplyingModel.countDocuments({ deleted: false, candidate_id: user._id });
            let lastWeekApplidJobs = await JobApplyingModel.countDocuments({ $and: [{ deleted: false }, searchStrWeek] });
            // let interviewScheduled = await JobOpeningModel.countDocuments({ $and: [{deleted:false},{isExit_opening_title:'active'},{user:mongoose.Types.ObjectId('609b9c303e3cd01a601918f1')}]});

            let candidate_obj = {};
            let candidate_obj1 = {};
            let candidate_obj2 = {};
            let candidate_obj3 = {};

            candidate_obj["title"] = "Total Relevant Jobs";
            candidate_obj["count"] = totalRelevantJobs;
            candidate_array.push(candidate_obj);

            candidate_obj1["title"] = "Applied Jobs";
            candidate_obj1["count"] = totalAppliedJobs;
            candidate_array.push(candidate_obj1);

            candidate_obj2["title"] = "Applied Jobs This Week";
            candidate_obj2["count"] = lastWeekApplidJobs;
            candidate_array.push(candidate_obj2);

            candidate_obj3["title"] = "Interview Scheduled";
            candidate_obj3["count"] = 0;
            candidate_array.push(candidate_obj3);


            // candidate_array.push(totalRelevantJobs, "Total Relevant Jobs");
            // candidate_array.push(totalAppliedJobs, "Applied Jobs");
            // candidate_array.push(lastWeekApplidJobs, "Applied Jobs This Week");
            // candidate_array.push(0, "Interview Scheduled");


            // let lastest5DaysJobOpeningsCandidate = await JobOpeningModel.find({$and:[{deleted:false},{created_at:{$gte: lastfiveDays}}]},{opening_title:1,created_at:1,opening_id:1})

            let candidate_job_data = [];
            // candidate_job_data.push("Latest Available Job");

            last10JobOpening.forEach((data, i) => {
                const today = moment();
                var date = moment(data.created_at).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.created_at).format('YYYY-MM-DD'), 'days');
                // var isExit_opening_title = candidate_job_data.includes(data.opening_title)

                // if (isExit_opening_title == false) {
                //     candidate_job_data.push(inDaysCount == 0 ? 'Latest Post' : `${inDaysCount} days ago`);
                //     candidate_job_data.push(data.opening_title)
                //     candidate_job_data.push(data.job_description)

                // }

                if (candidate_job_data.length == 0) {
                    obj["_id"] = data._id;
                    obj["time"] = inDaysCount == 0 ? 'Latest Post' : `${inDaysCount} days ago`;
                    obj["opening_title"] = data.opening_title;
                    obj["description"] = data.short_description;
                    obj["skills"] = data.required_skills;
                    candidate_job_data.push(obj);
                } else {

                    let data_exist = candidate_job_data.some((title) => {
                        return title.opening_title === data.opening_title;
                    });

                    if (data_exist == false) {
                        obj["_id"] = data._id;
                        obj["time"] = inDaysCount == 0 ? 'Latest Post' : `${inDaysCount} days ago`;
                        obj["opening_title"] = data.opening_title;
                        obj["description"] = data.short_description;
                        obj["skills"] = data.required_skills;
                        candidate_job_data.push(obj);
                    }
                }

            })

            let dataCandidate = {
                dashboard_statistics_count: candidate_array,
                dashboard_statistics_data: candidate_job_data,
                // last10JobOpening:last10JobOpening

            }

            return dataCandidate;
        }

        if (reqbody.role == 'bdm') {
            let bdm_array = [];

            let totalJobAssigned = await BdmAssignment.countDocuments({ $and: [{ deleted: false }, { assigned_bdm: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] })
            let totalJobOpeningId = await CandidateSubmissionModel.distinct("opening_id", { $and: [{ deleted: false }, { bdm_id: mongoose.Types.ObjectId(reqbody.id) }] })
            let profileSubmitted = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { bdm_id: mongoose.Types.ObjectId(reqbody.id) }, { opening_id: { $in: totalJobOpeningId } }] })
            let profileShortlisted = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { bdm_id: mongoose.Types.ObjectId(reqbody.id) }, { submission_status: "submit" }] })
            let interviewScheduled = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { bdm_id: mongoose.Types.ObjectId(reqbody.id) }, { submission_status: "I" }] });

            let bdm_obj = {};
            let bdm_obj1 = {};
            let bdm_obj2 = {};
            let bdm_obj3 = {};

            bdm_obj["title"] = "Total Jobs Assigned";
            bdm_obj["count"] = totalJobAssigned;
            bdm_array.push(bdm_obj);

            bdm_obj1["title"] = "Profile Submitted";
            bdm_obj1["count"] = profileSubmitted;
            bdm_array.push(bdm_obj1);

            bdm_obj2["title"] = "Profile Shortlisted";
            bdm_obj2["count"] = profileShortlisted;
            bdm_array.push(bdm_obj2);

            bdm_obj3["title"] = "Interview Scheduled";
            bdm_obj3["count"] = interviewScheduled;
            bdm_array.push(bdm_obj3);

            const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_bdm: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] }, { _id: 0, opening_id: 1 });

            const openingIdsArr = openingIds.map(item => item.opening_id)

            const lastest5JobOpeningsAssignToBdm = await JobOpeningModel.find({ opening_id: { $in: openingIdsArr } }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1, short_description: 1, required_skills: 1 }).sort({ updated_at: -1 }).limit(5);

            let bdm_job_data = [];

            for (data of lastest5JobOpeningsAssignToBdm) {
                let obj = {};
                const today = moment();
                var date = moment(data.created_at).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.created_at).format('YYYY-MM-DD'), 'days');

                let bdmId = mongoose.Types.ObjectId(reqbody.id);
                let openingIds = data.opening_id;
                obj["_id"] = data._id;
                obj["time"] = inDaysCount == 0 ? 'Latest Assigned Job' : `${inDaysCount} days ago`;
                obj["opening_title"] = data.opening_title;
                obj["description"] = data.short_description;
                obj["skills"] = data.required_skills;
                let totalCount1 = await CandidateSubmissionModel.find({ deleted: false, opening_id: openingIds, recruiter_id: { $exists: true }, submission_status: "submission", is_bdm_view_submission: 1 });
                let totalCount2 = await CandidateSubmissionModel.find({ deleted: false, opening_id: openingIds, freelancer_recruiter_id: { $exists: true }, submission_status: "submission", is_bdm_view_submission: 1 });
                obj["total"] = (totalCount1.length) + (totalCount2.length);

                bdm_job_data.push(obj);
            }

            let latest_five_candidate = await UserModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(reqbody.id), deleted: false } },
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
                                            { $eq: ['$bdm_id', '$$id'] },
                                            { $eq: ['$deleted', false] },
                                            // { $eq: ['$candidate_select_by_bdm', 1] }
                                            // { $eq: ['$submission_status', 'submit'] },
                                        ]
                                    }
                                }
                            },

                            { $sort: { updated_at: -1 } }, { $limit: 5 }

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
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$deleted', false] },
                                                        { $eq: ['$candidate_id', '$$id'] },
                                                        //  { $eq: ['$candidate_select_by_bdm', 1] },
                                                        // { $eq: ['$submission_status', 'submit'] },
                                                        { $eq: ['$bdm_id', mongoose.Types.ObjectId(reqbody.id)] },
                                                        // { $eq: ['$opening_id',reqbody.opening_id] },
                                                        // {$eq :['$submission_status',filter_value]}
                                                    ]
                                                }
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
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$deleted', false] },
                                                                    { $eq: ['$opening_id', '$$id'] },

                                                                ]
                                                            }
                                                        }
                                                    },
                                                ],
                                                as: 'job_opening_details'
                                            },

                                        },



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
                            { $sort: { "opening_details.updated_at": -1, "opening_details.submission_status": -1 } },
                            {
                                $project: {
                                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                    "employess": 1, "interviewschedules": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details": 1,
                                    candidate_qualifications_details: {
                                        $filter: {
                                            input: "$candidate_qualifications",
                                            as: "item",
                                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                        }
                                    }
                                }
                            },
                            // { $skip: Number(offset) }, { $limit: Number(limit) }
                        ],
                        as: 'candidate_details'
                    },


                },


            ])

            let dataBDM = {
                dashboard_statistics_count: bdm_array,
                dashboard_statistics_data: bdm_job_data,
                latest_five_candidate: latest_five_candidate.length > 0 ? latest_five_candidate[0].candidate_details : []
            }
            return dataBDM;

        }

        if (reqbody.role == 'recruiter') {
            let recruiter_array = [];

            let totalJobAssignedRecruiter = (await BdmAssignment.countDocuments({ $and: [{ deleted: false }, { assigned_recruiter: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] }).distinct('opening_id')).length
            let profileSubmittedRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { recruiter_id: mongoose.Types.ObjectId(reqbody.id) }] })
            let profileShortlistedRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { recruiter_id: mongoose.Types.ObjectId(reqbody.id) }, { candidate_select_by_bdm: 1 }] })
            let interviewScheduledRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { recruiter_id: mongoose.Types.ObjectId(reqbody.id) }, { submission_status: "I" }] });

            let recruiter_obj = {};
            let recruiter_obj1 = {};
            let recruiter_obj2 = {};
            let recruiter_obj3 = {};

            recruiter_obj["title"] = "Total Jobs Assigned";
            recruiter_obj["count"] = totalJobAssignedRecruiter;
            recruiter_array.push(recruiter_obj);

            recruiter_obj1["title"] = "Profile Submitted";
            recruiter_obj1["count"] = profileSubmittedRecruiter;
            recruiter_array.push(recruiter_obj1);

            recruiter_obj2["title"] = "Profile Shortlisted";
            recruiter_obj2["count"] = profileShortlistedRecruiter;
            recruiter_array.push(recruiter_obj2);

            recruiter_obj3["title"] = "Interview Scheduled";
            recruiter_obj3["count"] = interviewScheduledRecruiter;
            recruiter_array.push(recruiter_obj3);

            // recruiter_array.push(totalJobAssignedRecruiter, "Total Jobs Assigned");
            // recruiter_array.push(0, "Profile Submitted");
            // recruiter_array.push(0, "Profile Shortlisted");
            // recruiter_array.push(0, "Interview Scheduled");

            const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_recruiter: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] }, { _id: 0, opening_id: 1 });

            const openingIdsArr = openingIds.map(item => item.opening_id)

            let lastest5JobOpeningsAssignToRecruiter = await JobOpeningModel.find({ opening_id: { $in: openingIdsArr } }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1, short_description: 1, required_skills: 1 }).sort({ updated_at: -1 }).limit(5)

            let recruiter_job_data = [];
            // candidate_job_data.push("Latest Available Job");

            lastest5JobOpeningsAssignToRecruiter.forEach((data, i) => {
                let obj = {};
                const today = moment();
                var date = moment(data.created_at).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.created_at).format('YYYY-MM-DD'), 'days');

                obj["_id"] = data._id;
                obj["time"] = inDaysCount == 0 ? 'Latest Assigned Job' : `${inDaysCount} days ago`;
                obj["opening_title"] = data.opening_title;
                obj["description"] = data.short_description;
                obj["skills"] = data.required_skills;

                recruiter_job_data.push(obj);
            })

            let latest_five_candidate = await UserModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(reqbody.id), deleted: false } },
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
                                            { $eq: ['$recruiter_id', '$$id'] },
                                            { $eq: ['$deleted', false] },
                                            // { $eq: ['$candidate_select_by_bdm', 1] }
                                            // { $eq: ['$submission_status', 'submit'] },
                                        ]
                                    }
                                }
                            },

                            { $sort: { updated_at: -1 } }, { $limit: 5 }

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
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$deleted', false] },
                                                        { $eq: ['$candidate_id', '$$id'] },
                                                        //{ $eq: ['$candidate_select_by_bdm', 1] },
                                                        // { $eq: ['$submission_status', 'submit'] },
                                                        { $eq: ['$recruiter_id', mongoose.Types.ObjectId(reqbody.id)] },
                                                        // { $eq: ['$opening_id',reqbody.opening_id] },
                                                        // {$eq :['$submission_status',filter_value]}
                                                    ]
                                                }
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
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$deleted', false] },
                                                                    { $eq: ['$opening_id', '$$id'] },

                                                                ]
                                                            }
                                                        }
                                                    },
                                                ],
                                                as: 'job_opening_details'
                                            },

                                        },



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
                            { $sort: { "opening_details.updated_at": -1, "opening_details.submission_status": -1 } },
                            {
                                $project: {
                                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                    "employess": 1, "interviewschedules": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details": 1,
                                    candidate_qualifications_details: {
                                        $filter: {
                                            input: "$candidate_qualifications",
                                            as: "item",
                                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                        }
                                    }
                                }
                            },
                            // { $skip: Number(offset) }, { $limit: Number(limit) }
                        ],
                        as: 'candidate_details'
                    },
                },
            ])

            let dataRecruiter = {
                dashboard_statistics_count: recruiter_array,
                dashboard_statistics_data: recruiter_job_data,
                latest_five_candidate: latest_five_candidate.length > 0 ? latest_five_candidate[0].candidate_details : [],
            }
            return dataRecruiter;
        }

        if (reqbody.role == 'freelancerecruiter') {

            let recruiter_array = [];

            let recruiter_obj = {};
            let recruiter_obj1 = {};
            let recruiter_obj2 = {};
            let recruiter_obj3 = {};

            let totalJobRequestRecruiter = (await BdmAssignment.countDocuments({ $and: [{ deleted: false }, { assigned_freelancer: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] }).distinct('opening_id')).length
            let totalJobAssignedRecruiter = await JobOpeningModel.countDocuments({ $and: [{ deleted: false }, { assigned_recruiter: mongoose.Types.ObjectId(reqbody.id) }] })
            let profileSubmittedRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { freelancer_recruiter_id: mongoose.Types.ObjectId(reqbody.id) }] })
            let profileShortlistedRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { freelancer_recruiter_id: mongoose.Types.ObjectId(reqbody.id) }, { candidate_select_by_bdm: 1 }] })
            let interviewScheduledRecruiter = await CandidateSubmissionModel.countDocuments({ $and: [{ deleted: false }, { freelancer_recruiter_id: mongoose.Types.ObjectId(reqbody.id) }, { submission_status: "I" }] });

            recruiter_obj["title"] = "Total Assigned Jobs";
            recruiter_obj["count"] = totalJobRequestRecruiter;
            recruiter_array.push(recruiter_obj);

            recruiter_obj1["title"] = "Profile Submitted";
            recruiter_obj1["count"] = profileSubmittedRecruiter;
            recruiter_array.push(recruiter_obj1);

            recruiter_obj2["title"] = "Profile Shortlisted";
            recruiter_obj2["count"] = profileShortlistedRecruiter;
            recruiter_array.push(recruiter_obj2);

            recruiter_obj3["title"] = "Interview Scheduled";
            recruiter_obj3["count"] = interviewScheduledRecruiter;
            recruiter_array.push(recruiter_obj3);

            const openingIds = await BdmAssignment.find({ $and: [{ deleted: false }, { assigned_freelancer: { $in: [mongoose.Types.ObjectId(reqbody.id)] } }] }, { _id: 0, opening_id: 1 });
            const openingIdsArr = openingIds.map(item => item.opening_id)

            const lastest5JobOpeningsAssignToRecruiter = await JobOpeningModel.find({ opening_id: { $in: openingIdsArr } }, { opening_title: 1, created_at: 1, opening_id: 1, job_description: 1, short_description: 1, required_skills: 1 }).sort({ updated_at: -1 }).limit(5)

            let recruiter_job_data = [];
            // candidate_job_data.push("Latest Available Job");

            lastest5JobOpeningsAssignToRecruiter.forEach((data, i) => {
                let obj = {};
                const today = moment();
                var date = moment(data.created_at).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.created_at).format('YYYY-MM-DD'), 'days');

                obj["_id"] = data._id;
                obj["time"] = inDaysCount == 0 ? 'Latest Assigned Job' : `${inDaysCount} days ago`;
                obj["opening_title"] = data.opening_title;
                obj["description"] = data.short_description;
                obj["skills"] = data.required_skills;

                recruiter_job_data.push(obj);
            });

            let latest_five_candidate = await UserModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId(reqbody.id), deleted: false } },
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
                                            { $eq: ['$freelancer_recruiter_id', '$$id'] },
                                            { $eq: ['$deleted', false] },
                                            //   { $eq: ['$candidate_select_by_bdm', 1] }
                                            // { $eq: ['$submission_status', 'submit'] },
                                        ]
                                    }
                                }
                            },
                            { $sort: { updated_at: -1 } }, { $limit: 5 }
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
                                                $expr: {
                                                    $and: [
                                                        { $eq: ['$deleted', false] },
                                                        { $eq: ['$candidate_id', '$$id'] },
                                                        // { $eq: ['$candidate_select_by_bdm', 1] },
                                                        // { $eq: ['$submission_status', 'submit'] },
                                                        { $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(reqbody.id)] },
                                                        // { $eq: ['$opening_id',reqbody.opening_id] },
                                                        // {$eq :['$submission_status',filter_value]}
                                                    ]
                                                }
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
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$deleted', false] },
                                                                    { $eq: ['$opening_id', '$$id'] },

                                                                ]
                                                            }
                                                        }
                                                    },
                                                ],
                                                as: 'job_opening_details'
                                            },

                                        },
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
                            { $sort: { "opening_details.updated_at": -1, "opening_details.submission_status": -1 } },
                            {
                                $project: {
                                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                    "employess": 1, "interviewschedules": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.updated_at": 1, "opening_details.job_opening_details": 1,
                                    candidate_qualifications_details: {
                                        $filter: {
                                            input: "$candidate_qualifications",
                                            as: "item",
                                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                        }
                                    }
                                }
                            },
                            // { $skip: Number(offset) }, { $limit: Number(limit) }
                        ],
                        as: 'candidate_details'
                    },
                },
            ])

            let latest_five_job_approved = await JobOpeningModel.aggregate([
                { $match: { deleted: false, opening_id: { $in: openingIdsArr } } },
                // {
                //     $lookup:
                //         {
                //             from: 'jobworkapplications',
                //             let: { id: '$opening_id' },
                //             pipeline: [
                //                 {
                //                     $match: {
                //                         $expr: {
                //                             $and: [
                //                                 { $eq: ['$opening_id', '$$id'] },
                //                                 { $eq: ['$deleted', false] },
                //                               //  { $eq: ['$job_work_status','Approve']},
                //                                 { $eq: ['$freelance_id',mongoose.Types.ObjectId(reqbody.id)]}
                //                             ]
                //                         }
                //                     }
                //                 },
                //             ],
                //             as: 'jobworkapplications'
                //         }
                // },
                // {
                //     $match: { "jobworkapplications.0": { $exists: true } },
                // },
                { $sort: { created_at: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        _id: 1,
                        opening_title: 1,
                        short_description: 1,
                        required_skills: 1,
                        created_at: 1,

                    }
                }
            ]);

            let latest_job_approve_data = [];
            latest_five_job_approved.forEach((data, i) => {
                let obj = {};
                const today = moment();
                var date = moment(data.created_at).format('YYYY-MM-DD')
                var inDaysCount = today.diff(moment(data.created_at).format('YYYY-MM-DD'), 'days');

                obj["_id"] = data._id;
                obj["time"] = inDaysCount == 0 ? 'Latest Assigned Job' : `${inDaysCount} days ago`;
                obj["opening_title"] = data.opening_title;
                obj["description"] = data.short_description;
                obj["skills"] = data.required_skills;

                latest_job_approve_data.push(obj);

            });

            let dataRecruiter = {
                dashboard_statistics_count: recruiter_array,
                dashboard_statistics_data: recruiter_job_data,
                latest_five_candidate: latest_five_candidate.length > 0 ? latest_five_candidate[0].candidate_details : [],
                latest_five_job_approved: latest_job_approve_data
            }

            return dataRecruiter;
        }


    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  User Profile Details By Id
*/
exports.get = async (id) => {
    try {
        let user_profile_details = await UserModel.findOne({ _id: id }, { created_at: 0, updated_at: 0, password: 0 }).populate('reporting_manager assigned_role', 'display_name role_name').lean();

        if (!user_profile_details) {
            return false;
        }
        return user_profile_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_user = async (id) => {
    try {
        let user_exist = await UserModel.findOne({ _id: id }).lean();
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
exports.update = async (id, reqbody, is_exist_user, user) => {
    try {

        let update_user_profile = {};

        if (!isEmpty(reqbody.profile_picture && reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var matches = reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            var imageBuffer = decodedImg.data;
            let type = decodedImg.type;
            var extension = mime.getExtension(type);

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG/;
            var check_image = !filetypes.test(extension);

            // if (check_image) {
            //     errors.attachments = "Only image and files are allowed";
            // }


        }

        if (!isEmpty(reqbody.profile_picture && reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var filepath = "/upload/user/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;
            fse.mkdirsSync(storepath);
            var user_filename = Date.now() + "-user" + "." + extension;


            fs.writeFileSync(storepath + user_filename, imageBuffer, "utf8");
            update_user_profile.profile_picture = user_filename;


            if (is_exist_user.profile_picture) {

                old_file = storepath + is_exist_user.profile_picture;
                fs.unlink(old_file, (err) => {
                    if (err) {
                        console.error(err)
                    }
                })

            }
        } else {
            update_user_profile.profile_picture = reqbody.profile_picture || null;
        }


        update_user_profile.first_name = reqbody.first_name,
            update_user_profile.last_name = reqbody.last_name,
            update_user_profile.display_name = reqbody.display_name,
            update_user_profile.default = reqbody.default,
            update_user_profile.login_email = reqbody.login_email,
            update_user_profile.email = reqbody.email,
            update_user_profile.alternate_email = reqbody.alternate_email || null,
            update_user_profile.phone_home = reqbody.phone_home || null,
            update_user_profile.phone_work = reqbody.phone_work || null,
            update_user_profile.mobile = reqbody.mobile || null,
            update_user_profile.reporting_manager = reqbody.reporting_manager || null
        update_user_profile.profile = reqbody.profile,
            update_user_profile.assigned_role = reqbody.assigned_role,
            update_user_profile.status = reqbody.status,
            update_user_profile.updated_at = Date.now(),
            update_user_profile.updated_by = user

        return await UserModel.updateOne({ _id: id }, update_user_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};





/*
*  All User count no of user
*/
exports.user_list_count = async (reqbody) => {
    try {

        if (reqbody.user_type == 'admin') {
            let totalRecords = await AdminModel.countDocuments();
            return { totalRecords };

        }
        if (reqbody.user_type == 'company') {
            let totalRecords = await CompanyModel.countDocuments();
            return { totalRecords };
        }
        if (reqbody.user_type == 'bdm') {
            let totalRecords = await BdmModel.countDocuments();
            return { totalRecords };
        }
        if (reqbody.user_type == 'recruiter') {
            let totalRecords = await RecruiterModel.countDocuments();
            return { totalRecords };
        }
        if (reqbody.user_type == 'candidate') {
            let totalRecords = await CandidateModel.countDocuments();
            return { totalRecords };
        }

        // let recordsTotal = await UsersModel.countDocuments();
        // let user_list_count = await UsersModel.find({},{created_at:0,updated_at:0}).lean();

        // if (!user_list_count) {
        //   return false;
        // }
        // var data = {
        //     recordsTotal : recordsTotal,
        //     userList : user_list_count
        // }
        return false;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Delete User Profile
*/
exports.delete = async (id, user) => {
    try {

        let check_user_exist = await UserModel.findOne({ _id: id }).lean();

        if (!check_user_exist) {
            return false;
        }

        var filepath = "/upload/user/";
        var publicpath = process.cwd() + "/public/";
        var storepath = publicpath + filepath;


        if (check_user_exist.profile_picture != null) {
            old_file = storepath + check_user_exist.profile_picture;
            fs.unlink(old_file, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
        const userUpdate = await UserModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        return UserModel.removeOne({ _id: id });

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.delete_profile_image = async (user) => {
    try {

        let check_user_exist = await CandidateModel.findOne({ _id: user._id }).lean();

        if (!check_user_exist) {
            return false;
        }


        if (check_user_exist.profile_image) {
            let filepath = "/upload/candidate/";
            let publicpath = process.cwd() + "/public/";
            let storepath = publicpath + filepath;

            old_file = storepath + check_user_exist.profile_image;
            fs.unlink(old_file, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }

        return await CandidateModel.updateOne({ _id: user._id }, { $set: { 'profile_image': '' } });
    }
    catch (error) {
        console.error("Error : ", error);
    }

}

/*
 * Primary recruiter list where reporting_manager contain account_owner id
*/

exports.user_primary_recruiter_list = async (reqbody) => {
    try {
        let all_user_assign_more_recruiter_details = await UserModel.find({ reporting_manager: reqbody.account_owner_id }, { display_name: 1 }).lean();
        if (!all_user_assign_more_recruiter_details) {
            return false;
        }
        return all_user_assign_more_recruiter_details;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/* 
 * ALL Assign more recruiter list where profile is recruiter
*/
exports.user_assign_more_recruiter_list = async () => {
    try {
        let all_user_assign_more_recruiter_details = await UserModel.find({ profile: 'recruiter' }, { display_name: 1 }).lean();
        if (!all_user_assign_more_recruiter_details) {
            return false;
        }
        return all_user_assign_more_recruiter_details;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
 * ALL User Change Password
*/
exports.change_user_password = async (reqbody, user) => {
    try {


        let hashpassword = await commonFunctions.hashPassword(reqbody.new_password);
        // return await UserModel.updateOne({_id:id},update_user_profile).lean();
        const user_password_changed = await UserModel.updateOne({ _id: reqbody.user_id }, { password: hashpassword, updated_by: user }).lean();
        if (!user_password_changed) {
            return false;
        }
        return user_password_changed;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Email Exist
*/
exports.is_exist_user_email = async (email, project) => {
    try {
        // let user = await UserModel.findOne({$or:[{login_email:email},{email: email}]}).lean();
        let user = await UserModel.findOne({ $or: [{ login_email: email }, { email: email }] }, project).lean();

        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};

exports.forgot_password_email_template_exists = async (project) => {
    try {
        // let user = await UserModel.findOne({$or:[{login_email:email},{email: email}]}).lean();
        let forgot_password_email = await EmailTemplateModel.findOne(
            { email_type: "forgot_password" },
            project
        ).lean();

        if (!forgot_password_email) {
            return false;
        }
        return forgot_password_email;
    } catch (error) {
        console.error("Error in forgot passw eamil : ", error);
    }
};

exports.footer_email_template_exists = async (project) => {
    try {
        // let user = await UserModel.findOne({$or:[{login_email:email},{email: email}]}).lean();
        let footer_email = await EmailTemplateModel.findOne(
            { email_type: "email_footer" },
            project
        ).lean();

        if (!footer_email) {
            return false;
        }
        return footer_email;
    } catch (error) {
        console.error("Error in footer email template : ", error);
    }
};

/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
    try {

        let user_update_token = await UserModel.updateOne({ $or: [{ login_email: email }, { email: email }] }, token_data).lean();
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
        let is_exist_user_token = await UserModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

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
exports.user_password_reset = async (reqbody, userData) => {
    try {
        //password covert into hash
        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        let update_user_password_reset = {
            password: hashpassword,
            updated_at: Date.now(),
            // updated_by : user
        };

        // user_password_reset
        let reset_password = await UserModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

        // update candidate password if user passsword update
        if (userData && userData.candidate_id) {
            await Candidate.updateOne({ _id: userData.candidate_id }, update_user_password_reset).lean();
        }

        if (!reset_password) {
            return false;
        }
        return reset_password;
    } catch (error) {
        console.error("Error : ", error);
    }
};
/*
*  Latest Five Candidate List for Dashboard
*/
exports.latest_candidate_dashbaord_list = async (reqbody) => {
    try {

        let latest_five_candidate = await CompanyModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(reqbody.company_id), deleted: false } },
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
                                        { $eq: ['$company_id', '$$id'] },
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$candidate_select_by_bdm', 1] }
                                        // { $eq: ['$submission_status', 'submit'] },
                                    ]
                                }
                            }
                        },

                        { $sort: { created_at: -1 } }, { $limit: 5 }

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
                                            $expr: {
                                                $and: [
                                                    { $eq: ['$deleted', false] },
                                                    { $eq: ['$candidate_id', '$$id'] },
                                                    { $eq: ['$candidate_select_by_bdm', 1] },
                                                    // { $eq: ['$submission_status', 'submit'] },
                                                    { $eq: ['$company_id', mongoose.Types.ObjectId(reqbody.company_id)] },
                                                    // { $eq: ['$opening_id',reqbody.opening_id] },
                                                    // {$eq :['$submission_status',filter_value]}
                                                ]
                                            }
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
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ['$deleted', false] },
                                                                { $eq: ['$opening_id', '$$id'] },

                                                            ]
                                                        }
                                                    }
                                                },
                                            ],
                                            as: 'job_opening_details'
                                        },

                                    },



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
                        {
                            $project: {
                                email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                                "employess": 1, "opening_details.opening_id": 1, "opening_details.submission_status": 1, "opening_details.job_opening_details": 1,
                                candidate_qualifications_details: {
                                    $filter: {
                                        input: "$candidate_qualifications",
                                        as: "item",
                                        cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                                    }
                                }
                            }
                        },
                        // { $skip: Number(offset) }, { $limit: Number(limit) }
                    ],
                    as: 'candidate_details'
                },


            },


        ])

        let data = {};
        if (latest_five_candidate.length > 0) {

            // data.candidate_submission_listing = candidate_submission_list_for_company
            data.latest_five_candidate = latest_five_candidate[0].candidate_details

        }
        return data
        // let latest_five_candidate = await CandidateModel.find().sort({created_at:-1}).limit(5).lean();
        // if (!latest_five_candidate) {
        //     return false;
        // }
        // return {latest_five_candidates:latest_five_candidate};
    } catch (error) {
        console.error("Error : ", error);
    }
};
/*
 *  get_email_setting_details by user id
 */
exports.get_email_setting_details = async (reqbody) => {
    try {
        let user_id = mongoose.Types.ObjectId(reqbody.user_id);
        let user = await SmtpModel.findOne({ user_id: user_id, deleted: false, email_type: "receive" }).lean();

        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};

exports.email_template_by_type = async (template_type) => {
    try {

        let result = await EmailTemplateModel.findOne(
            { email_type: template_type },
            { content: 1 }
        ).lean();

        if (!result) {
            return false;
        }
        return result;
    } catch (error) {
        console.error("Error in email template role : ", error);
    }
};
exports.message_list_by_user = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let status = reqbody.status;
        let company_id = reqbody.company_id;
        let opening_id = reqbody.opening_id;
        let candidate_id = reqbody.candidate_id;
        let freelancer_recruiter_id = reqbody.freelancer_recruiter_id;
        let bdm_id = reqbody.bdm_id;
        let interview_type = reqbody.interview_type;
        let comment = reqbody.comment;
        let message = reqbody.message;

        /* let interview_str = {
             $and: [
                 { $eq: ['$deleted', false] },
             ]
         }*/

        let interview_str = { deleted: false }

        if (reqbody.dateRange != undefined && reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];

            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }
            interview_str.created_at = searchDate
        }

        if (status != "" && status != undefined) {
            interview_str.status = status
            //  interview_str["$and"].push({ $eq: ['$status', status] })
        }
        if (comment != "" && comment != undefined) {
            interview_str.comment = comment
        }
        if (message != "" && message != undefined) {
            interview_str.message = message
        }
        if (opening_id != "" && opening_id != undefined) {
            interview_str.opening_id = opening_id
            // interview_str["$and"].push({ $eq: ['$opening_id', opening_id] })
        }
        if (company_id != "" && company_id != undefined) {
            interview_str.company_id = mongoose.Types.ObjectId(company_id)
            // interview_str["$and"].push({ $eq: ['$company_id', mongoose.Types.ObjectId(company_id)] })
        }
        if (bdm_id != "" && bdm_id != undefined) {
            interview_str.bdm_id = mongoose.Types.ObjectId(bdm_id)
            //interview_str["$and"].push({ $eq: ['$bdm_id', mongoose.Types.ObjectId(bdm_id)] })
        }
        if (candidate_id != "" && candidate_id != undefined) {
            interview_str.candidate_id = mongoose.Types.ObjectId(candidate_id)
            //interview_str["$and"].push({ $eq: ['$candidate_id', mongoose.Types.ObjectId(candidate_id)] })
        }
        if (freelancer_recruiter_id != "" && freelancer_recruiter_id != undefined) {
            interview_str.freelancer_recruiter_id = mongoose.Types.ObjectId(freelancer_recruiter_id)
            //interview_str["$and"].push({ $eq: ['$freelancer_recruiter_id', mongoose.Types.ObjectId(freelancer_recruiter_id)] })
        }
        if (interview_type != "" && interview_type != undefined) {
            interview_str.interview_type = interview_type
            //interview_str["$and"].push({ $eq: ['$interview_type', interview_type] })
        }

        //Return count of Total Records and Total Pages
        let message_list_total_pages = await InterviewscheduleModel.aggregate([
            { $match: interview_str }
        ]);

        //Return Paginated Data
        let message_list_for_company = await InterviewscheduleModel.aggregate([
            { $match: interview_str },
            {
                $lookup:
                {
                    from: 'jobopenings',
                    let: { id: '$opening_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$opening_id', '$$id'] },

                                    ]
                                }

                            }
                        },

                        { $sort: { updated_at: -1 } }

                    ],
                    as: 'jobopenings'
                }
            },
            {
                $unwind: {
                    path: "$jobopenings",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup:
                {
                    from: 'candidates',
                    let: { id: '$candidate_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$deleted', false] },
                                        { $eq: ['$_id', '$$id'] },

                                    ]
                                }

                            }
                        },

                        { $sort: { updated_at: -1 } }

                    ],
                    as: 'candidates'
                }
            },
            {
                $unwind: {
                    path: "$candidates",
                    "preserveNullAndEmptyArrays": true
                }
            },
            { $sort: { updated_at: -1 } },

            { $skip: Number(offset) }, { $limit: Number(limit) }

        ])


        let data = {};

        if (message_list_total_pages.length > 0) {

            let total_pages = Math.ceil(parseInt(message_list_total_pages.length) / parseInt(limit));

            data.totalRecords = message_list_total_pages.length
            data.totalPages = total_pages
        } else {
            data.totalRecords = 0
            data.totalPages = 0
            data.message_listing = []
        }

        if (message_list_for_company.length > 0) {
            data.message_listing = message_list_for_company

        }
        return data

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.generateMonsterAuthToken = async function (req) {
    try {
        const data = qs.stringify({
            'client_id': process.env.MONSTER_CLIENT_ID,
            'client_secret': process.env.MONSTER_CLIENT_SECRET,
            'scope': 'GatewayAccess',
            'grant_type': 'client_credentials'
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.MONSTER_AUTH_HOST,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios.request(config);
        const respData = response.data;

        const options = { upsert: true, new: true };
        // Insert AccesToken To DB
        await MonsterCandidate.findOneAndUpdate({ 'createdBy': req.user._id, 'isCandidate': "0" }, { 'accessToken': respData.access_token, 'createdBy': req.user._id, 'isCandidate': "0" }, options);

        return true;
    } catch (error) {
        console.error('Error in generateMonsterAuthToken:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
}


exports.monsterCandidateList = async function (req) {
    try {

        if (!req.body.page && !req.body.perPage && !req.body.searchData) return false

        req.body.searchData.searchType = 'semantic';

        // Find AccessToken From DB
        let token = await MonsterCandidate.findOne({ accessToken: { $ne: null }, isCandidate: '0' });

        if (!token) {
            // If token doesn't exist, generate it
            await this.generateMonsterAuthToken(req);

            // Retrieve the newly generated token
            token = await MonsterCandidate.findOne({ accessToken: { $ne: null }, isCandidate: '0' });
        }

        const data = JSON.stringify(req.body.searchData);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://api.jobs.com/v2/candidates/queries?page=${req.body.page}&perPage=${req.body.perPage}`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);

        const respData = await this.checkMonsterCandidateAlreadyViewed(response.data.candidates)
        // Return the response data
        return respData
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                // Authorization error (401)
                await this.generateMonsterAuthToken(req);
                return await this.monsterCandidateList(req); // Recursively retry the request
            } else {
                // Other HTTP errors
                console.log('HTTP error:', error.response.status, error.response.data);
                throw error;
            }
        } else {
            // Network or other errors
            console.error('Network error:', error.message);
            throw error;
        }
    }
}


exports.checkMonsterCandidateAlreadyViewed = async function (candidateList) {
    try {
        const existingTextResumeIDs = await MonsterCandidate.distinct("textResumeID");

        const resultArray = candidateList.map((item) => {
            const textResumeID = item.identity.textResumeID;
            item.isViewed = true;
            if (!existingTextResumeIDs.includes(textResumeID)) {
                item.isViewed = false;
            }

            return item;
        });
        return resultArray
    } catch (error) {
        console.log('error :>>', error);
    }
}

const path = require('path');
const Candidate_IT_Skills = require("../candidate/itskills.model");
const Employee = require("../candidate/employee.model");
const fss = require('fs').promises;


exports.monsterCandidateView = async function (req) {
    try {
        let token = await MonsterCandidate.findOne({ accessToken: { $ne: null }, isCandidate: '0' });

        if (!token) {
            // If token doesn't exist, generate it
            await this.generateMonsterAuthToken(req);

            // Retrieve the newly generated token
            token = await MonsterCandidate.findOne({ accessToken: { $ne: null }, isCandidate: '0' });
        }

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.jobs.com/v2/candidates/${req.params.id}?resumeBoardId=1&verbose=true`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`
            }
        };

        const response = await axios.request(config);

        const data = response.data
        if (data) {
            // await fsp.writeFile(`${process.cwd()}/public/upload/data.json`, JSON.stringify(data, null, 2));
            // console.log('JSON file saved as data.json');

            let pdfFileName = ''
            let fileNameWithoutExtension = ''

            var publicpath = process.cwd() + "/public/";
            var storePath = publicpath + "upload/candidate/";

            if (!fs.existsSync(storePath)) {
                fs.mkdirSync(storePath);
            }
            let fileFlag = false
            try {
                // await generatePDF(data.resume, outputDirectory)                
                if ('resumeDocument' in data) {
                    if ('fileName' in data.resumeDocument && data.resumeDocument.fileName) {
                        fileNameWithoutExtension = data.resumeDocument.fileName.slice(data.resumeDocument.fileName.lastIndexOf('.') + 1);
                        if (fileNameWithoutExtension && data.resumeDocument?.fileContentType && data.resumeDocument?.file)
                            fileFlag = true
                    }
                }
                if (fileFlag) {

                    pdfFileName = `${Date.now()}.${fileNameWithoutExtension}`
                    const outputDirectory = storePath + pdfFileName
                    const binaryData = Buffer.from(data.resumeDocument.file, 'base64');
                    fs.writeFileSync(outputDirectory, binaryData, 'binary');
                }

            } catch (error) {
                console.log(' Error while inserting document:>>', error);
            }
            delete data.resume
            delete data.resumeDocument

            // Store Candidate To Database

            await this.insertCandidateToDatabase(req, data, fileFlag, pdfFileName)
            if (fileFlag) data.attachments = pdfFileName
            return data;
        }
    } catch (error) {
        console.log("Error While view data", error)
    }
}

exports.insertCandidateToDatabase = async function (req, data, fileFlag, pdfFileName) {
    try {
        const createObj = {
            created_at: Date.now(),
            updated_at: Date.now(),
            'isMonsterCandidate': '1',
            'textResumeID': data.identity.textResumeID,
            'createdBy': req.user._id,
            'updated_by': req.user._id,
            'created_by': req.user._id,
            'isCandidate': "1",
            "candidateDetails": data,
            "attachments": (fileFlag) ? pdfFileName : "",
            "first_name": ('name' in data?.identity)
                ? (data.identity.name)
                    ? (data.identity.name.split(' ')[0] !== undefined)
                        ? data.identity.name.split(' ')[0]
                        : ""
                    : ""
                : '',
            // last_name: ('name' in data?.identity) ? (data.identity.name) ? data.identity.name.split(' ')[1] : "" : '',
            "last_name": ('name' in data?.identity)
                ? (data.identity.name)
                    ? (data.identity.name.split(' ')[1] !== undefined)
                        ? data.identity.name.split(' ')[1]
                        : ""
                    : ""
                : '',
            "email": ('emailAddress' in data?.identity) ? data.identity.emailAddress : '',
            "mobile": ('phoneNumbers' in data && data.phoneNumbers?.length) ? data.phoneNumbers[0].phoneNumberValue : '',
            "total_work_exp_year": ('yearsOfExperience' in data) ? (data.yearsOfExperience.toString().includes('.')) ? data.yearsOfExperience.toString().split('.')[0] : data.yearsOfExperience.toString() : '',
            "total_work_exp_month": ('yearsOfExperience' in data) ? (data.yearsOfExperience.toString().includes('.')) ? data.yearsOfExperience.toString().split('.')[1] : '' : '',
            "area_pin_code": ('postalCode' in data?.location) ? data.location?.postalCode : '',
            "home_town": ('postalCode' in data?.location) ? data.location?.city : '',
            "current_location": ('city' in data?.location) ? data.location?.city : '',
            'key_skills': ('skills' in data?.relevance && data.relevance.skills.length) ? data.relevance.skills.map(skill => skill.name) : '',
            "desired_job_type": data?.relevance?.experience?.title?.name,
            'status': "active",
            "profile_strength": 10,
            "profile_summary": ('workAuthorizations' in data?.location) ? ('authorization' in data?.location?.workAuthorizations) ? data?.location?.workAuthorizations?.authorization : '' : '',
            "role": data?.relevance?.experience?.title?.name
        }
        const options = { upsert: true, new: true };

        const monsterObj = {
            'textResumeID': data.identity.textResumeID, 'createdBy': req.user._id, 'isCandidate': "1", candidateDetails: data, attachments: pdfFileName
        }

        await MonsterCandidate.findOneAndUpdate({ textResumeID: data.identity.textResumeID }, monsterObj, options);

        await CandidateModel.findOneAndUpdate({ textResumeID: data.identity.textResumeID }, createObj, options);

        // Candidate hist
        await MonsterCandidateHist.create({ textResumeID: data.identity.textResumeID, viewedBy: req.user._id })

        const candidate = await CandidateModel.findOne({ textResumeID: data.identity.textResumeID }).lean();

        await Candidate_IT_Skills.deleteMany({ candidate_id: new mongoose.Types.ObjectId(candidate._id) });

        if ('skills' in data?.relevance && candidate) {
            if (data?.relevance?.skills.length) {
                let itSkillsArray = [];
                data.relevance.skills.forEach(element => {
                    let skillData = {
                        candidate_id: candidate._id,
                        skill: element.name,
                        experience: element.experience,
                        // is_candidate_recruiter_by:0,
                        created_at: Date.now(),
                        updated_at: Date.now()
                    };
                    itSkillsArray.push(skillData);
                });
                try {

                    await Candidate_IT_Skills.insertMany(itSkillsArray);
                } catch (error) {
                    console.log("eee", error)
                }
            }
        }

        if ('experience' in data?.relevance) {
            if ('title' in data?.relevance?.experience) {
                let expDataObj = {
                    candidate_id: candidate._id,
                    designation: data?.relevance?.experience?.title?.name,
                    organization: data?.relevance?.experience?.company?.name,
                    is_current_company: null,
                    annual_salary_currency_type: null,
                    annual_salary: null,
                    work_since_from_year: null,
                    work_since_from_month: null,
                    work_since_to_present: null,
                    work_since_to_year: null,
                    work_since_to_month: null,
                    location: null,
                    description: null,
                    description_job_profile: null,
                    notice_period: null,
                    created_at: Date.now(),
                    updated_at: Date.now()
                };
                await Employee.findOneAndUpdate({ candidate_id: candidate._id }, expDataObj, options)
            }
        }
    } catch (error) {
        console.log("Error While inserting data into DB", error)
    }
}
// const puppeteer = require('puppeteer');

// async function generatePDF(htmlContent, outputPath) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Set the content of the page with your HTML
//     await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

//     // Generate PDF from the page
//     await page.pdf({ path: outputPath, format: 'A4' });

//     console.log("file Generated")
//     await browser.close();
// }

const xml2js = require('xml2js');
const util = require('util');

const parseStringPromise = util.promisify(xml2js.parseString);


async function xmlToJSON(xml) {
    try {
        const result = await parseStringPromise(xml);
        return result;
    } catch (error) {
        throw error;
    }
}


exports.getMonsterCandidateList = async function (req, res, next) {
    try {
        req.body.ver = process.env.MONSTER_VERSION_NO
        req.body.cat = process.env.MONSTER_CAT_TOKEN

        const queryString = Object.entries(req.body)
            .map(([key, value]) => `${(key)}=${(value)}`)
            .join('&');

        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.MONSTER_CANDIDATE_HOST}query.ashx?${queryString}`,
            headers: {}
        };
        const response = await axios.request(config);

        if (response && response.status == 200 && response?.data) {
            const monsterData = await xmlToJSON(response.data);
            if (monsterData.Monster.Resumes.length && monsterData.Monster.Resumes[0]['$'].Found != '0') {
                let candidateList = await this.checkMonsterCandidateViewed(monsterData)
                return candidateList
            }
            return monsterData
        }

    } catch (error) {
        if (error?.response?.status == 400) {
            throw error
        }
        console.log('errors fetching while candidate list :>>', error);
    }
}


exports.checkMonsterCandidateViewed = async function (candidateList) {
    try {
        const existingTextResumeIDs = await MonsterCandidate.distinct("textResumeID");

        await Promise.all(candidateList.Monster.Resumes[0].Resume.map(async (resume) => {
            resume.isViewed = false;
            if (_.has(resume, '$') && !_.isEmpty(resume["$"])) {
                const SID = resume["$"].SID;
                if (existingTextResumeIDs.includes(SID)) {
                    resume.isViewed = true;
                }
                try {
                    // Get ViewedHist from monster candidate hist
                    const viewedHist = await MonsterCandidateHist.aggregate([
                        {
                            $match: {
                                textResumeID: SID
                            }
                        },

                        {
                            $group: {
                                _id: { textResumeID: '$textResumeID', viewedBy: '$viewedBy' },
                                count: { $sum: 1 }
                            }
                        },

                        {
                            $lookup: {
                                from: 'users',
                                foreignField: '_id',
                                localField: '_id.viewedBy',
                                as: 'userDetails'
                            }
                        },
                        {
                            $unwind: "$userDetails" // Unwind the array created by $lookup
                        },
                        {
                            $project: {
                                count: '$count',
                                name: {
                                    $concat: ["$userDetails.first_name", " ", "$userDetails.last_name"]
                                }
                            }
                        }
                    ]);

                    const candidate = await CandidateModel.findOne({ textResumeID: SID }).lean();

                    resume.attachments = (candidate && (fs.existsSync(`${process.cwd()}/public/upload/candidate/${candidate.attachments}`))) ? candidate.attachments : ''
                    resume.viewedHist = viewedHist;
                    resume.candidateId = (candidate) ? candidate._id : ''

                } catch (error) {
                    console.log('error :>>', error);
                }
            }
        }));
        return candidateList
    } catch (error) {
        console.log('error :>>', error);
    }
}

const _ = require('lodash');
const Candidate = require("../candidate/candidate.model");

exports.getMonsterCandidate = async function (req, res, next) {
    try {
        const data = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">\r\n  <SOAP-ENV:Header>\r\n    <mh:MonsterHeader xmlns:mh="http://schemas.monster.com/MonsterHeader">\r\n      <mh:MessageData>\r\n        <mh:MessageId>0.38895300 1201759202</mh:MessageId>\r\n        <mh:Timestamp>2008-01-31T07:00:02Z</mh:Timestamp>\r\n      </mh:MessageData>\r\n    </mh:MonsterHeader>\r\n    <cat:CompanyAuthHeader xmlns:cat="http://webservices.monster.com/MonsterPortal">\r\n      <cat:CompanyAccessTicket>${process.env.MONSTER_CAT_TOKEN}</cat:CompanyAccessTicket>\r\n    </cat:CompanyAuthHeader>\r\n  </SOAP-ENV:Header>\r\n  <SOAP-ENV:Body>\r\n    <Query xmlns="http://schemas.monster.com/Monster" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance">\r\n      <Target>JobSeekers</Target>\r\n      <ReturnRestriction>\r\n        <ResumeRestriction>\r\n          <StoreRenderedTextResume>false</StoreRenderedTextResume>\r\n        </ResumeRestriction>\r\n      </ReturnRestriction>\r\n      <SelectBy>\r\n        <Criteria>textResumeId</Criteria>\r\n        <Value>${req.params.id}</Value>\r\n      </SelectBy>\r\n    </Query>\r\n  </SOAP-ENV:Body>\r\n</SOAP-ENV:Envelope>`;

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://gateway.monster.com:8443/bgwBroker',
            headers: {
                'Content-Type': 'application/xml'
            },
            data: data
        };

        const monsterData = await axios.request(config);
        if (monsterData && monsterData.status == 200 && monsterData?.data) {
            const response = await xmlToJSON(monsterData.data);

            if (response) {
                if (_.has(response, 'SOAP-ENV:Envelope') && _.has(response['SOAP-ENV:Envelope'], 'SOAP-ENV:Body')) {

                    const body = response["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];

                    if (
                        body &&
                        body[0] &&
                        body[0].QueriesResponse &&
                        body[0].QueriesResponse[0] &&
                        body[0].QueriesResponse[0].JobSeekers &&
                        body[0].QueriesResponse[0].JobSeekers.length
                    ) {
                        const candidate = await this.insertCandidateToDB(req, response);
                        return candidate
                    }
                    console.log('response :>>', response);
                    return ''
                }
            }
        }

    } catch (error) {
        throw error
    }
}

exports.insertCandidateToDB = async function (req, data) {
    try {
        const jobSeeker = data?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.[0]?.QueriesResponse?.[0]?.JobSeekers?.[0]?.JobSeeker;

        if (!jobSeeker) return false

        const firstName = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'StructuredName'], 'GivenName');
        const lastName = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'StructuredName'], 'FamilyName');
        const zipCode = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'Address'], 'PostalCode');
        const city = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'Address'], 'City');
        const phoneNo = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'Phones'], 'Phone');
        const email = fetchValueFromResp(jobSeeker, ['PersonalData', 'Contact', 'E-mail'], '');
        const languages = fetchValueFromResp(jobSeeker, ['Profile', 'Languages', 'Language'], '');
        const experienceYear = fetchValueFromResp(jobSeeker, ['Profile', 'TotalYearsWorkExperience', ''], '');
        const education = fetchValueFromResp(jobSeeker, ['Profile', 'HighestEducationDegree', ''], '');
        // const resumeFile = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'WorkAuthorizations'], 'WorkAuthorization');
        const experience = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'EmploymentHistory'], 'Position');
        const resumeDocument = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'ResumeDocument'], '');
        const resumeHtml = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'TextResume'], '');
        const desiredjobType = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'TargetJobTitles'], 'TargetJobTitle');
        const profileSummary = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'WorkAuthorizations'], 'WorkAuthorization');
        const jobCategory = fetchValueFromResp(jobSeeker, ['Resumes', 'Resume', 'TargetJobTitles'], 'TargetJobTitle');

        // console.log('expe :>>', resumeDocument);

        let attachmentFile = '';
        //upload document
        if (resumeDocument?.length && _.has(resumeDocument[0], 'File') && resumeDocument[0]?.File?.length && resumeDocument[0]?.FileName?.length && resumeDocument[0]?.FileContentType?.length) {
            attachmentFile = await this.uploadDocument(resumeDocument[0]?.File[0], resumeDocument[0]?.FileName)
        }
        // if (resumeHtml?.length && _.has(resumeHtml[0], '_') && resumeHtml[0]['_']) {
        //     attachmentFile = await this.uploadDocument(resumeHtml[0]['_'])
        // }

        delete jobSeeker[0]?.Resumes[0]?.Resume?.TextResume
        delete jobSeeker[0]?.Resumes[0]?.Resume?.ResumeDocument

        const options = { upsert: true, new: true };

        let createObj = {
            created_at: Date.now(),
            updated_at: Date.now(),
            key_skills: [],
            'isMonsterCandidate': '1',
            'textResumeID': req.params.id,
            'createdBy': req.user._id,
            'updated_by': req.user._id,
            'created_by': req.user._id,
            'isCandidate': "1",
            "candidateDetails": data,
            "attachments": (attachmentFile) ? attachmentFile : "",
            "first_name": (firstName?.length) ? firstName[0] : '',
            "last_name": (lastName?.length) ? lastName[0] : '',
            "email": (email?.length) ? email[0] : '',
            "mobile": (phoneNo?.length) ? (_.has(phoneNo[0], '_')) ? phoneNo[0]['_'] : '' : '',
            "total_work_exp_year": (_.has(experienceYear, '_') && experienceYear['_']) ? experienceYear['_'] : '',
            "total_work_exp_month": '',
            "area_pin_code": (zipCode?.length) ? zipCode[0] : '',
            "home_town": (city?.length) ? city[0] : '',
            "current_location": (city?.length) ? city[0] : '',
            "desired_job_type": (desiredjobType?.length && _.has(desiredjobType[0], 'Title') && desiredjobType[0]?.Title.length) ? desiredjobType[0]?.Title[0] : '',
            'status': "active",
            "profile_strength": 10,
            "profile_summary": (profileSummary?.length && _.has(profileSummary[0], 'AuthStatus')) ? (profileSummary[0]?.AuthStatus?.length) ? profileSummary[0]?.AuthStatus[0]['_'] : '' : '',
            "job_category": (jobCategory?.length && _.has(jobCategory[0], 'OccupationalClassification') && desiredjobType[0]?.OccupationalClassification?.length && _.has(desiredjobType[0]?.OccupationalClassification, 'Name')) ? desiredjobType[0]?.OccupationalClassification[0]?.Name[0] : '',

        }

        // Unlink Old resume

        if (attachmentFile) {
            const beforupcandidate = await CandidateModel.findOne({ textResumeID: req.params.id }).lean();
            if (beforupcandidate && beforupcandidate.attachments) {
                try {
                    var publicpath = `${process.cwd()}/public/upload/candidate/${beforupcandidate.attachments}`;
                    console.log('publicpath :>>', publicpath);
                    fs.unlink(publicpath, (err) => {
                        if (err) {
                            console.error(err)
                        }
                    })
                } catch (error) {
                    console.log('Error while unlink file :>>', error);
                }
            }
        }

        const monsterObj = {
            'textResumeID': req.params.id, 'createdBy': req.user._id, 'isCandidate': "1", candidateDetails: data, attachments: attachmentFile
        }

        await MonsterCandidate.findOneAndUpdate({ textResumeID: req.params.id }, monsterObj, options);

        await CandidateModel.findOneAndUpdate({ textResumeID: req.params.id }, createObj, options);

        // Candidate hist
        await MonsterCandidateHist.create({ textResumeID: req.params.id, viewedBy: req.user._id })

        const candidate = await CandidateModel.findOne({ textResumeID: req.params.id }).lean();

        if (experience.length) {
            experience.forEach(async exp => {
                const expDataObj = {
                    candidate_id: candidate._id,
                    organization: (_.has(exp, 'EmployerName') && exp?.EmployerName?.length) ? exp?.EmployerName[0] : null,
                    designation: (_.has(exp, 'PositionTitle') && exp?.PositionTitle?.length) ? exp?.PositionTitle[0] : null,
                    is_current_company: (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], '$')) ? (exp?.DateRange[0].$?.isCurrent) ? true : false : null,
                    annual_salary_currency_type: null,
                    annual_salary: null,
                    work_since_from_year: null,
                    work_since_from_month: null,
                    work_since_to_present: null,
                    work_since_to_year: null,
                    work_since_to_month: null,
                    location: null,
                    description: null,
                    description_job_profile: null,
                    notice_period: null,
                    created_at: Date.now(),
                    updated_at: Date.now()
                };
                if (expDataObj.is_current_company) {
                    expDataObj.work_since_from_year = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'StartDate')) ? (exp?.DateRange[0].StartDate.length) ? exp?.DateRange[0].StartDate[0].Year[0] : null : null
                    expDataObj.work_since_from_month = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'StartDate')) ? (exp?.DateRange[0].StartDate.length) ? exp?.DateRange[0].StartDate[0].Month[0] : null : null
                }
                if (!expDataObj.is_current_company) {
                    expDataObj.work_since_from_year = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'StartDate')) ? (exp?.DateRange[0].StartDate.length) ? exp?.DateRange[0].StartDate[0].Year[0] : null : null
                    expDataObj.work_since_from_month = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'StartDate')) ? (exp?.DateRange[0].StartDate.length) ? exp?.DateRange[0].StartDate[0].Month[0] : null : null

                    expDataObj.work_since_to_year = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'EndDate')) ? (exp?.DateRange[0].EndDate.length) ? exp?.DateRange[0].EndDate[0].Year[0] : null : null
                    expDataObj.work_since_to_month = (_.has(exp, 'DateRange') && exp?.DateRange?.length && _.has(exp?.DateRange[0], 'EndDate')) ? (exp?.DateRange[0].EndDate.length) ? exp?.DateRange[0].EndDate[0].Month[0] : null : null
                }
                await Employee.findOneAndUpdate({ candidate_id: candidate._id }, expDataObj, options)
            });
        }

        data['SOAP-ENV:Envelope'].attachments = (fs.existsSync(`${process.cwd()}/public/upload/candidate/${attachmentFile}`)) ? attachmentFile : ''
        data['SOAP-ENV:Envelope'].candidateId = candidate._id
        return data['SOAP-ENV:Envelope'].candidateId

    } catch (error) {
        console.log('error :>>', error);
    }
}

function fetchValueFromResp(data, findFromArray, fetchKey) {
    // Check if data exists and is an array
    if (Array.isArray(data) && data.length) {
        data = data[0];

        if (_.has(data, findFromArray[0])) {
            const contact = data[findFromArray[0]][0]?.[findFromArray[1]]?.[0];
            if (contact && !contact[findFromArray[2]]) return contact
            if (contact && contact[findFromArray[2]]?.length) {
                if (!fetchKey) return contact[findFromArray[2]]
                return contact[findFromArray[2]][0][fetchKey];
            }

        }
    }
    return null;
}

exports.uploadDocument = async function (binaryFile, resumeFileName) {
    var publicpath = process.cwd() + "/public/";
    var storePath = publicpath + "upload/candidate/";

    try {
        if (!resumeFileName?.length) return false
        if (!fs.existsSync(storePath)) {
            fs.mkdirSync(storePath);
        }

        // await generatePDF(data.resume, outputDirectory)     
        let fileNameWithoutExtension = resumeFileName[0].slice(resumeFileName[0].lastIndexOf('.') + 1);


        let attachmentsName = `${Date.now()}.${fileNameWithoutExtension}`
        const outputDirectory = storePath + attachmentsName
        const binaryData = Buffer.from(binaryFile, 'base64');
        await fs.promises.writeFile(outputDirectory, binaryData, 'binary');
        console.log('file uploaded successfully:>>');
        return attachmentsName

    } catch (error) {
        console.log(' Error while inserting document:>>', error);
    }
}

// const pdf = require('html-pdf-node');

// exports.uploadDocument = async function (HtmlContent) {
//     var publicpath = process.cwd() + "/public/";
//     var storePath = publicpath + "upload/candidate/";

//     try {
//         if (!fs.existsSync(storePath)) {
//             fs.mkdirSync(storePath);
//         }
//         let attachmentsName = `${Date.now()}.pdf`
//         const outputDirectory = storePath + attachmentsName

//         // Convert Html to pdf
//         const options = {
//             format: 'A4',  // Page format
//             path: outputDirectory  // Output file path
//         };

//         await pdf.generatePdf({ content: HtmlContent }, options)
//             .then(pdfBuffer => {
//                 // Save the PDF to a file
//                 fs.writeFileSync(options.path, pdfBuffer);
//                 console.log('PDF saved successfully!');
//                 return attachmentsName
//             })
//             .catch(error => {
//                 console.error('Error generating PDF:', error);
//                 return ''
//             });


//     } catch (error) {
//         console.log(' Error Whiel inserting document:>>', error);
//     }
// }