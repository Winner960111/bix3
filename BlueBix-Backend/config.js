const config = {
    roles: ['admin', "bdm", "recruiter", "freelancerecruiter", "candidate"],
    validateLength: {
        minSLength: 3,
        maxSLength: 100,
        minPhoneLength: 5,
        maxPhoneLength: 20,
        minPwdLength: 6,
        maxPwdLength: 8,
    }
};

module.exports = config;
