import React, { useMemo, useEffect, useState } from "react";
import objectPath from "object-path";
import ApexCharts from "apexcharts";
import { useHtmlClassService } from "../../../layout";
import axios from "axios";
import { DASHBOARD_USER, USER_CREATE } from "../../../../ApiUrl";
import { store } from "../../../../redux";
import { Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";


export function MixedWidget1({ className, role, dashboard_statistics_count }) {
  const uiService = useHtmlClassService();
  const users = useSelector(({ users }) => users);
  const rolesStats = {
    admin: [89, "Total Company Registered", 320, "Total Jobs Posted", 230, "Total Users", 150, "Total Candidates"],
    company: [90, "Total Jobs Posted", 10, "Active Jobs", 5, "Job Posted This Week", 70, "Job Posted This Month"],
    candidate: [40, "Total Relevant Jobs", 13, "Applied Jobs", 5, "Applied Jobs This Week", 2, "Interview Scheduled"],
    bdm: [10, "Total Jobs Assigned", 95, "Profile Submitted", 35, "Profile Shortlisted", 67, "Interview Scheduled"],
    recruiter: [4, "Total Jobs Assigned", 55, "Profile Submitted", 24, "Profile Shortlisted", 45, "Interview Scheduled"],
  };

  let stats = rolesStats[role];

  const layoutProps = useMemo(() => {
    return {
      colorsGrayGray500: objectPath.get(
        uiService.config,
        "js.colors.gray.gray500"
      ),
      colorsGrayGray200: objectPath.get(
        uiService.config,
        "js.colors.gray.gray200"
      ),
      colorsGrayGray300: objectPath.get(
        uiService.config,
        "js.colors.gray.gray300"
      ),
      colorsThemeBaseDanger: objectPath.get(
        uiService.config,
        "js.colors.theme.base.danger"
      ),
      fontFamily: objectPath.get(uiService.config, "js.fontFamily")
    };
  }, [uiService]);

  // useEffect(() => {
  //   const element = document.getElementById("kt_mixed_widget_1_chart");
  //   if (!element) {
  //     return;
  //   }
  //
  //   const options = getChartOptions(layoutProps);
  //
  //   const chart = new ApexCharts(element, options);
  //   chart.render();
  //
  //   return function cleanUp() {
  //     chart.destroy();
  //   };
  // }, [layoutProps]);


  const adminCandidatePath = "/admin/ClientsList"
  const adminOpeningPath = "/current-openings"
  const adminUserPath = "/user/list"
  const adminCandidatesPath = "/user/list"
  const companyPath = "/company/job-openings"
  const user = "/" + role + "/assign-jobs"
  const freelancerPath = "/" + role + "/all-jobs";
  // const recruiterPath = "/recruiter/assign-jobs"

  const user1 =
    role !== "admin" || role !== "company" ? "/" + role + "/userWiseCandidateSubmission/" : "";

  const path1 = role === 'admin' ? adminCandidatePath : role === 'company' ? companyPath : user
  const path2 = role === 'admin' ? adminOpeningPath : role === 'company' ? companyPath : user1 + "all"
  const path3 = role === 'admin' ? adminUserPath + '/all' : role === 'company' ? companyPath : user1 + "submit"
  const path4 = role === 'admin' ? adminCandidatesPath + '/active' : role === 'company' ? companyPath : user1 + "interview"

  return (
    <div className={`card card-custom bg-gray-100 ${className}`}>
      {/* Header */}
      <div className="card-header border-0 bg-danger py-5">
        <h3 className="card-title font-weight-bolder text-white">My Stats</h3>
      </div>
      {/* Body */}
      <div className="card-body p-0 position-relative overflow-hidden">
        {/* Chart */}
        <div
          id="kt_mixed_widget_1_chart"
          className="card-rounded-bottom bg-danger"
          style={{ height: "200px" }}
        ></div>

        {/* Stat */}
        <div className="card-spacer mt-n25">
          <div className="row m-0">
            <div className="col bg-light-warning px-6 py-8 rounded-xl mr-7 mb-7">
              <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
                <span className="text-warning font-size-h6">
                  {dashboard_statistics_count ? dashboard_statistics_count[0].count : ''}
                </span>
              </span>
              <NavLink className="text-warning font-weight-bold font-size-h6" to={{
                pathname: path1,
                // state: {item: item},
              }}>
                {dashboard_statistics_count ? dashboard_statistics_count[0].title : ''}
                {/*<a href="#" className="text-warning font-weight-bold font-size-h6">*/}
                {/*  {dashboard_statistics_count?dashboard_statistics_count[0].title:''}*/}
                {/*</a>*/}
              </NavLink>
            </div>
            <div className="col bg-light-primary px-6 py-8 rounded-xl mb-7">
              <span className="svg-icon svg-icon-3x svg-icon-primary d-block my-2">
                <span className="text-primary font-size-h6">
                  {dashboard_statistics_count ? dashboard_statistics_count[1].count : ''}
                </span>
              </span>
              {/*<a href="#" className="text-primary font-weight-bold font-size-h6 mt-2" >*/}
              {/*  {dashboard_statistics_count?dashboard_statistics_count[1].title:''}*/}
              {/*</a>*/}
              <NavLink className="text-primary font-weight-bold font-size-h6" to={{
                pathname: path2,
                // state: {item: item},
              }}>
                {dashboard_statistics_count ? dashboard_statistics_count[1].title : ''}
              </NavLink>
            </div>
          </div>
          <div className="row m-0">
            <div className="col bg-light-danger px-6 py-8 rounded-xl mr-7">
              <span className="svg-icon svg-icon-3x svg-icon-danger d-block my-2">
                <span className="text-danger font-size-h6">
                  {dashboard_statistics_count ? dashboard_statistics_count[2].count : ''}
                </span>
              </span>
              {/*<a href="#" className="text-danger font-weight-bold font-size-h6 mt-2" >*/}
              {/*  {dashboard_statistics_count?dashboard_statistics_count[2].title: ''}*/}
              {/*</a>*/}
              <NavLink className="text-danger font-weight-bold font-size-h6" to={{
                pathname: path3,
                // state: {item: item},
              }}>
                {dashboard_statistics_count ? dashboard_statistics_count[2].title : ''}
              </NavLink>
            </div>
            <div className="col bg-light-success px-6 py-8 rounded-xl">
              <span className="svg-icon svg-icon-3x svg-icon-success d-block my-2">
                <span className="text-success font-size-h6">
                  {dashboard_statistics_count ? dashboard_statistics_count[3].count : ''}
                </span>
              </span>
              {/*<a href="#" className="text-success font-weight-bold font-size-h6 mt-2" >*/}
              {/*  {dashboard_statistics_count?dashboard_statistics_count[3].title:''}*/}
              {/*</a>*/}
              <NavLink className="text-success font-weight-bold font-size-h6" to={{
                pathname: path4,
              }}>
                {dashboard_statistics_count ? dashboard_statistics_count[3].title : ''}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Resize */}
        <div className="resize-triggers">
          <div className="expand-trigger">
            <div style={{ width: "411px", height: "461px" }} />
          </div>
          <div className="contract-trigger" />
        </div>
      </div>
    </div>
  );
}

function getChartOptions(layoutProps) {
  const strokeColor = "#D13647";

  const options = {
    series: [
      {
        name: "Profiles",
        data: [30, 45, 32, 70, 40, 40, 40]
      }
    ],
    chart: {
      type: "area",
      height: 200,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      sparkline: {
        enabled: true
      },
      dropShadow: {
        enabled: true,
        enabledOnSeries: undefined,
        top: 5,
        left: 0,
        blur: 3,
        color: strokeColor,
        opacity: 0.5
      }
    },
    plotOptions: {},
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: "solid",
      opacity: 0
    },
    stroke: {
      curve: "smooth",
      show: true,
      width: 3,
      colors: [strokeColor]
    },
    xaxis: {
      categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: false,
        style: {
          colors: layoutProps.colorsGrayGray500,
          fontSize: "12px",
          fontFamily: layoutProps.fontFamily
        }
      },
      crosshairs: {
        show: false,
        position: "front",
        stroke: {
          color: layoutProps.colorsGrayGray300,
          width: 1,
          dashArray: 3
        }
      }
    },
    yaxis: {
      min: 0,
      max: 80,
      labels: {
        show: false,
        style: {
          colors: layoutProps.colorsGrayGray500,
          fontSize: "12px",
          fontFamily: layoutProps.fontFamily
        }
      }
    },
    states: {
      normal: {
        filter: {
          type: "none",
          value: 0
        }
      },
      hover: {
        filter: {
          type: "none",
          value: 0
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "none",
          value: 0
        }
      }
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: layoutProps.fontFamily
      },
      y: {
        formatter: function (val) {
          return val;
        }
      },
      marker: {
        show: false
      }
    },
    colors: ["transparent"],
    markers: {
      colors: layoutProps.colorsThemeBaseDanger,
      strokeColor: [strokeColor],
      strokeWidth: 3
    }
  };
  return options;
}
