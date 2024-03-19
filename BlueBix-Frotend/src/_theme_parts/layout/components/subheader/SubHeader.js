/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useMemo, useLayoutEffect, useEffect, useState } from "react";
import objectPath from "object-path";
import { useLocation, NavLink } from "react-router-dom";
import { getBreadcrumbsAndTitle, useSubheader } from "../../_core/Subheader";
import { useHtmlClassService } from "../../_core/Layout";
import { useSelector } from "react-redux";
import axios from "axios";
import { MESSAGE_COUNT } from "../../../../ApiUrl";
import { Empty, Badge } from "antd";

export function SubHeader() {
  const uiService = useHtmlClassService();
  const location = useLocation();
  const subheader = useSubheader();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = new Date();
  const layoutProps = useMemo(() => {
    return {
      config: uiService.config,
      subheaderMobileToggle: objectPath.get(
        uiService.config,
        "subheader.mobile-toggle"
      ),
      subheaderCssClasses: uiService.getClasses("subheader", true),
      subheaderContainerCssClasses: uiService.getClasses(
        "subheader_container",
        true
      ),
    };
  }, [uiService]);

  const users = useSelector(({ users }) => users);
  const role = users.role;

  const [count, setcount] = useState(0);

  useEffect(() => {
    if (role === "candidate") {
      // getMessageCount();
    }
  }, []);

  const getMessageCount = () => {
    const userID =
      role === "admin" ||
        role === "bdm" ||
        role === "recruiter" ||
        role === "freelancerecruiter"
        ? users.user._id
        : "";

    const param = {
      company_id: role === "company" ? users.user._id : "",
      candidate_id: role === "candidate" ? users.user._id : "",
      user_id: userID,
      contact_id: "",
    };
    axios
      .post(MESSAGE_COUNT, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          setcount(res.data.data);
        }
      })
      .catch((error) => {
        //setcount(0);
      });
  };

  useLayoutEffect(() => {
    const aside = getBreadcrumbsAndTitle("kt_aside_menu", location.pathname);
    const header = getBreadcrumbsAndTitle("kt_header_menu", location.pathname);
    const breadcrumbs =
      aside && aside.breadcrumbs.length > 0
        ? aside.breadcrumbs
        : header.breadcrumbs;
    subheader.setBreadcrumbs(breadcrumbs);
    subheader.setTitle(
      aside && aside.title && aside.title.length > 0
        ? aside.title
        : header.title
    );
    // eslint-disable-next-line
    if (role === "candidate") {
      getMessageCount();
    }
  }, [location.pathname]);

  // Do not remove this useEffect, need from update title/breadcrumbs outside (from the page)
  useEffect(() => { }, [subheader]);

  return (
    <div
      id="kt_subheader"
      className={`subheader py-2 py-lg-4   ${layoutProps.subheaderCssClasses}`}
    >
      <div
        className={`${layoutProps.subheaderContainerCssClasses} d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap`}
      >
        {/* Info */}
        <div className="d-flex align-items-center flex-wrap mr-1">
          {/* {layoutProps.subheaderMobileToggle && (
                <button
                    className="burger-icon burger-icon-left mr-4 d-inline-block d-lg-none"
                    id="kt_subheader_mobile_toggle"
                >
                  <span/>
                </button>
            )} */}
          {/* <BreadCrumbs items={subheader.breadcrumbs} /> */}

          { }
        </div>

        {/* Toolbar */}
        <div className="d-flex align-items-center">
          {role === "company" ? (
            <>
              {/* <span className="text-dark mr-3">Remaining</span>
              <span
                className="text-muted font-weight-bold mr-2"
                id="kt_dashboard_daterangepicker_title"
              >
                704 CV Access
              </span>
              <span className="text-dark mr-2">|</span>
              <span
                className="text-muted font-weight-bold mr-10"
                id="kt_dashboard_daterangepicker_title"
              >
                5554 Email
              </span> */}
            </>
          ) : role === "bdm" || role === "recruiter" ? (
            <>
              {/* <span className="text-dark mr-3">Remaining</span>
              <span
                className="text-muted font-weight-bold mr-10"
                id="kt_dashboard_daterangepicker_title"
              >
                5554 Email
              </span> */}
            </>
          ) : role === "candidate" ? (
            <div className={"candidate-navi navi-active"}>
              <div className="navi-item mb-2">
                <NavLink
                  to="/candidate/SearchJobs"
                  activeClassName="active"
                  className="navi-link py-4 mb-2"
                >
                  <span className="text-dark mr-10">Search Job</span>
                </NavLink>
                <NavLink
                  to="/candidate/MyJobApplications"
                  activeClassName="active"
                  className="navi-link py-4 mb-2"
                >
                  <span className="text-dark mr-10">My job Applications</span>
                </NavLink>
                <NavLink
                  to="/candidate/savedJobs"
                  activeClassName="active"
                  className="navi-link py-4 mb-2"
                >
                  <span className="text-dark mr-10">Saved jobs</span>
                </NavLink>
                <NavLink
                  to="/candidate/messages"
                  activeClassName="active"
                  className="navi-link py-4 mb-2"
                >
                  <Badge count={count} offset={[-20]}>
                    <span className="text-dark mr-10">Messages</span>
                  </Badge>
                </NavLink>
                <NavLink
                  to="/candidate/profile"
                  activeClassName="active"
                  className="navi-link py-4 mb-2"
                >
                  <span className="text-dark mr-10">Profile</span>
                </NavLink>
              </div>
            </div>
          ) : null}

          <a
            href="#"
            className="btn btn-light btn-sm font-weight-bold"
            id="kt_dashboard_daterangepicker"
            data-toggle="tooltip"
            title="Select dashboard daterange"
            data-placement="left"
          >
            <span
              className="text-muted font-weight-bold mr-2"
              id="kt_dashboard_daterangepicker_title"
            >
              Today
            </span>
            <span
              className="text-primary font-weight-bold"
              id="kt_dashboard_daterangepicker_date"
            >
              {monthNames[d.getMonth()]} {d.getDate()}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
