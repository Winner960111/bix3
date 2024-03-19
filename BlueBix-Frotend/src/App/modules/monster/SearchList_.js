import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Row, Col, Card, Button, Spin, Typography } from "antd";
import { MONSTER_CANDIDATE_LIST } from "../../../ApiUrl";
import moment from "moment";
import { NavLink } from "react-bootstrap";
import { LoadingOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const PERPAGE = 10;
const SearchList = () => {
  const history = useHistory();
  const users = useSelector(({ users }) => users);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchList, setsearchList] = useState([]);
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
    const willingnessToRelocate = data ? data.willingnessToRelocate : false;
    const keywordArray = keyword.split(",");
    const jobTitlesArray = jobTitles.split(",");
    const keywordObj =
      keywordArray != ""
        ? keywordArray.map((item) => {
            return {
              name: item,
              importance: "Required",
            };
          })
        : [];
    const jobTitlesObj =
      jobTitlesArray != ""
        ? jobTitlesArray.map((item) => {
            return item;
          })
        : [];

    const params = {
      page: currentPage,
      perPage: PERPAGE,
      searchData: {
        country: "US",
        searchType: "semantic",
        semantic: {
          jobTitles: jobTitlesObj,
          locations: [],
          skills: keywordObj,
          willingnessToRelocate: willingnessToRelocate,
          // "workAuthorizations": [
          //     {
          //         "workStatus": "AuthorizedToWorkForAnyEmployer",
          //         "countryAbbrev": "US"
          //     }
          // ],
          // "yearsOfExperience": "0",
          // "resumeUpdatedMaximumAge": "150000"
        },
      },
    };
    setLoading(true);
    axios
      .post(MONSTER_CANDIDATE_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        // setLoading(false);
        if (!res.data.error) {
          // setSuccess(true);
          // setLoading(false);
          // setError(false);
          setsearchList(res.data.data);
          // setDefaultState();
        } else {
          //setDefaultState();
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
  }

  const keyword = "";
  const keywordObj =
    keyword != ""
      ? [
          {
            name: keyword,
            importance: "Required",
          },
        ]
      : [];

  const SubmissionsTableMe = () => {
    return (
      searchList &&
      searchList.map((item, index) => {
        item.key = item._id;
        const identity = item.identity;
        const location = item.location;
        const workAuthorizations = location.workAuthorizations;
        const experience = item.relevance.experience;
        const skills = item.relevance.skills;
        const experienceTitle =
          experience && experience.title ? experience.title.name : "";
        const experiencecompany =
          experience && experience.company ? experience.company.name : "";
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
                    onClick={() =>
                      history.push({
                        pathname: "/admin/SearchDetail",
                        state: identity.textResumeID,
                      })
                    }
                  >
                    <Title level={4}>
                      {identity
                        ? `${identity.name} --UploadedProfile-${identity.textResumeID}`
                        : ""}
                    </Title>
                  </div>
                  <Text strong level={5} className="mb-0 ml-1">
                    {location
                      ? `${location.country}-${location.state}-${location.city}` +
                        "  "
                      : ""}
                  </Text>
                </Col>
                <Col span={4}>
                  <div className="d-flex w-100 justify-content-end">
                    {item.isViewed ? (
                      <div
                        style={{
                          width: 75,
                          height: 75,
                          paddingRight: 5,
                          backgroundColor: "green",
                          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                          textAlign: "end",
                        }}
                      >
                        <div>
                          <Text
                            style={{
                              fontSize: 12,
                              width: "50%",
                              rotate: "180deg",
                              color: "white",
                            }}
                          >
                            Viewedd
                          </Text>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Col>
                <Col span={12} className="mt-3">
                  <Title level={5} className="m b-0 ml-1">
                    {`${experienceTitle ? experienceTitle : " "}${
                      !experienceTitle || !experiencecompany ? " " : ", "
                    }   ${experiencecompany ? experiencecompany : " "}`}
                  </Title>
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
                      {identity.resumeModifiedDate
                        ? moment(identity.resumeModifiedDate).format(
                            "DD/MM/yyyy"
                          )
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
                      {item.degree ? item.degree : "-"}
                    </Text>
                  </div>
                  {/* <div className='d-flex'>
                    <Text strong level={5} style={{ width: "50%" }}>
                      Target Job Title
                    </Text>
                    <Text level={5} className={"ml-3 text-muted"} style={{ width: "50%" }}>
                      {"-"}
                    </Text>
                  </div> */}
                  {/* <div className='d-flex'>
                    <Text strong level={5} style={{ width: "50%" }}>
                      Desired status
                    </Text>
                    <Text level={5} className={"ml-3 text-muted"} style={{ width: "50%" }}>
                      {"-"}
                    </Text>
                  </div> */}
                  {/* <div className='d-flex'>
                    <Text strong level={5} style={{ width: "50%" }}>
                      Desired Job Type
                    </Text>
                    <Text level={5} className={"ml-3 text-muted"} style={{ width: "50%" }}>
                      {"-"}
                    </Text>
                  </div> */}
                  {/* <div className='d-flex'>
                    <Text strong level={5} style={{ width: "50%" }}>
                      Desired Salary
                    </Text>
                    <Text level={5} className={"ml-3 text-muted"} style={{ width: "50%" }}>
                      {"-"}
                    </Text>
                  </div> */}
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
                      {location.willRelocate ? "Relocate" : " Won't Relocate"}
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
                      {workAuthorizations
                        ? workAuthorizations.map((item, index) => {
                            return `${item.country}  ${item.authorization}`;
                          })
                        : "-"}
                    </Text>
                  </div>
                </Col>
                <Col span={8} className={"mt-0 mb-2"} style={{ width: "50%" }}>
                  <Text strong level={5}>
                    Skills
                  </Text>
                  {" : "}
                  <Text key={index.toString()} level={5} className="mb-0 pl-2">
                    {skills &&
                      skills.map((item, index) => {
                        return item.name + ",";
                      })}
                  </Text>
                </Col>
                <Col span={18}>
                  {/* <Text strong level={5} className="mb-0 ml-0">
                  {datys > 0 ? datys + " DAY AGO" : " Today"}
                </Text> */}
                </Col>
              </Row>
            </Card>
            {/* <Divider plain></Divider> */}
          </div>
        );
      })
    );
  };

  const Footer = () => {
    return (
      <Row gutter={24}>
        <Col span={24} className="align-text-center text-right">
          <Button
            type={"default"}
            htmlType="default"
            className="mb-2"
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
          >
            {"<"}
          </Button>
          <Button
            type={"default"}
            htmlType="default"
            className={"ml-5"}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {">"}
          </Button>
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
      <Footer />
      {searchList ? <SubmissionsTableMe /> : null}
      <Footer />
    </Spin>
  );
};

export default SearchList;
