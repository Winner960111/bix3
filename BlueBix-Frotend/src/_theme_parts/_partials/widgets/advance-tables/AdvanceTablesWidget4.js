/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid,jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../_helpers";
import { CANDIDATE_LIST_DASHBOARD } from "../../../../ApiUrl";
import { useSelector } from "react-redux";
import { UserSwitchOutlined } from "@ant-design/icons";
import axios from "axios";
import { Button } from "antd";
import { NavLink } from "react-router-dom";
import {
  CandidateSubmissionStatus,
  statusList,
} from "../../../../App/pages/constant/constant";

export function AdvanceTablesWidget4({
  className,
  role,
  latest_five_candidate,
}) {
  // const [candidateList, setCandidateList] = useState([]);

  const users = useSelector(({ users }) => users);
  // useEffect(() => {
  //
  //     getLastFiveCandidateList()
  // }, [users]);
  //
  // const getLastFiveCandidateList = () => {
  //     const values = {
  //         role: users.role,
  //         id: users.role !== "admin" ? users.user._id : "",
  //     }
  //     axios
  //         .post(CANDIDATE_LIST_DASHBOARD, values, {
  //             headers: {Authorization: users.token},
  //         })
  //         .then((res) => {
  //             setCandidateList(res.data.data)
  //         })
  //         .catch((error) => {
  //         });
  // };

  const setCandidateData = () => {
    let skills = "";

    return latest_five_candidates
      ? latest_five_candidates.map((item, index) => {
        const submissionStatusID = item.opening_details
          ? item.opening_details.submission_status
          : "";

        const JobTitle =
          item.opening_details &&
            item.opening_details.job_opening_details &&
            item.opening_details.job_opening_details.length > 0
            ? item.opening_details.job_opening_details[0].opening_title
            : "";

        const status = CandidateSubmissionStatus.find((status) => {
          return status.value === submissionStatusID;
        });
        skills = "";
        return (
            <tr key={index.toString()}>
              <td className="pl-0 py-8">
                <div className="d-flex align-items-center">
                  <div className="symbol symbol-50 symbol-light mr-4">
                    <span className="symbol-label">
                      <span className="svg-icon h-75 align-self-end">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/avatars/001-boy.svg"
                          )}
                        />
                      </span>
                    </span>
                  </div>
                  <div>
                    <a
                      href="#"
                      className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg"
                    >
                      {/*{item ? item.first_name + " " + item.last_name : ""}*/}
                      {item ? item.name.toUpperCase() : ""}
                    </a>

                    {item && item.key_skills
                      ? item.key_skills.map((item, index) => {
                        if (index % 2 !== 0) {
                          skills += " " + item;
                          const skill = skills;
                          skills = "";
                          return (
                            <span key={index} className="text-muted font-weight-bold d-block">
                              
                              {skill + ", "}
                            </span>
                          );
                        } else {
                          skills += item + ", ";
                        }
                      })
                      : ""}
                  </div>
                </div>
              </td>
              <td>
                <span className="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {item && item.current_ctc
                    ? parseInt(item.current_ctc) > 1000 ? '$ ' + parseInt(item.current_ctc) / 1000 + ' K' : '$ ' + item.current_ctc
                    : "$ 0.00 "
                  }
                </span>
              </td>
              <td>
                <span className="text-dark-75 font-weight-bolder d-block font-size-lg">
                  {item ? item.desired_location : "-"}
                </span>
              </td>
              <td>
                <span className="text-dark-75 font-weight-bolder d-block font-size-lg">
                  <span className="label label-lg label-light-primary label-inline">
                    {item.status || ''
                      // ? status.label.charAt(0).toUpperCase() +
                      //   status.label.slice(1)
                      // : submissionStatusID
                    }
                  </span>
                </span>
              </td>
              <td className="pr-0 text-right">
                {/*/company/candidateProfileDetail*/}
                {/*<a*/}
                {/*  href="#"*/}
                {/*  className="btn btn-light-success font-weight-bolder font-size-sm"*/}
                {/*>*/}
                {/*  View Profile*/}
                {/*</a>*/}
                <NavLink
                  to={{
                    pathname: "/" + users.role + "/candidateProfileDetail",
                    state: { item: item },
                  }}
                >
                  <Button
                    style={{ height: 35 }}
                    type="primary"
                    className={
                      "btn btn-light-success font-weight-bolder font-size-sm mr-3 align-items-center"
                    }
                  >
                    View Profile
                  </Button>
                </NavLink>
              </td>
            </tr>
        );
      })
      : "";
  };

  const latest_five_candidates = latest_five_candidate
    ? latest_five_candidate
    : undefined;

  return (
    <div className={`card card-custom ${className}`}>
      {/* Head */}
      <div className="card-header border-0 py-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label font-weight-bolder text-dark">
            {["bdm", "recruiter"].indexOf(role) > -1
              ? "Latest Profile Submitted"
              : "Latest Profiles"}
          </span>
        </h3>
        {role && role === "company" && (
          <div className="card-toolbar">
            <NavLink to="/company/add-opening">
              <Button
                style={{ height: 35 }}
                type="primary"
                className={
                  "btn btn-info font-weight-bolder font-size-sm mr-3 align-items-center"
                }
              >
                Post New Job
              </Button>
            </NavLink>
            {/*<a*/}
            {/*  href="#"*/}
            {/*  className="btn btn-info font-weight-bolder font-size-sm mr-3"*/}
            {/*>*/}
            {/*  Post New Job*/}
            {/*</a>*/}
          </div>
        )}
      </div>
      {/* Body */}
      <div className="card-body pt-0 pb-3">
        <div className="tab-content">
          <div className="table-responsive">
            <table className="table table-head-custom table-head-bg table-borderless table-vertical-center">
              <thead>
                <tr className="text-left text-uppercase">
                  <th className="pl-7">
                    <span className="text-dark-75">Name</span>
                  </th>
                  <th>
                    Current CTC
                  </th>
                  {/* <th style={{minWidth: "100px"}}>Expected CTC</th> Last Company */}
                  <th> Location</th>
                  <th> Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>{setCandidateData()}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
