import React, { useState } from "react";
import { useFormik } from "formik";
import { connect } from "react-redux";
import * as Yup from "yup";
import axios from "axios";
import { register } from "../_redux/authCrud";
import { Form, Input, Row, Col, Card, Select, Button, Checkbox } from "antd";
import { setRole, setUser, setToken } from "../../../../redux/actions/users";
import {
  monthsOfExpirance,
  yearsOfExpirance,
} from "../../../pages/constant/constant";
import { CANDIDATE_REGISTER } from "../../../../ApiUrl";
import { getBase64, showError } from "../../../pages/utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

const initialValues = {
  first_name: "",
  last_name: "",
  displayname: "",
  email: "",
  alternative_email: "",
  phone_number: "",
  contact_number: "",
  current_location: "",
  password: "",
  confirm_password: "",
  acceptTerms: false,
};

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

function Registration(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [fileList, setFileList] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  const RegistrationSchema = Yup.object().shape({
    first_name: Yup.string()
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    last_name: Yup.string()
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    displayname: Yup.string()
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    email: Yup.string()
      .email("Wrong email format")
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    alternative_email: Yup.string()
      .email("Wrong email format")
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols"),
    phone_number: Yup.string()
      .matches(phoneRegExp, "Phone number is not valid")
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    contact_number: Yup.string()
      .matches(phoneRegExp, "Contact number is not valid")
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
    current_location: Yup.string()
      .min(3, "Minimum 3 symbols")
      .max(50, "Maximum 50 symbols")
      .required("Required field"),
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

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

  const role = "candidate";
  const profile = role;
  const status = "Active";

  const formik = useFormik({
    initialValues,
    validationSchema: RegistrationSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setSubmitting(true);
      enableLoading();
      register(
        values.first_name,
        values.last_name,
        values.displayname,
        values.email,
        values.phone_number,
        values.contact_number,
        values.alternative_email,
        values.username,
        values.password,
        values.confirm_password,
        values.current_location,
        values.acceptTerms,
        role,
        profile,
        status
      )
        .then((res) => {
          const result = res.data;
          if (!result.data.error) {
            setTimeout(() => {
              props.history.push("/auth/login");
            }, 2000);
          } else {
            setSubmitting(false);
            setStatus("Not Registred");
          }
          disableLoading();
          setSubmitting(false);
        })
        .catch((err) => {
          setSubmitting(false);
          setStatus("The login detail is incorrect");
          disableLoading();
        });
    },
  });

  const propsUpload = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      let idCardBase64 = "";
      getBase64(file, (result) => {
        idCardBase64 = result;
        setSelectedImage(idCardBase64);
      });
      return false;
    },
    fileList,
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const onFinish = (values) => {
    values.attachments = "";
    values.status = values.status ? values.status : "Active";
    setLoading(true);
    axios
      .post(CANDIDATE_REGISTER, values)
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess("User Added successfully");
          setTimeout(() => {
            props.history.push("/auth/login");
          }, 3000);
          setDefaultState();
        } else {
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        let errorMessage = "";
        {
          error.response.data &&
            Object.entries(error.response.data.errors).map(([key, value]) => {
              return (errorMessage += value + ", ");
            });
        }
        //setStatus("Somethign Went Wrong. Please try Again");
        // setStatus(errorMessage);
        setmsgError(errorMessage);
        setDefaultState();
      });
  };
  const onFinishFailed = (errorInfo) => {};

  const styleFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 0,
      },
    },
  };

  return (
    <Form
      ref={form}
      // id="register"
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      {showError(success, msgSuccess, error, msgError)}
      <Card>
        <Row gutter={24}>
          <Col span={8}>
            <FormItem
              label="First name"
              name={"first_name"}
              rules={[
                {
                  required: true,
                  message: "First name is required.",
                },
              ]}
            >
              <Input placeholder="First name" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="Middle name"
              name={"middle_name"}
              // rules={[
              //   {
              //     required: true,
              //     message: "Middle name is required.",
              //   },
              // ]}
            >
              <Input placeholder="Middle name" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="Last name"
              name={"last_name"}
              rules={[
                {
                  required: true,
                  message: "Last name is required.",
                },
              ]}
            >
              <Input placeholder="Last name" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <FormItem
              label="Email"
              name={"email"}
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Email Address is required.",
                },
              ]}
            >
              <Input placeholder="Email" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="Mobile"
              name={"mobile"}
              rules={[
                {
                  required: true,
                  message: "Mobile is required.",
                },
              ]}
            >
              <Input placeholder="Mobile" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <FormItem label="Total Experience">
              <Row gutter={24}>
                <Col span={12}>
                  <FormItem
                    label="Years"
                    name={"total_work_exp_year"}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Years",
                      },
                    ]}
                  >
                    <Select>
                      {yearsOfExpirance.map((user, index) => {
                        return (
                          <Option value={user.value} key={index}>
                            {user.label + (index < 2 ? " Year" : " Years")}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label="Months"
                    name={"total_work_exp_month"}
                    rules={[
                      {
                        required: true,
                        message: "Please Select Months",
                      },
                    ]}
                  >
                    <Select>
                      {monthsOfExpirance.map((user, index) => {
                        return (
                          <Option value={user.value} key={index}>
                            {user.label + (index < 2 ? " Month" : " Months")}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              label="Password"
              name={"password"}
              rules={[
                {
                  required: true,
                  message: "Password is required.",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              label="Confirm Password"
              name={"confirm_password"}
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm Password" />
            </FormItem>
          </Col>
          {/* <Col span={24}>
            <FormItem
              label="Upload Document (only .jpeg, .jpg, .png)"
              name={"attachments"}
            >
              <Upload {...propsUpload}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </FormItem>
          </Col> */}
          <Col span={24}>
            <FormItem
              name="Terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Should accept Terms")),
                },
              ]}
              {...styleFormItemLayout}
            >
              <Checkbox>
                I have read the <a href="">Terms & Conditions </a>
              </Checkbox>
            </FormItem>
          </Col>
        </Row>
      </Card>
      <br />
      <Card>
        <Row gutter={24}>
          <Col span={24}>
            {loading ? (
              <Button type="primary" size="large" loading>
                Saving . .
              </Button>
            ) : (
              <Button type="primary" size="large" htmlType="submit">
                Register
              </Button>
            )}
          </Col>
        </Row>
      </Card>
    </Form>
  );
}

const mapDispatchToProps = (dispatch) => ({
  setRole: (data) => {
    dispatch(setRole(data));
  },
  setUser: (data) => {
    dispatch(setUser(data));
  },
  setToken: (data) => {
    dispatch(setToken(data));
  },
});

export default connect(null, mapDispatchToProps)(Registration);
