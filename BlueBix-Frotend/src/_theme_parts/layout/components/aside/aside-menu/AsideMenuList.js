/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";
import { Badge } from "antd";
import { toAbsoluteUrl, checkIsActive } from "../../../../_helpers";
import { useSelector } from "react-redux";
import { MESSAGE_COUNT } from "../../../../../ApiUrl";
import axios from "axios";

export function AsideMenuList({ layoutProps }) {
  const users = useSelector(({ users }) => users);
  const role = users.role;

  const [count, setcount] = useState(0);

  useEffect(() => {
    getMessageCount();
  }, []);

  const location = useLocation();
  const getMenuItemActive = (url, hasSubmenu = false) => {
    return checkIsActive(location, url)
      ? ` ${!hasSubmenu &&
      "menu-item-active"} menu-item-open menu-item-not-hightlighted`
      : "";
  };

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
      .catch((error) => { });
  };

  return (
    <>
      {role === "company" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/dashboard"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/dashboard.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/company/job-openings",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/job-openings"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Job Openings</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/company/candidates",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/candidates"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-hunting.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Candidates</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/agreements",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/agreements"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/handshake.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Agreement</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/company/Contacts",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/Contacts"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Contacts</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/company/subscription",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/subscription"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/subscription.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Subscriptions</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/company/messages",
              false
            )} `}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/messages"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/email.png")}
                  width="20px"
                ></img>
              </span>

              <span className="menu-text">Messages</span>
              <Badge count={count} offset={[5, 5]} />
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/company/reports",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/reports"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Reports</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/contactActivityLog",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/contactActivityLogList"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/edit.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Contact Activity</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}
      {role === "bdm" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/dashboard"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/dashboard.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/job-openings",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/job-openings"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Job Openings</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/assign-jobs",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/assign-jobs"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Assign Jobs</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/workJobsList",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/workJobsList"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Freelance work Jobs</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/CandidateList",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/CandidateList"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Candidates</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/ClientsList",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to={{
                pathname: "/bdm/ClientsList",
                state: { bdmID: users.user._id },
              }}
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Clients</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/contacts",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/contacts"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Contacts</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/AiRecruiter",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/AiRecruiter"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">AI Recruiter</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/agreements",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/company/agreements"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/handshake.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Agreement</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/messages",
              false
            )} `}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/messages"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/email.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Messages</span>
              <Badge count={count} offset={[5, 5]} />
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/bdm/reports",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/bdm/reports"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Reports</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}
      {role === "recruiter" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/dashboard"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/dashboard.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/assign-jobs",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/assign-jobs"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Assign Jobs</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/candidateApplyJobs",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/candidateApplyJobs"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Candidate Apply Jobs</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/addCandidate",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/addCandidate"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Add Candidate</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/AiRecruiter",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/AiRecruiter"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">AI Recruiter</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/messages",
              false
            )} `}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/messages"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/email.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Messages</span>
              <Badge count={count} offset={[5, 5]} />
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/recruiter/reports",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/recruiter/reports"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Reports</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}

      {role === "freelancerecruiter" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/dashboard"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/dashboard.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/freelancerecruiter/all-jobs",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/all-jobs"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">All Jobs</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/freelancerecruiter/assign-jobs",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/assign-jobs"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Assign Jobs</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/freelancerecruiter/addCandidate",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/addCandidate"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Add Candidate</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/freelancerecruiter/AiRecruiter",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/AiRecruiter"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">AI Recruiter</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/freelancerecruiter/messages",
              false
            )} `}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/messages"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/email.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Messages</span>
              <Badge count={count} offset={[5, 5]} />
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive("/reports", false)}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/freelancerecruiter/reports"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Reports</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}

      {role === "admin" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/dashboard"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/dashboard.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Dashboard</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/current-openings",
              false
            )}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/current-openings"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/job-seeker.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Current Openings</span>
            </NavLink>
          </li>

          {role === "admin" && (
            <li
              className={`menu-item ${getMenuItemActive(
                "/user/list",
                false
              )} ${getMenuItemActive(
                "/user/add-user",
                false
              )} ${getMenuItemActive("/user/edit-user", false)}`}
              aria-haspopup="true"
            >
              <NavLink
                onClick={() => getMessageCount()}
                className="menu-link"
                to="/user/list/all"
              >
                <span className="svg-icon menu-icon">
                  <img
                    src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                    width="20px"
                  />
                </span>
                <span className="menu-text">Users</span>
              </NavLink>
            </li>
          )}

          <li
            className={`menu-item ${getMenuItemActive(
              "/user/candidateList",
              false
            )}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/user/candidateList"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Candidates</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/admin/ClientsList",
              false
            )}`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/admin/ClientsList"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Clients</span>
            </NavLink>
          </li>
          <li
            className={`menu-item ${getMenuItemActive(
              "/admin/contacts",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/admin/contacts"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">Contacts</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/admin/AiRecruiter",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/admin/AiRecruiter"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                ></img>
              </span>
              <span className="menu-text">AI Recruiter</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/admin/subscription",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink className="menu-link" to="/admin/subscription">
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/subscription.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Subscriptions</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/admin/messages",
              false
            )} `}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/admin/messages"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/email.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Messages</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive("/reports", false)}  }`}
            aria-haspopup="true"
          >
            <NavLink className="menu-link" to="/admin/reports">
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Reports</span>
            </NavLink>
          </li>

          <li
            className={`menu-item ${getMenuItemActive(
              "/monsterSearch",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink className="menu-link" to="/admin/monsterSearch">
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/report.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Monster Search</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}

      {role === "candidate" ? (
        <ul className={`menu-nav ${layoutProps.ulClasses}`}>
          <li
            className={`menu-item ${getMenuItemActive(
              "/candidate/profile",
              false
            )}  }`}
            aria-haspopup="true"
          >
            <NavLink
              onClick={() => getMessageCount()}
              className="menu-link"
              to="/candidate/profile"
            >
              <span className="svg-icon menu-icon">
                <img
                  src={toAbsoluteUrl("/media/svg/icons/Extra/user.png")}
                  width="20px"
                />
              </span>
              <span className="menu-text">Profile</span>
            </NavLink>
          </li>
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
