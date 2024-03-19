import React, { useState, useEffect } from "react";
import { Card, Select, Col, Row, Button, DatePicker } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import ReportQuickLinks from "./ReportQuickLinks";
import { useSelector } from "react-redux";
import CandidateReport from "./CandidateReport";
import CompanyJobReport from "./CompanyJobReport";
import { COMPANY_REPORT_COUNT, OPENING_TITLE_LIST } from "../../../../ApiUrl";
import axios from "axios";
import {
  OpeningStatusList,
  statusList,
} from "../../../pages/constant/constant";

const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [status, setStatus] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [adminReport, setAdminReport] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [openingTitleList, setOpeningTitleList] = useState([]);
  const [isCandidateTabSelected, setCandidateTabSelected] = useState(false);
  const users = useSelector(({ users }) => users);
  const role = users.role;
  const CandidateReportPath = `/${role}/reports/candidateReport`;
  const CompanyJobReportPath = `/${role}/reports/companyJobReport`;

  useEffect(() => {
    getopeningTitleList();
    return () => { };
  }, []);

  useEffect(() => {
    getReportList();
    return () => { };
  }, [dateRange, status, openingId]);

  const getopeningTitleList = () => {
    const params = { company_id: users.user._id };
    axios
      .post(OPENING_TITLE_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningTitleList(res.data.data.opening_detail_list);
      })
      .catch((error) => {
      });
  };

  const getReportList = () => {
    const userId = users.user._id;

    const StatusListArray = isCandidateTabSelected
      ? statusList
      : OpeningStatusList;

    const statusObj = StatusListArray.filter((item) => {
      return status === item.value;
    });

    const arrayDateRange =
      dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

    const params = {
      dateRange: arrayDateRange,
      status: statusObj.length > 0 ? statusObj[0].value : "",
      id: userId,
      recruiter_id: "",
      bdm_id: "",
      opening_id: openingId,
    };

    axios
      .post(COMPANY_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAdminReport(res.data.data);
      })
      .catch((error) => {
      });
  };

  const onResetFilters = () => {
    setDateRange([]);
    setDateRangeValue([]);
    setStatus("");
    setOpeningId("");
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

  const handleOpeningIdChange = (value) => {
    setOpeningId(value);
  };

  const StatusListArray = isCandidateTabSelected
    ? statusList
    : OpeningStatusList;

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
              {StatusListArray != undefined &&
                StatusListArray.map((status, index) => (
                  <Option key={index.toString()} value={status.value}>
                    {status.label}
                  </Option>
                ))}
            </Select>
          </Col>
          {isCandidateTabSelected ? (
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                Opening :
              </label>
              <br />
              <Select
                placeholder="Select Status Name"
                value={openingId}
                onChange={handleOpeningIdChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {openingTitleList != undefined &&
                  openingTitleList.map((status, index) => (
                    <Option key={index.toString()} value={status.opening_id}>
                      {status.opening_title}
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

  const companyJobCount = adminReport ? adminReport.companyJobCount : undefined;

  const candidateJobCount = adminReport
    ? adminReport.candidateJobCount
    : undefined;

  const arrayDateRange =
    dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

  const statusObject = StatusListArray.filter((statusObj) => {
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
              to={CompanyJobReportPath}
            />
            <Route
              path={CandidateReportPath}
              component={() => (
                <CandidateReport
                  candidateJobCount={candidateJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  openingId={openingId}
                  setCandidateTabSelected={setCandidateTabSelected}
                />
              )}
            />
            <Route
              path={CompanyJobReportPath}
              component={() => (
                <CompanyJobReport
                  companyJobCount={companyJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  setCandidateTabSelected={setCandidateTabSelected}
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
