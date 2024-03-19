import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Modal,
  Typography,
  Tooltip,
  Avatar,
  Upload,
  Space,
  Image,
  Progress,
  Button,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import axios from "axios";
import RoomIcon from "@material-ui/icons/Room";
import CallIcon from "@material-ui/icons/Call";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import EmailIcon from "@material-ui/icons/Email";
import { monthsOfExpirance, yearsOfExpirance } from "../constant/constant";
import {
  CANDIDATE_PROFILE_SUMMARY_EDIT,
  IMAGE_CANDIDATE_URL,
  CANDIDATE_EDIT,
  US_CITY_LIST,
  US_STATE_LIST,
  REMOVE_PROFILE_IMAGE,
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { getBase64, showError } from "../utils/helpers";

const { Text, Title } = Typography;
const { Option } = Select;
const FormItem = Form.Item;

function ProfileCard(userProfile) {
  const formEditProfileImage = React.useRef();
  const formRef = useRef();
  const [editVisibleProfile, setEditVisibleProfile] = useState(false);
  const [editVisibleProfileImage, setEditVisibleProfileImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const users = useSelector(({ users }) => users);

  const basicProfile = userProfile.userProfile
    ? userProfile.userProfile.data[0]
    : "";

  const onClose = () => {
    if (editVisibleProfile) setUserValues();
    setEditVisibleProfile(false);
    setEditVisibleProfileImage(false);
  };

  const showDetails = () => {
    setEditVisibleProfile(true);
  };
  const showProfileImage = () => {
    setEditVisibleProfileImage(true);
  };

  const deleteProfileImage = (src) => {
    axios
      .delete(REMOVE_PROFILE_IMAGE, {
        headers: {
          Authorization: users.token,
        },
      })
      .then((res) => {
        setSuccess(true);
        setMsgSuccess(res.data.message);
        setTimeout(() => {
          userProfile.onclick();
        }, 3000);
        setDefaultState();
      })
      .catch((error) => {});
  };

  useEffect(() => {}, [users]);

  useEffect(() => {
    getStatesList();
  }, []);

  useEffect(() => {
    getCityList(selectedState);
  }, [selectedState]);

  const getStatesList = () => {
    axios
      .get(US_STATE_LIST, {})
      .then((res) => {
        setStateList(res.data.data);
      })
      .catch((error) => {});
  };

  const getCityList = (stateId) => {
    axios
      .post(US_CITY_LIST, { state_id: stateId })
      .then((res) => {
        setCityList(res.data.data);
      })
      .catch((error) => {});
  };
  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    formRef.current.setFieldsValue({
      stateName: stateCode,
      city: "",
    });
  };
  const handleCityChange = (citycode) => {
    setSelectedCity(citycode);
    formRef.current.setFieldsValue({
      city: citycode,
    });
  };

  const editProfile = (values) => {
    values.key_skills = basicProfile.key_skills;
    values.status = basicProfile.status;
    values.first_name =
      values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1);
    values.middle_name = values.middle_name
      ? values.middle_name.charAt(0).toUpperCase() + values.middle_name.slice(1)
      : "";
    values.last_name =
      values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1);

    const stateObject = stateList.find((item) => {
      return parseInt(item.code) === parseInt(values.stateName);
    });

    const cityObject = cityList.find((item) => {
      return parseInt(item.code) === parseInt(values.city);
    });

    const cityLable = cityObject !== undefined ? cityObject.city : values.city;
    const stateLable =
      stateObject !== undefined ? stateObject.state : values.stateName;

    values.current_location = cityLable + ", " + stateLable;

    axios
      .put(CANDIDATE_EDIT + "/" + users.user._id, values, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setEditVisibleProfile(false);
          setMsgSuccess(res.data.message);
          setLoading(false);
          setError(false);
          setTimeout(() => {
            userProfile.onclick();
          }, 3000);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
        } else {
          setmsgError(error.response.data.message);
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

  const setUserValues = (user) => {
    //const {state} = this.props.location
    //  const user = basicProfile;
  };

  useEffect(() => {
    //if (editVisibleProfileImage) setUserValues();
  }, [basicProfile]);

  const editSummary = () => {
    const values = {
      attachments: basicProfile.attachments,
      profile_summary: basicProfile.profile_summary,
      profile_image: selectedFile,
    };
    editSummaryApiCall(values);
  };

  const editSummaryApiCall = (values) => {
    setLoading(true);
    axios
      .put(CANDIDATE_PROFILE_SUMMARY_EDIT + "/" + users.user._id, values, {
        headers: {
          Authorization: users.token,
        },
      })
      .then((res) => {
        if (!res.data.error) {
          setSuccess(true);
          onClose();
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

  const EditModalProfileImage = () => {
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
          const values = {
            attachments: basicProfile.attachments,
            profile_summary: basicProfile.profile_summary,
            profile_image: idCardBase64,
          };
        });
        return false;
      },
      selectedFileList,
    };

    return (
      <Modal
        title="Profile Photo Upload"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisibleProfileImage}
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
              form="formEditProfileImage"
              htmlType="submit"
              key="submit"
              type="primary"
              onClick={editSummary}
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          ref={formEditProfileImage}
          id="editProfileImage"
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={24}>
              <Title level={5} className="mb-0"></Title>
              <div className="text-center">
                <Upload {...propsUpload}>
                  <Button>UPLOAD PHOTO</Button>
                </Upload>
                <Text type="secondary">
                  Supported file format: png, jpg, jpeg, gif - upto 3MB
                </Text>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  const editModalBasicDetails = (user) => {
    const location =
      user && user.current_location
        ? user.current_location.includes(",")
          ? user.current_location.split(",")
          : ["", ""]
        : ["", ""];

    // const stateObject = stateList.find((item) => {
    //   return parseInt(item.state) === parseInt(location[0]);
    // });

    // const cityObject = cityList.find((item) => {
    //   return parseInt(item.city) === parseInt(location[1]);
    // });

    // const locationStr = stateObject
    //   ? stateObject.code + " " + cityObject
    //     ? cityObject.code
    //     : ""
    //   : "";

    const locationStr = location[1] + " " + location[0];

    const param = user
      ? {
          first_name: user.first_name,
          middle_name: user.middle_name,
          last_name: user.last_name,
          current_location:
            location[0] === "" ? user.current_location : locationStr,
          mobile: user.mobile,
          email: user.email,
          total_work_exp_year: user.total_work_exp_year,
          total_work_exp_month: user.total_work_exp_month,
          current_ctc: user.current_ctc ? user.current_ctc : "",
          stateName: location[1] === "" ? selectedState : location[1],
          city: location[0] === "" ? selectedCity : location[0],
        }
      : {};

    return (
      <Modal
        title="Basic Details"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisibleProfile}
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
              form="editProfile"
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
          ref={formRef}
          initialValues={param}
          id="editProfile"
          layout="vertical"
          onFinish={editProfile}
        >
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
                      max: 15,
                      message: "First name must be between 3 to 15 characters.",
                      min: 3,
                      message: "First name must be between 3 to 15 characters.",
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
                  rules={[
                    {
                      // required: true,
                      // message: "Middle name is required.",
                      max: 15,
                      message:
                        "Middle name must be between 3 to 15 characters.",
                      min: 3,
                      message:
                        "Middle name must be between 3 to 15 characters.",
                    },
                  ]}
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
                      max: 15,
                      message: "Last name must be between 3 to 15 characters.",
                      min: 3,
                      message: "Last name must be between 3 to 15 characters.",
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
              <Col span={24}>
                {/* <FormItem
                  label="Location"
                  name={"current_location"}
                  rules={[
                    {
                      required: true,
                      message: "Location is required.",
                    },
                  ]}
                >
                  <Input placeholder="Location" />
                </FormItem> */}

                <FormItem label="Location">
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem
                        label="State"
                        name={"stateName"}
                        rules={[
                          {
                            required: true,
                            message: "Please select State",
                          },
                        ]}
                      >
                        <Select onChange={handleStateChange}>
                          {stateList.map((state, index) => {
                            return (
                              <Option value={state.code} key={index.toString()}>
                                {state.state}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        label="City"
                        name={"city"}
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Please select City.",
                        //   },
                        // ]}
                      >
                        <Select onChange={handleCityChange}>
                          {cityList.map((city, index) => {
                            return (
                              <Option value={city.code} key={index.toString()}>
                                {city.city}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
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
                              <Option value={user.value} key={index.toString()}>
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
                              <Option value={user.value} key={index.toString()}>
                                {user.label +
                                  (index < 2 ? " Month" : " Months")}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem>
                  <Col span={24}>
                    <FormItem
                      label="Annual Salary"
                      name={"current_ctc"}
                      rules={[
                        {
                          required: true,
                          message: "This is required field",
                        },
                      ]}
                    >
                      <Input
                        prefix={"$"}
                        placeholder="Salary"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </FormItem>
                  </Col>
                </FormItem>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    );
  };

  const position =
    basicProfile &&
    basicProfile.employees.find((employer) => {
      return employer.is_current_company === true;
    });

  return (
    <Card style={{ backgroundColor: "#33549f" }} bordered={false}>
      <Space align="start">
        <div
          // style={{height: 150, width: 150}}
          className="cursor-pointer d-flex"
        >
          <Avatar
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ed7206",
            }}
            onClick={() => {
              showProfileImage();
            }}
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            icon={
              basicProfile.profile_image ? (
                <Image
                  width={150}
                  preview={false}
                  // src={`${IMAGE_CANDIDATE_URL}${  basicProfile.profile_picture}`}
                  src={IMAGE_CANDIDATE_URL + basicProfile.profile_image}
                />
              ) : (
                <Title className="mb-0 text-white">
                  {" "}
                  {basicProfile.first_name && basicProfile.first_name !== ""
                    ? basicProfile.first_name.charAt(0).toUpperCase()
                    : ""}{" "}
                </Title>
              )
            }
          ></Avatar>
          {basicProfile.profile_image ? (
            <Image
              width={12}
              preview={false}
              src={"https://cdn-icons-png.flaticon.com/512/2961/2961937.png"}
              className={"-ml-1"}
              onClick={() => {
                deleteProfileImage(basicProfile.profile_image);
              }}
            />
          ) : (
            ""
          )}
        </div>
        <div className="pl-5">
          <Title level={4} className="mb-0 text-white text-uppercase">
            {(basicProfile.first_name || "") +
              " " +
              (basicProfile.middle_name || "") +
              " " +
              (basicProfile.last_name || "")}
            <Tooltip placement="top" title="Edit Your Profile Details">
              <EditOutlined
                style={{ fontSize: "20px", color: "#FFF" }}
                onClick={showDetails}
              />
            </Tooltip>
          </Title>
          <Text style={{ color: "#ffffffb3" }} className="mb-5">
            {position
              ? position.designation + " at " + position.organization
              : ""}
          </Text>
          <Row gutter={24} className="pl-2">
            <Col span="12" className="p-1">
              <RoomIcon style={{ color: "#ffffffb3", marginRight: "3px" }} />
              <Text className="text-white">
                {basicProfile.current_location}
              </Text>
            </Col>
            <Col span="12" className="p-1">
              <CallIcon style={{ color: "#ffffffb3", marginRight: "3px" }} />
              <Text className="text-white">{basicProfile.mobile}</Text>
            </Col>
            <Col span="12" className="p-1">
              <BusinessCenterIcon
                style={{ color: "#ffffffb3", marginRight: "3px" }}
              />
              <Text className="text-white">
                {basicProfile.total_work_exp_year +
                  " Year(s) " +
                  basicProfile.total_work_exp_month +
                  " Month(s)"}
              </Text>
            </Col>
            <Col span="12" className="p-1">
              <EmailIcon style={{ color: "#ffffffb3", marginRight: "3px" }} />
              <Text className="text-white">{basicProfile.email}</Text>
            </Col>
          </Row>
          <Row gutter={24} className="pl-2">
            <Col span="12" className="p-1">
              <AccountBalanceWalletIcon
                style={{ color: "#ffffffb3", marginRight: "3px" }}
              />
              <Text className="text-white">
                {basicProfile.current_ctc
                  ? parseInt(basicProfile.current_ctc) > 1000
                    ? "$ " + parseInt(basicProfile.current_ctc) / 1000 + " K"
                    : "$ " + basicProfile.current_ctc
                  : "$ 0.0"}
              </Text>
            </Col>
          </Row>
          <Row gutter={24} className="pl-2">
            <Col span="24" className="p-1">
              <Text className="text-white">Profile Stength</Text>
              <Progress
                percent={
                  basicProfile.profile_strength
                    ? basicProfile.profile_strength
                    : ""
                }
              />
            </Col>
          </Row>
        </div>
      </Space>
      {showError(success, msgSuccess, error, msgError)}
      {editModalBasicDetails(basicProfile)}
      {EditModalProfileImage()}
    </Card>
  );
}

export default ProfileCard;
