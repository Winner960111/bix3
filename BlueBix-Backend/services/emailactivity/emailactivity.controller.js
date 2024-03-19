const emailActivityServices = require("./emailactivity.services");
const { commonResponse } = require("../../helper");

exports.getList = async (req, res, next) => {

    const list = await emailActivityServices.getList(req.user);

    if (list) {
        commonResponse.success(res, 200, list, "Email Template Details");
    } else {
        commonResponse.customResponse(res, "SERVER_ERROR", 400, email_template_details, "Something went wrong, Please try again");
    }
}


exports.updateActivity = async (req, res, next) => {

    const result = await emailActivityServices.updateActivity(req.params.id, req.body);
    if (result) {
        commonResponse.success(res, 200, result, "Update Email Notification Activity");
    } else {
        commonResponse.customResponse(res, "SERVER_ERROR", 400, result, "Something went wrong, Please try again");
    }
}

// exports.setDummy = async (req, res) => {

//     const ress = await EmailActivity.insertMany([

//         {
//             user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//             email_type: "job_created",
//             description: "On New Job Creation",
//             status: true
//         },

//         {
//             user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//             email_type: "job_requested",
//             description: "On New Job Request",
//             status: false
//         },

//         {
//             user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//             email_type: "client_assigned",
//             description: "On Client Assignment",
//             status: true

//         }

//     ]);


//     res.send(ress)
// }


// {
//     user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//         email_type: "job_created",
//             description: "On New Job Creation",
//                 status: true
// },

// {
//     user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//         email_type: "job_requested",
//             description: "On New Job Request",
//                 status: false
// },

// {
//     user_id: mongoose.Types.ObjectId('60bf0fe47c98c11b8f605106'),
//         email_type: "client_assigned",
//             description: "On Client Assignment",
//                 status: true

// }