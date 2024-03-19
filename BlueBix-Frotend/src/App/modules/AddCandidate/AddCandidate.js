import React, { useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import { setRole, setToken, setUser } from "../../../redux/actions/users";
import { getBase64, showError } from "../../pages/utils/helpers";
import { CANDIDATE_RECRUITER_REGISTER } from "../../../ApiUrl";
import {
  monthsOfExpirance,
  yearsOfExpirance,
} from "../../pages/constant/constant";

const { Option } = Select;
const { Text } = Typography;
const FormItem = Form.Item;

function AddCandidate(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileError, setFileError] = useState(false);

  const propsUpload = {
    onRemove: (file) => {
      const index = selectedFileList.indexOf(file);
      const newFileList = selectedFileList.slice();
      newFileList.splice(index, 1);
      setSelectedFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.size > 5000000) {
        setError(true);
        setmsgError("File should be less than 5 MB.");
        // setDefaultState();
        setDefaultStateForFile();
        return false;
      }

      // if (
      //   file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      //   file.type !== "application/msword" &&
      //   file.type !== "application/pdf"
      // ) {
      if (
        file.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        file.type !== "application/msword" &&
        file.type !== "application/pdf" &&
        file.type !== "text/csv"
      ) {
        setError(true);
        setmsgError("Not a supported file format.");
        // setDefaultState();
        setDefaultStateForFile();
        return false;
      } else {
        setSelectedFileList([...selectedFileList, file]);
        let idCardBase64 = ""; //vnd.openxmlformats-officedocument.wordprocessingml.document
        //msword
        getBase64(file, (result) => {
          idCardBase64 = result.replace(
            "vnd.openxmlformats-officedocument.wordprocessingml.document",
            "msword"
          );
          setSelectedFile(idCardBase64);
          const values = {
            attachments: idCardBase64,
            profile_summary: userProfileDetails.profile_summary,
          };
          postEditSummary(values);
        });
        setFileError(false);
      }
      return false;
    },
    selectedFileList,
  };

  const onFinish = (values) => {
    if (selectedFileList.length === 0) {
      setFileError(true);
      return;
    }
    values.attachments = selectedFile;
    values.status = values.status ? values.status : "Active";
    let usertoken = JSON.parse(
      JSON.parse(localStorage.getItem("persist:root")).users
    ).token;
    setLoading(true);
    axios
      .post(CANDIDATE_RECRUITER_REGISTER, values, {
        headers: { Authorization: usertoken },
      })
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setDefaultState();
          setTimeout(() => {
            props.history.goBack();
          }, 3000);
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
        setmsgError(errorMessage);
        setTimeout(() => {
          setSuccess(false);
          setLoading(false);
          setError(false);
          setMsgSuccess("");
          setmsgError("");
        }, 3000);
      });
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
      setClearState();
    }, 3000);
  };

  const setDefaultStateForFile = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const setClearState = () => {
    form.current.setFieldsValue({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      mobile: "",
      total_work_exp_year: "",
      total_work_exp_month: "",
      notes: "",
      attachments: "",
    });
    setSelectedFileList([]);
    setSelectedFile("");
  };

  return (
    <Form ref={form} id="AddCandidate" layout="vertical" onFinish={onFinish}>
      {showError(success, msgSuccess, error, msgError)}
      <Card title={"Add Candidate"}>
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
            <FormItem label="Middle name" name={"middle_name"}>
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
          <Col span={12}>
            <FormItem
              label="Notes"
              name={"notes"}
              // rules={[
              //   {
              //     required: true,
              //     message: "Notes is required.",
              //   },
              // ]}
            >
              <Input.TextArea rows={4} placeholder="Notes" />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              label={<span><span style={{ color: '#ff4d4f' }}>*</span> Upload Document (only doc, docx, pdf, csv)</span>}
              name={"attachments"}
            >
              {/*<Upload {...propsUpload}>*/}
              {/*    <Button icon={<UploadOutlined/>}>Upload</Button>*/}
              {/*</Upload>*/}
              <Upload {...propsUpload} accept=".pdf, .doc, .docx , .csv">
                <Button>UPLOAD RESUME</Button>
              </Upload>
              <Text type="secondary">
                Supported Formats: doc, docx, pdf, csv, upto 5 MB
              </Text>
              {fileError && (
                <p style={{ color: '#ff4d4f' }}>Please upload a document</p>
              )}
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
                Submit
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

export default connect(null, mapDispatchToProps)(AddCandidate);
