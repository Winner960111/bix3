import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "antd";
import { useSelector } from "react-redux";

function ReportQuickLinks(props) {
  const [targetOffset, setTargetOffset] = useState(undefined);
  const users = useSelector(({ users }) => users);
  const role = users.role;

  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);

  const CandidateReportPath = `/${role}/reports/candidateReport`;
  const CompanyJobReportPath = `/${role}/reports/companyJobReport`;

  return (
    <Card bordered={false} title="Quick Links">
      <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
        <div className="navi-item mb-2">
          <NavLink
            to={CompanyJobReportPath}
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
        </div>
      </div>
    </Card>
  );
}

export default ReportQuickLinks;
