const RoleModel = require("./roles.model");
const { commonResponse } = require("../../helper");

/*
*  Check Role Exist
*/
exports.is_exist = async (role_name) => {
    try {
        let role_exist = await RoleModel.findOne({ role_name: role_name }).lean();
        if (!role_exist) {
            return false;
        }
        return role_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Create Role 
*/
exports.save = async (reqbody) => {
    try {
        const roleData = new RoleModel({
            role_name: reqbody.role_name,
            status: reqbody.status || 'active',
            created_at: Date.now(),
            updated_at: Date.now()
        })

        return roleData.save();
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Role Listing 
*/
exports.list = async (reqbody) => {
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
            var regex_filter_value = new RegExp(filter_value, "i")
            searchStr = { $or: [{ role_name: regex_filter_value }] };
        } else {
            searchStr = {};
        }

        let totalRecords = await RoleModel.countDocuments({ deleted: false });

        let filteredRecords = await RoleModel.countDocuments({ $and: [{ deleted: false }, searchStr] })

        let role_listing = await RoleModel.find(searchStr, {}, { 'skip': Number(offset), 'limit': Number(limit) }).sort(sortJson).lean();

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        if (!role_listing) {
            return false;
        }

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // filteredRecords : filteredRecords,
            role_listing: role_listing
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Role Details By Id
*/
exports.get = async (id) => {
    try {
        let role_details = await RoleModel.findOne({ _id: id }).lean();
        if (!role_details) {
            return false;
        }
        return role_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check Role Exist
*/
exports.is_exist_role = async (id) => {
    try {
        let role_exist = await RoleModel.findOne({ _id: id }).lean();
        if (!role_exist) {
            return false;
        }
        return role_exist;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Update Role 
*/
exports.update = async (id, reqbody) => {
    try {
        let update_role = {};

        update_role.role_name = reqbody.role_name,
            update_role.status = reqbody.status,
            update_role.updated_at = Date.now()

        return await RoleModel.updateOne({ _id: id }, update_role).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  Delete Role 
*/

exports.delete = async (id, user) => {
    try {

        let check_role_exist = await RoleModel.findOne({ _id: id }).lean();

        if (!check_role_exist) {
            return false;
        }
        // const roleUpdate = await RoleModel.updateOne({_id:id},{deleted_by:user}).lean();
        return RoleModel.removeOne({ _id: id });

    } catch (error) {
        console.error("Error : ", error);
    }
};