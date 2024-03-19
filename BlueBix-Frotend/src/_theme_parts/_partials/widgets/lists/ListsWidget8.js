/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../_helpers";
import { map } from "react-bootstrap/ElementChildren";
import { NavLink } from "react-router-dom";
import { Empty, Badge } from "antd";
import { useSelector } from "react-redux";

export function ListsWidget8({ className, role, company_job_data }) {
  const users = useSelector(({ users }) => users);

  const rolesStats = {
    admin: [
      "Latest Posted Job",
      "PHP Developer",
      "5 day ago",
      "Laravel Developer",
      "6 days ago",
      "Full Stack Developer",
      "3 days ago",
    ],
    company: [
      "Latest Posted Job",
      "PHP Developer",
      "5 day ago",
      "Laravel Developer",
      "6 days ago",
      "Full Stack Developer",
      "3 days ago",
    ],
    candidate: [
      "Latest Available Job",
      "Python Developer",
      "KNP PVT LTD.",
      "Node Js Developer",
      "DittoMedia PVT LTD.",
      "MERN Developer",
      "BYJUS PVT LTD.",
    ],
    bdm: [
      "Latest Assigned Job",
      "Sr. PHP Developer",
      "5 day ago",
      "Jr. Laravel Developer",
      "6 days ago",
      "Full Stack Developer",
      "3 days ago",
    ],
    recruiter: [
      "Latest Assigned Job",
      "Sr. Android Developer",
      "5 day ago",
      "Project Manager",
      "6 days ago",
      "Full Stack Developer",
      "3 days ago",
    ],
    freelancerecruiter: ["Latest Assigned Job", "", "", "", "", "", ""],
  };

  const createMarkup = (description) => {
    return { __html: description };
  };

  const renderData = () => {
    return company_job_data.map((item, index) => {
      return (
        <div key={index.toString()} className="mb-10">
          <div className="d-flex align-items-center">
            {/* <div className="symbol symbol-45 symbol-light mr-5">
                    <span className="symbol-label">
                      <SVG
                                className="h-50 align-self-center"
                                src={toAbsoluteUrl("/media/svg/misc/006-plurk.svg")}
                            ></SVG>
                    </span>
                  </div> */}

            <div className="d-flex flex-column flex-grow-1">
              {/* <a
                                href="#"
                                className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1"
                            >
                                {company_job_data ? item.opening_title : ''}
                            </a> */}
              <NavLink
                to={{
                  pathname:
                    users.role === "admin"
                      ? "/" + users.role + "/opening-detail"
                      : "/" + users.role + "/opening-detail",
                  state: { record: { _id: item._id } },
                }}
              >
                
                <Badge
                  count={
                    users.role === "company" || users.role === "bdm"
                      ? item.total
                      : ""
                  }
                  offset={[20, 5]}
                >
                  {company_job_data ? item.opening_title : ""}
                </Badge>
              </NavLink>
              <span className="text-muted font-weight-bold">
                {company_job_data ? item.time : ""}
              </span>
            </div>
          </div>
          {/* <p className="text-dark-50 m-0 pt-5 font-weight-normal">A brief write up about the top Authors that fits within this section</p> */}
          {company_job_data ? (
            <div dangerouslySetInnerHTML={createMarkup(item.description)} />
          ) : (
            ""
          )}
        </div>
      );
    });
  };

  let stats = rolesStats[role];
  return (
    <>
      <div className={`card card-custom ${className}`}>
        {/* Header */}
        <div className="card-header border-0">
          <h3 className="card-title font-weight-bolder text-dark">
            {stats[0]}
          </h3>
        </div>
        {/* Body */}
        <div className="card-body pt-0 ">
          {company_job_data.length <= 0 ? <Empty /> : null}
          {renderData()}
        </div>
      </div>
    </>
  );
}
