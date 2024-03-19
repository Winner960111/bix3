const { commonFunctions } = require("../../helper");
const ContactModel = require("./contact.model");
const ContactActivityModel = require("./contactactivity.model");
const mongoose = require("mongoose");
const CompanyModel = require('../company/company.model');

/*
*  Check Email Exist
*/
exports.is_exist = async (email) => {
    try {

        let user = await ContactModel.findOne({ email: email }).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Check Contact Name Exist
*/
exports.is_exist_company_name = async (company_id) => {
    try {


        let exist_company_name = await ContactModel.findOne({ company_id: company_id }).lean();
        // let exist_company_name = await CompanyModel.findOne({$or:[ {company_name:reqbody.company_name}, {contact_person_name:reqbody.contact_person_name}, {contact_person_email:reqbody.contact_person_email},{company_code:reqbody.company_code} ]}).lean();
        if (!exist_company_name) {
            return false;
        }
        return exist_company_name;
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  Check Email Exist And Role
*/
exports.is_exist_role = async (email_1) => {
    try {
        let user = await CompanyModel.findOne({ email_1: email_1 }).lean();
        if (!user) {
            return false;
        }
        return user;
    } catch (error) {
        console.error("Error in exist role : ", error);
    }
};


/*
*  Create New Contact
*/
exports.save = async (reqbody, user) => {
    try {
        const hashpassword = await commonFunctions.hashPassword('bluebix#123');

        const user_contact = {
            company_id: reqbody.company_id,
            access: reqbody.access,
            display_name: reqbody.display_name,
            first_name: reqbody.first_name,
            last_name: reqbody.last_name,
            phone: reqbody.phone,
            user_contact: ther_phone = reqbody.other_phone || null,
            mobile: reqbody.mobile || null,
            fax: reqbody.fax || null,
            email: reqbody.email,
            alternative_email: reqbody.alternative_email || null,
            skype_id: reqbody.skype_id || null,
            twitter_id: reqbody.twitter_id || null,
            contact_status: reqbody.contact_status || null,
            category: reqbody.category || null,
            country: reqbody.country || null,
            state: reqbody.state || null,
            city: reqbody.city || null,
            street_1: reqbody.street_1 || null,
            street_2: reqbody.street_2 || null,
            zip_code: reqbody.zip_code || null,
            description: reqbody.description || null,
            password: hashpassword,
            created_at: Date.now(),
            updated_at: Date.now(),
            created_by: user._id,
            updated_by: user._id
        };

        return await ContactModel.create(user_contact);
    } catch (error) {
        console.error("Error : ", error);
    }
};



/*
*  All Contact List
*/
exports.contactlist = async (reqbody) => {
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
            searchStr = { $or: [{ first_name: regex_filter_value }, { last_name: regex_filter_value }, { company_name: regex_filter_value }, { contact_owner: regex_filter_value }] };
        } else {
            searchStr = {};
        }

        let totalRecords = await ContactModel.countDocuments({ deleted: false, company_id: mongoose.Types.ObjectId(reqbody.company_id) });

        // let filteredRecords = await CompanyModel.countDocuments({ $and: [{deleted:false},searchStr]})

        // let company_list_details = await CompanyModel.find(searchStr,{}, { 'skip': Number(offset), 'limit': Number(limit) }).sort(sortJson).lean();


        let contact_list_details = await ContactModel.aggregate([
            { $match: { deleted: false, company_id: mongoose.Types.ObjectId(reqbody.company_id) } },
            {
                $lookup:
                {
                    from: 'companies',
                    localField: 'company_id',
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            // {
            //     $unwind: {
            // 	path: "$company_owner",
            // 	"preserveNullAndEmptyArrays": true
            //    }
            // },
            // {
            //     $lookup:
            //     {
            //         from: 'users',
            //         localField: 'contact_owner',
            //         foreignField: '_id',
            //         as: 'contact_owner'
            //     }
            // },
            // 'contact_owner._id':1,'contact_owner.display_name':1,
            {
                $project: { "company_id._id": 1, "company_id.company_name": 1, first_name: 1, last_name: 1, display_name: 1, contact_status: 1, access: 1, email: 1, created_at: 1, updated_at: 1 }
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

        if (!contact_list_details) {
            return false;
        }

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // totalfilteredRecords: contact_list_details[0].totalCount,
            contact_list_details: contact_list_details[0].paginatedResults
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Contact Profile Details By Id
*/
exports.get = async (id) => {
    try {
        // let contact_profile_details = await ContactModel.findOne({ _id: id },{created_at:0,updated_at:0}).populate('company_id','company_name').lean();
        let contact_profile_details = await ContactModel.aggregate([
            { $match: { deleted: false, _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { company_id: '$company_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$company_id'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'company_id'
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

        ])

        // if (!contact_profile_details) {
        //     return false;
        // }

        return contact_profile_details;
    } catch (error) {
        console.error("Error get: ", error);

    }
};

/*
*  Check User Exist
*/
exports.is_exist_user = async (id) => {
    try {
        let user_exist = await ContactModel.findOne({ _id: id }).lean();
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
exports.update = async (id, reqbody, user) => {
    try {

        let update_contact_profile = {};

        update_contact_profile.company_name = reqbody.company_name,
            // update_contact_profile.contact_owner   = reqbody.contact_owner,
            update_contact_profile.access = reqbody.access,
            update_contact_profile.display_name = reqbody.display_name,
            update_contact_profile.first_name = reqbody.first_name,
            update_contact_profile.last_name = reqbody.last_name,
            update_contact_profile.phone = reqbody.phone,
            // update_contact_profile.other_phone     = reqbody.other_phone||null,
            update_contact_profile.mobile = reqbody.mobile || null,
            update_contact_profile.fax = reqbody.fax || null,
            update_contact_profile.email = reqbody.email,
            update_contact_profile.alternative_email = reqbody.alternative_email || null,
            update_contact_profile.skype_id = reqbody.skype_id || null,
            update_contact_profile.twitter_id = reqbody.twitter_id || null,
            update_contact_profile.contact_status = reqbody.contact_status || null,
            update_contact_profile.category = reqbody.category || null,
            update_contact_profile.country = reqbody.country || null,
            update_contact_profile.state = reqbody.state || null,
            update_contact_profile.city = reqbody.city || null,
            update_contact_profile.street_1 = reqbody.street_1 || null,
            update_contact_profile.street_2 = reqbody.street_2 || null,
            update_contact_profile.zip_code = reqbody.zip_code || null,
            update_contact_profile.description = reqbody.description || null
        update_contact_profile.updated_at = Date.now()
        update_contact_profile.updated_by = user._id

        return await ContactModel.updateOne({ _id: id }, update_contact_profile).lean();
    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
*  Delete Company Profile
*/
exports.delete = async (id) => {
    try {

        let check_user_exist = await ContactModel.findOne({ _id: id }).lean();

        if (!check_user_exist) {
            return false;
        }

        // const userUpdate = await ContactModel.updateOne({_id:id},{deleted_by:user}).lean();
        return ContactModel.removeOne({ _id: id });

    } catch (error) {
        console.error("Error : ", error);
    }
};

/*
 *   Create Contact Activity
*/
exports.create_contact_activity = async (reqbody) => {
    try {


        let contact_activity = {};

        contact_activity.company_id = reqbody.company_id,
            contact_activity.contact_id = reqbody.contact_id,
            contact_activity.module = reqbody.module,
            contact_activity.title = reqbody.title,
            contact_activity.activity_log = reqbody.description,
            contact_activity.created_at = Date.now()
        contact_activity.updated_at = Date.now()

        return await ContactActivityModel.create(contact_activity);
    } catch (error) {
        console.error("Error : ", error);
    }
};


/*
*  All Contact Activity List
*/
exports.contact_activity_list = async (reqbody) => {
    try {

        let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1)
        let limit = parseInt(reqbody.per_page) || 5
        let order_column = reqbody.order || 'created_at'
        let sort_order = reqbody.order_direction;
        let filter_value = reqbody.search;
        let contact_id = reqbody.contact_id;
        let company_id = reqbody.company_id;
        let sortJson = {};

        if (sort_order == 'asc') {
            sortJson[order_column] = 1
        } else {
            sortJson[order_column] = -1;
        }

        let searchStr = { deleted: false };
        if (filter_value != '') {
            var regex_filter_value = new RegExp(filter_value, "i")
            searchStr = { $or: [{ module: regex_filter_value }, { title: regex_filter_value }] };
        }

        if (contact_id != "") {
            searchStr.contact_id = mongoose.Types.ObjectId(contact_id)
        }

        if (company_id != "") {
            searchStr.company_id = mongoose.Types.ObjectId(company_id);
        }

        let totalRecords

        if (contact_id != "") {
            totalRecords = await ContactActivityModel.countDocuments({ deleted: false, contact_id: mongoose.Types.ObjectId(contact_id) });
        } else {
            totalRecords = await ContactActivityModel.countDocuments({ searchStr });
        }

        let contact_activity_listing = await ContactActivityModel.aggregate([
            { $match: searchStr },
            {
                $lookup:
                {
                    from: 'companies',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { company_id: '$company_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$company_id'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'company_id'
                },
            },
            {
                $lookup:
                {
                    from: 'contacts',
                    // localField: 'account_name',
                    // foreignField: '_id',
                    let: { contact_id: '$contact_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$contact_id'] },
                                        { $eq: ['$deleted', false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'contact_id'
                },
            },

            {
                $project: { "company_id._id": 1, "company_id.company_name": 1, "contact_id._id": 1, "contact_id.display_name": 1, module: 1, title: 1, activity_log: 1, created_at: 1, updated_at: 1 }
            },
            { $sort: sortJson },
            {
                $facet: {
                    paginatedResults: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                }
            }


        ])

        let total_pages = Math.ceil(parseInt(totalRecords) / parseInt(limit));

        if (!contact_activity_listing) {
            return false;
        }

        let data = {
            totalRecords: totalRecords,
            totalPages: total_pages,
            // totalfilteredRecords: contact_list_details[0].totalCount,
            contact_activity_listing: contact_activity_listing[0].paginatedResults
        }

        return data;
    } catch (error) {
        console.error("Error : ", error);
    }
};
// 6437907e09adad0969844714
exports.getBdmContactList = async (reqbody) => {
    let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 10;
    let order_column = reqbody.order || 'created_at';
    let sort_order = reqbody.order_direction;
    const bdm_id = reqbody.bdm_id;
    let sortJson = {};

    if (sort_order == 'asc') {
        sortJson[order_column] = 1
    } else {
        sortJson[order_column] = -1;
    }

    const searchStr = {};
    if (bdm_id !== '' && bdm_id !== undefined) {
        searchStr.assigned_to_bdm = { $in: [mongoose.Types.ObjectId(bdm_id)] }
    }


    console.log('searchStr', searchStr)

    const contactsList = await CompanyModel.aggregate([
        {
            $match: searchStr
        },
        {
            $lookup: {
                from: 'contacts',
                let: { company_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$deleted', false] },
                                    { $eq: ["$company_id", "$$company_id"] }
                                ]
                            }
                        },
                    },
                ],
                as: "contact",
            },
        },

        { $unwind: { path: "$contact", preserveNullAndEmptyArrays: false } },

        { $sort: { 'contact.updated_at': - 1 } },

        {
            $facet: {
                data: [{ $skip: Number(offset) }, { $limit: Number(limit) }],
                dataInfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
            }
        },

        {
            $project: {
                paginatedResults: '$data.contact',
                totalCount: { $first: '$dataInfo.count' }
            }
        }
    ]);

    return { paginatedResults: contactsList[0].paginatedResults, count: contactsList[0].totalCount }
};

exports.getAdminContactList = async (reqbody) => {
    let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
    let limit = parseInt(reqbody.per_page) || 10;
    let order_column = reqbody.order || 'created_at';
    let sort_order = reqbody.order_direction;
    let sortJson = {};

    if (sort_order == 'asc') {
        sortJson[order_column] = 1
    } else {
        sortJson[order_column] = -1;
    }

    const contactsList = await ContactModel.find({ deleted: false }).sort({ updated_at: -1 });

    const total = contactsList.length;
    if (!total) return false;

    // let contacts = [];
    // contactsList[0].contacts.forEach(elm => {
    //     contacts.push(elm.contact[0]);
    // });

    return { paginatedResults: contactsList, count: total }
};

/*
 *  Contact List for dropdown with first_name and last_name
*/
// exports.contact_profile_list = async (reqbody) => {
//     try {

//         let user_exist = await ContactModel.find({company_name:mongoose.Types.ObjectId(reqbody.company_id)},{name:{$concat:["$first_name"," ","$last_name"]}}).lean();
//         // let user_exist = await ContactModel.aggregate({$project:{newField:{$concat:["$first_name","$last_name"]}}}
//         //         //   {$match:{newField:"value"}
//         //         // } 
//         // );
//         if (!user_exist) {
//           return false;
//         }
//         return user_exist;
//     } catch (error) {
//         console.error("Error : ", error);
//     }
// };



