const EmailActivity = require("./emailactivity.model")

exports.getList = async (user) => {
    // after wards fetched by id but fro now
    try {
        return await EmailActivity.find({ user_id: user._id });
    }
    catch {
        return false;
    }
}


exports.updateActivity = async (id, reqbody) => {
    try {
        return await EmailActivity.updateOne({ _id: id }, reqbody);
    }
    catch {
        return false;
    }
}