const { commonFunctions } = require("../../helper");
const jobworkModel = require("./jobwork.model");
const UsersModel = require("../users/users.model");
const UserModel = require("../users/users.model");
const JobOpeningModel = require("../jobopening/jobopening.model");
const FreelanceSubmissionModel = require("../jobopening/submission.model");

const isEmpty = require("../../validations/is-empty");
const fs = require("fs");
const mime = require("mime");
const fse = require("fs-extra");
const mongoose = require("mongoose");
const moment = require("moment");
const RoleModel = require("../roles/roles.model");
const JobActivityModel = require("../jobopening/jobactivity.model");
const MessageModel = require("../message/message.model");
const BdmAssignment = require("../jobopening/bdmassignment.model");
/*
 *  Send request for job work
 */
exports.save = async (reqbody) => {
  try {

    let jobwork = {};
    jobwork.freelance_id = reqbody.freelance_id;
    jobwork.opening_id = reqbody.opening_id;
    jobwork.bdm_id = reqbody.bdm_id;
    jobwork.job_id = reqbody.job_id;
    jobwork.job_work_status = reqbody.job_work_status;
    jobwork.status = reqbody.status;
    jobwork.note = reqbody.note;
    jobwork.created_at = Date.now();
    jobwork.updated_at = Date.now();

    return await jobworkModel.create(jobwork);
  } catch (error) {
    console.error("Error : ", error);
  }
};

/*
 *  Check Request Exist
 */
exports.is_exist_request = async (reqbody) => {
  try {
    let freelance_id = reqbody.freelance_id;
    let opening_id = reqbody.opening_id;
    let bdm_id = reqbody.bdm_id;

    let jobwork = await jobworkModel
      .findOne({
        freelance_id: freelance_id,
        opening_id: opening_id,
        bdm_id: bdm_id,
      })
      .lean();
    if (!jobwork) {
      return false;
    }
    return jobwork;
  } catch (error) {
    console.error("Error : ", error);
  }
};

/*
 *  Find BDM random
 */
exports.find_bdm = async (reqbody) => {
  try {
    let checkReqCountArray = [];
    let minJobAssign = [];
    let bdm_role_id = await RoleModel.findOne(
      { role_name: "bdm" },
      { role_name: 1 }
    ).lean();
    const user_list = await UsersModel.find({ assigned_role: bdm_role_id._id }).lean();

    if (user_list) {
      let smallest = 0;
      for (const user of user_list) {
        var id = mongoose.Types.ObjectId(user._id);
        let countData = await jobworkModel.find({ bdm_id: id }).lean();
        let count = countData.length;
        if (countData) {
          checkReqCountArray[user._id] = count;
        } else {
          checkReqCountArray[user._id] = count;
        }
        if (count == 0) {
          minJobAssign["email"] = user.email;
          minJobAssign["mdm_id"] = id;
          return minJobAssign;
        } else {
          if (count > 0) {
            if (smallest == 0) {
              smallest = count;

              minJobAssign["email"] = user.email;
              minJobAssign["mdm_id"] = id;
            } else {
              if (count < smallest) {

                minJobAssign["email"] = user.email;
                minJobAssign["mdm_id"] = id;

              }
            }
          } else {
            smallest = count;
          }
        }
      }
    }

    if (!minJobAssign) {
      return false;
    }
    return minJobAssign;
  } catch (error) {
    console.error("Error get: ", error);
  }
};

/*
 *  User Profile Details By Id
 */
exports.get = async (id) => {
  try {
    let user_profile_details = await jobworkModel
      .findOne(
        { _id: id },
        {
          created_at: 0,
          updated_at: 0,
        }
      )
      .populate("reporting_manager assigned_role", "display_name role_name")
      .lean();

    if (!user_profile_details) {
      return false;
    }
    return user_profile_details;
  } catch (error) {
    console.error("Error get: ", error);
  }
};

exports.job_listing_old = async (reqbody) => {
  try {
    let job_list = await JobOpeningModel.aggregate([
      {
        $lookup: {
          from: "jobworkapplications",
          localField: "_id",
          foreignField: "opening_id",
          as: "jobworkapplications",
        },
      },
    ]);
    job_list.map((jobList) => {
      jobList.jobworkapplications = jobList.jobworkapplications[0];
    });
    if (!job_list) {
      return false;
    }
    return job_list;
  } catch (error) {
    console.error("Error 11: ", error);
  }
};

exports.job_listing = async (reqbody) => {
  try {
    let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 5;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let categories = reqbody.categories;
    let salary = reqbody.salary;
    let jobdescription = reqbody.jobdescription;
    let experience = reqbody.experience;
    let freelance_id = reqbody.freelance_id;
    let location = reqbody.location;

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

      filter_condition["$or"] = [
        { required_skills: { $regex: searchString } },
        { profile_strength: { $regex: searchString } },
        { account_name: { $regex: searchString } },
        { opening_title: { $regex: searchString } },
      ];
    }

    let sal_range_from, sal_range_to;

    if (salary != undefined && salary.length != 0) {

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

    if (experience != "") {
      filter_condition.required_experience = parseInt(experience);
    }
    if (jobdescription != "") {
      filter_condition.job_description = jobdescription;
    }
    if (categories != "") {
      filter_condition.category = { "$in": categories };
    }
    if (location != "") {
      filter_condition.city = { "$in": location };
    }


    //let totalRecords = await JobOpeningModel.countDocuments({ deleted: false });
    // let totalRecords2 = await JobOpeningModel.aggregate([
    //   {
    //     $match: filter_condition
    //   }
    // ]);

    const bdmAssignment = await BdmAssignment.find({ deleted: false, assigned_bdm: { $exists: true, $ne: [] } }, { opening_id: 1 });

    const openingsIds = bdmAssignment.map(item => item.opening_id);

    let totalRecords = await JobOpeningModel.aggregate([
      { $match: { deleted: false, opening_id: { $in: openingsIds } } },
      {
        $lookup: {
          from: "jobworkapplications",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$freelance_id", mongoose.Types.ObjectId(freelance_id)] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "jobworkapplications",
        },
      },
      {

        $lookup: {
          from: "bdm_assignments",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              }
            }
          ],
          as: "bdmassignment"
        }



      },
      // {
      //   $lookup: {
      //     from: "users",
      //     let: { assigned_bdm: "$bdmassignment.assigned_bdm" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$_id", "$$assigned_bdm"] },
      //               { $eq: ["$deleted", false] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: "assigned_bdm",
      //   },
      // },

      // { "$match": { "bdmassignment.assigned_bdm": { $exists: true, $ne: [] } } },
      // {
      //   $unwind: {
      //     path: "$assigned_bdm",
      //     preserveNullAndEmptyArrays: true,
      //   },

      // },
      { $match: filter_condition },
      { $sort: sortJson }
    ]);

    totalRecords = totalRecords.length;

    let job_list = await JobOpeningModel.aggregate([
      { $match: { deleted: false, opening_id: { $in: openingsIds } } },
      {
        $lookup: {
          from: "jobworkapplications",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$freelance_id", mongoose.Types.ObjectId(freelance_id)] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "jobworkapplications",
        },
      },
      {
        $lookup: {
          from: "bdm_assignments",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              }
            }
          ],
          as: "assigned_bdm"
        }
      },
      // { "$match": { "assigned_bdm": { $exists: true, $ne: [] } } },
      // {
      //   $unwind: {
      //     path: "$assigned_bdm",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $project: {
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
          number_of_openings: 1,
          interview_type: 1,
          project_start_date: 1,
          project_close_date: 1,
          attachments: 1,
          employment_type: 1,
          experience_level: 1,
          country: 1,
          state: 1,
          city: 1,
          zip_code: 1,
          notes: 1,
          user: 1,
          bill_rate: 1,
          bill_currency: 1,
          bill_type: 1,
          pay_rate: 1,
          pay_currency: 1,
          pay_type: 1,
          account_owner: 1,
          end_client: 1,
          assign_more_recruits: 1,
          account_primary_recruit: 1,
          security_clearance: 1,
          local_indicator: 1,
          position_type: 1,
          role: 1,
          assigned_recruiter: 1,
          assigned_freelancer: 1,
          sub_category: 1,
          created_by: 1,
          updated_by: 1,
          created_at: 1,
          updated_at: 1,
          "assigned_bdm.assigned_bdm": 1,
          jobworkapplications: {
            $arrayElemAt: ["$jobworkapplications", 0],
          },
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
      filteredRecords: job_list[0].totalCount,
      job_opening_listing: job_list[0].paginatedResults,
    };

    return data;
  } catch (error) {
    console.error("Error 11: ", error);
  }
};

/*
*  Check User Exist
*/
exports.is_exist_job_work = async (id) => {
  try {
    let job_work_exist = await jobworkModel.findOne({ _id: id }).lean();
    if (!job_work_exist) {
      return false;
    }
    return job_work_exist;
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.update = async (id, reqbody, user) => {

  try {

    let findRec = await jobworkModel.findOne({ _id: id }).lean();
    let update_job_work = {};

    update_job_work.job_work_status = reqbody.job_work_status;
    update_job_work.updated_at = Date.now();
    update_job_work.updated_by = user;

    if (findRec && reqbody.job_work_status === "Approve") {
      let job_activity_log = {
        opening_id: findRec.opening_id,
        created_at: Date.now(),
        updated_at: Date.now(),
        created_by: user,
        updated_by: user,
      };
      let job_opening_assign = {
        updated_at: Date.now(),
        updated_by: user,
      };

      job_opening_assign.assigned_freelancer = findRec.freelance_id;

      //job opening activity log
      let freelancer_name = await UserModel.findOne(
        { _id: findRec.freelance_id },
        { display_name: 1 }
      );
      job_activity_log.freelance_id = findRec.freelance_id;
      job_activity_log.activity_log = `Opening Assign to Freelance - ${freelancer_name.display_name}`;

      let bdmassignmnet = await BdmAssignment.updateOne({ opening_id: findRec.opening_id, created_by: user }, job_opening_assign, { upsert: true });
      let job_activity_log_create = await JobActivityModel.create(
        job_activity_log
      );

      //Save Messages
      const messageData = new MessageModel({
        title: "Opening Assign",
        message: `Opening Assign to Freelance -  ${freelancer_name.display_name}`,
        opening_id: findRec.opening_id,
        user_id: user,
      });
      let message_create = await messageData.save();
    }

    if ((findRec) && reqbody.job_work_status === "Reject") {
      let job_activity_log = {
        opening_id: findRec.opening_id,
        created_at: Date.now(),
        updated_at: Date.now(),
        created_by: user,
        updated_by: user,
      };

      let job_opening_assign = {
        updated_at: Date.now(),
        updated_by: user,
        $unset: { assigned_freelancer: "" }
      };
      //job_opening_assign.assigned_freelancer = null;

      //job opening activity log
      let freelancer_name = await UserModel.findOne(
        { _id: findRec.freelance_id },
        { display_name: 1 }
      );
      job_activity_log.freelance_id = findRec.freelance_id;
      job_activity_log.activity_log = `Opening Unassign to Freelance - ${freelancer_name.display_name}`;

      let job_activity_log_create = await JobActivityModel.create(
        job_activity_log
      );

      let bdmassignmnet = await BdmAssignment.deleteOne({ opening_id: findRec.opening_id, created_by: user });
      //Save Messages
      const messageData = new MessageModel({
        title: "Opening Unassign",
        message: `Opening Unassign to Freelance -  ${freelancer_name.display_name}`,
        opening_id: findRec.opening_id,
        user_id: user,
      });
      let message_create = await messageData.save();

    }

    return await jobworkModel.updateOne({ _id: id }, update_job_work).lean();
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.freelancer_submission = async (reqbody) => {
  try {
    let freelancer_submit_data = {};
    freelancer_submit_data.opening_id = reqbody.opening_id;
    freelancer_submit_data.freelancer_id = reqbody.freelancer_id;
    freelancer_submit_data.candidate_id = reqbody.candidate_id;
    freelancer_submit_data.job_work_application_id = reqbody.job_work_application_id;
    freelancer_submit_data.submission_status = reqbody.submission_status;
    freelancer_submit_data.created_at = Date.now();
    freelancer_submit_data.updated_at = Date.now();

    let freelancer_submission_create = await FreelanceSubmissionModel.create(freelancer_submit_data);
    return { freelancer_submission: freelancer_submission_create };
  } catch (error) {
    console.log(error);
  }
}

exports.list_job_work_applications = async (reqbody) => {
  try {
    let offset =
      parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 5;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let bdmId = reqbody.bdmId;
    let freelanceId = reqbody.freelanceId;
    let openingId = reqbody.openingId;

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

      filter_condition["$or"] = [{ job_work_status: { $regex: searchString } }];
    }

    if (bdmId != "" && bdmId !== undefined) {
      filter_condition.bdm_id = { $in: [mongoose.Types.ObjectId(bdmId)] };
    }
    if (freelanceId != "") {
      //   filter_condition.freelance_id = mongoose.Types.ObjectId(freelanceId);
    }
    if (openingId != "") {
      // filter_condition.opening_id = mongoose.Types.ObjectId(openingId);
    }

    //let totalRecords = await jobworkModel.countDocuments({ deleted: false });
    let totalRecords = await jobworkModel.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "users",
          localField: "freelance_id",
          foreignField: "_id",
          as: "freelance",
        },
      },
      {
        $lookup: {
          from: "jobopenings",
          localField: "opening_id",
          foreignField: "opening_id",
          as: "jobopenings",
        },
      },
      { $match: filter_condition },
      { $sort: sortJson },
    ]);

    totalRecords = totalRecords.length;

    let job_work_application_list = await jobworkModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "freelance_id",
          foreignField: "_id",
          as: "freelance",
        },
      },
      {
        $lookup: {
          from: "jobopenings",
          localField: "opening_id",
          foreignField: "opening_id",
          as: "jobopenings",
        },
      },
      {
        $project: {
          _id: 1,
          freelance_id: 1,
          bdm_id: 1,
          opening_id: 1,
          status: 1,
          job_work_status: 1,
          note: 1,
          deleted: 1,
          deleted_by: 1,
          updated_by: 1,
          created_at: 1,
          updated_at: 1,
          freelancer: {
            $arrayElemAt: ["$freelance", 0],
          },
          jobopening: {
            $arrayElemAt: ["$jobopenings", 0],
          },
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
      filteredRecords: job_work_application_list[0].totalCount,
      job_work_application_listing:
        job_work_application_list[0].paginatedResults,
    };
    return data;
  } catch (error) {
    console.log(error);
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
    let freelance_id = reqbody.freelance_id;
    let opening_id = reqbody.opening_id;
    let opening_title = reqbody.opening_title;


    if (daterange != undefined && daterange != '' && daterange.length > 0) {
      from_date = daterange[0];
      to_date = daterange[1];
    }
    let searchStr = { deleted: false };


    //Freelance
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
    } else {
      BdmDateFilterConditions = { deleted: false };
    }

    if (status) {
      BdmDateFilterConditions.status = status;
    }
    if (opening_id) {
      BdmDateFilterConditions.opening_id = opening_id;
    }
    if (opening_title) {
      BdmDateFilterConditions.opening_title = opening_title;
    }
    // if (bdm_id) {
    //   BdmDateFilterConditions.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    // }
    // if (recruiter_id) {
    //   BdmDateFilterConditions.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
    // }
    if (company_id) {
      BdmDateFilterConditions.account_name = mongoose.Types.ObjectId(company_id);
    }

    let assignedObj = {};

    if (id) {
      assignedObj.assigned_freelancer = { $in: [id] };
    }
    else if (freelance_id) {
      assignedObj.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
    }

    let openingIds = await BdmAssignment.find({ $and: [{ deleted: false, assigned_freelancer: { $exists: true, $ne: [] } }, assignedObj] }, { opening_id: 1 });
    assignedOpeningIds = openingIds.map(item => item.opening_id);
    BdmDateFilterConditions.opening_id = { $in: assignedOpeningIds };

    let freelanceJobCount = {};
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
        freelanceJobCount[job._id] = job.count;
      }
    }

    return {
      freelanceJobCount,

    };
  } catch (error) {
    console.error("Error", error);
  }
};

exports.jobopen_status = async (reqbody) => {
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
    let freelance_id = reqbody.freelance_id;
    let opening_id = reqbody.opening_id;
    let opening_title = reqbody.opening_title;

    if (daterange != undefined && daterange != '' && daterange.length > 0) {
      from_date = daterange[0];
      to_date = daterange[1];
    }

    //Freelance
    let freelanceJobsFilter = {};
    if (
      from_date != undefined &&
      to_date != undefined &&
      from_date != "" &&
      to_date != ""
    ) {
      freelanceJobsFilter = {
        deleted: false,
        created_at: { $gte: new Date(from_date), $lt: new Date(to_date) },
      };
    } else {
      freelanceJobsFilter = { deleted: false };
    }

    if (status) {
      freelanceJobsFilter.status = status;
    }
    if (opening_id) {
      freelanceJobsFilter.opening_id = opening_id;
    }
    if (opening_title) {
      freelanceJobsFilter.opening_title = opening_title;
    }
    // if (bdm_id) {
    //   freelanceJobsFilter.assigned_bdm = mongoose.Types.ObjectId(bdm_id);
    // }
    // if (recruiter_id) {
    //   freelanceJobsFilter.assigned_recruiter = mongoose.Types.ObjectId(recruiter_id);
    // }
    if (company_id) {
      freelanceJobsFilter.account_name = mongoose.Types.ObjectId(company_id);
    }

    let assignedObj = {};

    if (id) {
      assignedObj.assigned_freelancer = { $in: [id] };
    }
    else if (freelance_id) {
      assignedObj.assigned_freelancer = mongoose.Types.ObjectId(freelance_id);
    }

    let openingIds = await BdmAssignment.find({ $and: [{ deleted: false, assigned_freelancer: { $exists: true, $ne: [] } }, assignedObj] }, { opening_id: 1 });

    assignedOpeningIds = openingIds.map(item => item.opening_id);
    freelanceJobsFilter.opening_id = { $in: assignedOpeningIds };

    const jobsFreelanceStatus = await JobOpeningModel.aggregate([
      {
        $match: freelanceJobsFilter,
      }
    ]);

    return {
      job_opening_listing: jobsFreelanceStatus
    }
  } catch (error) {
    console.error("Error", error);
  }
};

exports.approve_job_opening = async (reqbody) => {
  try {
    let offset =
      parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 5;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let categories = reqbody.categories;
    let salary = reqbody.salary;
    let jobdescription = reqbody.jobdescription;
    let experience = reqbody.experience;
    let freelance_id = reqbody.freelance_id;

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

      filter_condition["$or"] = [
        { required_skills: { $regex: searchString } },
        { profile_strength: { $regex: searchString } },
        { account_name: { $regex: searchString } },
      ];
    }

    if (salary != undefined && salary.length != 0) {
      filter_condition.salary_range = {
        $in: salary.map(function (salary) {
          return salary;
        }),
      };
    }
    if (experience != "") {
      filter_condition.required_experience = parseInt(experience);
    }
    if (jobdescription != "") {
      filter_condition.job_description = jobdescription;
    }
    if (categories != "") {
      filter_condition.category = categories;
    }

    // let totalRecords = await JobOpeningModel.countDocuments({ deleted: false });
    let totalRecords = await JobOpeningModel.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "jobworkapplications",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$job_work_status", 'Approve'] },
                    { $eq: ["$deleted", false] },
                    { $eq: ["$freelance_id", mongoose.Types.ObjectId(freelance_id)] },
                  ],
                },
              },
            },
          ],
          as: "jobworkapplications",
        },
      },
      { "$match": { "jobworkapplications": { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: "users",
          let: { assigned_bdm: "$assigned_bdm" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$assigned_bdm"] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "assigned_bdm",
        },
      },
      { "$match": { "assigned_bdm": { $exists: true, $ne: [] } } },
      {
        $unwind: {
          path: "$assigned_bdm",
          preserveNullAndEmptyArrays: true,
        },

      },

      { $match: filter_condition },
      { $sort: sortJson }]);
    totalRecords = totalRecords.length;

    let job_list = await JobOpeningModel.aggregate([
      { $match: { deleted: false } },
      /* {
            $lookup: {
                from: "jobworkapplications",
                localField: "opening_id",
                foreignField: "opening_id",
                as: "jobworkapplications",
            },
        },*/
      {
        $lookup: {
          from: "jobworkapplications",
          let: { opening_id: "$opening_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$opening_id", "$$opening_id"] },
                    { $eq: ["$job_work_status", 'Approve'] },
                    { $eq: ["$deleted", false] },
                    { $eq: ["$freelance_id", mongoose.Types.ObjectId(freelance_id)] },
                  ],
                },
              },
            },
          ],
          as: "jobworkapplications",
        },
      },
      { "$match": { "jobworkapplications": { $exists: true, $ne: [] } } },

      {
        $lookup: {
          from: "users",
          let: { assigned_bdm: "$assigned_bdm" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$assigned_bdm"] },
                    { $eq: ["$deleted", false] },
                  ],
                },
              },
            },
          ],
          as: "assigned_bdm",
        },
      },
      { "$match": { "assigned_bdm": { $exists: true, $ne: [] } } },
      {
        $unwind: {
          path: "$assigned_bdm",
          preserveNullAndEmptyArrays: true,
        },

      },

      {
        $project: {
          _id: 1,
          opening_title: 1,
          opening_id: 1,
          status: 1,
          required_skills: 1,
          salary_range: 1,
          required_experience: 1,
          category: 1,
          state: 1,
          city: 1,
          job_description: 1,
          short_description: 1,
          number_of_openings: 1,
          interview_type: 1,
          project_start_date: 1,
          project_close_date: 1,
          attachments: 1,
          employment_type: 1,
          experience_level: 1,
          country: 1,
          state: 1,
          city: 1,
          zip_code: 1,
          notes: 1,
          user: 1,
          bill_rate: 1,
          bill_currency: 1,
          bill_type: 1,
          pay_rate: 1,
          pay_currency: 1,
          pay_type: 1,
          account_owner: 1,
          end_client: 1,
          assign_more_recruits: 1,
          account_primary_recruit: 1,
          security_clearance: 1,
          local_indicator: 1,
          position_type: 1,
          role: 1,
          //  assigned_bdm: 1,
          assigned_recruiter: 1,
          assigned_freelancer: 1,
          sub_category: 1,
          created_by: 1,
          updated_by: 1,
          created_at: 1,
          updated_at: 1,
          "assigned_bdm._id": 1,
          "assigned_bdm.display_name": 1,
          jobworkapplications: {
            $arrayElemAt: ["$jobworkapplications", 0],
          },
          /*   assigned_bdm: {
             $arrayElemAt: ["$assigned_bdm", 0],
           },*/
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
      filteredRecords: job_list[0].totalCount,
      job_opening_listing: job_list[0].paginatedResults,
    };
    // job_list.map((jobList) => {
    //   jobList.jobworkapplications = jobList.jobworkapplications[0];
    // });
    // if (!job_list) {
    //   return false;
    // }
    return data;
  } catch (error) {
    console.error("Error 11: ", error);
  }
};