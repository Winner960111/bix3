const niv = require('node-input-validator');
const mongoose = require('mongoose');

niv.extend('unique', async ({ value, args }) => {
    // default field is email in this example
    const field = args[1] || 'email';

    let condition = {};

    condition[field] = value;

    // add ignore condition
    if (args[2]) {
        condition['_id'] = { $ne: args[2] };
        condition['deleted'] = { $ne: true };
    }

    try {
        let emailExist = await mongoose.model(args[0]).findOne(condition).select(field);
        // email already exists
        if (emailExist) return false;
        else return true
    } catch (error) {
        throw error
    }
});

niv.extend('exists', async ({ value, args }) => {
    // default field is email in this example
    const field = args[1] || '_id';

    let condition = {};

    condition[field] = value;
    try {
        if (!value) return true
        let recordExist = await mongoose.model(args[0]).findOne(condition);
        if (recordExist) return true;
        else return false;
    } catch (error) {
        throw error
    }
});

niv.extend('onlyAlphaNumeric', async ({ value, args }) => {
    if (value) {
        if (/^[a-zA-Z0-9]+$/i.test(value)) {
            return true;
        }
        else {
            return false;
        }
    }
});


module.exports = niv;