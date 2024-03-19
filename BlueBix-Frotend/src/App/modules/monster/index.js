import React, { useState } from "react";
import { Form, Input, Row, Col, Card, Select, Button, Checkbox } from "antd";
import SearchBar from "./SearchBar";
import {
  monsterYearsOfExpFilterList,
  monsterResumesUpdatedFilterList,
} from "../../pages/constant/constant";
import { useHistory } from "react-router";

const { Option } = Select;
const FormItem = Form.Item;

const MonsterSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [jobTitles, setJobTitles] = useState("");
  const [searchZipCodeRadius, setSearchZipCodeRadius] = useState();
  const [isSearchByZipCodeRadius, setIsSearchByZipCodeRadius] = useState(false);
  const [willingnessToRelocate, setWillingnessToRelocate] = useState(false);
  const [resumePostedFrom, setResumePostedFrom] = useState();
  const [resumePostedTo, setResumePostedTo] = useState();
  const [zipCode, setZipCode] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState([]);
  const history = useHistory();

  function onSubmit() {
    const values = {
      keyword,
      jobTitles,
      willingnessToRelocate,
      resumePostedFrom,
      resumePostedTo,
    };

    if (yearsOfExperience.length)
      values.yearsOfExperience = yearsOfExperience.join(",");

    if (isSearchByZipCodeRadius)
      values.residencePostalCodeRadius = `${zipCode}-${searchZipCodeRadius}`;

    history.push({ pathname: "/admin/SearchList", state: values });

    const keywordObj =
      keyword != ""
        ? [
            {
              name: keyword,
              importance: "Required",
            },
          ]
        : [];

    const params = {
      page: 1,
      perPage: 10,
      searchData: {
        country: "US",
        searchType: "semantic",
        semantic: {
          jobTitles: [jobTitles],
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

    // axios
    //     .post(MONSTER_CANDIDATE_LIST, params, {
    //         headers: { Authorization: users.token },
    //     })
    //     .then((res) => {
    //         // setLoading(false);
    //         if (!res.data.error) {
    //             // setSuccess(true);
    //             // setLoading(false);
    //             // setError(false);
    //             // setUserProfile(res.data);
    //             // setDefaultState();
    //         } else {
    //             //setDefaultState();
    //         }
    //     })
    //     .catch((err) => {
    //         // if (err.response && err.response.status === 401) {
    //         //     props.history.push("/logout");
    //         // }
    //         // setSuccess(false);
    //         // setLoading(false);
    //         // setError(true);
    //     });
  }

  return (
    <div>
      <Card bordered={false} className="px-0 py-0 mb-12">
        <Row gutter={24} className="mb-0 align-items-center">
          <Col span={2}>
            <h5 className="mb-0" title="Keyword">
              Keyword
            </h5>
          </Col>
          <Col span={12}>
            <SearchBar
              input={keyword}
              onChange={(value) => setKeyword(value)}
              placeholder={"Java AND Struts AND Spring AND React AND sql"}
            />
          </Col>
          <Button
            className="ml-5"
            onClick={onSubmit}
            type="primary"
            size="large"
          >
            Search
          </Button>
          {/* <NavLink
                        style={{ marginLeft: "10px" }}
                        to={{
                            pathname: "/admin/SearchList",
                            state: { record: values },
                        }}
                    >
                        <EditOutlined style={{ fontSize: "15px", color: "#372727" }} />
                    </NavLink> */}
        </Row>
        <Row gutter={24} className="mt-5 align-items-center">
          <Col span={2}>
            <h5 className="mb-0" title="Keyword">
              Job Titles
            </h5>
          </Col>
          <Col span={12}>
            <SearchBar
              input={jobTitles}
              onChange={(value) => setJobTitles(value)}
              placeholder={"Job Titles"}
            />
          </Col>
        </Row>
        <Row gutter={24} className="mt-5 align-items-center">
          <Col span={8}>
            <Checkbox
              onClick={() => {
                setWillingnessToRelocate(!willingnessToRelocate);
              }}
              checked={willingnessToRelocate}
              value={willingnessToRelocate}
            >
              Willingness to Relocate
            </Checkbox>
          </Col>
        </Row>
        <Row gutter={24} className="mt-5 d-flex align-items-center">
          <Col span={3}>
            <h5 className="mb-0 " title="Keyword">
              Resume Posted
            </h5>
          </Col>
          <Col span={5}>
            <label className="mr-5" title="Date Range">
              From
            </label>
            <Select
              value={resumePostedFrom}
              onChange={(value) => setResumePostedFrom(value)}
              style={{ width: "100%" }}
            >
              {monsterResumesUpdatedFilterList != undefined &&
                monsterResumesUpdatedFilterList.map((date, index) => (
                  <Option key={index.toString()} value={date.value}>
                    {date.label}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col span={5}>
            <label className="mr-5" title="Date Range">
              To
            </label>
            <Select
              value={resumePostedTo}
              onChange={(value) => setResumePostedTo(value)}
              style={{ width: "100%" }}
            >
              {monsterResumesUpdatedFilterList != undefined &&
                monsterResumesUpdatedFilterList.map((date, index) => (
                  <Option key={index.toString()} value={date.value}>
                    {date.label}
                  </Option>
                ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={24} className="mt-5 d-flex align-items-center">
          <Col span={3}>
            <h5 className="mb-0 " title="Keyword">
              Years Of Experience
            </h5>
          </Col>
          <Col span={5}>
            <Select
              value={yearsOfExperience}
              mode="multiple"
              onChange={(value) => setYearsOfExperience(value)}
              style={{ width: "100%" }}
            >
              {monsterYearsOfExpFilterList != undefined &&
                monsterYearsOfExpFilterList.map((date, index) => (
                  <Option key={index.toString()} value={date.value}>
                    {date.label}
                  </Option>
                ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={24} className="align-items-center">
          <Col span={12} style={{ marginTop: "25px" }}>
            <h5 className="mb-0" title="Keyword">
              Location choose one of the options below:
            </h5>
          </Col>
        </Row>
        <Row gutter={24} className="ms-5 align-items-center">
          <Col span={8}>
            <FormItem>
              <Checkbox
                onClick={() => {
                  setIsSearchByZipCodeRadius(!isSearchByZipCodeRadius);
                }}
                checked={isSearchByZipCodeRadius}
                value={isSearchByZipCodeRadius}
              >
                Search Zip Code Radius
              </Checkbox>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="mt-0 align-items-center">
          <Col span={6}>
            <label className="" title="Date Range">
              Country
            </label>
            <Input placeholder="Country" value={"US"} />
          </Col>
        </Row>
        <Row gutter={24} className="mt-3 align-items-center">
          <Col span={6}>
            <label className="" title="show jpb seekers">
              Only show job seekers withen
            </label>
          </Col>
          <Col span={5}>
            <Input
              formNoValidate={"number"}
              value={searchZipCodeRadius}
              onChange={(e) => setSearchZipCodeRadius(e.target.value)}
              placeholder="50 miles away"
            />
          </Col>
          <Col span={3}>
            <label className="" title="show jpb seekers">
              off zip code
            </label>
          </Col>
          <Col span={5}>
            <Input
              onChange={(e) => {
                setZipCode(e.target.value);
              }}
              value={zipCode}
            />
          </Col>
          {/* <Col span={3}>
                        <label className="" title="show jpb seekers">
                            Find a Zip code
                        </label>
                    </Col> */}
        </Row>
      </Card>
    </div>
  );
};

export default MonsterSearch;
