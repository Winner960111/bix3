/* eslint-disable no-lone-blocks */
/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Radio,
  Modal,
  Typography,
  DatePicker,
  Space,
  Upload,
  Button,
  Spin,
} from "antd";
import {
  DownloadOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  optionEmploymentType,
} from "../../constant/constant";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  CANDIDATE_PERSONAL_DETAILS_EDIT,
  CANDIDATE_PROFILE_SUMMARY_EDIT,
  CANDIDATE_CV_UPLOAD,
} from "../../../../ApiUrl";

import ResumeParser from "./ResumeParser";
import { getBase64, showError } from "../../utils/helpers";
import ProfileOverviewUI from "./ProfileOverviewUI";
import CareerDetail from "./CareerDetail";

//import Resume from "./resume.json";

const { Text, Title } = Typography;
const FormItem = Form.Item;

function ProfileOverview(userProfile) {
  const formDetails = React.useRef();
  const formSummary = React.useRef();
  const [editVisibleSummary, setEditVisibleSummary] = useState(false);
  const [editVisibleDetails, setEditVisibleDetails] = useState(false);
  const [editVisibleProfile, setEditVisibleProfile] = useState(false);
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;

  useEffect(() => {
    setSummary();
  }, [editVisibleSummary]);

  const postEditSummary = (values) => {
    const isAttachments = values.hasOwnProperty("attachments");

    if (!isAttachments)
      values.attachments =
        values.attachments === null
          ? values.attachments
          : userProfileDetails.attachments;

    values.profile_image = userProfileDetails.profile_image;

    setLoading(true);
    axios
      .put(CANDIDATE_PROFILE_SUMMARY_EDIT + "/" + users.user._id, values, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          onClose();
          setSuccess(true);
          setMsgSuccess(res.data.message);
          setError(false);
          setTimeout(() => {
            userProfile.onclick();
          }, 3000);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setError(true);
        if (error.response.data.statusCode !== 400) {
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

  const postEditProfileDetails = (values) => {
    values.date_of_birth = dateValue;
    setLoading(true);
    axios
      .put(CANDIDATE_PERSONAL_DETAILS_EDIT + "/" + users.user._id, values, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          onClose();
          setSuccess(true);
          setMsgSuccess(res.data.message);
          setError(false);
          setTimeout(() => {
            userProfile.onclick();
          }, 3000);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setError(true);
        if (error.response.data.statusCode !== 400) {
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

  /**
   * reset state
   */
  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const showSummary = () => {
    setEditVisibleSummary(true);
  };

  const showDetails = () => {
    setEditVisibleDetails(true);
  };

  const showProfile = () => {
    setEditVisibleProfile(true);
  };

  /**
   * reset diloag visibality
   */
  const onClose = () => {
    setEditVisibleSummary(false);
    setEditVisibleDetails(false);
    setEditVisibleProfile(false);
  };

  const setSummary = () => {
    if (userProfileDetails) {
      if (formSummary.current) {
        formSummary.current.setFieldsValue({
          profile_summary: userProfileDetails.profile_summary,
        });
      }
    } else {
      if (formSummary.current) {
        formSummary.current.setFieldsValue({
          profile_summary: "",
        });
      }
    }
  };
  const EditModalSummary = () => {
    return (
      <Modal
        title="Profile Summary"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisibleSummary}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editSummary"
              htmlType="submit"
              key="submit"
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          ref={formSummary}
          id="editSummary"
          layout="vertical"
          onFinish={postEditSummary}
        >
          <Row gutter={24}>
            <Col span={24}>
              <FormItem name={"profile_summary"}>
                <Input.TextArea rows={6} placeholder="Type here..." />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  const setDetails = () => {
    if (userProfileDetails) {
      if (formDetails.current) {
        formDetails.current.setFieldsValue({
          permanent_address: userProfileDetails.permanent_address,
          gender: userProfileDetails.gender,
          area_pin_code: userProfileDetails.area_pin_code,
          home_town: userProfileDetails.home_town,
        });

        if (!dateValue)
          setDateValue(
            userProfileDetails.date_of_birth
              ? userProfileDetails.date_of_birth
              : new Date()
          );
      }
    } else {
      if (formDetails.current) {
        formDetails.current.setFieldsValue({
          permanent_address: "",
          gender: "",
          area_pin_code: "",
          home_town: "",
        });
      }
    }
  };

  function onChange(value, dateString) {
    setDateValue(dateString);
  }

  /**
   * show dialog for edit personal detail
   * @returns
   */
  const EditModalDetails = () => {
    const dateFormat = "YYYY/MM/DD";
    useEffect(() => {
      setDetails();
    });

    return (
      <Modal
        title="Personal Details"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisibleDetails}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editDetails"
              htmlType="submit"
              key="submit"
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          ref={formDetails}
          id="editDetails"
          layout="vertical"
          onFinish={postEditProfileDetails}
        //  onFinishFailed={onFinishFailed}
        >
          <Card>
            {showError(success, msgSuccess, error, msgError)}
            <FormItem label="Date of Birth" name={"date_of_birth"}>
              <Space direction="vertical">
                <DatePicker
                  onChange={onChange}
                  value={moment(dateValue, dateFormat)}
                // format={dateFormat}
                />
              </Space>
            </FormItem>
            <Row gutter={16}>
              <Col span={24}>
                <FormItem
                  label="Gender"
                  name={"gender"}
                  rules={[
                    {
                      required: true,
                      message: "Please select gender.",
                    },
                  ]}
                >
                  <Radio.Group>
                    <Radio value={"Male"}>Male</Radio>
                    <Radio value={"Female"}>Female</Radio>
                    <Radio value={"Other"}>Other</Radio>
                  </Radio.Group>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <FormItem
                  label="Permanent Address"
                  name={"permanent_address"}
                  rules={[
                    {
                      required: true,
                      message: "Address is required.",
                    },
                  ]}
                >
                  <Input placeholder="Enter your Permanent Address" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <FormItem
                  label="Hometown"
                  name={"home_town"}
                  rules={[
                    {
                      required: true,
                      message: "Hometown is required.",
                    },
                  ]}
                >
                  <Input placeholder="Enter your Hometown" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={16}>
                <FormItem
                  label="Area Pin Code"
                  name={"area_pin_code"}
                  rules={[
                    {
                      required: true,
                      message: "Area Pin Code is required.",
                    },
                  ]}
                >
                  <Input placeholder="Enter your Area Pin Code" />
                </FormItem>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    );
  };

  const userProfileDetails =
    userProfile.userProfile.data !== undefined
      ? userProfile.userProfile.data[0]
      : "";

  const desired_employment_type = optionEmploymentType.find((item) => {
    return item.value === userProfileDetails.desired_employment_type;
  });

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
        setDefaultState();
        return false;
      }

      if (
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        file.type !== "application/msword" &&
        file.type !== "application/pdf"
      ) {
        setError(true);
        setmsgError("Not a supported file format.");
        setDefaultState();
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
      }
      return false;
    },
    selectedFileList,
  };

  const onDeleteFile = () => {
    const values = {
      attachments: null,
      profile_summary: userProfileDetails.profile_summary,
    };
    postEditSummary(values);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

  return (
    <div>
      <Spin indicator={antIcon} spinning={loading}>
        <Card title="Attach Resume" className="mb-6">
          <Row gutter={24} className="mb-5">
            {userProfileDetails.attachments ? (
              <Col span={24}>
                <Row>
                  <Col span={12}>{userProfileDetails.attachments}</Col>
                  <Col span={12} className="text-right">
                    <a
                      href={
                        CANDIDATE_CV_UPLOAD + userProfileDetails.attachments
                      }
                      download
                      target="_blank"
                    >                      
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        className="mr-5 mb-2"
                      >
                        Download
                      </Button>
                    </a>
                    <Button
                      onClick={() => {
                        onDeleteFile();
                      }}
                      type="danger"
                      icon={<DeleteOutlined />}
                    >
                      Delete Resume
                    </Button>
                  </Col>
                </Row>
              </Col>
            ) : null}
            <Col span={12} offset={6}>
              <Title level={5} className="mb-0"></Title>
              <div className="text-center">
                <Upload {...propsUpload} accept=".pdf, .doc, .docx">
                  <Button>UPLOAD RESUME</Button>
                </Upload>
                <Text type="secondary">
                  Supported Formats: doc, pdf, upto 5 MB
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
        <ResumeParser />
        <ProfileOverviewUI
          userProfileDetails={userProfileDetails}
          showSummary={showSummary}
          showDetails={showDetails}
          showProfile={showProfile}
          desired_employment_type={desired_employment_type}
        />
        {EditModalSummary()}
        {EditModalDetails()}
        <CareerDetail
          editVisibleProfile={editVisibleProfile}
          categoryList={categoryList}
          userProfileDetails={userProfileDetails}
          userProfile={userProfile}
          onClose={onClose}
        />
        {showError(success, msgSuccess, error, msgError)}
      </Spin>
    </div>
  );
}

export default ProfileOverview;
