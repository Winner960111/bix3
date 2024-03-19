import React, { useState, useEffect } from "react";
import { Card, Select, Col, Row, Button, DatePicker } from "antd";
import { Redirect, Route, Switch } from "react-router-dom";
import ReportQuickLinks from "./ReportQuickLinks";
import { useSelector } from "react-redux";
import JobReport from "./JobReport";
import CandidateReport from "./CandidateReport";
import BDMJobReport from "./BDMJobReport";
import RecruiterJobReport from "./RecruiterJobReport";
import FreelancerJobReport from "./FreelancerJobReport";
import {
  ADMIN_REPORT_COUNT,
  JOB_BDM_LIST,
  JOB_RECRUITER_LIST,
  BDM_REPORT_COUNT,
  RECRUITER_REPORT_COUNT,
  FREELANCE_REPORT_COUNT
} from "../../../../../../ApiUrl";
import axios from "axios";
import { statusList, OpeningStatusList } from "../../../../../pages/constant/constant";
const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [status, setStatus] = useState("");
  const [adminReport, setAdminReport] = useState();
  const [bdmReport, setBDMReport] = useState();
  const [recruiterReport, setRecruiterReport] = useState();
  const [freelanceReport, setFreelancerReport] = useState();
  const [allBDM, setAllBDM] = useState([]);
  const [selectedBDM, setSelectedBDM] = useState("");
  const [recruterList, setAllRecruterList] = useState([]);
  const [selectedRecruter, setSelectedRecruter] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [isBDMTabSelected, setBDMTabSelected] = useState(false);
  const [isRecruiterTabSelected, setRecruiterTabSelected] = useState(false);
  const [isCandidateTabSelected, setCandidateTabSelected] = useState(false);
  const users = useSelector(({ users }) => users);
  const role = users.role;
  const JobReportPath = `/${role}/reports/JobReport`;
  const CandidateReportPath = `/${role}/reports/candidateReport`;
  const BDMJobReportPath = `/${role}/reports/bdmJobReport`;
  const RecruiterJobReportPath = `/${role}/reports/recruiterJobReport`;
  const FreelancerJobReportPath = `/${role}/reports/freelancerJobReport`;

  useEffect(() => {
    getAllBDMList();
    getAllRecruterList();
    return () => { };
  }, []);
  useEffect(() => {
    getReportList();
    return () => { };
  }, [dateRange, status, selectedBDM, selectedRecruter]);

  const getAllBDMList = () => {
    axios
      .get(JOB_BDM_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllBDM(res.data.data);
      })
      .catch((error) => {
      });
  };

  const getAllRecruterList = () => {
    axios
      .get(JOB_RECRUITER_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllRecruterList(res.data.data);
      })
      .catch((error) => {
      });
  };

  const getReportList = () => {
    const arrayDateRange =
      dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];
    const statusObj = statusList.filter((item) => {
      return status === item.value;
    });
    const params = {
      dateRange: arrayDateRange,
      status: statusObj.length > 0 ? statusObj[0].value : "",
      recruiter_id: selectedRecruter,
      bdm_id: selectedBDM,
    };

    if (isRecruiterTabSelected) params.id = selectedRecruter;

    axios
      .post(ADMIN_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAdminReport(res.data.data);
      })
      .catch((error) => {
      });

    axios
      .post(BDM_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setBDMReport(res.data.data);
      })
      .catch((error) => {
      });

    axios
      .post(RECRUITER_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setRecruiterReport(res.data.data);
      })
      .catch((error) => {
      });

    axios
      .post(FREELANCE_REPORT_COUNT, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setFreelancerReport(res.data.data);
      })
      .catch((error) => {
      });
  };

  const handleBDMChange = (value) => {
    setSelectedBDM(value);
  };
  const handleRecruiterChange = (value) => {
    setSelectedRecruter(value);
  };
  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const onResetFilters = () => {
    setDateRange([]);
    setDateRangeValue([]);
    setStatus("");
    setSelectedBDM("");
    setSelectedRecruter("");
    setBDMTabSelected(false);
    setRecruiterTabSelected(false);
    setCandidateTabSelected(false);
  };

  const onDataRangeChange = (value, dateString) => {
    if (value !== null) {
      setDateRangeValue(value);
      setDateRange(dateString);
    } else {
      onDataRangeChange([]);
    }
  };

  const filtersUI = () => (
    <>
      <Card title="Filters" bordered={false} className="px-0 py-0">
        <Row gutter={24}>
          <Col span={8} sm={16} xl={10}>
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
          {!isCandidateTabSelected ?
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
            : ''}
          {isBDMTabSelected ? (
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                BDM :
              </label>
              <br />
              <Select
                value={selectedBDM}
                onChange={handleBDMChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {allBDM
                  ? allBDM.map((user, index) => {
                    return (
                      <Option value={user._id} key={index.toString()}>
                        {user.display_name.charAt(0).toUpperCase() +
                          user.display_name.slice(1)}
                      </Option>
                    );
                  })
                  : null}
              </Select>
            </Col>
          ) : null}

          {isRecruiterTabSelected ? (
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                Recruiter :
              </label>
              <br />
              <Select
                placeholder="Select Recruiter Name"
                value={selectedRecruter}
                onChange={handleRecruiterChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {recruterList != undefined &&
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

  const JobCountStatus = adminReport ? adminReport.JobCountStatus : undefined;
  const bdmJobCount = bdmReport ? bdmReport.bdmJobCount : undefined;
  const freelanceJobCount = freelanceReport
    ? freelanceReport.freelanceJobCount
    : undefined;
  const recruiterJobCount = recruiterReport
    ? recruiterReport.recruiterJobCount
    : undefined;
  const candidateJobCount = adminReport
    ? adminReport.candidateJobCount
    : undefined;
  const arrayDateRange =
    dateRange && dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];
  const statusObject = statusList.filter((statusObj) => {
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
              to={JobReportPath}
            />
            <Route
              path={JobReportPath}
              component={() => (
                <JobReport
                  JobCountStatus={JobCountStatus}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  bdm_id={selectedBDM}
                  recruiter_id={selectedRecruter}
                />
              )}
            />
            <Route
              path={CandidateReportPath}
              component={() => (
                <CandidateReport
                  candidateJobCount={candidateJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  setCandidateTabSelected={setCandidateTabSelected}
                />
              )}
            />
            <Route
              path={BDMJobReportPath}
              component={() => (
                <BDMJobReport
                  bdmJobCount={bdmJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  bdm_id={selectedBDM}
                  recruiter_id={selectedRecruter}
                  setBDMTabSelected={setBDMTabSelected}
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
                  bdm_id={selectedBDM}
                  recruiter_id={selectedRecruter}
                  setRecruiterTabSelected={setRecruiterTabSelected}
                />
              )}
            />
            <Route
              path={FreelancerJobReportPath}
              component={() => (
                <FreelancerJobReport
                  freelanceJobCount={freelanceJobCount}
                  arrayDateRange={arrayDateRange}
                  statusLabal={statusLabal}
                  bdm_id={selectedBDM}
                  recruiter_id={selectedRecruter}
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
