import React, { useState, useEffect } from "react";
import { Card, Select, Col, Row, Button, DatePicker } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import ReportQuickLinks from "./ReportQuickLinks";
import { useSelector } from "react-redux";
import RecruiterJobReport from "./RecruiterJobReport";
import { RECRUITER_REPORT_COUNT } from "../../../../ApiUrl";
import axios from "axios";
import { OpeningStatusList } from "../../../pages/constant/constant";

const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [report, setReport] = useState();
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const users = useSelector(({ users }) => users);
  const role = users.role;
  const RecruiterJobReportPath = `/${role}/reports/recruiterJobReport`;

  useEffect(() => {
    getReportList();
    return () => { };
  }, [dateRange, status]);

  const getReportList = () => {
    const userId = users.user._id;
    const params = {
      dateRange: arrayDateRange,
      id: userId,
      status: statusObject.length > 0 ? statusObject[0].value : "",
      company_id: "",
      bdm_id: "",
      opening_id: "",
    };

    axios
      .post(RECRUITER_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setReport(res.data.data);
      })
      .catch((error) => {
      });
  };

  const onResetFilters = () => {
    setDateRange([]);
    setDateRangeValue([]);
    setStatus("");
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

  const recruiterJobCount = report ? report.recruiterJobCount : undefined;

  const arrayDateRange =
    dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

  const statusObject = OpeningStatusList.filter((statusObj) => {
    return status === statusObj.value;
  });

  const statusLabal = statusObject.length > 0 ? statusObject[0].value : "";

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
              {OpeningStatusList != undefined &&
                OpeningStatusList.map((status, index) => (
                  <Option key={index.toString()} value={status.value}>
                    {status.label}
                  </Option>
                ))}
            </Select>
          </Col>
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
              to={RecruiterJobReportPath}
            />
            <Route
              path={RecruiterJobReportPath}
              component={() => (
                <RecruiterJobReport
                  recruiterJobCount={recruiterJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
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
