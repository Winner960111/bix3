/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import {
  Select,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Spin,
  Avatar,
  Image,
  Empty,
} from "antd";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  optionEmploymentType,
  Courses,
  CandidateSubmissionStatus,
  monsterMonths,
  noticePeriod,
} from "../../pages/constant/constant";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  IMAGE_CANDIDATE_URL,
  CANDIDATE,
  COMPANY_CANDIDATE_DETAILS,
  CANDIDATE_CV_UPLOAD,
  MONSTER_CANDIDATE_VIEW,
} from "../../../ApiUrl";
import { NavLink, useLocation } from "react-router-dom";
import RoomIcon from "@material-ui/icons/Room";
import CallIcon from "@material-ui/icons/Call";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import EmailIcon from "@material-ui/icons/Email";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { SmileOutlined } from "@ant-design/icons";
import {
  PostContactActivity,
  CONTACT_ACTIVITY_MODULE,
} from "../../pages/company/ActivityLogApiCall";
import PerfectScrollbar from "react-perfect-scrollbar";
import { showError } from "../../pages/utils/helpers";

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false,
};

const { Text, Title } = Typography;
const { Option } = Select;

function CandidateProfileDetail(props) {
  const formDetails = React.useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const [editVisibleDetails, setEditVisibleDetails] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [dateValue, setDateValue] = useState();
  const [timeValue, setTimeValue] = useState();
  let location = useLocation();
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;
  const Location = useLocation();
  const monsterId = Location.state;

  useEffect(() => {
    getMonsterDetail(monsterId);
  }, [monsterId]);

  const getMonsterDetail = (id) => {
    setLoading(true);
    axios
      .get(`${MONSTER_CANDIDATE_VIEW}/${id}`, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          getCandidateDetail(res.data.data);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.status === 401) {
          props.history.push("/logout");
        }
        setSuccess(false);
        setLoading(false);
        setError(true);
      });
  };

  const getCandidateDetail = (candidateId) => {
    setLoading(true);
    axios
      .post(
        COMPANY_CANDIDATE_DETAILS,
        { candidate_id: candidateId },
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        if (!res.data.error) {
          setUserProfile(res.data);
          setLoading(false);
          setError(false);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        if (error.response) {
          if (error.response && error.response.status === 401) {
            props.history.push("/logout");
          }
          setmsgError("Unauthenticated");
        }
        setDefaultState();
      });
  };

  const callActivity = (title, description) => {
    if (users.user.contact_person_details) {
      const contact_person_details = users.user.contact_person_details;
      const contactLogObject = {
        company_id: users.user._id,
        contact_id: users.user.contact_person_details._id,
        module: CONTACT_ACTIVITY_MODULE.SUBMISSION,
        title: title,
        description:
          description +
          contact_person_details.first_name +
          " " +
          contact_person_details.last_name,
      };
      PostContactActivity(contactLogObject, users.token);
    }
  };

  const updateCandidateStatus = (record, status) => {
    if (record !== undefined) {
      const statusObject = CandidateSubmissionStatus.find((item) => {
        return status === item.value;
      });
      const submission_status = statusObject
        ? statusObject.label
        : status.charAt(0, 1).toUpperCase() + status.slice(1);
      const openingId = location.state
        ? location.state.item.opening_details
          ? location.state.item.opening_details.opening_id
          : ""
        : "";
      setSuccess(false);
      setLoading(true);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
      axios
        .put(
          CANDIDATE + "/status/" + record._id,
          {
            status: status,
            opening_id: openingId,
          },
          {
            headers: { Authorization: users.token },
          }
        )
        .then((res) => {
          if (!res.data.error) {
            onClose();
            callActivity(
              record.first_name +
                " " +
                record.last_name +
                " Submission status update to " +
                submission_status,

              record.first_name +
                " " +
                record.last_name +
                " Submission status update to " +
                submission_status +
                " by "
            );
            setSuccess(true);
            setLoading(false);
            setError(false);
            setMsgSuccess(res.data.message);
            setDefaultState();
            setTimeout(() => {
              props.history.goBack();
            }, 6000);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            props.history.push("/logout");
          }
          setSuccess(false);
          setLoading(false);
          setError(true);
          setmsgError("Unauthenticated");
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

  const emeployeedata = (employers) => {
    if (employers && employers.length <= 0) {
      return (
        <Row gutter={24} className="mb-5">
          {EmptyView()}
        </Row>
      );
    }

    return employers.map((employer, index) => {
      return (
        <Row gutter={24} className="mb-5" key={index}>
          <Col span={24} className="mb-10">
            <Title level={5} className="mb-0">
              {employer.designation}
            </Title>
            <Text type="secondary">{employer.organization}</Text>
            <br />
            <Text type="secondary">
              {employer.work_since_from_month &&
                monsterMonths.find(
                  (month) => month.value == employer.work_since_from_month
                )?.label +
                  "/" +
                  employer.work_since_from_year}
              to
              {!employer.is_current_company
                ? employer.work_since_to_month &&
                  monsterMonths.find(
                    (month) => month.value == employer.work_since_to_month
                  )?.label +
                    "/" +
                    employer.work_since_to_year
                : "Present"}
            </Text>
            <br />
            <Text type="secondary">
              Available to join in{" "}
              {
                noticePeriod.find(
                  (notice) => notice.value == employer.notice_period
                )?.label
              }
            </Text>
            <br />
            <Text type="secondary">{employer.description_job_profile}</Text>
          </Col>
        </Row>
      );
    });
  };

  const qualificationsdata = () => {
    const qualifications = userProfileDetails.candidate_qualifications;
    if (qualifications && qualifications.length <= 0) {
      return (
        <Row gutter={24} className="mb-5">
          {EmptyView()}
        </Row>
      );
    }
    return qualifications.map((qualification, index) => {
      const course = Courses.find((item) => {
        return parseInt(item.value) === parseInt(qualification.course);
      });
      return (
        <Row key={index} gutter={24} className="mb-5">
          <Col span={24} className="mb-10">
            <Title level={5} className="mb-0">
              {course ? course.label : ""}
            </Title>
            <Text type="secondary">{qualification.university}</Text>
            <br />
            <Text type="secondary">
              {qualification.passing_year} ({qualification.course_type})
            </Text>
            <br />
          </Col>
        </Row>
      );
    });
  };

  const candidateStatusChange = (record, status) => {
    if (status === "I") {
      showDetails();
    } else {
      updateCandidateStatus(record, status);
    }
  };

  function onDateChange(value, dateString) {
    setDateValue(dateString);
  }
  function onTimeChange(time, timeString) {
    setTimeValue(timeString);
  }

  useEffect(() => {
    if (editVisibleDetails) setDetails();
  }, [editVisibleDetails]);

  const setDetails = () => {
    const dateFormat = "YYYY/MM/DD";
    if (userProfileDetails) {
      if (formDetails.current) {
        formDetails.current.setFieldsValue({
          interview_type: "", //userProfileDetails.interview_type,
          duration: "", // userProfileDetails.duration,
        });

        if (!dateValue) {
          setDateValue(
            userProfileDetails.date_of_interview
              ? userProfileDetails.date_of_interview
              : moment(new Date(), dateFormat)
          );
          setTimeValue(
            userProfileDetails.time_of_interview
              ? userProfileDetails.time_of_interview
              : "0:00 AM"
          );
        }
      }
    } else {
      if (formDetails.current) {
        formDetails.current.setFieldsValue({
          interview_type: "",
          duration: "",
        });
      }
    }
  };

  const showDetails = () => {
    setEditVisibleDetails(true);
  };
  const onClose = () => {
    setEditVisibleDetails(false);
  };

  const UsersView = () => {
    const item = location.state ? location.state.item : undefined;

    const submission_status =
      userProfileDetails.candidate_submission?.submission_status;
    const opening_id = userProfileDetails.candidate_submission?.opening_id;

    const job_opening_details = userProfileDetails.job_opening_details;

    const statusObject = CandidateSubmissionStatus.find((status) => {
      return submission_status
        ? submission_status.toUpperCase() === status.value.toUpperCase()
        : false;
    });

    const openingId = opening_id;

    return (
      <Row gutter={24} className="mb-5 mt-0">
        <Col span={users.role !== "admin" ? 12 : 24}>
          <Card style={{ backgroundColor: "#33549f" }} bordered={false}>
            <Space align="start" wrap={"Auto wrap line"}>
              <div>
                <Avatar
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ed7206",
                  }}
                  size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                  icon={
                    userProfileDetails.profile_image ? (
                      <Image
                        width={150}
                        preview={false}
                        src={
                          IMAGE_CANDIDATE_URL + userProfileDetails.profile_image
                        }
                      />
                    ) : (
                      <Title className="mb-0 text-white">
                        {" "}
                        {userProfileDetails.first_name &&
                        userProfileDetails.first_name !== ""
                          ? userProfileDetails.first_name
                              .charAt(0)
                              .toUpperCase()
                          : ""}{" "}
                      </Title>
                    )
                  }
                >
                  <Title className="mb-0 text-white">J</Title>
                </Avatar>
              </div>
              <Row gutter={24} className="mb-5">
                <Col span={24}>
                  <div className="pl-5">
                    <Title level={4} className="mb-0 text-white text-uppercase">
                      {userProfileDetails.first_name +
                        " " +
                        userProfileDetails.last_name}
                    </Title>
                    <Text style={{ color: "#ffffffb3" }} className="mb-5">
                      {position
                        ? position.designation + " at " + position.organization
                        : ""}
                    </Text>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <RoomIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.current_location
                            ? userProfileDetails.current_location
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <CallIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.mobile
                            ? userProfileDetails.mobile
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <BusinessCenterIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.total_work_exp_year +
                            " Year(s) " +
                            userProfileDetails.total_work_exp_month +
                            " Month(s)"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <EmailIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.email
                            ? userProfileDetails.email
                            : "-"}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <AccountBalanceWalletIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.current_ctc
                            ? parseInt(userProfileDetails.current_ctc) > 1000
                              ? "$ " +
                                parseInt(userProfileDetails.current_ctc) /
                                  1000 +
                                " K"
                              : userProfileDetails.current_ctc
                            : "$ 0.0"}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
        {users.role !== "admin" ? (
          <Col span={12}>
            <Card>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Opening Title
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>
                    {/* {job_opening_details.length > 0
                    ? job_opening_details[0].opening_title
                    : "-"} */}
                    {job_opening_details?.opening_title}
                  </Text>
                </Col>
              </Row>

              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Short Description
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>{job_opening_details?.short_description}</Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Salary Range ({job_opening_details?.salary_type})
                  </Title>
                </Col>
                <Col span={12}>
                  <Text>
                    ${job_opening_details?.salary_range_from} -
                    {job_opening_details?.salary_range_to}
                  </Text>
                </Col>
              </Row>

              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Submission Status
                  </Title>
                </Col>
                <Col span={12}>
                  {statusObject
                    ? statusObject.label
                    : submissionStatus.charAt(0, 1).toUpperCase() +
                      submissionStatus.slice(1)}
                </Col>
              </Row>
              {/* <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Interview schedules
                  </Title>
                </Col>
                <Col span={12}>
                  {statusObject
                    ? statusObject.value === "I" &&
                      location.state &&
                      interviewschedule
                      ? interviewschedule.message +
                      moment(interviewschedule.date_of_interview).format(
                        "DD-MM-YYYY"
                      ) +
                      " " +
                      (interviewschedule.time_of_interview === "0:00 AM"
                        ? "12:00 AM"
                        : interviewschedule.time_of_interview)
                      : ""
                    : "-"}
                </Col>
              </Row> */}
              {/* <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Comment
                  </Title>
                </Col>
                <Col span={12}>
                  {statusObject
                    ? statusObject.value === "I" &&
                      location.state &&
                      item &&
                      interviewschedule
                      ? interviewschedule.comment
                      : ""
                    : ""}
                </Col>
              </Row> */}
            </Card>
          </Col>
        ) : null}
      </Row>
    );
  };

  const CompanyView = () => {
    return (
      <Row gutter={24} className="mb-5 mt-0">
        <Col span={12}>
          <Card style={{ backgroundColor: "#33549f" }} bordered={false}>
            <Space align="start" wrap={"Auto wrap line"}>
              <div>
                <Avatar
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ed7206",
                  }}
                  size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                  icon={
                    userProfileDetails.profile_image ? (
                      <Image
                        width={150}
                        preview={false}
                        src={
                          IMAGE_CANDIDATE_URL + userProfileDetails.profile_image
                        }
                      />
                    ) : (
                      <Title className="mb-0 text-white">
                        {userProfileDetails.first_name
                          ? userProfileDetails.first_name
                              .charAt(0)
                              .toUpperCase()
                          : ""}
                      </Title>
                    )
                  }
                >
                  <Title className="mb-0 text-white">J</Title>
                </Avatar>
              </div>
              <Row gutter={24} className="mb-5">
                <Col span={24}>
                  <div className="pl-5">
                    <Title level={4} className="mb-0 text-white text-uppercase">
                      {userProfileDetails.first_name +
                        " " +
                        userProfileDetails.last_name}
                    </Title>
                    <Text style={{ color: "#ffffffb3" }} className="mb-5">
                      {position
                        ? position.designation + " at " + position.organization
                        : "-"}
                    </Text>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <RoomIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.current_location
                            ? userProfileDetails.current_location
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <CallIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.mobile
                            ? userProfileDetails.mobile
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <BusinessCenterIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.total_work_exp_year +
                            " Year(s) " +
                            userProfileDetails.total_work_exp_month +
                            " Month(s)"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <EmailIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.email
                            ? userProfileDetails.email
                            : "-"}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <AccountBalanceWalletIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {userProfileDetails.current_ctc
                            ? parseInt(userProfileDetails.current_ctc) > 1000
                              ? "$ " +
                                parseInt(userProfileDetails.current_ctc) /
                                  1000 +
                                " K"
                              : userProfileDetails.current_ctc
                            : "$ 0.0"}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Opening Title
                </Title>
              </Col>
              <Col span={12}>
                <Text>{job_opening_details?.opening_title}</Text>
              </Col>
            </Row>

            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Short Description
                </Title>
              </Col>
              <Col span={12}>
                <Text>{job_opening_details?.short_description}</Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Salary Range (Annualy)
                </Title>
              </Col>
              <Col span={12}>
                <Text>
                  $
                  {location.state
                    ? location.state.item.opening_details
                      ? location.state.item.opening_details
                          .job_opening_details[0].salary_range
                      : "0.00"
                    : "0.00"}
                </Text>
              </Col>
            </Row>

            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Submission Status
                </Title>
              </Col>
              <Col span={12}>
                <Select
                  placeholder="Select Status Name"
                  value={
                    location.state
                      ? location.state.item.opening_details.submission_status
                      : userProfileDetails.job_opening_details &&
                        userProfileDetails.job_opening_details.length > 0
                      ? userProfileDetails.job_opening_details
                          .submission_status === "active"
                        ? "Active"
                        : userProfileDetails.job_opening_details[0]
                            .submission_status
                      : ""
                  }
                  onChange={(status) => {
                    setSubmissionStatus(status);
                    candidateStatusChange(userProfileDetails, status);
                  }}
                  style={{ width: "100%" }}
                >
                  <Option value={""}>{"Select"}</Option>
                  {CandidateSubmissionStatus != undefined &&
                    CandidateSubmissionStatus.map((status, index) => (
                      <Option key={index.toString()} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };
  const EmptyView = () => {
    return (
      <Col span={24}>
        <Empty
          imageStyle={{
            height: 60,
          }}
          description={<span> Data Not Found </span>}
        ></Empty>
      </Col>
    );
  };
  const EmptyViewResume = () => {
    return (
      <Col span={24}>
        <Empty
          imageStyle={{
            height: 60,
          }}
          description={<span> No Attechments </span>}
        ></Empty>
      </Col>
    );
  };

  const customizeRenderEmpty = () => (
    <div style={{ textAlign: "center" }}>
      <SmileOutlined style={{ fontSize: 20 }} />
      <p>Data Not Found</p>
    </div>
  );

  const userProfileDetails =
    userProfile.data !== undefined ? userProfile.data[0] : null;

  const category = categoryList.find((item) => {
    return item.code === userProfileDetails
      ? userProfileDetails.job_category
      : "";
  });

  const position =
    userProfileDetails &&
    userProfileDetails.employees.find((employer) => {
      return employer.is_current_company === true;
    });

  const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

  return userProfileDetails ? (
    <div>
      <Spin indicator={antIcon} spinning={loading}>
        <Row gutter={24} className="mr-0">
          <NavLink
            className="pull-right w-100 text-right"
            to={
              {
                // pathname: "/company/job-openings",
              }
            }
          >
            <Button
              onClick={() => {
                props.history.goBack();
              }}
              type="Secondary"
            >
              Back
            </Button>
          </NavLink>
        </Row>
        {users.role === "company" ? CompanyView() : UsersView()}

        <Row gutter={24} className="mb-5 mt-0">
          <Col span={12}>
            <Card title="Personal Details" className="mb-6">
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Date of Birth
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.date_of_birth
                      ? moment(userProfileDetails.date_of_birth).format(
                          "DD/MM/YYYY"
                        )
                      : "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Permanent Address
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.permanent_address
                      ? userProfileDetails.permanent_address
                      : "-"}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Gender
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.gender
                      ? userProfileDetails.gender
                      : "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Area Pin Code
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.area_pin_code
                      ? userProfileDetails.area_pin_code
                      : "-"}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Hometown
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.home_town
                      ? userProfileDetails.home_town
                      : "-"}
                  </Text>
                </Col>
              </Row>
            </Card>
            <Card title="Career Profile">
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Job Category
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails &&
                    userProfileDetails.job_category &&
                    userProfileDetails.job_category.length > 0
                      ? userProfileDetails.job_category[0].name
                      : "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Role
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.role ? userProfileDetails.role : "-"}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Desired Job Type
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.desired_job_type
                      ? userProfileDetails.desired_job_type
                      : "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Desired Employment Type
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.desired_employment_type
                      ? optionEmploymentType.find(
                          (item) =>
                            item.value ===
                            userProfileDetails.desired_employment_type
                        ).label
                      : ""}
                    {/* {desiredEmploymentType
                      ? desiredEmploymentType.label
                      : "-"} */}
                  </Text>
                </Col>
              </Row>
              <Row gutter={24} className="mb-5">
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    Desired Shift
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.desired_shift
                      ? userProfileDetails.desired_shift
                      : "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Title level={5} className="mb-0">
                    desired Location
                  </Title>
                  <Text type="secondary">
                    {userProfileDetails.desired_location
                      ? userProfileDetails.desired_location
                      : "-"}
                  </Text>
                </Col>
              </Row>
            </Card>
            <Card title="Education" className="mb-6 mt-6">
              {userProfileDetails ? qualificationsdata() : null}
            </Card>
          </Col>

          <Col span={12}>
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
                            className="mr-5"
                          >
                            Download
                          </Button>
                        </a>
                      </Col>
                    </Row>
                  </Col>
                ) : (
                  EmptyViewResume()
                )}
              </Row>
            </Card>
            <Card title="Profile Summary" className="mb-6">
              <Row gutter={24} className="mb-5">
                {userProfileDetails.profile_summary ? (
                  <Col span={24}>
                    <PerfectScrollbar
                      options={perfectScrollbarOptions}
                      className="scroll"
                      style={{ maxHeight: "45vh", position: "relative" }}
                    >
                      <Text type="secondary">
                        {userProfileDetails.profile_summary}
                      </Text>
                    </PerfectScrollbar>
                  </Col>
                ) : (
                  EmptyView()
                )}
              </Row>
            </Card>

            <Card title="Employment" className="mb-6">
              {emeployeedata(userProfileDetails.employees)}
            </Card>
          </Col>
        </Row>

        {showError(success, msgSuccess, error, msgError)}
      </Spin>
    </div>
  ) : (
    <div></div>
  );
}

export default CandidateProfileDetail;
