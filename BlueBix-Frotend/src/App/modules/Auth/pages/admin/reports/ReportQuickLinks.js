import React from "react";
import { NavLink } from "react-router-dom";
import { Card } from "antd";
import { useSelector } from "react-redux";

function ReportQuickLinks(props) {
  const users = useSelector(({ users }) => users);
  const role = users.role;
  const JobReportPath = `/${role}/reports/JobReport`;
  const CandidateReportPath = `/${role}/reports/candidateReport`;
  const BDMJobReportPath = `/${role}/reports/bdmJobReport`;
  const RecruiterJobReportPath = `/${role}/reports/recruiterJobReport`;
  const FreelancerJobReportPath = `/${role}/reports/freelancerJobReport`;

  return (
    <Card bordered={false} title="Quick Links">
      <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
        <div className="navi-item mb-2">
          <NavLink
            to={JobReportPath}
            className="navi-link py-4 mb-2"
            activeClassName="active"
            onClick={() => props.setTabChange()}
          >
            <span className="navi-text font-size-lg">Job Report</span>
          </NavLink>
          <NavLink
            to={CandidateReportPath}
            className="navi-link py-4 mb-2"
            activeClassName="active"
            onClick={() => props.setTabChange()}
          >
            <span className="navi-text font-size-lg">Candidate Report</span>
          </NavLink>
          <NavLink
            to={BDMJobReportPath}
            className="navi-link py-4 mb-2"
            activeClassName="active"
            onClick={() => props.setTabChange()}
          >
            <span className="navi-text font-size-lg">BDM Report</span>
          </NavLink>
          <NavLink
            to={RecruiterJobReportPath}
            className="navi-link py-4 mb-2"
            activeClassName="active"
            onClick={() => props.setTabChange()}
          >
            <span className="navi-text font-size-lg">Recruiter Report</span>
          </NavLink>
          <NavLink
            to={FreelancerJobReportPath}
            className="navi-link py-4 mb-2"
            activeClassName="active"
            onClick={() => props.setTabChange()}
          >
            <span className="navi-text font-size-lg">
              Freelancer Recruiter Report
            </span>
          </NavLink>
        </div>
      </div>
    </Card>
  );
}

export default ReportQuickLinks;
