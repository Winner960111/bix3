import React, { useState } from "react";
import { useFormik } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import * as auth from "../_redux/authRedux";
import { CANDIDATE_REGISTER, USER_CREATE } from "../../../../ApiUrl";
import axios from "axios";
import { yearsOfExpirance } from "../../../pages/constant/constant";

const initialValues = {
  first_name: "",
  last_name: "",
  middle_name: "",
  email: "",
  alternate_email: "",
  phone_home: "",
  mobile: "",
  current_location: "",
  password: "",
  confirm_password: "",
  total_work_exp_year: "",
  total_work_exp_month: "",
  acceptTerms: false,
};

// const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

function NewRegistration({props}) {
  const [loading, setLoading] = useState(false);

  const RegistrationSchema = Yup.object().shape({
    first_name: Yup.string()
      // .min(3, 'Minimum 3 symbols')
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    last_name: Yup.string()
      // .min(3, 'Minimum 3 symbols')
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    email: Yup.string()
      .email("Wrong email format")
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    mobile: Yup.string()
      .required("Mobile is required"),
    total_work_exp_year: Yup.string()
      .required("Year is required"),
    total_work_exp_month: Yup.string()
      .required("Month is required"),
    password: Yup.string()
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    confirm_password: Yup.string()
      .required("Required field")
      .when("password", {
        is: (val) => (val && val.length > 0 ? true : false),
        then: Yup.string().oneOf(
          [Yup.ref("password")],
          "Password and Confirm Password didn't match"
        ),
      }),
    acceptTerms: Yup.bool().required(
      "You must accept the terms and conditions"
    ),
  });

  const disableLoading = () => {
    setLoading(false);
  };

  const getInputClasses = (fieldname) => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return "is-invalid";
    }
    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return "is-valid";
    }
    return "";
  };

  const role = "freelancerecruiter";
  const profile = role;
  const status = "Active";
  const defaultEmail = "email";

  const formik = useFormik({
    initialValues,
    validationSchema: RegistrationSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      console.log('values', values)
      values.attachments = "";
      values.status = values.status ? values.status : "Active";
      axios
        .post(CANDIDATE_REGISTER, values)
        .then((res) => {
          if (!res.data.error) {
            setStatus("User has been successfully registered.");
            setTimeout(() => {
              props.history.push("/auth/login");
            }, 2000);
          } else {
            setSubmitting(false);
            setStatus("Not Registred");
            setTimeout(() => {
              setSubmitting(false);
              setStatus("");
            }, 3000);
          }
          disableLoading();
          setSubmitting(false);
        })
        .catch((error) => {
          setSubmitting(false);
          let errorMessage = "";
          {
            Object.entries(error.response.data.errors).map(([key, value]) => {
              return (errorMessage += value + ", ");
            });
          }
          //setStatus("Somethign Went Wrong. Please try Again");
          setStatus(errorMessage);
          setTimeout(() => {
            setSubmitting(false);
            setStatus("");
          }, 3000);
          disableLoading();
        });
    },
  });

  return (
    <div
    // className="login-form login-signin"
    // style={{ display: "block", maxWidth: "75%" }}
    >
      {/* <div className="text-center mb-10 mb-lg-20">
        <h3 className="font-size-h1">Register with BlueBix Recruitment</h3>
        <p className="text-muted font-weight-bold">
          Enter your details to create your account
        </p>
      </div> */}
      <form
        // id="kt_login_signin_form"
        // className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
        onSubmit={formik.handleSubmit}
      >
        {/* begin: Alert */}
        {formik.status &&
          (formik.status.includes("success") ? (
            <div className="mb-10 alert alert-custom alert-light-primary alert-dismissible">
              <div className="alert-text font-weight-bold">{formik.status}</div>
            </div>
          ) : (
            <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
              <div className="alert-text font-weight-bold">{formik.status}</div>
            </div>
          ))}
        {/* end: Alert */}
        <div className="row">
          <div className="col-md-4">
            {/* begin: first_name */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="First name"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "first_name"
                )}`}
                name="first_name"
                {...formik.getFieldProps("first_name")}
              />
              {formik.touched.first_name && formik.errors.first_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.first_name}
                  </div>
                </div>
              ) : null}
            </div>
            {/* end: first_name */}
          </div>
          <div className="col-md-4">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container ">
              <input
                placeholder="Middle name"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "middle_name"
                )}`}
                name="middle_name"
                // {...formik.getFieldProps("middle_name")}
              />
              {/* {formik.touched.middle_name && formik.errors.middle_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.middle_name}
                  </div>
                </div>
              ) : null} */}
            </div>
            {/* end: displayname */}
          </div>
          <div className="col-md-4">
            {/* begin: last_name */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="Last name"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "last_name"
                )}`}
                name="last_name"
                {...formik.getFieldProps("last_name")}
              />
              {formik.touched.last_name && formik.errors.last_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.last_name}</div>
                </div>
              ) : null}
            </div>
            {/* end: last_name */}
          </div>

          <div className="col-md-6">
            {/* begin: Email */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="Email"
                type="email"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "email"
                )}`}
                name="email"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.email}</div>
                </div>
              ) : null}
            </div>
            {/* end: Email */}
          </div>

          <div className="col-md-6">
            {/* begin: Contact Number */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="Mobile"
                //type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "mobile"
                )}`}
                name="mobile"
                {...formik.getFieldProps("mobile")}
              />
              {formik.touched.mobile && formik.errors.mobile ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.mobile}</div>
                </div>
              ) : null}
            </div>
            {/* end: Contact Number */}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-1">
            <label>
              Total Experience
            </label>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            {/* begin: experience */}
            <div className="form-group fv-plugins-icon-container register_require">
              <select
                className={`form-control form-control-solid h-auto py-5 px-6 custom_select ${getInputClasses(
                  "total_work_exp_year"
                )}`}
                name="total_work_exp_year"
                //onChange={(item) => handleCityChange(item)}
                {...formik.getFieldProps("total_work_exp_year")}
              >
                <option key={"#"}>{"Select Year"}</option>
                {yearsOfExpirance.map((experience, index) => {
                  return (
                    <option value={experience.value} key={index.toString()}>
                      {experience.label + (index < 2 ? " Year" : " Years")}
                    </option>
                  );
                })}
              </select>
              {formik.touched.total_work_exp_year && formik.errors.total_work_exp_year ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.total_work_exp_year}</div>
                </div>
              ) : null}
            </div>
            {/* end: experience */}
          </div>

          <div className="col-md-6">
            {/* begin: experience */}
            <div className="form-group fv-plugins-icon-container register_require">
              <select
                className={`form-control form-control-solid h-auto py-5 px-6 custom_select ${getInputClasses(
                  "total_work_exp_month"
                )}`}
                name="total_work_exp_month"
                {...formik.getFieldProps("total_work_exp_month")}
               // onChange={(item) => handleCityChange(item)}
              >
                <option key={"#"}>{"Select Months"}</option>
                {yearsOfExpirance.map((experience, index) => {
                  return (
                    <option value={experience.value} key={index.toString()}>
                      {experience.label + (index < 2 ? " Month" : " Months")}
                    </option>
                  );
                })}
              </select>
              {formik.touched.total_work_exp_month && formik.errors.total_work_exp_month ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.total_work_exp_month}</div>
                </div>
              ) : null}
            </div>
            {/* end: experience */}
          </div>
        </div>

        {/* begin: Password */}
        <div className="form-group fv-plugins-icon-container register_require">
          <input
            placeholder="Password"
            type="password"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              "password"
            )}`}
            name="password"
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.password}</div>
            </div>
          ) : null}
        </div>
        {/* end: Password */}
        {/* begin: Confirm Password */}
        <div className="form-group fv-plugins-icon-container register_require">
          <input
            placeholder="Confirm Password"
            type="password"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              "confirm_password"
            )}`}
            name="confirm_password"
            {...formik.getFieldProps("confirm_password")}
          />
          {formik.touched.confirm_password && formik.errors.confirm_password ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                {formik.errors.confirm_password}
              </div>
            </div>
          ) : null}
        </div>
        {/* end: Confirm Password */}
        {/* begin: Terms and Conditions */}
        <div className="form-group">
          <label className="checkbox">
            <input
              type="checkbox"
              name="acceptTerms"
              className="m-1"
              {...formik.getFieldProps("acceptTerms")}
            />
            <span />
            <Link
              to="/auth/freelanceRecruiter/terms"
              target="_blank"
              className="mr-1 ml-2"
              rel="noopener noreferrer"
            >
              I agree the Terms & Conditions
            </Link>
          </label>
          {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.acceptTerms}</div>
            </div>
          ) : null}
        </div>
        {/* end: Terms and Conditions */}
        <div className="form-group d-flex flex-wrap flex-center">
          <button
            type="submit"
            disabled={
              formik.isSubmitting ||
              !formik.isValid ||
              !formik.values.acceptTerms
            }
            className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <span>Submit</span>
            {loading && <span className="mx-3 spinner spinner-white"></span>}
          </button>
          <Link to="/auth/login">
            <button
              type="button"
              className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4"
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default connect(null, auth.actions)(NewRegistration);
