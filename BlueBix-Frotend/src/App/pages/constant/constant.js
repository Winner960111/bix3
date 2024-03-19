const optionsSecurity_clearance = [
  { label: "Confidential", value: "CF" },
  { label: "Dept of Homeland Security", value: "DH" },
  { label: "DoE Q or L", value: "DL" },
  { label: "Intel Agency", value: "IA" },
  { label: "Public Trust", value: "PT" },
  { label: "Secret", value: "SC" },
  { label: "Top Secret/SCI", value: "TI" },
  { label: "Top Secret", value: "TS" },
];

const optionsCurrency = [{ label: "$(USD)", value: "USD" }];

const optionsCountry = [{ label: "United States", value: "1" }];

const optionsPositionType = [
  { label: "Contract", value: "27" },
  { label: "Contract-to-Hire", value: "28" },
  { label: "Full Time", value: "4" },
  { label: "Part Time", value: "5" },
  { label: "Per Diem ", value: "26" },
];

const optionsInterviewType = [
  { label: "Face to Face", value: "fa" },
  { label: "Phone Interview", value: "pi" },
  { label: "Panel Interview", value: "pa" },
  { label: "Skype/Video interview", value: "sv" },
];

const optionsexperienceLevel = [
  { label: "Entry Level", value: "11" },
  { label: "Executive (SVP, VP, Department Head, etc)", value: "14" },
  { label: "Experienced (Non-Manager)", value: "12" },
  { label: "Manager (Manager/Supervisor of Staff)", value: "13" },
  { label: "Senior Executive (President, CFO, etc)", value: "15" },
  { label: "Student (High School)", value: "16" },
  { label: "Student (Undergraduate/Graduate)", value: "10" },
];

const optionsVisaType = [
  { label: "Afghanistan Authorized", value: "AGA" },
  { label: "Can work for any employer", value: "CE" },
  { label: "Canada Authorized", value: "CA" },
  { label: "Canadian Citizen", value: "CC" },
  { label: "CP", value: "CP" },
  { label: "Current Employer Only", value: "CEO" },
  { label: "Employment Auth. Document", value: "EAD" },
  { label: "Employment Authorization Documen", value: "ED" },
  { label: "France Authorized", value: "FRA" },
  { label: "GC-EAD", value: "GE" },
  { label: "Green Card Holder", value: "GC" },
  { label: "H1B", value: "H1" },
  { label: "Have H1", value: "HHV" },
  { label: "Ireland Authorized", value: "IRA" },
  { label: "Italy Authorized", value: "ITA" },
  { label: "Need H1", value: "NH" },
  { label: "Need H1 Visa Sponsor", value: "NV" },
  { label: "OPT", value: "OP" },
  { label: "Sponsorship Required", value: "SR" },
  { label: "TN Permit Holder", value: "TP" },
  { label: "United Kingdom Authorized", value: "UK" },
  { label: "US Authorized", value: "UA" },
  { label: "US Citizen", value: "US" },
  { label: "US Citizenship", value: "USCS" },
];

const optionEmploymentType = [
  { value: "D_PT", label: "PARTTIME" },
  { value: "D_CW", label: "CON_W2" },
  { value: "D_CHW", label: "CON_HIRE_W2" },
  { value: "D_CC", label: "CON_CORP" },
  { value: "ch", label: "Contract-to-Hire" },
  { value: "cw", label: "Contract – W2" },
  { value: "EM", label: "Employee" },
  { value: "hc", label: "Contract-to-Hire-Corp" },
  { value: "I", label: "Intern" },
  { value: "ic", label: "Independent Contractor" },
  { value: "ot", label: "Others" },
  { value: "pp", label: "Corp-to-Corp" },
  { value: "V", label: "Volunteer" },
  { value: "99", label: "Contract-to-Hire-1099" },
  { value: "fw", label: "Full time – W2" },
  { value: "hw", label: "Contract-to-Hire-W2" },
  { value: "TC", label: "Temporary / Contract" },
  { value: "S", label: "Seasonal" },
  { value: "DH", label: "Direct Hire" },
  { value: "D_FT", label: "FULLTIME" },
  { value: "M_WH", label: "WorkAtHome" },
  { value: "D_CHI", label: "CON_HIRE_IND" },
  { value: "D_CI", label: "CON_IND" },
  { value: "D_CHC", label: "CON_HIRE_CORP" },
];

const statusList = [
  { label: "Active", value: "Active" },
  { label: "Closed", value: "ri" },
  { label: "Inactive", value: "inactive" },
  { label: "Hiring", value: "H" },
  { label: "Interview", value: "I" },
  { label: "Interview (in-House)", value: "ih" },
  { label: "Offer", value: "offer" },
  { label: "No Response", value: "nr" },
  { label: "Submit", value: "submit" },
  { label: "Rejected", value: "reject" },
  { label: "On Hold", value: "oh" },
  { label: "Opening", value: "pw" },
  { label: "Opening Posted", value: "op" },
  { label: "Resume Screening (Recruitment)", value: "rs" },
  { label: "Client Review", value: "client_review" },
  { label: "Placed", value: "placed" },
  { label: "Submitted", value: "submitted" },
  { label: "Submission ", value: "submission " },
];

const OpeningStatusList = [
  { label: "Active", value: "Active" },
  { label: "Closed", value: "ri" },
  { label: "On Hold", value: "oh" },
  { label: "Resume Screening", value: "rs" },
  { label: "Interview", value: "I" },
  { label: "Offer", value: "offer" },
];

const companyStatusList = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const CandidateSubmissionStatus = [
  { label: "Active", value: "Active" },
  { label: "Closed", value: "ri" },
  { label: "Hiring", value: "H" },
  { label: "Interview", value: "I" },
  { label: "Interview (in-House)", value: "ih" },
  { label: "No Response", value: "nr" },
  { label: "Submit", value: "submit" },
  { label: "Rejected", value: "reject" },
  { label: "On Hold", value: "oh" },
  { label: "Resume Screening (Recruitment)", value: "rs" },
  { label: "Client Review", value: "client_review" },
  { label: "Placed", value: "placed" },
];

const employeeStrength = [
  { label: "0-25", value: 1 },
  { label: "25-50", value: 2 },
  { label: "50-100", value: 3 },
  { label: "100-500", value: 4 },
  { label: "500-1000", value: 5 },
  { label: "1000-2000", value: 6 },
  { label: "2000-5000", value: 7 },
  { label: "5000-10000", value: 8 },
  { label: "10000+", value: 9 },
];

const salaryRange = [
  { label: "0-3000", value: "0-3000" },
  { label: "3000-5000", value: "3000-5000" },
  { label: "5000-10000", value: "5000-10000" },
  { label: "10000-20000", value: "10000-20000" },
  { label: "20000-30000", value: "20000-30000" },
  { label: "30000-50000", value: "30000-50000" },
  { label: "50000-100000", value: "50000-100000" },
  // { label: "100000+", value: "100000" },
];

const monthsOfExpirance = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
];

const yearsOfExpirance = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10", value: "10" },
  { label: "11", value: "11" },
  { label: "12", value: "12" },
  { label: "13", value: "13" },
  { label: "14", value: "14" },
  { label: "15", value: "15" },
  { label: "16", value: "16" },
  { label: "17", value: "17" },
  { label: "18", value: "18" },
  { label: "19", value: "19" },
  { label: "20", value: "20" },
  // { label: "20+", value: "20+" },
];

const months = [
  { label: "Jan", value: "0" },
  { label: "Feb", value: "1" },
  { label: "Mar", value: "2" },
  { label: "Apr", value: "3" },
  { label: "May", value: "4" },
  { label: "Jun", value: "5" },
  { label: "Jul", value: "6" },
  { label: "Aug", value: "7" },
  { label: "Sep", value: "8" },
  { label: "Oct", value: "9" },
  { label: "Nov", value: "10" },
  { label: "Dec", value: "11" },
];

const monsterMonths = [
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const noticePeriod = [
  { label: "15 Days or less", value: 1 },
  { label: "1 Month", value: 2 },
  { label: "2 Months", value: 3 },
  { label: "3 Months", value: 4 },
  { label: "More then 3 Months", value: 5 },
];

const EducationList = [
  { label: "Doctorate/PhD", value: 0 },
  { label: "Masters/Post-Graduation", value: 1 },
  { label: "Graduation/Diploma", value: 2 },
  { label: "12th", value: 3 },
  { label: "10th", value: 4 },
  { label: "Bellow 10th", value: 4 },
];

const Courses = [
  { label: "B.Tech/B.E", value: 1 },
  { label: "B.Com", value: 2 },
  { label: "B.Sc", value: 3 },
  { label: "B.A", value: 4 },
  { label: "Diploma", value: 5 },
  { label: "BCA", value: 6 },
  { label: "B.Arch", value: 7 },
  { label: "B.Des", value: 8 },
  { label: "B.Ed", value: 9 },
  { label: "B.El.Ed", value: 10 },
  { label: "B.P.Ed", value: 11 },
  { label: "B.Pharma", value: 12 },
  { label: "B.U.M.S", value: 13 },
  { label: "BAMS", value: 14 },
  { label: "BDS", value: 15 },
  { label: "BFA", value: 16 },
  { label: "BHM", value: 17 },
  { label: "BHMS", value: 18 },
  { label: "BVSC", value: 19 },
  { label: "LLB", value: 20 },
  { label: "MBBS", value: 21 },
  { label: "Other", value: 22 },
];

const monsterResumesUpdatedFilterList = [
  { label: "Today", value: 0 },
  { label: "1 Day Ago", value: 1440 },
  { label: "2 days", value: 2 * 1440 },
  { label: "3 days", value: 3 * 1440 },
  { label: "1 week", value: 7 * 1440 },
  { label: "2 weeks", value: 7 * 1440 * 2 },
  { label: "1 month", value: 30 * 1440 },
  { label: "3 months", value: 30 * 1440 * 3 },
  { label: "6 months", value: 30 * 1440 * 6 },
  { label: "9 months", value: 30 * 1440 * 9 },
];

const monsterYearsOfExpFilterList = [
  { label: "Less than 1 Year", value: 1 },
  { label: "1+ to 2 Years", value: 2 },
  { label: "2+ to 5 Years", value: 3 },
  { label: "5+ to 7 Years", value: 4 },
  { label: "7+ to 10 Years", value: 5 },
  { label: "10+ to 15 Years", value: 6 },
  { label: "more than 15 Years", value: 7 }
];

export {
  optionsSecurity_clearance,
  optionsCurrency,
  optionsCountry,
  optionsPositionType,
  optionsInterviewType,
  optionsexperienceLevel,
  optionsVisaType,
  optionEmploymentType,
  statusList,
  OpeningStatusList,
  CandidateSubmissionStatus,
  companyStatusList,
  employeeStrength,
  monthsOfExpirance,
  yearsOfExpirance,
  noticePeriod,
  EducationList,
  Courses,
  months,
  monsterMonths,
  salaryRange,
  monsterResumesUpdatedFilterList,
  monsterYearsOfExpFilterList
};
