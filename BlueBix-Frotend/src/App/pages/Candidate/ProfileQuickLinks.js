import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "antd";
import SchoolIcon from "@material-ui/icons/School";
import WorkIcon from "@material-ui/icons/Work";
import PersonIcon from "@material-ui/icons/Person";
import BuildIcon from "@material-ui/icons/Build";

function ProfileQuickLinks() {
  const [targetOffset, setTargetOffset] = useState(undefined);

  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);

  return (
    <Card bordered={false} title="Quick Links">
      <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
        <div className="navi-item mb-2">
          <NavLink
            to="/candidate/profile/profile-overview"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-icon mr-2">
              <span className="svg-icon">
                <PersonIcon />
              </span>
            </span>
            <span className="navi-text font-size-lg">Profile Overview</span>
          </NavLink>
          <NavLink
            to="/candidate/profile/employment"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-icon mr-2">
              <span className="svg-icon">
                <WorkIcon />
              </span>
            </span>
            <span className="navi-text font-size-lg">Employment</span>
          </NavLink>
          <NavLink
            to="/candidate/profile/education"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-icon mr-2">
              <span className="svg-icon">
                <SchoolIcon />
              </span>
            </span>
            <span className="navi-text font-size-lg">Education</span>
          </NavLink>
          <NavLink
            to="/candidate/profile/skills"
            className="navi-link py-4 mb-2"
            activeClassName="active"
          >
            <span className="navi-icon mr-2">
              <span className="svg-icon">
                <BuildIcon />
              </span>
            </span>
            <span className="navi-text font-size-lg">Skills</span>
          </NavLink>
        </div>
      </div>
    </Card>
  );
}

export default ProfileQuickLinks;
