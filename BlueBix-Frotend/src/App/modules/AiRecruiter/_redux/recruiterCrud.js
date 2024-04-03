import axios from "axios";
import { GET_RECRUITERS_URL } from "./../../../../ApiUrl";

export const TMP_REGISTER_URL = "api/auth/register";

const header = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
};

export const getRecruiters = () => 
  new Promise((resolve, reject) => {
    axios
    .post(GET_RECRUITERS_URL, { title: "", name: "" }, header)
    .then((res) => resolve(res))
    .catch((err) => Error(err));
  })