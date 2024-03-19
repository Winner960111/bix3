import React, { useState, useEffect } from "react";
import { Card, Select, Col, Row, Button, DatePicker } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import ReportQuickLinks from "./ReportQuickLinks";
import { useSelector } from "react-redux";
import BDMJobReport from "./BDMJobReport";
import RecruiterJobReport from "./RecruiterJobReport";
import {
  BDM_REPORT_COUNT,
  JOB_RECRUITER_LIST,
  RECRUITER_REPORT_COUNT,
} from "../../../../ApiUrl";
import axios from "axios";
import { OpeningStatusList } from "../../../pages/constant/constant";

const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [status, setStatus] = useState("");
  const [recruterList, setAllRecruterList] = useState([]);
  const [selectedRecruter, setSelectedRecruter] = useState("");
  const [adminReport, setAdminReport] = useState();
  const [recruiterReport, setRecruiterReport] = useState();
  const [isRecruiterTabSelected, setRecruiterTabSelected] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const users = useSelector(({ users }) => users);
  const role = users.role;
  const BDMJobReportPath = `/${role}/reports/bdmJobReport`;
  const RecruiterJobReportPath = `/${role}/reports/recruiterJobReport`;

  useEffect(() => {
    getAllRecruterList();
    return () => {};
  }, []);

  useEffect(() => {
    getReportList();
    return () => {};
  }, [dateRange, status, selectedRecruter]);

  const getAllRecruterList = () => {
    axios
      .get(JOB_RECRUITER_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllRecruterList(res.data.data);
      })
      .catch((error) => {});
  };

  const getReportList = () => {
    const userId = users.user._id;

    const statusObj = OpeningStatusList.filter((item) => {
      return status === item.value;
    });

    const arrayDateRange =
      dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

    const paramsBDM = {
      dateRange: arrayDateRange,
      id: userId,
      status: statusObj.length > 0 ? statusObj[0].value : "",
      company_id: "",
      recruiter_id: selectedRecruter,
      opening_id: "",
    };
    const paramsRecruiter = {
      dateRange: arrayDateRange,
      id: selectedRecruter,
      status: statusObj.length > 0 ? statusObj[0].value : "",
      company_id: "",
      bdm_id: userId,
      opening_id: "",
    };

    axios
      .post(BDM_REPORT_COUNT, paramsBDM, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAdminReport(res.data.data);
      })
      .catch((error) => {});

    axios
      .post(RECRUITER_REPORT_COUNT, paramsRecruiter, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setRecruiterReport(res.data.data);
      })
      .catch((error) => {});
  };

  const onResetFilters = () => {
    setDateRange([]);
    setDateRangeValue([]);
    setStatus("");
    setSelectedRecruter("");
    setRecruiterTabSelected(false);
  };

  const onDataRangeChange = (value, dateString) => {
    if (value !== null) {
      setDateRangeValue(value);
      setDateRange(dateString);
    } else {
      onDataRangeChange([]);
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };
  const handleAssignChange = (value) => {
    setSelectedRecruter(value);
  };

  const filtersUI = () => (
    <>
      <Card title="Filters" bordered={false} className="px-0 py-0">
        <Row gutter={24}>
          <Col span={8}>
            <label for="by_source" className="" title="Date Range">
              Date Range :
            </label>
            <br />
            <RangePicker
              allowClear={true}
              key={"RangePicker"}
              value={dateRangeValue}
              onChange={onDataRangeChange}
            />
          </Col>
          <Col span={6}>
            <label for="by_source" className="" title="Status">
              Status :
            </label>
            <br />
            <Select
              placeholder="Select Status Name"
              value={status}
              onChange={handleStatusChange}
              style={{ width: "100%" }}
            >
              <Option value={""}>{"Select"}</Option>
              {OpeningStatusList !== undefined &&
                OpeningStatusList.map((status, index) => (
                  <Option key={index.toString()} value={status.value}>
                    {status.label}
                  </Option>
                ))}
            </Select>
          </Col>
          {isRecruiterTabSelected ? (
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                Recruiter :
              </label>
              <br />
              <Select
                placeholder="Select Recruiter Name"
                value={selectedRecruter}
                onChange={handleAssignChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {recruterList !== undefined &&
                  recruterList.map((status, index) => (
                    <Option key={index.toString()} value={status._id}>
                      {status.display_name}
                    </Option>
                  ))}
              </Select>
            </Col>
          ) : null}
        </Row>
        <Row gutter={24} className="py-5 text-right">
          <Col span={24}>
            <Button onClick={onResetFilters} type="primary" size="small" danger>
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>
      <br />
    </>
  );

  const bdmJobCount = adminReport ? adminReport.bdmJobCount : undefined;
  const recruiterJobCount = recruiterReport
    ? recruiterReport.recruiterJobCount
    : undefined;

  const arrayDateRange =
    dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

  const statusObject = OpeningStatusList.filter((statusObj) => {
    return status === statusObj.value;
  });

  const statusLabal = statusObject.length > 0 ? statusObject[0].value : "";

  return (
    <div>
      <Row gutter={24}>
        <Col span={6}>
          <ReportQuickLinks setTabChange={onResetFilters} />
        </Col>
        <Col span={18}>
          {filtersUI()}
          <Switch>
            <Redirect
              from={`/${role}/reports`}
              exact={true}
              to={BDMJobReportPath}
            />
            <Route
              path={BDMJobReportPath}
              component={() => (
                <BDMJobReport
                  bdmJobCount={bdmJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  selectedRecruter={selectedRecruter}
                />
              )}
            />
            <Route
              path={RecruiterJobReportPath}
              component={() => (
                <RecruiterJobReport
                  recruiterJobCount={recruiterJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  selectedRecruter={selectedRecruter}
                  setRecruiterTabSelected={setRecruiterTabSelected}
                />
              )}
            />
          </Switch>
        </Col>
      </Row>
    </div>
  );
}

export default Reports;
