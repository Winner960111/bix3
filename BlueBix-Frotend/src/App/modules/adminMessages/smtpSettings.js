import React, { useState, useEffect } from "react";
import { Form, Col, Row, Card, Button, Input, Tabs, Switch } from "antd";
import axios from "axios";
import {
  SMTP_CREATE,
  SMTP,
  SMTP_EMAIL_TEST,
  EMAIL_ACTIVITY_LIST,
  EMAIL_ACTIVITY_UPDATE,
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { showError } from "../../pages/utils/helpers";

const FormItem = Form.Item;
const { TabPane } = Tabs;

function SmtpSettings() {
  const formRef = React.useRef();
  const formRefReceive = React.useRef();
  const formRefTest = React.useRef();
  const [loading, setLoading] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [currentTab, setCurrentTab] = useState("send");
  const [emailActivity, setEmailActivity] = useState([]);
  const [smtp, setSmtp] = useState(undefined);
  const users = useSelector(({ users }) => users);

  useEffect(() => {
    getSmtpSettings();
    getEmailNotificationList();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setValues();
    }, 500);
  }, [smtp, currentTab]);

  const onFinishReceive = (values) => {
    values.smtp_user_name = values ? values.email : "";
    values.email_type = "receive";
    values.user_id = users.user._id;
    values.email_protocol = "SMTP";
    values.smtp_port = values.smtp_port.toString();

    if (Object.keys(smtp).length === 0) {
      values.form_type = "create";
    } else {
      if (smtp.email_receive) {
        values.form_type = "edit";
      } else {
        values.form_type = "create";
      }
    }
    callSMTPapi(values);
  };

  const onFinishSend = (values) => {
    values.smtp_user_name = values ? values.email : "";
    values.email_type = "send";
    values.user_id = users.user._id;
    values.email_protocol = "SMTP";
    values.smtp_port = values.smtp_port.toString();

    if (Object.keys(smtp).length === 0) {
      values.form_type = "create";
    } else {
      if (smtp.email_send) {
        values.form_type = "edit";
      } else {
        values.form_type = "create";
      }
    }
    callSMTPapi(values);
  };

  const callSMTPapi = (values) => {
    setLoading(true);
    axios
      .post(SMTP_CREATE, values, {
        headers: {
          Authorization: users.token,
        },
      })
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setTimeout(() => {
            getSmtpSettings();
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
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
        }
        setDefaultState();
      });
  };

  const getSmtpSettings = () => {
    axios
      .get(SMTP + "/" + users.user._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setSmtp(res.data.data);
        setValues();
      })
      .catch((error) => {});
  };

  const getEmailNotificationList = () => {
    axios(EMAIL_ACTIVITY_LIST, {
      headers: { Authorization: users.token },
    })
      .then((res) => {
        setEmailActivity(res.data.data);
      })
      .catch((err) => {});
  };

  const updateEmailNotification = (elm) => {
    const updateNotifi = axios.put(
      EMAIL_ACTIVITY_UPDATE + "/" + elm._id,
      { status: elm.status },
      {
        headers: { Authorization: users.token },
      }
    );
  };

  const setValues = () => {
    let values = undefined;
    if (smtp && Object.keys(smtp).length > 0) {
      if (currentTab === "send") {
        values = smtp.email_send ? smtp.email_send : undefined;
        if (values)
          formRef.current.setFieldsValue({
            email_protocol: values.email_protocol,
            email_encryption: values.email_encryption,
            smtp_host: values.smtp_host,
            smtp_port: values.smtp_port,
            email: values.email,
            smtp_password: values.smtp_password,
            email_charset: values.email_charset,
            email_signature: values.email_signature,
          });
      } else if (currentTab === "receive") {
        values = smtp.email_receive ? smtp.email_receive : undefined;
        if (values && formRefReceive.current)
          formRefReceive.current.setFieldsValue({
            email_protocol: values.email_protocol,
            email_encryption: values.email_encryption,
            smtp_host: values.smtp_host,
            smtp_port: values.smtp_port,
            email: values.email,
            smtp_password: values.smtp_password,
            email_charset: values.email_charset,
            email_signature: values.email_signature,
          });
      }
    }
    if (values) {
    } else {
      if (formRef.current) {
        formRef.current.setFieldsValue({
          email_protocol: "",
          email_encryption: "",
          smtp_host: "",
          smtp_port: "",
          email: "",
          smtp_password: "",
          email_charset: "",
          email_signature: "",
        });
      }
      if (formRefReceive.current) {
        formRefReceive.current.setFieldsValue({
          email_protocol: "",
          email_encryption: "",
          smtp_host: "",
          smtp_port: "",
          email: "",
          smtp_password: "",
          email_charset: "",
          email_signature: "",
        });
      }
    }
  };

  const mailConfigration = (email_type) => {
    return (
      <>
        <Form
          ref={formRef}
          initialValues={{
            email_protocol: "",
            email_encryption: "",
            smtp_host: "",
            smtp_port: "",
            email: "",
            smtp_password: "",
            email_charset: "",
            email_signature: "",
          }}
          name={currentTab === "send" ? "send" : "receive"}
          onFinish={email_type === "receive" ? onFinishReceive : onFinishSend}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                label="Email Encryption"
                name={"email_encryption"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email Encryption",
                  },
                ]}
              >
                <Input placeholder="Email Encryption" />
              </FormItem>
              <FormItem
                label="SMTP Host"
                name={"smtp_host"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Host",
                  },
                ]}
              >
                <Input placeholder="SMTP Host" />
              </FormItem>
              <FormItem
                label="SMTP Port"
                name={"smtp_port"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Port",
                  },
                ]}
              >
                <Input placeholder="SMTP Port" />
              </FormItem>
              <FormItem
                label="Email"
                name={"email"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </FormItem>
              <FormItem
                label="SMTP Password"
                name={"smtp_password"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Password",
                  },
                ]}
              >
                <Input security={true} placeholder="SMTP Password" />
              </FormItem>
              <FormItem
                label="Email charset"
                name={"email_charset"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email charset",
                  },
                ]}
              >
                <Input placeholder="Email charset" />
              </FormItem>
              <FormItem label="Email Signature" name={"email_signature"}>
                <Input placeholder="Email Signature" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24} className="ml-1">
            <Button
              onClick={handleClose}
              type="primary"
              danger
              className="mr-5 mb-2"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="d-flex align-items-center"
            >
              Save
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Row>
        </Form>
      </>
    );
  };

  const mailConfigrationReceive = (email_type) => {
    return (
      <>
        <Form
          ref={formRefReceive}
          initialValues={{
            email_protocol: "",
            email_encryption: "",
            smtp_host: "",
            smtp_port: "",
            email: "",
            smtp_password: "",
            email_charset: "",
            email_signature: "",
          }}
          name={currentTab === "send" ? "send" : "receive"}
          onFinish={email_type === "receive" ? onFinishReceive : onFinishSend}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                label="Email Encryption"
                name={"email_encryption"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email Encryption",
                  },
                ]}
              >
                <Input placeholder="Email Encryption" />
              </FormItem>
              <FormItem
                label="SMTP Host"
                name={"smtp_host"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Host",
                  },
                ]}
              >
                <Input placeholder="SMTP Host" />
              </FormItem>
              <FormItem
                label="SMTP Port"
                name={"smtp_port"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Port",
                  },
                ]}
              >
                <Input placeholder="SMTP Port" />
              </FormItem>
              <FormItem
                label="Email"
                name={"email"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </FormItem>
              <FormItem
                label="SMTP Password"
                name={"smtp_password"}
                rules={[
                  {
                    required: true,
                    message: "Please enter SMTP Password",
                  },
                ]}
              >
                <Input security={true} placeholder="SMTP Password" />
              </FormItem>
              <FormItem
                label="Email charset"
                name={"email_charset"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email charset",
                  },
                ]}
              >
                <Input placeholder="Email charset" />
              </FormItem>
              <FormItem label="Email Signature" name={"email_signature"}>
                <Input placeholder="Email Signature" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24} className="ml-1">
            <Button
              onClick={handleClose}
              type="primary"
              danger
              className="mr-5 mb-2"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="d-flex align-items-center"
            >
              Save
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Row>
        </Form>
      </>
    );
  };

  const callSmtpEmailTest = (values) => {
    let smtpObject = undefined;
    if (smtp && Object.keys(smtp).length > 0) {
      if (currentTab === "send") {
        smtpObject = smtp.email_send ? smtp.email_send : undefined;
      } else if (currentTab === "receive") {
        smtpObject = smtp.email_receive ? smtp.email_receive : undefined;
      }
    }
    if (smtpObject) {
      values.email = smtpObject.email;
      setLoadingTest(true);
      axios
        .post(SMTP_EMAIL_TEST, values, {
          headers: {
            Authorization: users.token,
          },
        })
        .then((res) => {
          setLoadingTest(false);
          if (!res.data.error) {
            setSuccess(true);
            setLoadingTest(false);
            setError(false);
            setMsgSuccess(res.data.message);
            setDefaultState();
            formRefTest.current.resetFields();
          } else {
            formRefTest.current.resetFields();
            setDefaultState();
          }
        })
        .catch((error) => {
          setSuccess(false);
          setLoadingTest(false);
          setError(true);
          if (error.data) {
            let errorMessage = "";
            {
              error.response.data &&
                Object.entries(error.response.data.errors).map(
                  ([key, value]) => {
                    return (errorMessage += value + ", ");
                  }
                );
            }
            setmsgError(errorMessage);
          }
          formRefTest.current.resetFields();
          setDefaultState();
        });
    }
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

  function handleClose() {
    setLoading(false);
  }

  function callback(key) {
    setCurrentTab(key);
  }

  const handleSwitchEvent = (email_type, e) => {
    const updated = emailActivity.map((act) => {
      if (act.email_type === email_type) act.status = e;
      return act;
    });
    setEmailActivity(updated);

    const updatedelm = emailActivity.filter(
      (item) => item.email_type === email_type
    );
    updateEmailNotification(updatedelm[0]);
  };

  const testMailSend = () => {
    return (
      <>
        <Form ref={formRefTest} onFinish={callSmtpEmailTest} layout="vertical">
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                label="Email"
                name={"to"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Email",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </FormItem>
              <Button
                type="primary"
                htmlType="submit"
                className="d-flex align-items-center"
              >
                Test
                {loadingTest && (
                  <span className="mx-3 spinner spinner-white"> </span>
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Card title={"Email Configuration"}>
            <Tabs defaultActiveKey="Send" onChange={callback}>
              <TabPane tab="Email Outgoing Configuration" key="send">
                <Row gutter={24}>
                  <Col span={24}>{mailConfigration("send")}</Col>
                </Row>
              </TabPane>
              <TabPane tab="Email Incoming Configuration" key="receive">
                <Row gutter={24}>
                  <Col span={24}>{mailConfigrationReceive("receive")}</Col>
                </Row>
              </TabPane>
              {users.role == "bdm" ? (
                <TabPane tab="Email Notifications" className="mt-7">
                  <Row gutter={24}>
                    <Col span={14}>
                      <h3 className="card-title  text-dark">
                        Toggle Email Notifications
                      </h3>
                      <div className="mt-10 ml-5">
                        {emailActivity.map((item, index) => {
                          return (
                            <FormItem
                              label={item.description}
                              name="job_created"
                              key={index}
                              className="d-flex align-items-center"
                            >
                              <Switch
                                className="ml-7"
                                onChange={(e) =>
                                  handleSwitchEvent(item.email_type, e)
                                }
                                checked={item.status}
                              ></Switch>
                            </FormItem>
                          );
                        })}
                      </div>
                    </Col>
                  </Row>
                </TabPane>
              ) : (
                ""
              )}
            </Tabs>
          </Card>
          {currentTab === "send" || currentTab === "receive" ? (
            <Card title={"Test Email Configuration"}>{testMailSend()}</Card>
          ) : (
            ""
          )}
        </Col>
      </Row>
      {showError(success, msgSuccess, error, msgError)}
    </div>
  );
}

export default SmtpSettings;
