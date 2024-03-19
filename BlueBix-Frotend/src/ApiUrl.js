const APP_URL = process.env.REACT_APP_BASE_URL + "/api/v1/";

const IMAGE_BASE_URL =  process.env.REACT_APP_BASE_URL + "/upload/";

export const CANDIDATE_CV_UPLOAD =  process.env.REACT_APP_BASE_URL + "/upload/candidate/";

export const CANDIDATE_RESUME_URL =  process.env.REACT_APP_BASE_URL + "/upload/candidate/";

export const IMAGE_USER_URL = IMAGE_BASE_URL + "user/";
export const IMAGE_CANDIDATE_URL = IMAGE_BASE_URL + "candidate/";

export const LOGIN_URL = APP_URL + "candidate/login";
export const ADMIN_LOGIN = APP_URL + "admin/login";
export const COMPANY_LOGIN = APP_URL + "company/login";
export const USER_LOGIN = APP_URL + "user/login";
export const ADMIN_REGISTER = APP_URL + "admin/register";
export const REGISTER_URL = APP_URL + "register";
export const REGISTER_COMPANY_URL = APP_URL + "company/register";
export const REGISTER_COMPANY_URL_USER = APP_URL + "company/register-by-user";

export const REQUEST_PASSWORD_URL = APP_URL + "";
export const ME_URL = APP_URL + "";

export const USERS_LIST = APP_URL + "user";
export const USER = APP_URL + "user";
export const USER_CREATE = APP_URL + "user/register";
export const UPDATE_USER = APP_URL + "user/edit";
export const REPORTING_MANAGER_LIST = APP_URL + "user/list/reporting-manager";
export const ROLE_LIST = APP_URL + "user/list/role";
export const ADMIN_PROFILE_UPDATE = APP_URL + "admin/edit";
export const ADMIN_PROFILE = APP_URL + "admin";
export const ADMIN_REPORT_COUNT = APP_URL + "admin/report/count";

export const PROFILE_LIST = APP_URL + "user/profile/list";
export const REMOVE_PROFILE_IMAGE = APP_URL + "candidate/profile-image"
export const PRIMARY_RECRUITER_LIST = APP_URL + "user/primary-recruiter/list";

export const DASHBOARD_USER = APP_URL + "user/dashboard";

export const COMPANY = APP_URL + "company";
export const COMPANY_NAMES = APP_URL + "company/names";
export const COMPANY_DETAIL = APP_URL + "company/details";
export const COMPANY_PROFILE_UPDAT = APP_URL + "company/edit";
export const COMPANY_NAME_LIST = APP_URL + "company/account-name/list";
export const COMPANY_NAME_LIST_RECRUITER =
  APP_URL + "company/account-name/recruiter/list";
export const COMPANY_CANDIDATE_DETAILS = APP_URL + "company/candidate-details";
export const COMPANY_CANDIDATE_SUBMISSION_LIST =
  APP_URL + "company/candidate-submission/list";
export const CANDIDATE_SUBMISSION_BY_COMPANY_LIST =
  APP_URL + "company/candidate-submission_by_company/list";

export const CANDIDATE_REGISTER = APP_URL + "candidate/register";
export const CANDIDATE_BY_ID = APP_URL + "candidate";
export const CANDIDATE = APP_URL + "candidate";
export const CANDIDATE_EDIT = APP_URL + "candidate/edit";
export const CANDIDATE_PERSONAL_DETAILS_EDIT =
  APP_URL + "candidate/personal-details/edit";
export const CANDIDATE_CAREER_PROFILE_EDIT =
  APP_URL + "candidate/career-profile/edit";
export const CANDIDATE_PROFILE_SUMMARY_EDIT =
  APP_URL + "candidate/profile-summary/edit";
export const CANDIDATE_EMPLOYEE_REGISTER =
  APP_URL + "candidate/employee-details/register";
export const CANDIDATE_EMPLOYEE_DETAILS_EDIT =
  APP_URL + "candidate/employee-details/edit";
export const CANDIDATE_QUALIFICATION_DETAILS_EDIT =
  APP_URL + "candidate/employee-qualification-details/edit";
export const CANDIDATE_QUALIFICATION_REGISTER =
  APP_URL + "candidate/employee-qualification-details/register";
export const CANDIDATE_EMPLOYEE_DETAILS =
  APP_URL + "candidate/employee-details";
export const CANDIDATE_QUALIFICATION_DETAILS =
  APP_URL + "candidate/employee-qualification-details";
export const CANDIDATE_IT_SKILLS_REGISTER =
  APP_URL + "candidate/employee-it-skill/register";
export const CANDIDATE_IT_SKILLS_EDIT =
  APP_URL + "candidate/employee-it-skill/edit";
export const CANDIDATE_IT_SKILLS = APP_URL + "candidate/employee-it-skill";
export const US_STATE_LIST = APP_URL + "company/state/list";
export const US_CITY_LIST = APP_URL + "company/city/list";
export const CANDIDATE_LIST_DASHBOARD =
  APP_URL + "user/dashboard/candidate/list";

export const COMPANY_INTERVIEW_SCHEDULE =
  APP_URL + "company/interview-schedule";
export const MESSAGE_LIST_BY_USER = APP_URL + "user/message-list-by-user";
export const MESSAGE_LIST_MESSAGES = APP_URL + "message/list-messages";
export const MESSAGE_COUNT = APP_URL + "message/count";
export const MESSAGE_UPDATE_FLAG = APP_URL + "message/update-flag";

export const REQUEST_PASSWORD_URL_COMPANY = APP_URL + "company/forgot-password";
export const REQUEST_PASSWORD_URL_CANDIDATE =
  APP_URL + "candidate/forgot-password";
export const REQUEST_RESET_PASSWORD_CANDIDATE =
  APP_URL + "candidate/reset-password";
export const REQUEST_RESET_PASSWORD_COMPANY =
  APP_URL + "company/reset-password";
export const REQUEST_FORGOT_PASSWORD_USER = APP_URL + "user/forgot-password";
export const REQUEST_RESET_PASSWORD_USER = APP_URL + "user/reset-password";

export const SUBSCRIPTION_PLAN_LIST = APP_URL + "plan";
export const SUBSCRIPTION_PLAN_CREATE = APP_URL + "plan/create";
export const OPENING_TITLE_LIST = APP_URL + "company/opening-id-title/list";
export const CANDIDATE_SORT_LIST = APP_URL + "candidate/shortlist/details";
export const CANDIDATE_JOB_OPENING_LIST =
  APP_URL + "candidate/job-opening/list";
export const CANDIDATE_CATEGORY_LIST = APP_URL + "candidate/category/list";
export const CANDIDATE_CITY_LIST = APP_URL + "candidate/city/list";
export const CANDIDATE_RECRUITER_REGISTER =
  APP_URL + "candidate/recruiter/register";
export const CANDIDATE_CANDIDATE_LIST = APP_URL + "candidate/candidate-list";
export const CANDIDATE_SAVE_JOB = APP_URL + "candidate/save-job";
export const CANDIDATE_APPLY_JOB = APP_URL + "candidate/apply-job";
export const CANDIDATE_SAVE_JOB_LIST = APP_URL + "candidate/saved-job-list";
export const CANDIDATE_REMOVE_JOB = APP_URL + "candidate/remove-job";

export const JOB_CREATE = APP_URL + "job/create";
export const JOB_CREATE_BY_USER = APP_URL + "job/createByUser";
export const JOBS_LIST = APP_URL + "job";
export const JOBS_LIST_BDM = APP_URL + "job/by-bdm";
export const JOB_DETAIL = APP_URL + "job";
export const JOB_DELETE = APP_URL + "job";
export const CATEGORY_LIST = APP_URL + "job/category/list";
export const SUB_CATEGORY_LIST = APP_URL + "job/sub-category/list";
export const CONTACT_NAME_LIST = APP_URL + "job/contact-name";
export const ASSIGN_JOB = APP_URL + "job/admin/assign";
export const JOB_BDM_LIST = APP_URL + "job/bdm/list";
export const JOB_RECRUITER_LIST = APP_URL + "job/recruiter/list";
export const SUBMISSION_BY_RECRUITER = APP_URL + "job/submission-by/recruiter";
export const SUBMISSION_BY = APP_URL + "job/submission-by";
export const BDM_COMPANY_PROFILE_UPDATE = APP_URL + "bdm/company/edit";
export const SUBMISSION_BY_BDM = APP_URL + "job/submission-by/bdm";
export const SUBMISSION_BY_OTHER_BDM = APP_URL + "job/submission-by/other-bdm";

export const CANDIDATE_SUBMISSION_RE_SUBMISSION =
  APP_URL + "job/candidate/re-submission";
export const JOB_ACTIVITY_LOG = APP_URL + "job/activity-log";
export const CANDIDATE_SUBMISSION_REJECT =
  APP_URL + "job/candidate-submission/reject";
export const CANDIDATE_SUBMISSION_LIST =
  APP_URL + "job/submission/candidate/list";
export const CANDIDATE_SUBMISSION_HOLD =
  APP_URL + "job/candidate-submission/hold";
export const BDM_CANDIDATE_SUBMISSION_LIST =
  APP_URL + "job/submission-candidate/bdm/list";
export const CANDIDATE_JOB_SUBMIT_LIST = APP_URL + "job/submit-candidate/list";

export const JOB_ASSIGNMENT_DETAILS = APP_URL + "job/list-for-assignments";

export const JOB_CANDIDATE_WITHDRAW_RECRUITER =
  APP_URL + "job/candidate-withdraw/recruiter";
export const JOB_REPORT_DOWNLOAD_LIST = APP_URL + "job/report-download-list";
export const BDM_REPORT_COUNT = APP_URL + "bdm/report/count";

// used only for bringing bdm jobs list in admin portal, I cant send any bdm id as in admin 
// but required only assigned bdms jobs
export const BDM_REPORT_JOBS = APP_URL + "bdm/report/jobs";

export const RECRUITER_REPORT_COUNT = APP_URL + "recruiter/report/count";
export const RECRUITER_REPORT_JOBS = APP_URL + "recruiter/report/jobs";
export const COMPANY_REPORT_COUNT = APP_URL + "company/report/count";
export const FREELANCE_REPORT_COUNT = APP_URL + "freelance/report/count";
export const FREELANCE_REPORT_JOBS = APP_URL + "freelance/report/jobs";
export const BDM_FREELANCER_LIST = APP_URL + "bdm/freelancer/list";
export const USER_JOB_CANDIDATE_SUBMIT_LIST =
  APP_URL + "job/submit-candidate-by-id/list";

export const CANDIDATE_REPORT_JOBS =
  APP_URL + "candidate/report/list";

export const RECRUITER_APPLY_SUBMISSION =
  APP_URL + "recruiter/recruiter-apply-submission";
export const COMPANY_UPDATE_SUBMISSION_COUNT =
  APP_URL + "company/update-job-submission-view-status-by-company";
export const BDM_UPDATE_SUBMISSION_COUNT =
  APP_URL + "bdm/update-job-submission-view-status-by-bdm";

export const FREELANCE_JOB_LIST = APP_URL + "freelance/";
export const FREELANCE_JOB_WORK_REQUEST =
  APP_URL + "freelance/job-work-request";
export const FREELANCE_JOB_WORK_LIST = APP_URL + "freelance/list-job-work";
export const UPDATE_FREELANCE_JOB_WORK_STATUS =
  APP_URL + "freelance/update-job-work-status";
export const FREELANCE_APPROVE_JOB_LIST =
  APP_URL + "freelance/approve-job-opening-list";

export const SMTP_CREATE = APP_URL + "smtp/create";
export const SMTP_EMAIL_SEND = APP_URL + "smtp/email/send";
export const SMTP = APP_URL + "smtp";
export const SMTP_EMAIL_TEST = APP_URL + "smtp/email/test";
export const EMAIL_TEMPLATES_CREATE = APP_URL + "email/email-template";
export const EMAIL_TEMPLATES_UPDATE = APP_URL + "email/update-email-template";
export const EMAIL_TEMPLATES_DETAIL = APP_URL + "email/email-template-detail";
export const EMAIL_TEMPLATES_BY_TYPE_DETAIL =
  APP_URL + "email/email-template-detail-by-type";
export const EMAIL_SENT_LIST = APP_URL + "user/email/sent/list";
export const EMAIL_INBOX_LIST = APP_URL + "user/email/inbox/list";

export const CONTACTS = APP_URL + "contact";
export const CONTACTS_CREATE = APP_URL + "contact/create";
export const CONTACTS_EDIT = APP_URL + "contact/edit";
export const CONTACT_CREATE_ACTIVITY = APP_URL + "contact/create/activity";
export const CONTACT_ACTIVITY_LIST = APP_URL + "contact/activity/list";

export const EMAIL_ACTIVITY_LIST = APP_URL + 'emailactivity/list';
export const EMAIL_ACTIVITY_UPDATE = APP_URL + 'emailactivity';

export const ASSIGNED_BDM_LIST = APP_URL + 'job/list-bdm-assign';
export const ASSIGNED_RECRUITER_LIST = APP_URL + 'job/list-recruiter-assign';

export const CONTACTS_BDM = APP_URL + "contact/bdm";
export const CONTACTS_ADMIN = APP_URL + "contact/admin";

export const MONSTER_CANDIDATE_LIST_ = APP_URL + "user/monster/list-candidate";
export const MONSTER_CANDIDATE_VIEW_ = APP_URL + "user/monster/view-candidate";

export const MONSTER_CANDIDATE_LIST = APP_URL + "user/monster-candidate/list";
export const MONSTER_CANDIDATE_VIEW = APP_URL + "user/monster-candidate/view";
export const GET_RECRUITERS_URL = APP_URL + "recruiters";