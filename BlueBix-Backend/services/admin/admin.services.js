const { commonFunctions } = require("../../helper");
const AdminModel = require("./admin.model");
const BdmModel = require("../bdm/bdm.model");
const CandidateModel = require("../candidate/candidate.model");
const CompanyModel = require("../company/company.model");
const RecruiterModel = require("../recruiter/recruiter.model");
const RoleModel = require("../roles/roles.model");
const UserModel = require("../users/users.model");
const isEmpty = require("../../validations/is-empty");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const JobOpeningModel = require("../jobopening/jobopening.model");
const SubmissionModel = require("../jobopening/submission.model");
const mongoose = require("mongoose");
const Imap = require('imap'),
  inspect = require('util').inspect;

/*
*  Check Email Exist
*/
exports.is_exist = async (email) => {
  try {

    let user = await UserModel.findOne({ $or: [{ login_email: email }, { email: email }] }).lean();
    if (!user) {
      return false;
    }
    return user;
  } catch (error) {
    console.error("Error : ", error);
  }
};

// /*
// *  Check Login Email Exist
// */
// exports.is_exist_login_email = async (email) => {
//     try {

//         let user = await UserModel.findOne({ login_email: email }).lean();
//         if (!user) {
//             return false;
//         }
//         return user;
//     } catch (error) {
//         console.error("Error : ", error);
//     }
// };



/*
*  Check Email Exist And Role
*/
exports.is_exist_role = async (email, profile) => {
  try {
    let user = await UserModel.findOne({ $and: [{ profile: profile }, { $or: [{ email: email }, { login_email: email }] }] }).lean();
    // let user = await UserModel.findOne({ email: email, profile: profile }).lean();
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
    let role_id = await RoleModel.findOne({ role_name: reqbody.role }).lean();

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

    let user_admin = {};
    user_admin.email = reqbody.email,
      user_admin.default = reqbody.default,
      // user_admin.login_email       = reqbody.login_email||null,
      user_admin.password = hashpassword,
      user_admin.assigned_role = role_id._id,
      user_admin.status = reqbody.status
    user_admin.first_name = reqbody.first_name,
      user_admin.last_name = reqbody.last_name,
      user_admin.display_name = reqbody.display_name,
      user_admin.alternate_email = reqbody.alternate_email || null,
      user_admin.phone_home = reqbody.phone_home,
      user_admin.mobile = reqbody.mobile || null,
      user_admin.profile = reqbody.profile,
      user_admin.profile_picture = profile_picture_filename || null,
      user_admin.current_location = reqbody.current_location,
      user_admin.reporting_manager = null
    user_admin.created_at = Date.now()
    user_admin.updated_at = Date.now()


    return await UserModel.create(user_admin);
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
*  Admin List
*/
exports.adminlist = async (reqbody) => {
  try {

    // let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.page) - 1)
    // let limit = parseInt(reqbody.per_page)
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
      searchStr = { $or: [{ display_name: filter_value }, { reporting_manager: filter_value }, { assigned_role: filter_value }] };
    } else {
      searchStr = {};
    }

    let totalRecords = await UserModel.countDocuments({ deleted: false });

    // let filteredRecords = await UserModel.countDocuments({ $and: [{deleted:false},searchStr]})

    // let admin_list_details = await UserModel.find(searchStr,{}, { 'skip': Number(offset), 'limit': Number(limit) }).sort(sortJson).lean();

    let admin_list_details = await UserModel.aggregate([
      { $match: { deleted: false } },
      {
        $lookup:
        {
          from: 'users',
          localField: 'reporting_manager',
          foreignField: '_id',
          as: 'reporting_manager'
        }
      },
      // {
      //     $unwind: {
      // 	path: "$reporting_managers",
      // 	"preserveNullAndEmptyArrays": true
      //    }
      // },
      {
        $lookup:
        {
          from: 'roles',
          localField: 'assigned_role',
          foreignField: '_id',
          as: 'assigned_role'
        }
      },
      // {
      //     $unwind: {
      // 	path: "$assigned_roles",
      // 	"preserveNullAndEmptyArrays": true
      //    }
      // },
      {
        $project: { reporting_manager: '$reporting_manager.display_name', assigned_role: { $arrayElemAt: ["$assigned_role.role_name", 0] }, display_name: 1, login_email: 1, email: 1, profile: 1, status: 1, updated_at: 1, created_at: 1 }
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

    if (!admin_list_details) {
      return false;
    }

    var data = {
      totalRecords: totalRecords,
      totalPages: total_pages,
      // filteredRecords :  admin_list_details[0].totalCount,
      admin_list_details: admin_list_details[0].paginatedResults
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
    let user_profile_details = await UserModel.findOne({ _id: id }, { created_at: 0, updated_at: 0 }).select('-password').lean();
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
*  Update Admin Profile 
*/
exports.update = async (id, reqbody, is_exist_user, user) => {
  try {

    let role_id = await RoleModel.findOne({ role_name: reqbody.role }).lean();
    let update_admin_profile = {};
    let extension;
    let imageBuffer;
    if (!isEmpty(reqbody.profile_picture && reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/))) {
      const matches = reqbody.profile_picture.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      image = {};
      // get image extension and image
      image.type = matches[1];
      image.data = new Buffer.from(matches[2], "base64");
      const decodedImg = image;
      imageBuffer = decodedImg.data;
      let type = decodedImg.type;
      extension = mime.getExtension(type);

      const filetypes = /jpg|JPG|jpeg|JPEG|png|PNG/;
      const check_image = !filetypes.test(extension);

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
      update_admin_profile.profile_picture = user_filename;

      if (is_exist_user.profile_picture) {

        old_file = storepath + is_exist_user.profile_picture;
        fs.unlink(old_file, (err) => {
          if (err) {
            console.error(err)
          }
        })

      }
    } else {
      update_admin_profile.profile_picture = reqbody.profile_picture || null;
    }

    update_admin_profile.email = reqbody.email
    update_admin_profile.default = reqbody.default
    update_admin_profile.login_email = reqbody.login_email || null
    update_admin_profile.assigned_role = role_id._id
    update_admin_profile.status = reqbody.status || 'Active'
    update_admin_profile.first_name = reqbody.first_name
    update_admin_profile.last_name = reqbody.last_name
    update_admin_profile.display_name = reqbody.display_name
    update_admin_profile.alternate_email = reqbody.alternate_email || null
    update_admin_profile.phone_home = reqbody.phone_home || null
    update_admin_profile.mobile = reqbody.mobile
    update_admin_profile.profile = reqbody.profile
    update_admin_profile.current_location = reqbody.current_location
    update_admin_profile.reporting_manager = null
    update_admin_profile.updated_at = Date.now()
    update_admin_profile.updated_by = user

    return await UserModel.updateOne({ _id: id }, update_admin_profile).lean();
  } catch (error) {
    console.error("Error : ", error);
  }
};


/*
*  Check Update Token
*/
exports.update_token = async (token_data, email) => {
  try {

    let user_update_token = await AdminModel.updateOne({ email: email }, token_data).lean();
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
exports.is_exist_admin_token = async (token) => {
  try {
    let is_exist_user_token = await AdminModel.findOne({ $and: [{ reset_password_token: token }, { reset_password_expires: { $gte: Date.now() } }] }).lean();

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
exports.admin_password_reset = async (reqbody, user) => {
  try {
    //password covert into hash
    hashpassword = await commonFunctions.hashPassword(reqbody.password);

    let update_user_password_reset = {
      password: hashpassword,
      updated_at: Date.now(),
      updated_by: user
    };

    // user_password_reset
    let reset_password = await AdminModel.updateOne({ reset_password_token: reqbody.token }, update_user_password_reset).lean();

    if (!reset_password) {
      return false;
    }
    return reset_password;
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


    const userUpdate = await UserModel.updateOne({ _id: id }, { deleted_by: user }).lean();
    return UserModel.removeOne({ _id: id });

  } catch (error) {
    console.error("Error : ", error);
  }
};


/*
*  Email Listing Details
*/
exports.email_list = async (reqbody) => {
  try {


    var imap = new Imap({
      user: process.env.INCOMING_EMAIL_USER,
      password: process.env.INCOMING_EMAIL_PASSWORD,
      host: process.env.INCOMING_EMAIL_HOST,
      port: process.env.INCOMING_EMAIL_PORT,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      },
      authTimeout: 3000
    });

    var email_array = [];
    var email_data = [];
    function openInbox(cb) {
      imap.openBox('INBOX', true, cb);
    }


    imap.once('ready', function () {
      openInbox(function (err, box) {
        if (err) throw err;
        var f = imap.seq.fetch(`1:${reqbody.number}`, {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
          struct: true
        });
        f.on('message', function (msg, seqno) {
          // console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function (stream, info) {
            // console.log("info::",info.which);
            var buffer = '';
            stream.on('data', function (chunk) {
              buffer += chunk.toString('utf8');

            });
            stream.once('end', function () {

              var buffer_obj = Imap.parseHeader(buffer);
              buffer_obj['id'] = seqno

              // console.log(prefix + 'Parsed header: %s',typeof inspect(Imap.parseHeader(buffer , seqno)));
              email_array.push(buffer_obj)

            });
          });
          msg.once('attributes', function (attrs) {
            // console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
            email_data.push(attrs, false, 8)
          });
          msg.once('end', function () {
            // console.log(prefix + 'Finished');
          });
        });
        f.once('error', function (err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function () {
          console.log('Done fetching all messages!');
          // commonResponse.success(res, 200, email_array, 'Email List Successfully');
          imap.end();
        });


      });


    });

    imap.once('error', function (err) {
      console.log(err);
    });

    imap.once('end', function () {
      console.log('Connection ended');


    });

    imap.connect();




  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.count_jobopen_statusOLD = async (reqbody) => {
  try {
    let from_date = '';
    let to_date = '';
    let daterange = reqbody.dateRange;
    let bdm_id = reqbody.bdm_id;
    let recruiter_id = reqbody.recruiter_id;
    let status = reqbody.status;


    if (daterange != undefined && daterange != '' && daterange.length > 0) {
      from_date = daterange[0];
      to_date = daterange[1];
    }
    let dateFilterConditions = {};
    if (from_date != undefined && to_date != undefined && from_date != '' && to_date != '') {
      dateFilterConditions = {
        'deleted': false, status: { $ne: '' },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      dateFilterConditions = { 'deleted': false, status: { $ne: '' } }
    }

    //Active Job
    let JobCountStatus = {};
    const cntjobsStatus = await JobOpeningModel.aggregate([{
      /*  $match: { 'deleted' : false,status: { $ne: ''},
            created_at: {$gte: new Date(from_date), $lt: new Date(to_date)},
        }*/
      $match: dateFilterConditions
    },

    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }]);

    if (cntjobsStatus) {
      for (job of cntjobsStatus) {
        JobCountStatus[job._id] = job.count;
      }
    }

    //Candidate
    let candidateDateFilterConditions = {};
    if (from_date != undefined && to_date != undefined && from_date != '' && to_date != '') {
      candidateDateFilterConditions = {
        'deleted': false, candidate_id: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      candidateDateFilterConditions = { 'deleted': false, candidate_id: { $ne: null } }
    }
    if (bdm_id) {
      candidateDateFilterConditions.bdm_id = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      candidateDateFilterConditions.recruiter_id = mongoose.Types.ObjectId(recruiter_id);
    }

    if (status) {
      candidateDateFilterConditions.submission_status = status;
    }

    let candidateJobCount = {};
    const cntjobsCandidateStatus = await SubmissionModel.aggregate([{
      //  $match: { 'deleted' : false,candidate_id: { $ne: null }  }},
      $match: candidateDateFilterConditions
    },
    {
      $group: {
        _id: "$submission_status",
        count: { $sum: 1 }
      }
    }]);

    if (cntjobsCandidateStatus) {
      for (job of cntjobsCandidateStatus) {
        candidateJobCount[job._id] = job.count;
      }
    }

    //BDM
    let BdmDateFilterConditions = {};
    if (from_date != undefined && to_date != undefined && from_date != '' && to_date != '') {
      BdmDateFilterConditions = {
        'deleted': false, bdm_id: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      BdmDateFilterConditions = { 'deleted': false, bdm_id: { $ne: null } }
    }

    if (bdm_id) {
      BdmDateFilterConditions.bdm_id = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      BdmDateFilterConditions.recruiter_id = mongoose.Types.ObjectId(recruiter_id);
    }

    if (status) {
      BdmDateFilterConditions.submission_status = status;
    }

    let bdmJobCount = {};
    const cntjobsBDMStatus = await SubmissionModel.aggregate([{
      //$match: { 'deleted' : false,bdm_id: { $ne: null }  }},
      $match: BdmDateFilterConditions
    },
    {
      $group: {
        _id: "$submission_status",
        count: { $sum: 1 }
      }
    }]);

    if (cntjobsBDMStatus) {
      for (job of cntjobsBDMStatus) {
        bdmJobCount[job._id] = job.count;
      }
    }

    // Recruiter
    let recruiterDateFilterConditions = {};
    if (from_date != undefined && to_date != undefined && from_date != '' && to_date != '') {
      recruiterDateFilterConditions = {
        'deleted': false, recruiter_id: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      recruiterDateFilterConditions = { 'deleted': false, recruiter_id: { $ne: null } }
    }

    if (bdm_id) {
      recruiterDateFilterConditions.bdm_id = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      recruiterDateFilterConditions.recruiter_id = mongoose.Types.ObjectId(recruiter_id);
    }

    if (status) {
      recruiterDateFilterConditions.submission_status = status;
    }

    let recruiterJobCount = {};
    const cntjobsrecruiterStatus = await SubmissionModel.aggregate([{
      //$match: { 'deleted' : false,recruiter_id: { $ne: null }  }},
      $match: recruiterDateFilterConditions
    },
    {
      $group: {
        _id: "$submission_status",
        count: { $sum: 1 }
      }
    }]);

    if (cntjobsrecruiterStatus) {
      for (job of cntjobsrecruiterStatus) {
        recruiterJobCount[job._id] = job.count;
      }
    }


    return { JobCountStatus, candidateJobCount, bdmJobCount, recruiterJobCount }

  } catch (error) {
    console.error("Error", error);
  }
};

exports.count_jobopen_status = async (reqbody) => {
  try {
    let from_date = '';
    let to_date = '';
    let daterange = reqbody.dateRange;
    let bdm_id = reqbody.bdm_id;
    let recruiter_id = reqbody.recruiter_id;
    let status = reqbody.status;
    let freelance_id = reqbody.freelance_id;

    if (daterange != undefined && daterange != '' && daterange.length > 0) {
      from_date = daterange[0];
      to_date = daterange[1];
    }

    let dateFilterConditions = {};
    if (
      from_date != undefined &&
      to_date != undefined &&
      from_date != "" &&
      to_date != ""
    ) {
      dateFilterConditions = {
        deleted: false,
        status: { $ne: "" },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      dateFilterConditions = { deleted: false, status: { $ne: "" } };
    }

    if (status) {
      dateFilterConditions.status = status;
    }

    //Active Job
    let JobCountStatus = {};
    const cntjobsStatus = await JobOpeningModel.aggregate([
      {
        $match: dateFilterConditions,
      },

      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    if (cntjobsStatus) {
      for (job of cntjobsStatus) {
        JobCountStatus[job._id] = job.count;
      }
    }

    //Candidate
    let candidateDateFilterConditions = {};
    if (
      from_date != undefined &&
      to_date != undefined &&
      from_date != "" &&
      to_date != ""
    ) {
      candidateDateFilterConditions = {
        deleted: false,
        candidate_id: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      candidateDateFilterConditions = {
        deleted: false,
        candidate_id: { $ne: null },
      };
    }

    if (bdm_id) {
      candidateDateFilterConditions.bdm_id = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      candidateDateFilterConditions.recruiter_id = mongoose.Types.ObjectId(recruiter_id);
    }

    if (status) {
      candidateDateFilterConditions.submission_status = status;
    }

    if (freelance_id) {
      candidateDateFilterConditions.freelancer_recruiter_id = mongoose.Types.ObjectId(freelance_id);
    }

    let candidateJobCount = {};
    const cntjobsCandidateStatus = await SubmissionModel.aggregate([
      {
        //  $match: { 'deleted' : false,candidate_id: { $ne: null }  }},
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
        //  bdm_id: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      BdmDateFilterConditions = { deleted: false };
    }

    if (bdm_id) {
      BdmDateFilterConditions.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      BdmDateFilterConditions.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
    }

    if (freelance_id) {
      BdmDateFilterConditions.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
    }

    if (status) {
      BdmDateFilterConditions.status = status;
    }
    let bdmJobCount = {};
    const cntjobsBDMStatus = await JobOpeningModel.aggregate([
      {
        //$match: { 'deleted' : false,bdm_id: { $ne: null }  }},
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

    // Recruiter
    let recruiterDateFilterConditions = {};
    if (
      from_date != undefined &&
      to_date != undefined &&
      from_date != "" &&
      to_date != ""
    ) {
      recruiterDateFilterConditions = {
        deleted: false,
        //   assigned_recruiter: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      recruiterDateFilterConditions = {
        deleted: false,
        // assigned_recruiter: { $ne: null },
      };
    }

    if (bdm_id) {
      recruiterDateFilterConditions.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      recruiterDateFilterConditions.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
    }

    if (freelance_id) {
      recruiterDateFilterConditions.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
    }

    if (status) {
      recruiterDateFilterConditions.status = status;
    }
    let recruiterJobCount = {};
    const cntjobsrecruiterStatus = await JobOpeningModel.aggregate([
      {
        $match: recruiterDateFilterConditions,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    if (cntjobsrecruiterStatus) {
      for (job of cntjobsrecruiterStatus) {
        recruiterJobCount[job._id] = job.count;
      }
    }

    //freelancer
    let freelancerDateFilterConditions = {};
    if (
      from_date != undefined &&
      to_date != undefined &&
      from_date != "" &&
      to_date != ""
    ) {
      freelancerDateFilterConditions = {
        deleted: false,
        // assigned_freelancer: { $ne: null },
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      freelancerDateFilterConditions = {
        deleted: false,
        //      assigned_freelancer: { $ne: null },
      };
    }

    if (bdm_id) {
      freelancerDateFilterConditions.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    }

    if (recruiter_id) {
      freelancerDateFilterConditions.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
    }

    if (freelance_id) {
      freelancerDateFilterConditions.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
    }

    if (status) {
      freelancerDateFilterConditions.status = status;
    }
    let freelanceJobCount = {};
    const cntjobsfreelancerStatus = await JobOpeningModel.aggregate([
      {
        $match: freelancerDateFilterConditions,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    if (cntjobsfreelancerStatus) {
      for (job of cntjobsfreelancerStatus) {
        freelanceJobCount[job._id] = job.count;
      }
    }


    return {
      JobCountStatus,
      candidateJobCount,
      bdmJobCount,
      recruiterJobCount,
      freelanceJobCount
    };
  } catch (error) {
    console.error("Error", error);
  }
};

exports.company_list = async () => {
  try {
    const company_listing = await CompanyModel.find({ deleted: false });
    return { company_list: company_listing };
  } catch (error) {
    console.log(error);
  }
};

exports.company_listing_by_companyId = async (reqbody) => {
  try {
    let offset =
      parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 5;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let companyCode = reqbody.companyCode;
    let company_id = reqbody.company_id;

    let sortJson = {};

    if (sort_order == "asc") {
      sortJson[order_column] = 1;
    } else {
      sortJson[order_column] = -1;
    }

    let filter_condition = {};

    if (filter_value != "") {
      var searchString = new RegExp(filter_value, "i");

      // filter_condition = { $or: [{'account_name':searchString}] };

      // console.log("searchString",searchString)
      filter_condition["$or"] = [
        { category: { $regex: searchString } },
        //   { profile_strength: { $regex: searchString } },
      ];
    }

    if (companyCode != "") {
      filter_condition.company_code = companyCode;
    }

    let totalRecords = await CompanyModel.countDocuments({ deleted: false });
    let candidateList = [];
    let checkCanId = [];
    let company_list = await CompanyModel.aggregate([
      { $match: { deleted: false, "_id": mongoose.Types.ObjectId(reqbody.company_id) } },
      {
        $lookup: {
          from: "jobopenings",
          let: { account_name: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$account_name",
                        mongoose.Types.ObjectId(reqbody.company_id),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "job_opening",
        },

      },
      /* { $lookup: {
               from: "users",
               localField: "job_opening.assigned_bdm",
               foreignField: "_id",
               as: "assigned_bdm",
           },
       },
       { $unwind: { path: "$assigned_bdm", preserveNullAndEmptyArrays: true } },
       { $lookup: {
               from: "users",
               localField: "job_opening.assigned_recruiter",
               foreignField: "_id",
               as: "assigned_recruiter",
           },
       },
       { $unwind: { path: "$assigned_recruiter", preserveNullAndEmptyArrays: true } },*/

      {
        $lookup: {
          from: "contacts",
          localField: "job_opening.contact_name",
          foreignField: "_id",
          as: "contact_name",
        },
      },

      { $match: filter_condition },
      { $sort: sortJson },

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
    ]);

    let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

    var data = {
      totalRecords: totalRecords,
      totalPages: total_pages,
      //filteredRecords: candidate_list[0].totalCount,
      company_listing: company_list[0].paginatedResults,
    };

    return data;
  } catch (error) {
    console.error("Error : ", error);
  }
};