import axios from "axios";
import {
  LOGIN_URL,
  REGISTER_URL,
  REQUEST_PASSWORD_URL,
  ADMIN_LOGIN,
  ADMIN_REGISTER,
  ME_URL,
  COMPANY_LOGIN,
  USER_LOGIN,
  REGISTER_COMPANY_URL,
  REGISTER_COMPANY_URL_USER,
  REQUEST_PASSWORD_URL_COMPANY,
  REQUEST_PASSWORD_URL_CANDIDATE,
  REQUEST_RESET_PASSWORD_CANDIDATE,
  REQUEST_RESET_PASSWORD_COMPANY,
  REQUEST_FORGOT_PASSWORD_USER,
  REQUEST_RESET_PASSWORD_USER,
} from "./../../../../ApiUrl";

export const TMP_REGISTER_URL = "api/auth/register";

const header = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
};

export function login(email, password, role) {
  const URL = role === 'admin'? ADMIN_LOGIN:  role === 'company'? COMPANY_LOGIN: 
  role === 'candidate'? LOGIN_URL: USER_LOGIN
  console.log('URL', URL)
  return axios
    .post(LOGIN_URL, { email, password, role }, header)
    .then((res) => res)
    .catch((err) => Error(err));
}

export function company_login(email, password, role) {
  return axios
    .post(COMPANY_LOGIN, { email, password }, header)
    .then((res) => res)
    .catch((err) => Error(err));
}

export function user_login(email, password) {
  return axios
    .post(USER_LOGIN, { email, password }, header)
    .then((res) => res)
    .catch((err) => Error(err));
}

export function admin_login(email, password, profile) {
  return axios
    .post(ADMIN_LOGIN, { email, password, profile }, header)
    .then((res) => res)
    .catch((err) => Error(err));
}

export function tmp_register(email, fullname, username, password) {
  return axios.post(TMP_REGISTER_URL, { email, fullname, username, password });
}

export function register(
  first_name,
  last_name,
  display_name,
  email,
  phone_number_home,
  contact_number,
  alternative_email,
  username,
  password,
  confirm_password,
  current_location,
  acceptTerms,
  role,
  profile,
  status
) {
  return axios.post(
    REGISTER_URL,
    {
      first_name,
      last_name,
      display_name,
      email,
      phone_number_home,
      contact_number,
      alternative_email,
      username,
      password,
      confirm_password,
      current_location,
      acceptTerms,
      role,
      profile,
      status,
    },
    header
  );
}

export function admin_register(
  first_name,
  last_name,
  display_name,
  email,
  phone_home,
  mobile,
  alternate_email,
  username,
  password,
  confirm_password,
  current_location,
  acceptTerms,
  role,
  profile,
  status,
  defaultEmail
) {
  const params = {
    first_name,
    last_name,
    display_name,
    email,
    phone_home,
    mobile,
    alternate_email,
    username,
    password,
    confirm_password,
    current_location,
    acceptTerms,
    role,
    profile,
    status,
    default: defaultEmail,
  };
  return axios.post(ADMIN_REGISTER, params, header);
}

export function registerCompany(
  company_name,
  company_code,
  contact_person_name,
  contact_person_email,
  company_website,
  contact_number,
  password,
  confirm_password,
  acceptTerms,
  role,
  profile,
  status,
  category,
  phone_number_1,
  phone_number_2,
  country,
  state,
  city,
  street,
  zip_code,
  fax,
  email_1,
  email_2,
  employee_strength,
  industry_type,
  product_services,
  assigned_to_bdm,
  is_email_send
) {
  return axios.post(
    REGISTER_COMPANY_URL,
    {
      company_name,
      company_code,
      contact_person_name,
      contact_person_email,
      email: contact_person_email,
      company_website,
      contact_number,
      password,
      confirm_password,
      acceptTerms,
      role,
      profile,
      status,
      category,
      phone_number_1,
      phone_number_2,
      country,
      state,
      city,
      street,
      zip_code,
      fax,
      email_1,
      email_2,
      employee_strength,
      industry_type,
      product_services,
      assigned_to_bdm,
      is_email_send
    },
    header
  );
}

export function registerCompanyByUser(
  company_name,
  company_code,
  contact_person_name,
  contact_person_email,
  company_website,
  contact_number,
  password,
  confirm_password,
  acceptTerms,
  role,
  profile,
  status,
  category,
  phone_number_1,
  phone_number_2,
  country,
  state,
  city,
  street,
  zip_code,
  fax,
  email_1,
  email_2,
  employee_strength,
  industry_type,
  product_services,
  assigned_to_bdm,
  is_email_send,
  token,
) {
  return axios.post(
    REGISTER_COMPANY_URL_USER,
    {
      company_name,
      company_code,
      contact_person_name,
      contact_person_email,
      email: contact_person_email,
      company_website,
      contact_number,
      password,
      confirm_password,
      acceptTerms,
      role,
      profile,
      status,
      category,
      phone_number_1,
      phone_number_2,
      country,
      state,
      city,
      street,
      zip_code,
      fax,
      email_1,
      email_2,
      employee_strength,
      industry_type,
      product_services,
      assigned_to_bdm,
      is_email_send
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        Authorization: token,
      },
    }
  );
}

export function requestPassword(email) {
  return axios.post(REQUEST_PASSWORD_URL, { email }, header);
}

export function requestPasswordCompany(email) {
  return axios.post(REQUEST_PASSWORD_URL_COMPANY, { email }, header);
}

export function requestPasswordCandidate(email) {
  return axios.post(REQUEST_PASSWORD_URL_CANDIDATE, { email }, header);
}

export function requestPasswordUser(values) {
  return axios.post(REQUEST_FORGOT_PASSWORD_USER, values, header);
}

export function resetPasswordCompany(values) {
  header.Authorization = values.token;
  return axios.post(REQUEST_RESET_PASSWORD_COMPANY, values, header);
}
export function resetPasswordCandidate(values) {
  header.Authorization = values.token;
  return axios.post(REQUEST_RESET_PASSWORD_CANDIDATE, values, header);
}
export function resetPasswordUser(values) {
  header.Authorization = values.token;
  return axios.post(REQUEST_RESET_PASSWORD_USER, values, header);
}

export function getUserByToken() {
  return axios.get(ME_URL);
}
