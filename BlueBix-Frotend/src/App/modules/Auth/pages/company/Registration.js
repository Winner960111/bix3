import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import * as auth from "../../_redux/authRedux";
import { registerCompany } from "../../_redux/authCrud";
import axios from "axios";
import { US_STATE_LIST, US_CITY_LIST } from "../../../../../ApiUrl";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { employeeStrength } from "../../../../pages/constant/constant";

const initialValues = {
  company_name: "",
  company_code: "",
  company_email: "",
  company_person_name: "",
  company_person_email: "",
  company_website: "",
  password: "",
  confirm_password: "",
  industry_type: "",
  employee_strength: "",
  product_services: [],
  acceptTerms: false,
  country: "United States",
};

// const employeeStrength = [
//   { label: "0-3", value: 1 },
//   { label: "3-5", value: 2 },
//   { label: "5-10", value: 3 },
//   { label: "10-20", value: 4 },
//   { label: "20-30", value: 5 },
//   { label: "30-50", value: 6 },
//   { label: "50-100", value: 7 },
//   { label: "100+", value: 8 },
// ];
const industries = [
  {
    value: "AFI",
    name: "Accounting/Finance/Insurance",
  },
  {
    value: "ACL",
    name: "Administrative/Clerical",
  },
  {
    value: "Ar85424",
    name: "Architectural &amp; Planning",
  },
  {
    value: "Au85425",
    name: "Automation",
  },
  {
    value: "BRM",
    name: "Banking/Real Estate/Mortgage Professionals",
  },
  {
    value: "Bi85435",
    name: "Biotechnology",
  },
  {
    value: "Bu85434",
    name: "Building Envelope/Materials",
  },
  {
    value: "BSM",
    name: "Business/Strategic Management",
  },
  {
    value: "EN",
    name: "Civil Engineering",
  },
  {
    value: "BST",
    name: "Construction",
  },
  {
    value: "CDN",
    name: "Creative/Design",
  },
  {
    value: "CSC",
    name: "Customer Support/Client Care",
  },
  {
    value: "EW",
    name: "Editorial/Writing",
  },
  {
    value: "ET",
    name: "Education/Training",
  },
  {
    value: "El85432",
    name: "Electrical &amp; Electronics Manufacturing",
  },
  {
    value: "Fa85428",
    name: "Farming",
  },
  {
    value: "Fo85433",
    name: "Food Processing/ Food Beverages",
  },
  {
    value: "FH",
    name: "Food Production",
  },
  {
    value: "hr",
    name: "Human Resources",
  },
  {
    value: "In85420",
    name: "Industrial",
  },
  {
    value: "it",
    name: "Information Technology",
  },
  {
    value: "IMP",
    name: "Installation/Maintenance/Repair",
  },
  {
    value: "L",
    name: "Legal",
  },
  {
    value: "LT",
    name: "Logistics/Transportation",
  },
  {
    value: "Ma85429",
    name: "Machinery",
  },
  {
    value: "MPO",
    name: "Manufacturing",
  },
  {
    value: "MP",
    name: "Marketing/Product",
  },
  {
    value: "Me85426",
    name: "Mechanical/Industrial Engineering",
  },
  {
    value: "MH",
    name: "Medical Devices",
  },
  {
    value: "Mi85430",
    name: "Mining &amp; Metals",
  },
  {
    value: "Oi85423",
    name: "Oil &amp; Energy",
  },
  {
    value: "Ga85422",
    name: "Oil &amp; Gas",
  },
  {
    value: "O",
    name: "Others",
  },
  {
    value: "Ph85421",
    name: "Pharmaceuticals",
  },
  {
    value: "Pl85427",
    name: "Plastic",
  },
  {
    value: "PPM",
    name: "Project/Program Management",
  },
  {
    value: "QS",
    name: "Quality Assurance/Safety",
  },
  {
    value: "R",
    name: "Research",
  },
  {
    value: "SRB",
    name: "Sales/Retail/Business Development",
  },
  {
    value: "SP",
    name: "Security/Protective Services",
  },
  {
    value: "Ut85431",
    name: "Utility Infrastructure",
  },
];

function Registration(props) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    getStatesList();
    //  getCategoriesList();
  }, []);

  useEffect(() => {
    getCityList(selectedState);
  }, [selectedState]);

  const getStatesList = () => {
    axios
      .get(US_STATE_LIST, {
        // headers: { Authorization: users.token },
      })
      .then((res) => {
        setStateList(res.data.data);
      })
      .catch((error) => {});
  };

  const getCityList = (stateId) => {
    axios
      .post(
        US_CITY_LIST,
        { state_id: stateId },
        {
          // headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        setCityList(res.data.data);
      })
      .catch((error) => {});
  };
  const handleStateChange = (event) => {
    event.persist();
    setSelectedState(event.target.value);
    setSelectedCity("");
    formik.setFieldValue({
      state_name: event.target.value,
      city: "",
    });
  };

  const handleCityChange = (event) => {
    //  event.persist();
    setSelectedCity(event.target.value);
    formik.setFieldValue({
      city: event.target.value,
    });
  };

  const onError = (status, clearSuggestions) => {
    clearSuggestions();
  };

  const handleChange = (address) => {
    setAddress(address);
  };
  const handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => {})
      .catch((error) => {});
  };

  const RegistrationSchema = Yup.object().shape({
    company_name: Yup.string()
      .min(2, "Minimum 2 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    // company_code: Yup.string()
    //     .required("Required field"),
    // contact_person_name: Yup.string()
    //     .min(2, "Minimum 3 symbols")
    //     .max(30, "Maximum 50 symbols")
    //     .required("Required field"),
    // contact_person_email: Yup.string()
    //     .email("Wrong email format")
    //     .required("Required field"),
    company_website: Yup.string()
      .matches(
        /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        "Enter correct url!"
      )
      .required("Please enter Company's website"),
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
    phone_number_1: Yup.string().required("Required field"),
    // phone_number_2: Yup.number()
    //     .required("Required field"),
    country: Yup.string().required("Required field"),
    // state_name: Yup.string().required("Required field"),
    //city: Yup.string().required("Required field"),
    street: Yup.string().required("Required field"),
    zip_code: Yup.string().required("Required field"),
    //fax: Yup.string().required("Required field"),
    email_1: Yup.string().required("Required field"),
    // email_2: Yup.string().required("Required field"),
    employee_strength: Yup.string().required("Required field"),
    industry_type: Yup.string().required("Required field"),
  });

  const enableLoading = () => {
    setLoading(true);
  };

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

  const postRegister = (values, setStatus, setSubmitting) => {
    registerCompany(
      values.company_name,
      //values.company_code = values.company_name + Math.floor(100000 + Math.random() * 900000),
      (values.company_code = values.company_name.replace(/ /g, "")),
      values.contact_person_name,
      "",
      values.company_website,
      values.contact_number,
      values.password,
      values.confirm_password,
      values.acceptTerms,
      role,
      profile,
      status,
      category,
      values.phone_number_1,
      values.phone_number_2,
      values.country,
      (values.state_name = selectedState),
      (values.city = selectedCity),
      values.street,
      values.zip_code,
      values.fax,
      values.email_1,
      values.email_2,
      values.employee_strength,
      values.industry_type,
      values.product_services
    )
      .then((res) => {
        const result = res.data;
        if (!result.data.error) {
          setStatus("Company has been successfully registered.");
          setTimeout(() => {
            props.history.push("/auth/company/login");
          }, 3000);
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
  };

  const role = "company";
  const profile = role;
  const status = "Active";
  const category = "client";

  const formik = useFormik({
    initialValues,
    validationSchema: RegistrationSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setSubmitting(true);
      enableLoading();
      if (values.state_name === "") {
        setSubmitting(false);
        setStatus("please select State");
        setTimeout(() => {
          setSubmitting(false);
          setStatus("");
        }, 3000);
      } else {
        if (selectedState === "3980") {
          postRegister(values, setStatus, setSubmitting);
        } else if (selectedCity !== "") {
          postRegister(values, setStatus, setSubmitting);
        } else {
          setSubmitting(false);
          setStatus("please select city");
          setTimeout(() => {
            setSubmitting(false);
            setStatus("");
          }, 3000);
        }
      }
    },
  });

  return (
    <div
      className="login-form login-signin"
      style={{ display: "block", maxWidth: "75%" }}
    >
      <div className="text-center mb-10 mb-lg-20">
        <h3 className="font-size-h1">Register with BlueBix Recruitment</h3>
        <p className="text-muted font-weight-bold">
          Enter your details to create your account
        </p>
      </div>
      <form
        autoComplete="off"
        id="kt_login_signin_form"
        className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
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
          <div className="col-md-6">
            {/* begin: first_name */}
            <div className="form-group fv-plugins-icon-container  register_require">
              <input
                placeholder="Company Name"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "company_name"
                )}`}
                name="company_name"
                {...formik.getFieldProps("company_name")}
              />
              {formik.touched.company_name && formik.errors.company_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.company_name}
                  </div>
                </div>
              ) : null}
            </div>
            {/* end: company_name */}
          </div>
          {/*  <div className="col-md-4">
                         begin: last_name
                        <div className="form-group fv-plugins-icon-container">
                            <input
                                placeholder="Company Code"
                                type="text"
                                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                                    "company_code"
                                )}`}
                                name="company_code"
                                {...formik.getFieldProps("company_code")}
                            />
                            {formik.touched.company_code && formik.errors.company_code ? (
                                <div className="fv-plugins-message-container">
                                    <div className="fv-help-block">{formik.errors.company_code}</div>
                                </div>
                            ) : null}
                        </div>
                         end: company_code
                    </div>*/}

          <div className="col-md-6">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container">
              <input
                placeholder="Contact Person Name"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "contact_person_name"
                )}`}
                name="contact_person_name"
                //{...formik.getFieldProps("contact_person_name")}
              />
              {/* {formik.touched.displayname &&
              formik.errors.contact_person_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.contact_person_name}
                  </div>
                </div>
              ) : null} */}
            </div>
            {/* end: Company Email */}
          </div>
          {/* <div className="row">
            <SearchLocationInput onChange={() => null} />
          </div> */}

          {/*<div className="col-md-6">*/}
          {/*     begin: Email */}
          {/*    <div className="form-group fv-plugins-icon-container">*/}
          {/*        <input*/}
          {/*            placeholder="Contact Person Email"*/}
          {/*            type="email"*/}
          {/*            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(*/}
          {/*                "contact_person_email"*/}
          {/*            )}`}*/}
          {/*            name="contact_person_email"*/}
          {/*            {...formik.getFieldProps("contact_person_email")}*/}
          {/*        />*/}
          {/*        {formik.touched.contact_person_email && formik.errors.contact_person_email ? (*/}
          {/*            <div className="fv-plugins-message-container">*/}
          {/*                <div className="fv-help-block">{formik.errors.contact_person_email}</div>*/}
          {/*            </div>*/}
          {/*        ) : null}*/}
          {/*    </div>*/}
          {/*     end: company person name */}
          {/*</div>*/}
          <div className="col-md-6">
            {/* begin: Alternative Email */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="Company Website"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "company_website"
                )}`}
                name="company_website"
                {...formik.getFieldProps("company_website")}
              />
              {formik.touched.company_website &&
              formik.errors.company_website ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.company_website}
                  </div>
                </div>
              ) : null}
            </div>
            {/* end: company person email */}
          </div>
          <div className="col-md-6">
            <div className="form-group fv-plugins-icon-containe register_require">
              <div>
                <select
                  // className={`form-control form-control-lg form-control-solid`}
                  className={`form-control form-control-solid h-auto py-5 px-6 custom_select ${getInputClasses(
                    "industry_type"
                  )}`}
                  name="industry_type"
                  {...formik.getFieldProps("industry_type")}
                >
                  <option key={"#"}>{"Select industry type"}</option>
                  {industries.map((industry, index) => {
                    return (
                      <option value={industry.value} key={index.toString()}>
                        {industry.name}
                      </option>
                    );
                  })}
                </select>
                {formik.touched.industry_type && formik.errors.industry_type ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.industry_type}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            {/* <label className="col-lg-4 col-form-label">Employees Strength</label> */}
            <div className="form-group fv-plugins-icon-containe register_require">
              <div>
                <select
                  className={`form-control form-control-lg form-control-solid custom_select`}
                  name="employee_strength"
                  {...formik.getFieldProps("employee_strength")}
                >
                  <option key={"#"}>{"Select employee strength"}</option>
                  {employeeStrength.map((employeeStrength, index) => {
                    return (
                      <option value={employeeStrength.value} key={index}>
                        {employeeStrength.label}
                      </option>
                    );
                  })}
                </select>
                {formik.touched.employee_strength &&
                formik.errors.employee_strength ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.employee_strength}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="phone number 1"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "phone_number_1"
                )}`}
                name="phone_number_1"
                {...formik.getFieldProps("phone_number_1")}
              />
              {formik.touched.phone_number_1 && formik.errors.phone_number_1 ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.phone_number_1}
                  </div>
                </div>
              ) : null}
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-6">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container">
              <input
                placeholder="phone number 2"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "phone_number_2"
                )}`}
                name="phone_number_2"
                {...formik.getFieldProps("phone_number_2")}
              />
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-6">
            {/* begin: country */}
            <div className="form-group fv-plugins-icon-container">
              <input
                placeholder="country"
                disabled
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "country"
                )}`}
                name="country"
                {...formik.getFieldProps("country")}
              />
              {formik.touched.country && formik.errors.country ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.country}</div>
                </div>
              ) : null}
            </div>
            {/* end: country */}
          </div>
          <div className="col-md-6">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container register_require">
              {/* <input
                placeholder="state"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "state_name"
                )}`}
                name="state_name"
                {...formik.getFieldProps("state_name")}
              /> */}
              <select
                className={`form-control form-control-lg form-control-solid custom_select`}
                // className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                //   "state_name"
                // )}`}
                name="state_name"
                //{...formik.getFieldProps("state_name")}
                onChange={handleStateChange}
              >
                <option key={"#"}>{"Select State"}</option>
                {stateList.map((state, index) => {
                  return (
                    <option value={state.code} key={index.toString()}>
                      {state.state}
                    </option>
                  );
                })}
              </select>
              {/* {formik.touched.state_name && formik.errors.state_name ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    {formik.errors.state_name}
                  </div>
                </div>
              ) : null} */}
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-6">
            {/* begin: displayname */}
            <div className="form-group fv-plugins-icon-container register_require">
              {/* <input
                placeholder="city"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "city"
                )}`}
                name="city"
                {...formik.getFieldProps("city")}
              /> */}
              <select
                // className={`form-control form-control-lg form-control-solid`}
                className={`form-control form-control-solid h-auto py-5 px-6 custom_select ${getInputClasses(
                  "city"
                )}`}
                name="city"
                // {...formik.getFieldProps("city")}
                onChange={(item) => handleCityChange(item)}
              >
                <option key={"#"}>{"Select City"}</option>
                {cityList.map((state, index) => {
                  return (
                    <option value={state.code} key={index.toString()}>
                      {state.city}
                    </option>
                  );
                })}
              </select>
              {/* {formik.touched.city && formik.errors.city ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.city}</div>
                </div>
              ) : null} */}
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-4">
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="street"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "street"
                )}`}
                name="street"
                {...formik.getFieldProps("street")}
              />
              {formik.touched.street && formik.errors.street ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.street}</div>
                </div>
              ) : null}
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-4">
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="zip_code"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "zip_code"
                )}`}
                name="zip_code"
                {...formik.getFieldProps("zip_code")}
              />
              {formik.touched.zip_code && formik.errors.zip_code ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.zip_code}</div>
                </div>
              ) : null}
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-4">
            <div className="form-group fv-plugins-icon-container">
              <input
                placeholder="fax"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "fax"
                )}`}
                name="fax"
                // {...formik.getFieldProps("fax")}
              />
            </div>
            {/* end: phone number 1 */}
          </div>
          <div className="col-md-6">
            <div className="form-group fv-plugins-icon-container register_require">
              <input
                placeholder="email_1"
                type="text"
                autoComplete="off"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "email_1"
                )}`}
                name="email_1"
                {...formik.getFieldProps("email_1")}
              />
              {formik.touched.email_1 && formik.errors.email_1 ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.email_1}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group fv-plugins-icon-container">
              <input
                placeholder="email_2"
                type="text"
                className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
                  "email_2"
                )}`}
                name="email_2"
                {...formik.getFieldProps("email_2")}
              />
            </div>
          </div>
        </div>
        {/* begin: Password */}
        <div className="form-group fv-plugins-icon-container register_require">
          <input
            placeholder="Password"
            type="password"
            autocomplete="off"
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
              to="/auth/company/terms"
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

export default connect(null, auth.actions)(Registration);
