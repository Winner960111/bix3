import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Empty,
  Button,
  Spin,
  Typography,
  Pagination,
} from "antd";
import { MONSTER_CANDIDATE_LIST } from "../../../ApiUrl";
import moment from "moment";
import { NavLink } from "react-bootstrap";
import { LoadingOutlined } from "@ant-design/icons";
import MonsterCandidateDetail from "./MonsterCandidateDetail";
import { showError } from "../../pages/utils/helpers";

const { Text, Title } = Typography;
const PERPAGE = 10;

const SearchList = () => {
  const history = useHistory();
  const [showModel, setShowModel] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [selectedViewHistory, setSelectedViewHistory] = useState([]);
  const users = useSelector(({ users }) => users);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchObj, setsearchObj] = useState([]);
  const [searchList, setsearchList] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const location = useLocation();
  const data = location.state;

  useEffect(() => {
    // if (data)
    getSearchData();
    return () => {};
  }, [data, currentPage]);

  function getSearchData() {
    const keyword = data ? data.keyword : "";
    const jobTitles = data ? data.jobTitles : "";
    const willingnessToRelocate = data
      ? data.willingnessToRelocate
        ? 1
        : 0
      : 0;
    let formData = new FormData();
    formData.append("q", keyword);
    formData.append("qajt", jobTitles);
    formData.append("page", currentPage);
    formData.append("pagesize", 10);
    if (data.resumePostedFrom)
      formData.append("mdatemaxage", data.resumePostedFrom);
    if (data.resumePostedTo)
      formData.append("mdateminage", data.resumePostedTo);
    formData.append("relo", willingnessToRelocate);
    if (data.residencePostalCodeRadius)
      formData.append("rpcr", data.residencePostalCodeRadius);
    if (data.yearsOfExperience)
      formData.append("yrsexpid", data.yearsOfExperience);

    setLoading(true);
    axios
      .post(MONSTER_CANDIDATE_LIST, formData, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        // setLoading(false);
        if (!res.data.error) {
          const data = res.data.data;
          const monster = data.Monster;
          setSuccess(true);
          setLoading(false);
          setError(false);
          const monsterResumes = monster ? monster.Resumes : [];
          setsearchObj(monsterResumes);
          if (monsterResumes && monsterResumes[0].$.Found !== "0") {
            setMsgSuccess("Success!");
            setTotalRecords(monsterResumes[0].$.Found);
            setsearchList(monsterResumes[0].Resume);
          } else {
            setSuccess(false);
            setDefaultState();
          }
          setDefaultState();
        } else {
          setDefaultState();
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.response && err.response.status === 401) {
          history.push("/logout");
        }
        setSuccess(false);
        setLoading(false);
        setmsgError(err?.message);
        setError(true);
      });
  }

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const isObject = (value) => typeof value === "object";
  const SubmissionsTableMe = () => {
    return (
      searchList.length > 0 &&
      searchList.map((item, index) => {
        const {
          $,
          Relevance,
          ResumeTitle,
          DateModified,
          DateCreated,
          PersonalData,
          Target,
          Educations,
          Experiences,
          WorkAuths,
          Boards,
          isViewed,
        } = item;
        const dateModified = DateModified[0].$
          ? DateModified[0].$.Date
          : undefined;
        const nameObj = isObject(PersonalData[0])
          ? PersonalData[0].Name[0]
          : undefined;
        const addressObj = isObject(PersonalData[0])
          ? PersonalData[0].Address[0]
          : undefined;
        const targetObj = isObject(Target[0]) ? Target[0] : undefined;
        const Salary = targetObj ? targetObj.Salary[0] : undefined;
        const experience = Experiences[0].Experience
          ? Experiences[0].Experience[0]
          : undefined;
        const education = Educations[0].Education
          ? Educations[0].Education[0]
          : undefined;
        const WorkAuthsObj = isObject(WorkAuths[0])
          ? WorkAuths[0].WorkAuth
          : undefined;
        const name = nameObj ? `${nameObj.First[0]} ${nameObj.Last[0]}` : "";
        const address = addressObj ? `${addressObj.Location[0]}` : "";
        const resumeTitle = isObject(ResumeTitle) ? `${ResumeTitle[0]}` : "";
        const targetJobTitle = targetObj ? targetObj.JobTitle[0] : "";
        const targetJobTypes = targetObj ? targetObj.JobTypes[0].JobType : "";
        const Relocation = targetObj ? targetObj.Relocation[0]._ : "";
        const targetCurrency = Salary ? Salary.Currency[0] : "";
        const Company =
          experience && experience.Company[0] ? experience.Company[0].Name : "";
        const JobTitle =
          experience && experience.Job[0] ? experience.Job[0].Title[0] : "";
        const JobDescription =
          experience && experience.Job[0]
            ? experience.Job[0].Description[0]
            : "";

        return (
          <div className="site-card-border-less-wrapper" key={index.toString()}>
            <Card
              bordered={true}
              className="px-0 py-0 mb-10"
              bodyStyle={{ padding: 0 }}
            >
              <Row gutter={24} className="pl-10 pb-10">
                <Col span={20} className="mt-10">
                  <div
                    className={"cursor-pointer"}
                    onClick={() => {
                      //setShowModel(true)
                      history.push({
                        pathname: "/admin/SearchDetail",
                        state: $.SID,
                      });
                    }}
                  >
                    <Title level={4}>
                      {nameObj ? `${name} --${resumeTitle}` : ""}
                    </Title>
                  </div>
                  <Text strong level={5} className="mb-0 ml-1">
                    {addressObj ? address + "  " : "-"}
                  </Text>
                </Col>
                <Col span={4}>
                  <div className="d-flex w-100 justify-content-end">
                    {isViewed ? (
                      <div
                        onClick={() => {
                          setShowModel(true);
                          setSelectedViewHistory(item.viewedHist);
                          setSelectedCandidateId(item.candidateId);
                        }}
                        style={{
                          width: 75,
                          height: 75,
                          paddingRight: 5,
                          backgroundColor: "green",
                          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                          textAlign: "end",
                          cursor: "pointer",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            width: "50%",
                            rotate: "180deg",
                            color: "white",
                          }}
                        >
                          Viewed
                        </Text>
                      </div>
                    ) : null}
                  </div>
                </Col>
                <Col span={12} className="mt-0">
                  <Title level={5} className="b-0 ml-1 mt-10">
                    {`${JobTitle ? JobTitle : " "}${
                      !JobTitle || !Company ? " " : ", "
                    }   ${Company ? Company : " "}`}
                  </Title>
                  <p level={5} className="mb-0 ml-1 mt-10">
                    {JobDescription ? JobDescription + "" : "-"}
                  </p>
                </Col>
                <Col span={12} className="mt-3 ">
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={4}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Resume Updated
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {dateModified
                        ? moment(dateModified).format("DD/MM/yyyy")
                        : "-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Highest Education
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {education ? education.Level[0]._ : "-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Target Job Title
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {targetJobTitle ? targetJobTitle : "-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Desired status
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {"-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Desired Job Type
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {(targetJobTypes &&
                        targetJobTypes.map(
                          (item, index) =>
                            item._ +
                            (index === targetJobTypes.length - 1 ? "" : ", ")
                        )) ||
                        "-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Desired Salary
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {targetCurrency._
                        ? `${targetCurrency._} ${Salary.Min[0]} - ${Salary.Max[0]}`
                        : "-"}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Relocation
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {Relocation}
                    </Text>
                  </div>
                  <div className="d-flex pt-1">
                    <Text
                      strong
                      level={5}
                      style={{ fontSize: 15, width: "50%" }}
                    >
                      Authorization
                    </Text>
                    <Text
                      level={5}
                      className={"ml-3 text-muted"}
                      style={{ width: "50%" }}
                    >
                      {/* {workAuthType || workAuthCountry ? `${workAuthType} ${workAuthCountry}` : '-'} */}
                      {(WorkAuthsObj &&
                        WorkAuthsObj.map((item, index) => {
                          const { AuthType, Country } = item;
                          const workAuthType =
                            AuthType.length > 0 ? AuthType[0]._ : "";
                          const workAuthCountry =
                            Country.length > 0 ? Country[0]._ : "";

                          return workAuthType || workAuthCountry
                            ? `${workAuthType} ${workAuthCountry}` +
                                (index === WorkAuthsObj.length - 1 ? "" : ", ")
                            : "-";
                        })) ||
                        "-"}
                    </Text>
                  </div>
                </Col>
                {/* <Col span={8} className={"mt-0 mb-2"} style={{ width: "50%" }}>
                </Col>
                <Col span={18}>
                </Col> */}
              </Row>
            </Card>
          </div>
        );
      })
    );
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const Footer = () => {
    return (
      <Row gutter={24}>
        <Col span={24} className="align-text-center text-right">
          {totalRecords > 0 ? (
            <div className="text-right mr-10">
              <Pagination
                showSizeChanger={false}
                current={currentPage}
                onChange={onPageChange}
                total={totalRecords}
              />
            </div>
          ) : null}
        </Col>
      </Row>
    );
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
  return (
    <Spin indicator={antIcon} spinning={loading}>
      <Card
        title={"Candidates"}
        extra={
          <NavLink
            to={
              {
                // pathname: "/candidate/job-List",
              }
            }
          >
            <Button onClick={() => history.goBack()} type="Secondary">
              Back
            </Button>
          </NavLink>
        }
        bordered={false}
        className="px-0 py-0 mb-5"
      ></Card>
      {showError(success, msgSuccess, error, msgError)}
      <Footer />
      {searchList && searchList.length ? (
        <SubmissionsTableMe />
      ) : (
        <Col span={24}>
          <Empty
            imageStyle={{
              height: 60,
            }}
            description={<span> Data Not Found </span>}
          ></Empty>
        </Col>
      )}
      <Footer />
      <MonsterCandidateDetail
        showModel={showModel}
        setShowModel={setShowModel}
        candidateId={selectedCandidateId}
        viewHistory={selectedViewHistory}
      />
    </Spin>
  );
};

export default SearchList;
