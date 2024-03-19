import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Row, Upload } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { UploadOutlined } from "@ant-design/icons";
import { SMTP_EMAIL_SEND, SMTP } from "../../../ApiUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { getBase64, showError } from "../../pages/utils/helpers";

const FormItem = Form.Item;

export default function Compose() {
  const formRef = React.useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [jobDesc] = useState("");
  const [descEditor, setDescEditor] = React.useState([]);
  const [emails, setEmails] = useState([]);
  const [smtp, setSmtp] = useState([]);
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const users = useSelector(({ users }) => users);
  let job_description = "";
  let editor;

  useEffect(() => {
    getSmtpSettings();
  }, [users]);

  const getSmtpSettings = () => {
    axios
      .get(SMTP + "/" + users.user._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setSmtp(res.data.data);
      })
      .catch((error) => {});
  };

  function handleClose() {
    setLoading(false);
  }

  const propsUpload = {
    onRemove: (file) => {
      const index = selectedFileList.indexOf(file);
      const newFileList = selectedFileList.slice();
      newFileList.splice(index, 1);
      setSelectedFileList(newFileList);
    },
    beforeUpload: (file) => {
      setSelectedFileList([...selectedFileList, file]);
      let idCardBase64 = "";
      getBase64(file, (result) => {
        idCardBase64 = result;
        setSelectedFile(idCardBase64);
      });
      return false;
    },
    selectedFileList,
  };

  const onFinish = (values) => {
    values.attachment = selectedFile ? selectedFile : "";
    const editorData = descEditor.getData();
    values.message = editorData;
    values.to = emails;
    values.email = Object.keys(smtp).length > 0 ? smtp.email_send.email : "";
    callSmtpSend(values);
  };

  const callSmtpSend = (values) => {
    setLoading(true);
    axios
      .post(SMTP_EMAIL_SEND, values, {
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
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
          setError(true);
        }
        setDefaultState();
      });
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
      setEmails([]);
      formRef.current.resetFields();
    }, 3000);
  };

  return (
    <div>
      <div className="container">
        <Form ref={formRef} onFinish={onFinish} layout="vertical">
          {showError(success, msgSuccess, error, msgError)}
          <Card title="Compose" className="mb-6">
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  label="Email Address"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Email Address",
                    },
                  ]}
                >
                  <>
                    <ReactMultiEmail
                      placeholder="Emails"
                      emails={emails}
                      name={"email"}
                      onChange={(_emails) => {
                        // this.setState({emails: _emails});
                        setEmails(_emails);
                      }}
                      validateEmail={(email) => {
                        return isEmail(email); // return boolean
                      }}
                      getLabel={(email, index, removeEmail) => {
                        return (
                          <div data-tag key={index}>
                            {email}
                            <span
                              data-tag-handle
                              onClick={() => removeEmail(index)}
                            >
                              ×
                            </span>
                          </div>
                        );
                      }}
                    />
                  </>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  label="Subject"
                  name={"subject"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Subject",
                    },
                  ]}
                >
                  <Input disabled={false} placeholder="Subject" />
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem label="Upload Attachments" name={"attachment"}>
                  <Upload {...propsUpload}>
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  label="Message"
                  name={"message"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Message.",
                    },
                  ]}
                >
                  <CKEditor
                    onChange={(event, editor) => {
                      job_description = editor.getData();
                    }}
                    editor={ClassicEditor}
                    data={jobDesc}
                    onInit={(editor) => {
                      // You can store the "editor" and use when it is needed.
                      editor.editing.view.change((writer) => {
                        writer.setStyle(
                          "height",
                          "500px",
                          editor.editing.view.document.getRoot()
                        );
                      });
                    }}
                    onReady={(newEditor) => {
                      editor = newEditor;
                      setDescEditor(newEditor);
                    }}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row className="mb-6">
              <Button
                onClick={handleClose}
                type="primary"
                danger
                className="mr-5 d-flex align-items-center mb-2"
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Send
                {loading && (
                  <span className="mx-3 spinner spinner-white"> </span>
                )}
              </Button>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
}
