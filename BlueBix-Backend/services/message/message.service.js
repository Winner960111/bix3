const messageModel = require("./message.model");
const mongoose = require("mongoose");
/*
 *  Create message
 */
exports.save = async (reqbody) => {
  try {
    let messageData = {};
    (messageData.title = reqbody.title),
      (messageData.message = reqbody.message),
      (messageData.candidate_id = reqbody.candidate_id),
      (messageData.company_id = reqbody.company_id),
      (messageData.opening_id = reqbody.opening_id),
      (messageData.user_id = reqbody.user_id),
      (messageData.contact_id = reqbody.contact_id);
    messageData.user_role = reqbody.user_role;
    messageData.created_at = Date.now();
    messageData.updated_at = Date.now();

    return await messageModel.create(messageData);
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.message_listing = async (reqbody) => {
  try {
    let offset =
      parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 5;
    let order_column = reqbody.order || "created_at";
    let sort_order = reqbody.order_direction || "desc";
    let filter_value = reqbody.search;
    let candidate_id = reqbody.candidate_id;
    let company_id = reqbody.company_id;
    let opening_id = reqbody.opening_id;
    let user_id = reqbody.user_id;
    let contact_id = reqbody.contact_id;
    let role = reqbody.role;

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
        { message: { $regex: searchString } },
        { user_role: { $regex: searchString } },
        { title: { $regex: searchString } },
      ];
    }
    if (candidate_id != "" && candidate_id != undefined) {
      filter_condition.candidate_id = mongoose.Types.ObjectId(candidate_id);
    }
    if (company_id != "" && company_id != undefined) {
      filter_condition.company_id = mongoose.Types.ObjectId(company_id);
    }
    if (opening_id != "" && opening_id != undefined) {
      filter_condition.opening_id = opening_id;
    }
    if (role !== 'bdm')
      if (user_id != "" && user_id != undefined) {
        filter_condition.user_id = mongoose.Types.ObjectId(user_id);
      }
    if (contact_id != "" && contact_id != undefined) {
      filter_condition.contact_id = mongoose.Types.ObjectId(contact_id);
    }

    let message_list = await messageModel.aggregate([
      { $match: { deleted: false } },

      { $match: filter_condition },
      { $sort: sortJson },
      {
        $facet: {
          totalCount: [{
            $group: { _id: null, count: { $sum: 1 } }
          }],
          data: [
            { $skip: Number(offset) },
            { $limit: Number(limit) },
          ],
        }
      },
      {
        $project: {
          totalRecords: { $first: '$totalCount.count' },
          paginatedResults: '$data'
        }
      }
    ]);

    let total_pages = Math.ceil(parseInt(message_list[0].totalRecords) / parseInt(limit));

    const data = {
      totalPages: total_pages,
      totalRecords: message_list[0].totalRecords,
      filteredRecords: message_list[0].totalCount,
      message_listing: message_list[0].paginatedResults,
    };
    return data;
  } catch (error) {
    console.error("Error 11: ", error);
  }
};

exports.updateReadMessageFlag = async (reqBody) => {
  try {
    const { user_id, candidate_id, company_id, contact_id } = reqBody;
    if (user_id) {
      const updateuserMessageFlag = await messageModel.updateMany(
        { user_id },
        { $set: { is_view_message_user: 0 } }
      );
      return updateuserMessageFlag;
    }
    if (candidate_id) {
      const updateCandidateMessageFlag = await messageModel.updateMany(
        { candidate_id },
        { $set: { is_view_message_candidate: 0 } }
      );
      return updateCandidateMessageFlag;
    }
    if (company_id) {
      const updateCompanyMessageFlag = await messageModel.updateMany(
        { company_id },
        { $set: { is_view_message_company: 0 } }
      );
      return updateCompanyMessageFlag;
    }
    if (contact_id) {
      const updateContactMessageFlag = await messageModel.updateMany(
        { user_id },
        { $set: { is_view_message_contact: 0 } }
      );
      return updateContactMessageFlag;
    }
  } catch (error) {
    console.error("Error : ", error);
  }
};

exports.counter = async (reqBody) => {
  try {
    const { user_id, candidate_id, company_id, contact_id } = reqBody;
    if (user_id) {
      const countUserMessageFlag = await messageModel
        .find({ user_id, is_view_message_user: 1 })
        .count();
      return countUserMessageFlag;
    }
    if (candidate_id) {
      const countCandidateMessageFlag = await messageModel
        .find({ candidate_id, is_view_message_candidate: 1 })
        .count();
      return countCandidateMessageFlag;
    }
    if (company_id) {
      const countCompanyMessageFlag = await messageModel
        .find({ company_id, is_view_message_company: 1 })
        .count();
      return countCompanyMessageFlag;
    }
    if (contact_id) {
      const countContactMessageFlag = await messageModel
        .find({ contact_id, is_view_message_contact: 1 })
        .count();
      return countContactMessageFlag;
    }
  } catch (error) {
    console.error("Error : ", error);
  }
};
