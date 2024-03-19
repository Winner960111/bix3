const { commonFunctions } = require("../../helper");
const CandidateModel = require("./candidate.model");
const PlanAssignModel = require("../planassign/planassign.model");
const QualificationModel = require("./qualification.model");
const JobApplyModel = require("../jobapplying/jobapplying.model");
const EmployeeModel = require("./employee.model");
const ITSkillModel = require("./itskills.model");
const AttachmentModel = require("./attachment.model");
const UsersModel = require("../users/users.model");
const isEmpty = require("../../validations/is-empty");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const mongoose = require("mongoose");
const CandidateSubmissionModel = require("../jobopening/submission.model");
const JobOpeningModel = require("../jobopening/jobopening.model");
const CityModel = require("../company/city.model");
const CategoryModel = require("../jobopening/category.model");
const JobsavedModel = require("../jobsaved/jobsaved.model");
const crypto = require("crypto");
const JobSaved = require("../jobsaved/jobsaved.model");
const RoleModel = require("../roles/roles.model");
const JobApplyings = require("../jobapplying/jobapplying.model");
const BdmAssignment = require("../jobopening/bdmassignment.model");

/*
*  Check Email Exist
*/
exports.is_exist = async (email, project) => {
    try {

        let user = await CandidateModel.findOne({ email: email }, project).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Email is Ved=rify
*/
exports.is_email_verify = async (email) => {
    try {
        let user = await CandidateModel.findOne({ email: email }).lean();
        // let user = await CandidateModel.findOne({ email: email,isVerified:true}).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};

/*
*  Check Email Exist And Role
*/
exports.is_exist_role = async (email) => {
    try {
        let user = await CandidateModel.findOne({ email: email }).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};

/*
*  Add New Candidate Direct
*/
exports.save_direct_candidate_data = async (reqbody) => {
    try {

        hashpassword = await commonFunctions.hashPassword(reqbody.password);

        if (!isEmpty(reqbody.attachments && reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            console.log("inner called");
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


            // var filepath = "/upload/candidate/";
            // var publicpath = process.cwd() + "/public/";
            // var storepath = publicpath + filepath;

            // fse.mkdirsSync(storepath);
            // var candidate_filename = Date.now() + "-candidate" + "." + extension;


            // fs.writeFileSync(storepath + candidate_filename, imageBuffer, "utf8");


            // let file_obj = {}

            // file_obj.candidate_id = user_candidate_create._id
            // file_obj.file = candidate_filename
            // file_obj.created_at = Date.now()
            // file_obj.updated_at = Date.now()
            // // file_obj.created_by = user
            // // file_obj.updated_by = user

            // const file_create = await AttachmentModel.create(file_obj)
        }

        var file_attachments;
        if (!isEmpty(reqbody.attachments)) {
            var filepath = "/upload/candidate/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;

            fse.mkdirsSync(storepath);
            var candidate_filename = Date.now() + "-candidate" + "." + extension;

            fs.writeFileSync(storepath + candidate_filename, imageBuffer, "utf8");
            file_attachments = candidate_filename;

        }

        let user_candidate = {};
        // if(reqbody.form_type == '1'){

        user_candidate.first_name = reqbody.first_name
        user_candidate.middle_name = reqbody.middle_name || null
        user_candidate.last_name = reqbody.last_name
        user_candidate.email = reqbody.email
        user_candidate.mobile = reqbody.mobile
        user_candidate.password = hashpassword
        user_candidate.status = reqbody.status
        user_candidate.total_work_exp_year = reqbody.total_work_exp_year || null
        user_candidate.total_work_exp_month = reqbody.total_work_exp_month || null
        user_candidate.isVerified = false
        user_candidate.profile_strength = 10

        // user_candidate.attachments = file_attachments || null
        // user_candidate.is_candidate_recruiter_by = 0;
        user_candidate.created_at = Date.now()
        user_candidate.updated_at = Date.now()

        let user_candidate_create = await CandidateModel.create(user_candidate);

        // insert candidate to user table for login
        await this.insertCandidateToUserTable(user_candidate_create);

        return { candidate_details: user_candidate_create }

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.insertCandidateToUserTable = async function (candidate) {
    try {
        let findRole = await RoleModel.findOne({ role_name: "candidate" });
        await UsersModel.create({
            "email": candidate.email,
            "login_email": candidate.email,
            "password": candidate.password,
            "profile": ['candidate'],
            "first_name": candidate.first_name,
            "last_name": candidate.last_name,
            "display_name": `${candidate.first_name} ${candidate.last_name}`,
            "candidate_id": candidate._id,
            "assigned_role": (findRole) ? findRole._id : null,
            "status": "Active",
            "default": "login_email",
            "phone_work": candidate.mobile
        })
    } catch (error) {

    }
}

/*
*  Add New Candidate through recruiter
*/
exports.save = async (reqbody, user) => {
    try {

        let recruiter_candidate_create = {};

        if (!isEmpty(reqbody.password)) hashpassword = await commonFunctions.hashPassword(reqbody.password);



        hashpassword = await commonFunctions.hashPassword(reqbody.password);


        // hashpassword = await commonFunctions.hashPassword(password);

        let candidate_profile_strength = 0;

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

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|GIF|gif|PDF|csv|pdf/;
            var check_image = !filetypes.test(extension);

        }

        var file_attachments;
        if (!isEmpty(reqbody.attachments)) {
            var filepath = "/upload/candidate/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;

            fse.mkdirsSync(storepath);
            var candidate_filename = Date.now() + "-candidate" + "." + extension;

            fs.writeFileSync(storepath + candidate_filename, imageBuffer, "utf8");
            file_attachments = candidate_filename;

            candidate_profile_strength = 20;
        }
        let notes = '';
        if (reqbody.notes != '' && reqbody.notes != undefined) {
            notes = reqbody.notes
        }

        recruiter_candidate_create.first_name = reqbody.first_name;
        recruiter_candidate_create.middle_name = reqbody.middle_name || null;
        recruiter_candidate_create.last_name = reqbody.last_name;
        recruiter_candidate_create.email = reqbody.email;
        recruiter_candidate_create.mobile = reqbody.mobile;
        recruiter_candidate_create.password = hashpassword;
        recruiter_candidate_create.total_work_exp_year = reqbody.total_work_exp_year;
        recruiter_candidate_create.total_work_exp_month = reqbody.total_work_exp_month;
        recruiter_candidate_create.status = reqbody.status;
        recruiter_candidate_create.attachments = file_attachments || null;
        recruiter_candidate_create.profile_strength = (candidate_profile_strength + 10);
        recruiter_candidate_create.created_at = Date.now();
        recruiter_candidate_create.updated_at = Date.now();
        recruiter_candidate_create.is_candidate_recruiter_by = 1;
        recruiter_candidate_create.notes = notes;
        recruiter_candidate_create.created_by = user._id;
        let candidate_create = await CandidateModel.create(recruiter_candidate_create);

        await this.insertCandidateToUserTable(candidate_create);

        // let from_email = 'test.knptech@gmail.com'
        // let to_email  = reqbody.email

        // if(candidate_create){
        //     return {password,from_email,to_email}
        // }
        return candidate_create;

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
exports.candidatelist = async (reqbody) => {
    try {

        // let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
        // let limit = parseInt(reqbody.per_page)
        // let order_column = reqbody.order_column || 'updated_at'
        // let sort_order = reqbody.sort_order;
        // let filter_value = reqbody.filter_value;

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'updated_at'
        let sort_order = reqbody.order_direction;
        let filter_value = reqbody.search;
        let sortJson = {};

        let categories = reqbody.categories;
        let job_title = reqbody.job_post_title;
        let status = reqbody.status;
        // let candidate_name_skill = reqbody.candidate_name_skill;

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr = { deleted: false };
        if (categories != '' && categories != undefined) {
            searchStr.job_category = { $in: categories.map(function (category) { return new RegExp(category, "i"); }) };

        }

        let searchStatus = {};

        if (status != '') {
            var regex_status = new RegExp(status, "i")
            searchStr.status = regex_status
        }

        let searchJobTitle = {};

        if (job_title != '') {
            var regex_job_title = new RegExp(job_title, "i")
            searchStr.job_title = regex_job_title
        }

        let searchName = {};

        if (filter_value != '') {
            // filter_value = filter_value.trim().split(" ")[0]
            let regex_filter_value = new RegExp(filter_value, "i");
            // searchStr["$or"] = [{ first_name: regex_filter_value }, { middle_name: regex_filter_value }, { last_name: regex_filter_value }, { key_skills: regex_filter_value }]

            searchStr["$or"] = [
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $concat: [
                                    "$first_name",
                                    " ",
                                    "$last_name",
                                ],
                            },
                            regex: filter_value,
                            options: "i",
                        },
                    },
                },
                {
                    key_skills: regex_filter_value
                },
                // {
                //     job_category: regex_filter_value
                // },
                {
                    current_location: regex_filter_value
                }
            ];
        }
        let filter_condition = {};

        if (reqbody.dateRange.length != 0) {
            let fromDate = reqbody.dateRange[0];
            let toDate = reqbody.dateRange[1];

            let searchDate = { "$gte": new Date(fromDate), "$lte": new Date(toDate + "T23:59:59.999Z") }

            searchStr.created_at = searchDate
        }

        let candidate_list_details = await CandidateModel.aggregate([
            { $match: searchStr },
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
                    //   localField: '_id',
                    //   foreignField: 'candidate_id',
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
                $project: {
                    isMonsterCandidate: 1, email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] }, "employess": 1,
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
                    datainfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
                    data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                }
            },
            {
                $project: {
                    paginatedResults: "$data",
                    totalRecords: { $first: "$datainfo.count" }
                }
            }
        ]);

        let total_pages = Math.ceil(parseInt(candidate_list_details[0].totalRecords) / parseInt(limit));

        if (!candidate_list_details) {
            return false;
        }

        let data = {
            totalRecords: candidate_list_details[0].totalRecords,
            totalPages: total_pages,
            // filerRecords: candidate_list_details[0].totalCount,
            candidate_list_details: candidate_list_details[0].paginatedResults
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Candidate Profile Details By Id
*/
exports.get = async (id) => {
    try {
        // console.log("user 1::",user.is_candidate_recruiter_by == 1);
        // console.log("user 0::",user.is_candidate_recruiter_by == 0);
        // console.log("user profile::",user.profile);
        // if(user.profile || user.is_candidate_recruiter_by == 0){
        //     console.log("user profile in if block");
        // }
        // if(user.is_candidate_recruiter_by == 1){
        //     console.log("candidate by recruiter!!");
        // }
        // if(user.is_candidate_recruiter_by == 0){
        //     console.log("candidate by it self!!");
        // }
        let candidate = await CandidateModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id), deleted: false } },
            // {
            //     $lookup:
            //     {
            //         from: 'candidate_attachments',
            //         // localField: '_id',
            //         // foreignField: 'candidate_id',
            //         let: { id: '$_id' },
            //         pipeline: [
            //           {
            //             $match: {
            //               $expr: {
            //                 $and: [
            //                   { $eq: ['$candidate_id', '$$id'] },
            //                   { $eq: ['$deleted', false] }
            //                 ]
            //               }
            //             }
            //           }
            //         ],
            //         as: 'file_attachments'
            //     },
            // },
            {
                $lookup:
                {
                    from: 'candidate_qualifications',
                    // localField: '_id',
                    // foreignField: 'candidate_id',
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
                    as: 'candidate_qualifications'
                },
            },
            {
                $lookup:
                {
                    from: 'employees',
                    // localField: '_id',
                    // foreignField: 'candidate_id',
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
                    // localField: 'job_category',
                    // foreignField: 'code',
                    as: 'job_category'
                },
            },
            // {
            //     $lookup:
            //     {
            //         from: 'candidate_it_skills',
            //         // let: {
            //         //     id: "$_id"
            //         //   },
            //         localField: '_id',
            //         // pipeline: [
            //         //     { $match: { deleted: false } }
            //         //  ],
            //         foreignField: 'candidate_id',
            //         as: 'candidate_it_skills'
            //     },
            // },
            {
                $lookup: {
                    from: 'candidate_it_skills',
                    //here $_id is localfield of candidate model and check in $expr with foreignField candidate_id is in candidate_it_skills model 
                    //   localField: '_id',
                    //   foreignField: 'candidate_id',
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

            { $project: { created_at: 0, updated_at: 0, updated_by: 0, "job_category._id": 0, "qualification_details._id": 0, "file_attachments._id": 0, "candidate_qualifications.deleted_by": 0, "candidate_qualifications.deleted": 0, "candidate_qualifications.__v": 0, "employees.deleted_by": 0, "employees.deleted": 0, "employees.__v": 0, "candidate_it_skills.deleted_by": 0, "candidate_it_skills.__v": 0 } }
        ]);

        ;
        // let candidate_profile_details = await CandidateModel.findOne({ _id: id },{created_at:0,updated_at:0}).populate('employees').populate('candidate_it_skills').populate('candidate_qualifications').populate('category','code name -_id').lean();

        // console.log("candidate_profile_details",candidate_profile_details)
        // if (!candidate_profile_details) {
        //   return false;
        // }

        if (candidate.length > 0) {
            let already_candidate_view = await PlanAssignModel.findOne({ company_id: "60a7418e1dc8ba22545904d6", candidate_view_list: { "$nin": id } })
            if (already_candidate_view != null) {

                let company_candidate_count = await PlanAssignModel.updateOne({ company_id: "60a7418e1dc8ba22545904d6" }, { $push: { candidate_view_list: id }, $inc: { company_candidate_view_count: -1 } })
                // let company_candidate_count = await PlanAssignModel.updateOne({company_id:"60ebdd688a241c09141581ff"},{ $inc: { company_candidate_view_count: -1,$push:{candidate_view_list:id}}}) 

            }

        }
        return candidate;

    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_candidate = async (id) => {
    try {
        let user_exist = await CandidateModel.findOne({ _id: id }).lean();
        if (!user_exist) {
            return false;
        }
        return user_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check User Exist in employee
*/
exports.is_exist_candidate_in_employee = async (id) => {
    try {
        let user_exist = await EmployeeModel.findOne({ candidate_id: id }).lean();
        if (!user_exist) {
            return false;
        }
        return user_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check User Exist in qualification
*/
exports.is_exist_candidate_in_qualification = async (id) => {
    try {
        let user_exist = await QualificationModel.findOne({ candidate_id: id }).lean();
        if (!user_exist) {
            return false;
        }
        return user_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Candidate Exist in IT SKills
*/
exports.is_exist_candidate_with_it_skills = async (id) => {
    try {
        let candidate_exist = await ITSkillModel.findOne({ candidate_id: id }).lean();
        if (!candidate_exist) {
            return false;
        }
        return candidate_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Update Candidate Profile 
*/
exports.update = async (id, reqbody, user) => {
    try {

        // hashpassword = await commonFunctions.hashPassword(reqbody.password);

        if (user.is_candidate_recruiter_by == 0 || user.is_candidate_recruiter_by == 1) {


            for (var i = 0; i < reqbody.attachments.length; i++) {


                if (!isEmpty(reqbody.attachments[i] && reqbody.attachments[i].match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
                    var matches = reqbody.attachments[i].match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
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

                    // if (check_image) {
                    //     errors.attachments = "Only image and files are allowed";
                    // }

                    var filepath = "/upload/candidate/";
                    var publicpath = process.cwd() + "/public/";
                    var storepath = publicpath + filepath;

                    fse.mkdirsSync(storepath);
                    var candidate_filename = Date.now() + "-candidate" + "." + extension;



                    fs.writeFileSync(storepath + candidate_filename, imageBuffer, "utf8");

                    let file_obj = {}

                    file_obj.candidate_id = id
                    file_obj.file = candidate_filename
                    file_obj.created_at = Date.now()
                    file_obj.updated_at = Date.now()
                    file_obj.created_by = user._id
                    file_obj.updated_by = user._id

                    const file_create = await AttachmentModel.create(file_obj)
                }


            }

        }


        let update_candidate_profile = {};

        if (user.is_candidate_recruiter_by == 0 && reqbody.is_candidate_recruiter_by == 0) {

            update_candidate_profile.email = reqbody.email;
            update_candidate_profile.status = reqbody.status || 'In-Active';
            update_candidate_profile.first_name = reqbody.first_name;
            update_candidate_profile.middle_name = reqbody.middle_name;
            update_candidate_profile.last_name = reqbody.last_name;
            update_candidate_profile.mobile = reqbody.mobile || null;
            update_candidate_profile.city = reqbody.city || null;
            update_candidate_profile.notice_period = reqbody.notice_period || null;
            update_candidate_profile.candidate_category = reqbody.candidate_category || null;
            update_candidate_profile.sub_category = reqbody.sub_category || null;
            update_candidate_profile.current_employer = reqbody.current_employer || null;
            update_candidate_profile.total_work_exp_year = reqbody.total_work_exp_year || null;
            update_candidate_profile.total_work_exp_month = reqbody.total_work_exp_month || null;
            update_candidate_profile.job_title = reqbody.job_title || null;
            update_candidate_profile.skills = reqbody.skills || null;
            update_candidate_profile.qualification_details = reqbody.qualification_details || null;

            update_candidate_profile.current_job_designation = reqbody.current_job_designation || null;

            update_candidate_profile.annual_salary_currency_type = reqbody.annual_salary_currency_type || null;
            update_candidate_profile.annual_salary = reqbody.annual_salary || null;

            update_candidate_profile.work_since_from_year = reqbody.work_since_from_year || null;
            update_candidate_profile.work_since_from_month = reqbody.work_since_from_month || null;

            update_candidate_profile.work_since_to_present = reqbody.work_since_to_present || null;
            update_candidate_profile.work_since_to_year = reqbody.work_since_to_year || null;
            update_candidate_profile.work_since_to_month = reqbody.work_since_to_month || null;

            update_candidate_profile.updated_at = Date.now();
            update_candidate_profile.updated_by = user._id;

        }

        if (user.profile) {

            update_candidate_profile.sourced_from = reqbody.sourced_from || null
            update_candidate_profile.source_information = reqbody.source_information || null
            update_candidate_profile.sourcing = reqbody.sourcing || null
            update_candidate_profile.sourced_by = reqbody.sourced_by || null
            update_candidate_profile.available_from = reqbody.available_from || null
            update_candidate_profile.notice_period = reqbody.notice_period || null
            update_candidate_profile.fax = reqbody.fax || null
            update_candidate_profile.license_no = reqbody.license_no || null
            update_candidate_profile.passport_no = reqbody.passport_no || null
            update_candidate_profile.visa_status = reqbody.visa_status || null
            update_candidate_profile.date_of_birth = reqbody.date_of_birth || null
            update_candidate_profile.employment_type = reqbody.employment_type || null
            update_candidate_profile.candidate_status = reqbody.candidate_status || null
            update_candidate_profile.clearance = reqbody.clearance || null
            update_candidate_profile.description = reqbody.description || null

        }
        if (user.is_candidate_recruiter_by == 1 && reqbody.is_candidate_recruiter_by == 1) {

            update_candidate_profile.email = reqbody.email
            update_candidate_profile.status = reqbody.status || 'In-Active'
            update_candidate_profile.first_name = reqbody.first_name
            update_candidate_profile.middle_name = reqbody.middle_name
            update_candidate_profile.last_name = reqbody.last_name
            update_candidate_profile.mobile = reqbody.mobile || null
            update_candidate_profile.phone = reqbody.phone
            update_candidate_profile.country = reqbody.country || null
            update_candidate_profile.state = reqbody.state || null
            update_candidate_profile.city = reqbody.city || null
            update_candidate_profile.address = reqbody.address || null
            update_candidate_profile.preferred_location_1 = reqbody.preferred_location_1 || null
            update_candidate_profile.preferred_location_2 = reqbody.preferred_location_2 || null
            update_candidate_profile.postal_code = reqbody.postal_code || null
            update_candidate_profile.skype_id = reqbody.skype_id || null
            update_candidate_profile.linkedIn_id = reqbody.linkedIn_id || null
            update_candidate_profile.gender = reqbody.gender || null
            update_candidate_profile.father_name = reqbody.father_name || null
            update_candidate_profile.mother_name = reqbody.mother_name || null
            update_candidate_profile.nationality = reqbody.nationality || null
            update_candidate_profile.hobbies = reqbody.hobbies || null
            update_candidate_profile.marital_status = reqbody.marital_status || null
            update_candidate_profile.priority = reqbody.priority || null
            update_candidate_profile.candidate_category = reqbody.candidate_category || null
            update_candidate_profile.sub_category = reqbody.sub_category || null
            update_candidate_profile.number_of_jobs_changed = reqbody.number_of_jobs_changed || null
            update_candidate_profile.current_employer = reqbody.current_employer || null
            update_candidate_profile.total_work_exp_year = reqbody.total_work_exp_year || null
            update_candidate_profile.total_work_exp_month = reqbody.total_work_exp_month || null
            update_candidate_profile.gap_period = reqbody.gap_period || null
            update_candidate_profile.relevant_experience = reqbody.relevant_experience || null
            update_candidate_profile.current_pay_rate = reqbody.current_pay_rate || null
            update_candidate_profile.expected_pay_rate = reqbody.expected_pay_rate || null
            update_candidate_profile.marketing_bill_rate = reqbody.marketing_bill_rate || null
            update_candidate_profile.job_title = reqbody.job_title || null
            update_candidate_profile.objectives = reqbody.objectives || null
            update_candidate_profile.achievements = reqbody.achievements || null
            update_candidate_profile.references = reqbody.references || null
            update_candidate_profile.resume_title = reqbody.resume_title || null
            update_candidate_profile.resume_file_name = reqbody.resume_file_name || null
            update_candidate_profile.qualification = reqbody.qualification || null
            update_candidate_profile.languages_known = reqbody.languages_known || null
            update_candidate_profile.skills = reqbody.skills || null
            update_candidate_profile.qualification_details = reqbody.qualification_details || null
            update_candidate_profile.notes = reqbody.notes || null

            update_candidate_profile.current_job_designation = reqbody.current_job_designation || null

            update_candidate_profile.annual_salary_currency_type = reqbody.annual_salary_currency_type || null
            update_candidate_profile.annual_salary = reqbody.annual_salary || null

            update_candidate_profile.work_since_from_year = reqbody.work_since_from_year || null
            update_candidate_profile.work_since_from_month = reqbody.work_since_from_month || null

            update_candidate_profile.work_since_to_present = reqbody.work_since_to_present || null
            update_candidate_profile.work_since_to_year = reqbody.work_since_to_year || null
            update_candidate_profile.work_since_to_month = reqbody.work_since_to_month || null

            update_candidate_profile.updated_at = Date.now()
            update_candidate_profile.updated_by = user._id

        }

        return await CandidateModel.updateOne({ _id: id }, update_candidate_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Update Candidate Profile form 1
*/
exports.update_candidate_profile = async (id, reqbody, is_exist_user, user) => {
    try {
        let update_candidate_profile = {};

        if (reqbody.key_skills == null) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: -5 } });
            update_candidate_profile.key_skills = []

        } else {
            update_candidate_profile.key_skills = reqbody.key_skills
        }

        update_candidate_profile.email = reqbody.email
        update_candidate_profile.first_name = reqbody.first_name
        update_candidate_profile.middle_name = reqbody.middle_name
        update_candidate_profile.last_name = reqbody.last_name
        update_candidate_profile.mobile = reqbody.mobile
        update_candidate_profile.status = reqbody.status
        update_candidate_profile.total_work_exp_year = reqbody.total_work_exp_year
        update_candidate_profile.total_work_exp_month = reqbody.total_work_exp_month
        update_candidate_profile.current_location = reqbody.current_location
        update_candidate_profile.current_ctc = reqbody.current_ctc
        update_candidate_profile.updated_at = Date.now()

        if (is_exist_user.key_skills.length == 0) {
            // console.log("this is called if block")
            if (reqbody.key_skills && reqbody.key_skills.length > 0) {
                // console.log("this is called if block second if is called")
                let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 5 } });
            }
        }

        // Update candidate in user table
        await UsersModel.updateOne({ candidate_id: id }, {
            "email": update_candidate_profile.email,
            "login_email": update_candidate_profile.email,
            "first_name": update_candidate_profile.first_name,
            "last_name": update_candidate_profile.last_name,
            "display_name": `${update_candidate_profile.first_name} ${update_candidate_profile.last_name}`,
            // "assigned_role": (findRole) ? findRole._id : null,
            "status": "Active",
            "default": "login_email",
            "phone_work": update_candidate_profile.mobile,
        })

        return await CandidateModel.updateOne({ _id: id }, update_candidate_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Delete Candidate Profile
*/
exports.delete = async (id, user) => {
    try {

        let check_user_exist = await CandidateModel.findOne({ _id: id }).lean();

        if (!check_user_exist) {
            return false;
        }

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
    try {

        let user_update_token = await CandidateModel.updateOne({ email: email }, token_data).lean();
        // let candidate_details = await CandidateModel.findOne({ email: email },{first_name:1,last_name:1}).lean();

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
        let is_exist_user_token = await CandidateModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

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
            // updated_by: user
        };

        // user_password_reset
        let reset_password = await CandidateModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

        if (!reset_password) {
            return false;
        }
        return reset_password;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 * Candidate Password Change
*/

exports.change_candidate_password = async (reqbody, user) => {
    try {

        let hashpassword = await commonFunctions.hashPassword(reqbody.new_password);

        const candidate_password_changed = await CandidateModel.updateOne({ _id: reqbody.candidate_id }, { password: hashpassword, updated_at: Date.now(), updated_by: user }).lean();
        if (!candidate_password_changed) {
            return false;
        }
        return candidate_password_changed;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Update email_token and isVerified field
*/

exports.update_email_token = async (token_data, email) => {
    try {

        let candidate_email_update_token = await CandidateModel.updateOne({ email: email }, token_data).lean();
        if (!candidate_email_update_token) {
            return false;
        }
        return candidate_email_update_token;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Email Token exist with isVerified is false
*/
exports.candidate_email_token = async (token) => {
    try {
        let is_exist_email_token = await CandidateModel.findOne({ $and: [{ email_token: token }, { isVerified: false }] }).lean();

        if (!is_exist_email_token) {
            return false;
        }
        return is_exist_email_token;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Email Token exist with isVerified is false
*/
exports.candidate_email_verify = async (token) => {
    try {

        let update_candidate_email_verify = {
            email_token: token,
            isVerified: true,
            updated_at: Date.now(),
        };

        let email_verify = await CandidateModel.updateOne({ email_token: token }, update_candidate_email_verify).lean();
        let candidate_details = await CandidateModel.findOne({ email_token: token }).lean();

        if (!email_verify) {
            return false;
        }
        return { candidate_details, email_verify };
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Save data of employee details
*/
exports.save_employee_details = async (reqbody, is_exist_user_employee) => {
    try {

        let employee_multiple_data = [];
        for (var i = 0; i < reqbody.employee_details.length; i++) {

            let data = {
                candidate_id: reqbody.id,
                designation: reqbody.employee_details[i].designation,
                organization: reqbody.employee_details[i].organization,
                is_current_company: reqbody.employee_details[i].is_current_company,
                annual_salary_currency_type: reqbody.employee_details[i].annual_salary_currency_type,
                annual_salary: reqbody.employee_details[i].annual_salary,
                work_since_from_year: reqbody.employee_details[i].work_since_from_year,
                work_since_from_month: reqbody.employee_details[i].work_since_from_month,
                work_since_to_present: reqbody.employee_details[i].work_since_to_present || null,
                work_since_to_year: reqbody.employee_details[i].work_since_to_year || null,
                work_since_to_month: reqbody.employee_details[i].work_since_to_month || null,
                location: reqbody.employee_details[i].location,
                description: reqbody.employee_details[i].description,
                description_job_profile: reqbody.employee_details[i].description_job_profile,
                notice_period: reqbody.employee_details[i].notice_period,
                // is_candidate_recruiter_by:0,
                created_at: Date.now(),
                updated_at: Date.now()
            };
            employee_multiple_data.push(data);
        }

        let emplopyee_details_insert = await EmployeeModel.insertMany(employee_multiple_data);

        if (is_exist_user_employee == false) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.id }, { $inc: { profile_strength: 10 } });
        }



        return { employee_details: emplopyee_details_insert }

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Save data of qualification details
*/
exports.save_qualification_details = async (reqbody, is_exist_user_qualification) => {
    try {

        let qulification_multiple_data = [];
        for (var i = 0; i < reqbody.qualification_details.length; i++) {

            let data = {
                candidate_id: reqbody.id,
                qualification: reqbody.qualification_details[i].qualification,
                course: reqbody.qualification_details[i].course,
                course_type: reqbody.qualification_details[i].course_type,
                specialization: reqbody.qualification_details[i].specialization,
                university: reqbody.qualification_details[i].university,
                passing_year: reqbody.qualification_details[i].passing_year,
                // is_candidate_recruiter_by:0,
                created_at: Date.now(),
                updated_at: Date.now()
            };
            qulification_multiple_data.push(data);

        }

        let qualification_details_insert = await QualificationModel.insertMany(qulification_multiple_data);

        if (is_exist_user_qualification == false) {

            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.id }, { $inc: { profile_strength: 10 } });
        }

        return { candidate_qualification_details: qualification_details_insert }

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Update data of employee details
*/
exports.update_employee_details = async (reqbody, user) => {
    try {

        let employee_details_update;
        let employee_multiple_data = [];
        for (var i = 0; i < reqbody.employee_details.length; i++) {

            let data = {
                // _id:reqbody.employee_details[i]._id,
                candidate_id: reqbody.employee_details[i].candidate_id,
                designation: reqbody.employee_details[i].designation,
                organization: reqbody.employee_details[i].organization,
                is_current_company: reqbody.employee_details[i].is_current_company,
                annual_salary_currency_type: reqbody.employee_details[i].annual_salary_currency_type,
                annual_salary: reqbody.employee_details[i].annual_salary,
                work_since_from_year: reqbody.employee_details[i].work_since_from_year,
                work_since_from_month: reqbody.employee_details[i].work_since_from_month,
                work_since_to_present: reqbody.employee_details[i].work_since_to_present || null,
                work_since_to_year: reqbody.employee_details[i].work_since_to_year || null,
                work_since_to_month: reqbody.employee_details[i].work_since_to_month || null,
                location: reqbody.employee_details[i].location,
                description: reqbody.employee_details[i].description,
                description_job_profile: reqbody.employee_details[i].description_job_profile,
                notice_period: reqbody.employee_details[i].notice_period,
                // is_candidate_recruiter_by:0,
                updated_at: Date.now(),
                updated_by: user._id
            };
            employee_multiple_data.push(data);


            employee_details_update = await EmployeeModel.updateOne({ _id: reqbody.employee_details[i]._id }, data)
        }

        return employee_details_update;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Update data of qualification details
*/
exports.update_qualification_details = async (reqbody, user) => {
    try {
        // console.log("user::",user)

        let qualification_details_update;
        let qulification_multiple_data = [];
        for (var i = 0; i < reqbody.qualification_details.length; i++) {

            let data = {
                candidate_id: reqbody.qualification_details[i].candidate_id,
                qualification: reqbody.qualification_details[i].qualification,
                course: reqbody.qualification_details[i].course,
                course_type: reqbody.qualification_details[i].course_type,
                specialization: reqbody.qualification_details[i].specialization,
                university: reqbody.qualification_details[i].university,
                passing_year: reqbody.qualification_details[i].passing_year,
                // is_candidate_recruiter_by:0,
                updated_at: Date.now(),
                // updated_by: user._id
            };
            qulification_multiple_data.push(data);

            qualification_details_update = await QualificationModel.updateOne({ _id: reqbody.qualification_details[i]._id }, data)


        }

        return qualification_details_update;
        // let qualification_details_insert = await QualificationModel.insertMany(qulification_multiple_data);

        // return {candidate_qualification_details:qualification_details_insert}

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
 *   Delete Employee Profile Details By Id
*/
exports.delete_employee_details = async (id, reqbody) => {
    try {

        let check_employee_exist = await EmployeeModel.findOne({ _id: id }).lean();

        if (!check_employee_exist) {
            return false;
        }


        // const employeeDetailsUpdate = await EmployeeModel.updateOne({ _id: id }, { deleted_by: user }).lean();

        let delete_data = await EmployeeModel.removeOne({ _id: id });
        let totalRecords_employee = await EmployeeModel.countDocuments({ deleted: false, candidate_id: reqbody.candidate_id });
        if (totalRecords_employee == 0) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.candidate_id }, { $inc: { profile_strength: -10 } });

        }
        return delete_data

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *   Delete Employee Qualification Profile Details By Id
*/
exports.delete_qualification_details = async (id, reqbody) => {
    try {

        let check_employee_qualification_exist = await QualificationModel.findOne({ _id: id }).lean();

        if (!check_employee_qualification_exist) {
            return false;
        }


        // const employeeDetailsUpdate = await EmployeeModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        let delete_qualification = await QualificationModel.removeOne({ _id: id });

        let totalRecords_qualification = await QualificationModel.countDocuments({ deleted: false, candidate_id: reqbody.candidate_id });

        if (totalRecords_qualification == 0) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.candidate_id }, { $inc: { profile_strength: -10 } });

        }

        return delete_qualification

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Save data of Candidate IT Skills details
*/

exports.save_candidate_it_skill_details = async (reqbody, is_exist_user) => {
    try {

        let it_skill_multiple_data = [];
        for (var i = 0; i < reqbody.it_skills_details.length; i++) {

            let data = {
                candidate_id: reqbody.id,
                skill: reqbody.it_skills_details[i].skill,
                version: reqbody.it_skills_details[i].version,
                last_used: reqbody.it_skills_details[i].last_used,
                experience: reqbody.it_skills_details[i].experience,
                // is_candidate_recruiter_by:0,
                created_at: Date.now(),
                updated_at: Date.now()
            };
            it_skill_multiple_data.push(data);

        }

        let it_skills_details_insert = await ITSkillModel.insertMany(it_skill_multiple_data);

        if (is_exist_user == false) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.id }, { $inc: { profile_strength: 10 } });
        }


        return { candidate_it_skills_details: it_skills_details_insert }

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Update data of Candidate IT SKills details
*/
exports.update_it_skills_details = async (reqbody, user) => {
    try {

        let it_skills_details_update;
        let it_skills_multiple_data = [];
        for (var i = 0; i < reqbody.it_skills_details.length; i++) {

            let data = {
                _id: reqbody.it_skills_details[i]._id,
                candidate_id: reqbody.it_skills_details[i].candidate_id,
                skill: reqbody.it_skills_details[i].skill,
                version: reqbody.it_skills_details[i].version,
                last_used: reqbody.it_skills_details[i].last_used,
                experience: reqbody.it_skills_details[i].experience,
                // is_candidate_recruiter_by:0,
                updated_at: Date.now(),
                // updated_by: user._id
            };
            it_skills_multiple_data.push(data);

            it_skills_details_update = await ITSkillModel.updateOne({ _id: reqbody.it_skills_details[i]._id }, data)


        }

        return it_skills_details_update;
        // let qualification_details_insert = await QualificationModel.insertMany(qulification_multiple_data);

        // return {candidate_qualification_details:qualification_details_insert}

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
 *   Delete Candidare IT Skills Details By Id
*/
exports.delete_it_skill_details = async (id, reqbody) => {
    try {

        let check_candidate_it_skill_exist = await ITSkillModel.findOne({ _id: id }).lean();

        if (!check_candidate_it_skill_exist) {
            return false;
        }


        // const employeeDetailsUpdate = await EmployeeModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        let delete_it_skill = await ITSkillModel.removeOne({ _id: id });

        let totalRecords_it_skill = await ITSkillModel.countDocuments({ deleted: false, candidate_id: reqbody.candidate_id });

        if (totalRecords_it_skill == 0) {
            let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: reqbody.candidate_id }, { $inc: { profile_strength: -10 } });
        }
        return delete_it_skill;

    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
 *  Candidate Personal Details DOB,gender like fields Update By Id
*/
exports.update_candidate_personal_detail = async (id, reqbody, is_exist_user, user) => {
    try {

        let update_candidate_personal_detail = {};

        update_candidate_personal_detail.date_of_birth = reqbody.date_of_birth
        update_candidate_personal_detail.permanent_address = reqbody.permanent_address
        update_candidate_personal_detail.gender = reqbody.gender
        update_candidate_personal_detail.area_pin_code = reqbody.area_pin_code
        update_candidate_personal_detail.home_town = reqbody.home_town
        update_candidate_personal_detail.updated_at = Date.now()
        // update_candidate_profile.updated_by              = user._id



        if (is_exist_user.permanent_address == undefined) {
            if (reqbody.permanent_address && reqbody.permanent_address != '') {
                let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 10 } });
            }
        }
        return await CandidateModel.updateOne({ _id: id }, update_candidate_personal_detail).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
 *  Candidate Career Profile Details Job Category,Role,Desired Job Type like fields Update By Id
 */
exports.update_candidate_career_profile = async (id, reqbody, is_exist_user, user) => {
    try {

        let update_candidate_career_detail = {};
        update_candidate_career_detail.job_category = reqbody.job_category
        update_candidate_career_detail.role = reqbody.role
        update_candidate_career_detail.desired_job_type = reqbody.desired_job_type
        update_candidate_career_detail.desired_employment_type = reqbody.desired_employment_type
        update_candidate_career_detail.desired_shift = reqbody.desired_shift,
            update_candidate_career_detail.desired_location = reqbody.desired_location,
            update_candidate_career_detail.updated_at = Date.now()
        // update_candidate_profile.updated_by              = user._id

        if (is_exist_user.job_category == undefined) {
            if (reqbody.job_category && reqbody.job_category != '') {
                let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 10 } });
            }
        }
        return await CandidateModel.updateOne({ _id: id }, update_candidate_career_detail).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *  Candidate Profile Summary Details attachments,profile summary like fields Update By Id
*/
exports.update_candidate_summary_profile = async (id, reqbody, is_exist_user, user) => {
    try {

        let update_candidate_summary_detail = {};
        let imageBuffer, type, extension;


        if (!isEmpty(reqbody.attachments && reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var matches = reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            imageBuffer = decodedImg.data;
            type = decodedImg.type;
            extension = mime.getExtension(type);

            let filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|GIF|gif|PDF|pdf/;
            let check_image = !filetypes.test(extension);
        }

        if (!isEmpty(reqbody.attachments && reqbody.attachments.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            let filepath = "/upload/candidate/";
            let publicpath = process.cwd() + "/public/";
            let storepath = publicpath + filepath;

            fse.mkdirsSync(storepath);
            let candidate_filename = Date.now() + "-candidate" + "." + extension;

            fs.writeFileSync(storepath + candidate_filename, imageBuffer, "utf8");
            update_candidate_summary_detail.attachments = candidate_filename;

            if (is_exist_user.attachments == undefined || is_exist_user.attachments == null) {
                if (reqbody.attachments && reqbody.attachments != '' && candidate_filename) {
                    let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 20 } });
                }
            }

            if (is_exist_user.attachments) {
                old_file = storepath + is_exist_user.attachments;
                fs.unlink(old_file, (err) => {
                    if (err) {
                        console.error(err)
                    }
                })
            }
        } else {
            if (reqbody.attachments == null) {

                if (is_exist_user.attachments) {

                    var filepath = "/upload/candidate/";
                    var publicpath = process.cwd() + "/public/";
                    var storepath = publicpath + filepath;

                    old_file = storepath + is_exist_user.attachments;
                    fs.unlink(old_file, (err) => {
                        if (err) {
                            console.error(err)
                        }
                    })

                    update_candidate_summary_detail.attachments = null;
                    let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: -20 } });

                }
            } else {

                update_candidate_summary_detail.attachments = reqbody.attachments;
            }
        }

        if (!isEmpty(reqbody.profile_image && reqbody.profile_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var matches = reqbody.profile_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                image = {};
            // get image extension and image
            image.type = matches[1];
            image.data = new Buffer.from(matches[2], "base64");
            let decodedImg = image;
            var ProfileImageBuffer = decodedImg.data;
            let ProfileImagetype = decodedImg.type;

            var ProfileImage_extension = mime.getExtension(ProfileImagetype);

            var filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|GIF|gif|PDF|pdf/;
            var check_image = !filetypes.test(ProfileImage_extension);

            // if (check_image) {
            //     errors.attachments = "Only image and files are allowed";
            // }


        }

        if (!isEmpty(reqbody.profile_image && reqbody.profile_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
            var filepath = "/upload/candidate/";
            var publicpath = process.cwd() + "/public/";
            var storepath = publicpath + filepath;

            fse.mkdirsSync(storepath);
            var candidate_image_name = Date.now() + "-candidate" + "." + ProfileImage_extension;


            fs.writeFileSync(storepath + candidate_image_name, ProfileImageBuffer, "utf8");
            update_candidate_summary_detail.profile_image = candidate_image_name;

            if (is_exist_user.profile_image == undefined || is_exist_user.profile_image == null) {

                if (reqbody.profile_image && reqbody.profile_image != '' && candidate_image_name) {
                    let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 10 } });
                }
            }

            if (is_exist_user.profile_image) {

                old_file = storepath + is_exist_user.profile_image;
                fs.unlink(old_file, (err) => {
                    if (err) {
                        console.error(err)
                    }
                })

            }
        } else {
            if (reqbody.profile_image == null) {

                if (is_exist_user.profile_image) {

                    var filepath = "/upload/candidate/";
                    var publicpath = process.cwd() + "/public/";
                    var storepath = publicpath + filepath;

                    old_file = storepath + is_exist_user.profile_image;
                    fs.unlink(old_file, (err) => {
                        if (err) {
                            console.error(err)
                        }
                    })

                    update_candidate_summary_detail.profile_image = null;
                    let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: -10 } });
                }
            } else {
                update_candidate_summary_detail.profile_image = reqbody.profile_image;
            }
        }

        update_candidate_summary_detail.profile_summary = reqbody.profile_summary
        update_candidate_summary_detail.updated_at = Date.now()

        if (is_exist_user.profile_summary == undefined || is_exist_user.profile_summary == null) {

            if (reqbody.profile_summary && reqbody.profile_summary != '') {
                let candidate_profile_strenght_update = await CandidateModel.updateOne({ _id: id }, { $inc: { profile_strength: 5 } });
            }
        }
        return await CandidateModel.updateOne({ _id: id }, update_candidate_summary_detail).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Update Candidate Submission Status By id
*/
exports.update_candidate_status = async (id, reqbody, user) => {
    try {

        let update_candidate_status = {
            submission_status: reqbody.status,
            updated_at: Date.now(),
            updated_by: user._id
        }

        return await CandidateSubmissionModel.updateOne({ candidate_id: id, opening_id: reqbody.opening_id }, update_candidate_status).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};




/*
 *   Candidate ShortList Details By Candidate Id
*/
exports.shortlist_candidate_detailsOLD = async (reqbody) => {
    try {

        let candidate_submission_details = await CandidateModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(reqbody.candidate_id), deleted: false } },
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
                    //   localField: '_id',
                    //   foreignField: 'candidate_id',
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
                $lookup:
                {
                    from: 'candidate_submissions',
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ['$candidate_id', '$$id'] },
                                        { $eq: ['$deleted', false] },
                                        //  { $eq: ['$candidate_select_by_bdm', 1] },
                                        // { $eq: ['$submission_status', 'Old'] },
                                    ],
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
                                ],
                                as: 'job_opening_details'
                            },

                        },

                    ],
                    as: 'candidate_submissions'
                }
            },

            {
                $project: {
                    email: 1, mobile: 1, candidate_category: 1, job_category: 1, total_work_exp_year: 1, total_work_exp_month: 1, desired_employment_type: 1, desired_job_type: 1, key_skills: 1, current_location: 1, desired_location: 1, current_ctc: 1, profile_image: 1, status: 1, created_at: 1, updated_at: 1, name: { $concat: ["$first_name", " ", "$last_name"] },
                    "employess": 1, "candidate_submissions.opening_id": 1, "candidate_submissions.submission_status": 1, "candidate_submissions.job_opening_details": 1,
                    candidate_qualifications_details: {
                        $filter: {
                            input: "$candidate_qualifications",
                            as: "item",
                            cond: { $eq: ["$$item.passing_year", { $max: "$candidate_qualifications.passing_year" }] }
                        }
                    }
                }
            }


        ])

        return candidate_submission_details

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.shortlist_candidate_details = async (reqbody) => {
    try {
        let candidate_submission_details = await CandidateModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(reqbody.candidate_id),
                    deleted: false,
                },
            },
            {
                $lookup: {
                    from: "jobapplyings",
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
                    as: "jobapplying",
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
                                        { $eq: ["$candidate_id", "$$id"] },
                                        { $eq: ["$deleted", false] },
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
                    //   localField: '_id',
                    //   foreignField: 'candidate_id',
                    let: { id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
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
                    //from: "candidate_submissions",
                    from: "jobapplyings",
                    //   localField: '_id',
                    //   foreignField: 'company_id',
                    let: { id: "$_id" },
                    pipeline: [
                        /* {
                           $match: {
                             $expr: {
                               $and: [
                                 { $eq: ["$candidate_id", "$$id"] },
                                 { $eq: ["$deleted", false] },
                              //   { $eq: ["$candidate_select_by_bdm", 1] },
                                 // { $eq: ['$submission_status', 'Old'] },
                               ],
                             },
                           },
                         },*/
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$candidate_id", "$$id"] },
                                        { $eq: ["$deleted", false] },
                                        //   { $eq: ["$candidate_select_by_bdm", 1] },
                                        // { $eq: ['$submission_status', 'Old'] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: "jobopenings",
                                let: { id: "$job_opening_id" },
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

                                    {
                                        $lookup: {
                                            from: "companies",
                                            // localField: 'account_name',
                                            // foreignField: '_id',
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
                                            from: "states",
                                            localField: "state",
                                            foreignField: "code",
                                            as: "state",
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "cities",
                                            localField: "city",
                                            foreignField: "code",
                                            as: "city",
                                        },
                                    },
                                ],
                                as: "job_opening_details",
                            },
                        },
                        { $sort: { created_at: -1 } },
                        { "$match": { "job_opening_details": { $exists: true, $ne: [] } } },
                    ],
                    as: "candidate_submissions",
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
                    current_ctc: 1,
                    profile_image: 1,
                    status: 1,
                    created_at: 1,
                    updated_at: 1,
                    name: { $concat: ["$first_name", " ", "$last_name"] },
                    employess: 1,
                    // jobapplying:1,
                    //  jobopenings:1,
                    "candidate_submissions.opening_id": 1,
                    "candidate_submissions.submission_status": 1,
                    "candidate_submissions.job_opening_details": 1,
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
        ]);

        return candidate_submission_details;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *   Candidate Show All Job Opening List
*/
exports.all_job_opening_list = async (reqbody) => {
    try {
        if (reqbody.search || reqbody.categories.length || reqbody.salary.length || reqbody.location.length || reqbody.experience) {
            reqbody.current_page = 1
        }

        let offset =
            parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
        let limit = parseInt(reqbody.per_page) || 10;
        let order_column = reqbody.order || "created_at";
        let sort_order = reqbody.order_direction || "desc";
        let filter_value = reqbody.search;
        let categories = reqbody.categories;
        let salary = reqbody.salary;
        let location = reqbody.location;
        let experience = reqbody.experience;
        let candidate_id = mongoose.Types.ObjectId(reqbody.candidate_id);

        let sortJson = {};

        if (sort_order == "asc") {
            sortJson[order_column] = 1;
        } else {
            sortJson[order_column] = -1;
        }

        let filter_condition = {};

        if (filter_value != "") {
            var searchString = new RegExp(filter_value, "i");

            filter_condition["$or"] = [
                { required_skills: { $regex: searchString } },
                { opening_title: { $regex: searchString } },
                { account_name: { $regex: searchString } },
            ];
        }

        if (categories.length != 0) {
            filter_condition["category.code"] = {
                $in: categories.map(function (category) {
                    return new RegExp(category, "i");
                }),
            };
        }
        let sal_range_from, sal_range_to;

        if (salary.length != 0) {
            [sal_range_from, sal_range_to] = salary[0].split('-');
            salary.forEach(el => {
                el = el.split('-');
                if (el[0] * 1 < sal_range_from * 1) sal_range_from = el[0];
                if (el[1] * 1 > sal_range_to * 1) sal_range_to = el[1];
            });

            filter_condition["$and"] = [
                { salary_range_from: { $gte: sal_range_from * 1 } },
                { salary_range_to: { $lte: sal_range_to * 1 } }
            ];
        }

        if (location.length != 0) {
            filter_condition["city.code"] = {
                $in: location.map(function (location) {
                    return location;
                }),
            };
        }

        if (experience != "") {
            filter_condition.required_experience = parseInt(experience);
        }

        let bdmassignment = await BdmAssignment.find({
            $or: [
                { assigned_recruiter: { $exists: true, $type: 'array', $ne: [] } },
                { assigned_freelancer: { $exists: true, $type: 'array', $ne: [] } }
            ]
        }, { opening_id: 1 });

        let openingIds = bdmassignment.map(item => item.opening_id);

        let job_opening_listing_for_candidate = await JobOpeningModel.aggregate([
            { $match: { deleted: false, opening_id: { $in: openingIds } } },
            {
                $lookup: {
                    from: "companies",
                    // localField: 'account_name',
                    // foreignField: '_id',
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
                    from: "categories",
                    localField: "category",
                    foreignField: "code",
                    as: "category",
                },
            },
            {
                $lookup: {
                    from: "states",
                    localField: "state",
                    foreignField: "code",
                    as: "state",
                },
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "city",
                    foreignField: "code",
                    as: "city",
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    localField: "opening_id",
                    foreignField: "opening_id",
                    as: "candidate_submission",
                },
            },
            {
                $lookup: {
                    from: "jobapplyings",
                    let: { opening_id: "$opening_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$job_opening_id", "$$opening_id"] },
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$candidate_id", candidate_id] }
                                    ],
                                },
                            },
                        },
                    ],
                    as: "job_applied",
                },
            },
            {
                $lookup: {
                    from: "jobsaves",
                    let: { opening_id: "$opening_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$job_opening_id", "$$opening_id"] },
                                        { $eq: ["$deleted", false] },
                                        { $eq: ["$candidate_id", candidate_id] }
                                    ],
                                },
                            },
                        },
                    ],
                    as: "job_save",
                },
            },

            { $match: filter_condition },

            { $sort: sortJson },
            {
                $project: {
                    account_name: { $arrayElemAt: ["$account_name.company_name", 0] },
                    category: { $arrayElemAt: ["$category.name", 0] },
                    job_apply: { $arrayElemAt: ["$job_applied", 0] },
                    job_save: { $arrayElemAt: ["$job_save", 0] },
                    _id: 1,
                    opening_title: 1,
                    opening_id: 1,
                    status: 1,
                    required_skills: 1,
                    salary_range_from: 1,
                    salary_range_to: 1,
                    required_experience: 1,
                    category: 1,
                    state: 1,
                    city: 1,
                    job_description: 1,
                    short_description: 1,
                    created_at: 1,
                    updated_at: 1,
                    candidate_submission: 1,
                    assigned_recruiter: 1
                },
            },
            {
                $facet: {
                    paginatedResults: [
                        { $skip: Number(offset) },
                        { $limit: Number(limit) },
                    ],
                    totalCount: [{ $group: { _id: null, count: { $sum: 1 } } }],
                },
            },
            {
                $project: {
                    paginatedResults: '$paginatedResults',
                    totalCount: { $first: "$totalCount.count" }
                }
            }
        ]);

        totalRecords = job_opening_listing_for_candidate[0].totalCount;
        const total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        const data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            job_opening_listing:
                job_opening_listing_for_candidate[0].paginatedResults,
        };
        return data;

    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Candidate Job Opening Create Wise City List Dropdown
*/
exports.job_opening_city_list = async () => {
    try {
        let city_list = await JobOpeningModel.distinct('city', { deleted: false, city: { $ne: null } }).lean();
        let city_name = await CityModel.find({ code: { $in: city_list } }, { code: 1, city: 1, _id: 0 })
        return { city: city_name };
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Candidate Job Opening Create Wise Category List Dropdown
*/
exports.job_opening_category_list = async () => {
    try {
        let category_list = await JobOpeningModel.distinct('category', { deleted: false }).lean();
        let category_name = await CategoryModel.find({ code: { $in: category_list } }, { code: 1, name: 1, _id: 0 })
        return { category: category_name };
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Candidate apply jobs
*/
exports.JobApply = async (reqbody) => {
    try {
        let candidate_apply_jobs = {};
        candidate_apply_jobs.company_id = reqbody.company_id
        candidate_apply_jobs.job_opening_id = reqbody.job_opening_id
        candidate_apply_jobs.recruiter_id = reqbody.recruiter_id
        candidate_apply_jobs.candidate_id = reqbody.candidate_id
        candidate_apply_jobs.profile_submit = reqbody.profile_submit

        let candidate_apply = await JobApplyModel.create(candidate_apply_jobs);

        return candidate_apply;

    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Job apply request Exist
*/
exports.is_exist_job_apply_request = async (reqbody) => {
    try {
        let candidate_id = reqbody.candidate_id;
        let job_opening_id = reqbody.job_opening_id;
        let profile_submit = reqbody.profile_submit;
        let jobapply = await JobApplyModel.findOne({ candidate_id: candidate_id, job_opening_id: job_opening_id, profile_submit: profile_submit }).lean();

        if (!jobapply) {
            return false;
        }
        return jobapply;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
 *  Find Recruiter random
 */
exports.find_recruiter = async (reqbody) => {
    try {
        let checkReqCountArray = [];
        let minJobApply = [];
        let recruiter_role_id = await RoleModel.findOne(
            { role_name: "recruiter" },
            { role_name: 1 }
        ).lean();
        const user_list = await UsersModel.find({ assigned_role: recruiter_role_id._id }).lean();

        if (user_list) {
            let smallest = 0;
            for (const user of user_list) {
                var id = mongoose.Types.ObjectId(user._id);
                let countData = await JobApplyModel.find({ recruiter_id: { $in: id } }).lean();
                let count = countData.length;
                if (countData) {
                    checkReqCountArray[user._id] = count;
                } else {
                    checkReqCountArray[user._id] = count;
                }
                if (count == 0) {
                    minJobApply["email"] = user.email;
                    minJobApply["recruiter_id"] = id;
                    return minJobApply;
                } else {
                    if (count > 0) {
                        if (smallest == 0) {
                            smallest = count;
                            minJobApply["email"] = user.email;
                            minJobApply["recruiter_id"] = id;
                        } else {
                            if (count < smallest) {
                                minJobApply["email"] = user.email;
                                minJobApply["recruiter_id"] = id;
                            }
                        }

                    } else {
                        smallest = count;
                    }
                }
            }
        }

        if (!minJobApply) {
            return false;
        }
        return minJobApply;
    } catch (error) {
        console.error("Error get: ", error);
    }
};


exports.candidate_listing_old = async (reqbody) => {
    try {
        let candidateList = [];
        let checkCanId = [];
        let candidate_list = await CandidateModel.aggregate([
            {
                $lookup: {
                    from: "jobapplyings",
                    localField: "_id",
                    foreignField: "candidate_id",
                    as: "job_applied",
                },
            },
            { $unwind: { path: "$job_applied" } }
        ]);

        if (!candidate_list) {
            return false;
        } else {

            for (const user of candidate_list) {
                let userId = (user._id).toString();
                let containsMarcus = checkCanId.indexOf(userId)
                if (containsMarcus == -1) {
                    candidateList.push(user);
                    checkCanId.push(userId);
                }
            }

        }
        return candidateList;
    } catch (error) {
        console.error("Error : ", error);
    }
};


exports.is_exist_job_saved_request = async (reqbody) => {
    try {

        let job_opening_id = reqbody.job_opening_id;
        let candidate_id = reqbody.candidate_id;

        let jobsaved = await JobsavedModel.findOne({ job_opening_id: job_opening_id, candidate_id: candidate_id }).lean();

        if (!jobsaved) {
            return false;
        }
        return jobsaved;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.candidate_listing = async (reqbody) => {
    try {
        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
        let limit = parseInt(reqbody.per_page) || 5;
        let order_column = reqbody.order || "created_at";
        let sort_order = reqbody.order_direction || "desc";
        let filter_value = reqbody.search;
        let jobcategory = reqbody.jobcategory;
        let location = reqbody.location;
        let recruiter_id = reqbody.recruiter_id;

        let sortJson = {};

        if (sort_order == "asc") {
            sortJson[order_column] = 1;
        } else {
            sortJson[order_column] = -1;
        }

        let filter_condition = {};

        if (filter_value != "") {
            var searchString = new RegExp(filter_value, "i");
            filter_condition["$or"] = [
                { key_skills: { $regex: searchString } },
                { profile_strength: { $regex: searchString } },
            ];
        }

        if (jobcategory != "") {
            filter_condition.job_category = jobcategory;
        }
        if (location != "") {
            filter_condition.home_town = location;
        }

        let totalRecords = await CandidateModel.aggregate([
            { $match: { deleted: false } },
            {
                $lookup: {
                    from: "jobapplyings",
                    let: { candidate_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$candidate_id", "$$candidate_id"] },
                                        {
                                            $eq: [
                                                "$recruiter_id",
                                                mongoose.Types.ObjectId(reqbody.recruiter_id),
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "job_applied",
                },
            },
            {
                $match: { "job_applied.0": { $exists: true } },
            },
            {
                $lookup: {
                    from: "jobopenings",
                    localField: "job_applied.job_opening_id",
                    foreignField: "opening_id",
                    as: "jobopenings",
                },
            },
            {
                $unwind: {
                    path: "$jobopenings",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "candidate_submissions",
                    localField: "job_applied.job_opening_id",
                    foreignField: "opening_id",
                    as: "candidate_submissions",
                },
            },
            { $match: filter_condition },
            { $sort: sortJson },
        ]);
        totalRecords = totalRecords.length;

        let candidateList = [];
        let checkCanId = [];

        const candidate_list = await JobApplyings.aggregate([
            {
                $match: {
                    recruiter_id: mongoose.Types.ObjectId(recruiter_id)
                },
            },
            {
                $lookup: {
                    from: "candidates",
                    localField: "candidate_id",
                    foreignField: "_id",
                    as: "candidate_details",
                }
            },

            {
                $lookup: {
                    from: "candidate_submissions",
                    localField: "job_opening_id",
                    foreignField: "opening_id",
                    as: "candidate_submissions",
                },
            },

            {
                $lookup: {
                    from: "jobopenings",
                    // localField: "job_opening_id",
                    // foreignField: "opening_id",
                    let: { opening_id: "$job_opening_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $eq: ["$opening_id", "$$opening_id"],
                                },
                            },
                        },
                    ],

                    as: "jobopenings",

                },
            },

            { $sort: { updated_at: -1 } },
            {
                $facet: {
                    totalCount: [
                        {
                            $count: "filteredRecords",
                        },
                    ],
                    paginatedResults: [
                        { $skip: Number(offset) },
                        { $limit: Number(limit) },
                    ],
                },
            },
        ])

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            filteredRecords: candidate_list[0].totalCount,
            candidate_listing: candidate_list[0].paginatedResults,
        };

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.save_job = async (reqbody) => {
    try {
        let save_job_data = {};
        save_job_data.job_opening_id = reqbody.job_opening_id;
        save_job_data.candidate_id = reqbody.candidate_id;
        save_job_data.created_at = Date.now();
        save_job_data.updated_at = Date.now();

        let save_job_create = await JobsavedModel.create(save_job_data);
        return { saved_job: save_job_create };
    } catch (error) {
        console.log(error);
    }
}

/*
*  Delete Job saved
*/
exports.deleteJobs = async (id, user) => {
    try {

        let check_job_saved_exist = await JobsavedModel.findOne({ _id: id }).lean();

        if (!check_job_saved_exist) {
            return false;
        }


        const jobSavedUpdate = await JobsavedModel.updateOne({ _id: id }, { deleted_by: user }).lean();
        return JobsavedModel.removeOne({ _id: id });

    } catch (error) {
        console.error("Error : ", error);
    }
};

exports.job_saved_list = async (user) => {
    try {
        const saved_job_list = await JobOpeningModel.aggregate([
            {
                $lookup: {
                    from: "jobsaves",
                    localField: "opening_id",
                    foreignField: "job_opening_id",
                    as: "job_save",
                },
            },
            {
                $unwind: "$job_save",
            },
            {
                $match: {
                    "job_save.candidate_id": mongoose.Types.ObjectId(user),
                    "job_save.deleted": false,
                },
            },
        ]);
        return { saved_jobs: saved_job_list };
    } catch (error) {
        console.log(error);
    }
};

exports.reportListSubmissions = async (reqbody) => {
    try {

        let from_date = '';
        let to_date = '';
        let daterange = reqbody.dateRange;
        let status = reqbody.status;

        if (daterange != undefined && daterange != '' && daterange.length > 0) {
            from_date = daterange[0];
            to_date = daterange[1];
        }

        let candidateFilterConditions = {};
        if (
            from_date != undefined &&
            to_date != undefined &&
            from_date != "" &&
            to_date != ""
        ) {
            candidateFilterConditions = {
                deleted: false,
                candidate_id: { $ne: null },
                created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
            };
        } else {
            candidateFilterConditions = {
                deleted: false,
                candidate_id: { $ne: null },
            };
        }

        if (status && status !== 'submission') {
            candidateFilterConditions.submission_status = status;
        }
        else {
            // this api is for admin report -> candidate submissions 
            // so we need to filter 'submission' status, by freelancer / recruiter submissions
            candidateFilterConditions.submission_status = { $ne: 'submission' }
        }

        const candidateSubmissions = await CandidateSubmissionModel.aggregate([
            {
                $match: candidateFilterConditions,
            },
            {
                $lookup: {
                    from: 'candidates',
                    localField: 'candidate_id',
                    foreignField: '_id',
                    pipeline: [{
                        $project: {
                            _id: 0,
                            first_name: 1,
                            last_name: 1,
                            display_name: { $concat: ['$first_name', ' ', '$last_name'] },
                            current_location: 1
                        }
                    }],
                    as: 'candidate'
                }
            },
            {
                $lookup: {
                    from: 'jobopenings',
                    localField: 'opening_id',
                    foreignField: 'opening_id',
                    pipeline: [{
                        $project: {
                            _id: 0,
                            category: 1
                        }
                    }],
                    as: 'jobopening'
                }
            },

            {
                $project: {
                    candidate: { $arrayElemAt: ['$candidate', 0] },
                    jobopening: { $arrayElemAt: ['$jobopening', 0] },
                    candidate_id: 1,
                    submission_status: 1
                }
            }
        ]);

        return {
            candidate_submission_listing: candidateSubmissions,
            totalRecords: candidateSubmissions.length
        }
    }
    catch (error) {
        console.log(error)
    }
}

