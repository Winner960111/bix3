import React, { useEffect, useState } from "react";
import {
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
import { useSelector } from "react-redux";
import axios from "axios";
import { CANDIDATE_CV_UPLOAD, MONSTER_CANDIDATE_VIEW } from "../../../ApiUrl";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import RoomIcon from "@material-ui/icons/Room";
import CallIcon from "@material-ui/icons/Call";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import EmailIcon from "@material-ui/icons/Email";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

const { Text, Title } = Typography;

const SearchDetail = () => {
  const users = useSelector(({ users }) => users);
  const history = useHistory();
  const Location = useLocation();
  const data = Location.state;
  const [loading, setLoading] = useState(false);
  const [candidateDetail, setCandidateDetail] = useState({});

  useEffect(() => {
    getCandidateDetail();
    return () => {};
  }, [data]);

  const getCandidateDetail = () => {
    setLoading(true);
    axios
      .get(`${MONSTER_CANDIDATE_VIEW}/${data}`, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setCandidateDetail(res.data.data);
        }
      })
      .catch((err) => {
        setLoading(false);
        // if (err.response && err.response.status === 401) {
        //     props.history.push("/logout");
        // }
        // setSuccess(false);
        // setLoading(false);
        // setError(true);
      });
  };

  const userProfileDetails1 = {
    identity: {
      textResumeID: "6br3ez8vzisqutzv",
      resumeModifiedDate: "2023-07-26T19:20:00.0000000Z",
      md5EmailAddress: "eb93c7b9e7939822b37098d4fd74b587",
      emailAddress: "w_harris_06@yahoo.com",
      name: "Winston Harris",
    },
    location: {
      city: "North Providence",
      state: "RI",
      postalCode: "02904",
      country: "US",
      willRelocate: true,
      workAuthorizations: [
        {
          authorization:
            "I am authorized to work in this country for any employer.",
          country: "US",
        },
      ],
    },
    yearsOfExperience: 15.1,
    relevance: {
      experience: {
        title: {
          name: "Aircraft Technician-Crew Chief",
        },
        company: {
          name: "Quonset Air Force base",
        },
      },
      skills: [
        {
          name: "Desktop PC",
          yearsOfExperience: 10.1,
          lastUsed: "2023-05-14T23:00:00.0000000Z",
          matched: "",
        },
        {
          name: "Systems Administration/Management",
          yearsOfExperience: 10,
          lastUsed: "2023-05-14T23:00:00.0000000Z",
          matched: "",
        },
        {
          name: "Customer Support/Service",
          yearsOfExperience: 8.9,
          matched: "",
        },
      ],
    },
    boards: [
      {
        id: 1,
        name: "Monster",
      },
      {
        id: 6143,
        name: "Diversity",
      },
    ],
    resumeTitle: "UploadedProfile-2c08085e-8f9f-47a6-b9e0-efe1ab9be3fe",
    targetJobTitle: "",
    desiredSalary: {
      min: "",
      max: "",
    },
    phoneNumbers: [
      {
        phoneNumberValue: "+14016614999",
        priority: "Primary",
        type: "Mobile",
      },
    ],
    highestEducationDegree: "Bachelor's Degree",
    resumeModifiedDate: "2023-07-26T19:20:00.0000000Z",
  };

  const identity = candidateDetail.identity;
  const location = candidateDetail.location;
  const workAuthorizations = location ? location.workAuthorizations : "";
  const experience = candidateDetail.relevance
    ? candidateDetail.relevance.experience
    : {};
  const skills = candidateDetail.relevance
    ? candidateDetail.relevance.skills
    : [];

  const UsersView = () => {
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
                    identity && identity.profile_image ? (
                      <Image
                        width={150}
                        preview={false}
                        src={identity.profile_image}
                      />
                    ) : (
                      <Title className="mb-0 text-white">
                        {identity && identity.name && identity.name !== ""
                          ? identity.name.charAt(0).toUpperCase()
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
                      {identity && identity.name}
                    </Title>
                    <Text style={{ color: "#ffffffb3" }} className="mb-5">
                      {/* {identity
                                                ? identity.designation + " at " + identity.organization
                                                : ""} */}
                    </Text>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <RoomIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {location
                            ? `${location.country}-${location.state}-${location.city}` +
                              "  "
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <CallIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {candidateDetail.phoneNumbers
                            ? candidateDetail.phoneNumbers[0].phoneNumberValue
                            : "-"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <BusinessCenterIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {candidateDetail.yearsOfExperience + " Year(s)"}
                        </Text>
                      </Col>
                      <Col span="12" className="p-1">
                        <EmailIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {identity ? identity.emailAddress : "-"}
                        </Text>
                      </Col>
                    </Row>
                    <Row gutter={24} className="pl-2">
                      <Col span="12" className="p-1">
                        <AccountBalanceWalletIcon
                          style={{ color: "#ffffffb3", marginRight: "3px" }}
                        />
                        <Text className="text-white">
                          {candidateDetail.current_ctc
                            ? parseInt(candidateDetail.current_ctc) > 1000
                              ? "$ " +
                                parseInt(candidateDetail.current_ctc) / 1000 +
                                " K"
                              : candidateDetail.current_ctc
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

  const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

  return (
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
              history.goBack();
            }}
            type="Secondary"
          >
            Back
          </Button>
        </NavLink>
      </Row>
      <UsersView />
      <Row gutter={24} className="mb-5 mt-0">
        <Col span={12}>
          <Card title="Personal Details" className="mb-6">
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Date of Birth
                </Title>
                <Text type="secondary">
                  {candidateDetail.date_of_birth
                    ? moment(candidateDetail.date_of_birth).format("DD/MM/YYYY")
                    : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Permanent Address
                </Title>
                <Text type="secondary">
                  {location
                    ? `${location.country}-${location.state}-${location.city}` +
                      "  "
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
                  {candidateDetail.gender ? candidateDetail.gender : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Area Pin Code
                </Title>
                <Text type="secondary">
                  {location && location.postalCode ? location.postalCode : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Hometown
                </Title>
                <Text type="secondary">
                  {location && location.city ? location.city : "-"}
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
                  {candidateDetail &&
                  candidateDetail.job_category &&
                  candidateDetail.job_category.length > 0
                    ? candidateDetail.job_category[0].name
                    : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Role
                </Title>
                <Text type="secondary">
                  {candidateDetail.role ? candidateDetail.role : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Title
                </Title>
                <Text type="secondary">
                  {experience && experience.title ? experience.title.name : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Company
                </Title>
                <Text type="secondary">
                  {experience && experience.company
                    ? experience.company.name
                    : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Desired Salary
                </Title>
                <Text type="secondary">
                  $
                  {candidateDetail.desiredSalary
                    ? (candidateDetail.desiredSalary.min !== ""
                        ? candidateDetail.desiredSalary.min
                        : "0.00") +
                      "-" +
                      (candidateDetail.desiredSalary.max
                        ? candidateDetail.desiredSalary.max
                        : "0.00")
                    : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  desired Location
                </Title>
                <Text type="secondary">
                  {candidateDetail.desired_location
                    ? candidateDetail.desired_location
                    : "-"}
                </Text>
              </Col>
            </Row>
          </Card>
          {/* <Card title="Education" className="mb-6 mt-6">
                    </Card> */}
        </Col>
        <Col span={12}>
          <Card title="Resume" className="mb-6">
            <Row gutter={24} className="mb-5">
              {candidateDetail.attachments ? (
                <Col span={24}>
                  <Row>
                    <Col span={12}>{candidateDetail.attachments}</Col>
                    <Col span={12} className="text-right">
                      <a
                        href={CANDIDATE_CV_UPLOAD + candidateDetail.attachments}
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
                <>{/* {EmptyViewResume()} */}</>
              )}
            </Row>
          </Card>
          {/* <Card title="Profile Summary" className="mb-6">
                        <Row gutter={24} className="mb-5">

                            {candidateDetail.profile_summary ? (
                                <Col span={24}>


                                    <PerfectScrollbar
                                        options={perfectScrollbarOptions}
                                        className="scroll"
                                        style={{ maxHeight: "45vh", position: "relative" }}
                                    >

                                        <Text type="secondary">
                                            {candidateDetail.profile_summary}
                                        </Text>

                                    </PerfectScrollbar>
                                </Col>
                            ) : (
                                EmptyView()
                            )}
                        </Row>
                    </Card> */}

          <Card title="Employment" className="mb-6">
            {/* {emeployeedata(candidateDetail.employees)} */}
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  {"Designation"}
                </Title>
                <Text type="secondary">
                  {experience && experience.title ? experience.title.name : "-"}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  {"Company"}
                </Title>
                <Text type="secondary">
                  {experience && experience.company
                    ? experience.company.name
                    : "-"}
                </Text>
              </Col>
            </Row>
          </Card>
          <Card title="Skills" className="mb-6">
            {skills &&
              skills.map((item, index) => {
                return (
                  <Row key={index} gutter={24} className="mb-5">
                    <Col span={12}>
                      <Title level={5} className="mb-0">
                        {"Name"}
                      </Title>
                      <Text type="secondary">{item.name}</Text>
                    </Col>
                    <Col span={12}>
                      <Title level={5} className="mb-0">
                        {"Years Of Experience"}
                      </Title>
                      <Text type="secondary">
                        {item.yearsOfExperience + " years"}
                      </Text>
                    </Col>
                  </Row>
                );
              })}
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default SearchDetail;
