import React, { useState } from "react";
import { useFormik } from "formik";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import * as Yup from "yup";
import * as auth from "../../_redux/authRedux";
import { resetPasswordUser } from "../../_redux/authCrud";
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Button,
} from "antd";
import { showError } from "../../../../pages/utils/helpers";

const initialValues = {
  email: "",
  password: "",
  confirm_password: "",
};

const FormItem = Form.Item;

function ResetPassword(props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [isRequested, setIsRequested] = useState(false);
  const ForgotPasswordSchema = Yup.object().shape({
    // email: Yup.string()
    //   .email("Wrong email format")
    //   .min(3, "Minimum 3 symbols")
    //   .max(50, "Maximum 50 symbols")
    //   .required("Required field"),
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
  });

  const params = props.match.params;

  const getInputClasses = (fieldname) => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return "is-invalid";
    }

    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return "is-valid";
    }

    return "";
  };

  const formik = useFormik({
    initialValues,
    // validationSchema: ForgotPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      values.token = params.id
      // requestPasswordCandidate(values)
      //   .then(() => setIsRequested(true))
      //   .catch(() => {
      //     setIsRequested(false);
      //     setSubmitting(false);
      //     setStatus(
      //       intl.formatMessage(
      //         "The requested {values.email} is not found",
      //         { name: values.email }
      //       )
      //     );
      //   });
    },
  });

  const onFinish = (values) => {
    values.token = params.id
    resetPasswordUser(values)
      .then((res) => {
        const result = res.data;
        if (!result.data.error) {
          setSuccess(true)
          setMsgSuccess(result.message)
          setLoading(false)
          setTimeout(() => {
            setIsRequested(true)
          }, 2000);
        }
      })
      .catch((error) => {
        setIsRequested(false);
        setLoading(false)
        if (error?.response?.data) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setError(true)
          setmsgError(errorMessage)
          setTimeout(() => {
            setError(false)
            // setmsgError()
          }, 2000);
        }
        // setStatus(
        //     intl.formatMessage(
        //         "The requested {values.email} is not found",
        //         { name: values.email }
        //     )
        // );
      });
  }

  return (
    <>
      {isRequested && <Redirect to="/auth/admin" />}
      {!isRequested && (
        <div className="login-form login-forgot" style={{ display: "block" }}>
          <div className="text-center mb-10">
            <h3 className="font-size-h1">Reset Password ?</h3>
            <div className="text-muted font-weight-bold">
              Enter your password & confirm password to reset
            </div>
          </div>
          <Form
            id="register"
            layout="vertical"
            onFinish={onFinish}
          //onFinishFailed={onFinishFailed}
          >
            {showError(success, msgSuccess, error, msgError)}
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
            <Card>
              <Row gutter={24}>
                <Col span={24}>
                  {loading ? (
                    <Button type="primary" size="large" loading>
                      Saving . .
                    </Button>
                  ) : (
                    <Button type="primary" size="large" htmlType="submit">
                      Submit
                    </Button>
                  )}
                </Col>
              </Row>
            </Card>
          </Form>
        </div>
      )}
    </>
  );
}

export default connect(null, auth.actions)(ResetPassword);
