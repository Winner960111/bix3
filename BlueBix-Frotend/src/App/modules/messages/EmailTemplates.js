import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Select } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  EMAIL_TEMPLATES_BY_TYPE_DETAIL,
  EMAIL_TEMPLATES_CREATE,
  EMAIL_TEMPLATES_UPDATE,
} from "../../../ApiUrl";
import { showError } from "../../pages/utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const TEPLATES = [
  // { label: "Email Receive", value: "receive" },
  //  { label: "Email Sent", value: "sent" },
  { label: "Forgot Password", value: "forgot_password" },
  { label: "Footer", value: "email_footer" },
];

const ADMIN_TEPLATES = [
  // { label: "Email Receive", value: "receive" },
  //  { label: "Email Sent", value: "sent" },
  { label: "Forgot Password", value: "forgot_password" },
  { label: "Footer", value: "email_footer" },
  { label: "Welcome Footer", value: "register_user_footer" },
  { label: "Welcome Message", value: "register_user_welcome_msg" },
];

const TEMPLATES_IDS = [
  { label: "6124e74d1274d04a4094e78a", value: "forgot_password" },
  { label: "6124d8e51bf83c3bec6d43be", value: "email_footer" },
];

export default function EmailTempalte() {
  const formRef = React.useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [descEditor, setDescEditor] = React.useState([]);
  const [currentTamplete, setCurrentTamplete] = useState("");
  const [emailTemplateRes, setEmailTemplateRes] = useState("");
  const [emailTemplateDesc, setEmailTemplateDesc] = useState("");
  const [IsCreate, setSetCreate] = useState(false);
  const users = useSelector(({ users }) => users);
  const role = users.role;

  let job_description = "";
  let editor;

  useEffect(() => {
    setEmailTemplateRes("");
    if (currentTamplete !== "") {
      getCurrentTemplateDetail();
    }
  }, [currentTamplete]);

  const getCurrentTemplateDetail = () => {
    setEmailTemplateRes("");
    const params = {
      user_id: users.user._id,
      email_type: currentTamplete,
    };
    axios
      .post(EMAIL_TEMPLATES_BY_TYPE_DETAIL, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setEmailTemplateDesc(res.data.data.content);
        setSetCreate(res.data.data.content ? true : false);
        setEmailTemplateRes(res.data.data);
      })
      .catch((error) => {
        setEmailTemplateRes("");
        setEmailTemplateDesc("");
      });
  };

  const postEmailTemplate = (params) => {
    params.user_id = users.user._id;
    const createPost = axios.post(EMAIL_TEMPLATES_CREATE, params, {
      headers: { Authorization: users.token },
    });
    setLoading(true);
    createPost
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setDefaultState();
          setCurrentTamplete("");
        }
      })
      .catch((error) => {
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

  const emailUpdateTemplate = (params) => {
    const updatePost = axios.put(
      EMAIL_TEMPLATES_UPDATE + "/" + emailTemplateRes._id,
      params,
      {
        headers: { Authorization: users.token },
      }
    );
    setLoading(true);
    updatePost
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setDefaultState();
          setCurrentTamplete("");
        }
      })
      .catch((error) => {
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
    }, 3000);
  };

  const onFinish = () => {
    const editorData = descEditor.getData();
    const params = {
      email_type: currentTamplete,
      content: editorData,
    };
    if (currentTamplete !== "" && editorData !== "") {
      if (emailTemplateRes._id === undefined) {
        postEmailTemplate(params);
      } else {
        emailUpdateTemplate(params);
      }
    } else {
      setmsgError(
        currentTamplete === "" ? "Select template type" : "Please enter content"
      );
      setError(true);
      setDefaultState();
    }
  };

  const handleTemplateChange = (value) => {
    setCurrentTamplete(value);
  };

  function handleClose() {
    setLoading(false);
  }

  const templateList = users.role === "admin" ? ADMIN_TEPLATES : TEPLATES;

  return (
    <div>
      <div className="container">
        <Form ref={formRef} onFinish={onFinish} layout="vertical">
          <Card
            title="Email Content"
            className="mb-6 p-10"
            bodyStyle={{ padding: 0 }}
          >
            <Row gutter={24} style={{ margin: "20px", alignItems: "center" }}>
              <label for="by_source" className="" title="Template">
                Email Template :
              </label>
              <Col span={6}>
                <Select
                  placeholder="Select Email Template"
                  value={currentTamplete}
                  onChange={handleTemplateChange}
                  style={{ width: "100%" }}
                >
                  <Option value={""}>{"Select"}</Option>
                  {templateList.map((template, index) => (
                    <Option key={index.toString()} value={template.value}>
                      {template.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  //label="Message"
                  name={"message"}
                  //   rules={[
                  //     {
                  //       required: true,
                  //       message: "Please Enter Message.",
                  //     },
                  //   ]}
                >
                  <CKEditor
                    onChange={(event, editor) => {
                      job_description = editor.getData();
                    }}
                    editor={ClassicEditor}
                    data={emailTemplateDesc}
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
          </Card>
          <Card className="mb-6">
            <Button
              onClick={handleClose}
              type="primary"
              danger
              className="mr-5 mb-2"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Card>
        </Form>
        {showError(success, msgSuccess, error, msgError)}
      </div>
    </div>
  );
}
