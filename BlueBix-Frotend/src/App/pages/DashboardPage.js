import React, { useEffect, useState } from "react";
import {
  MixedWidget1,
  AdvanceTablesWidget4,
  ListsWidget8,
} from "../../_theme_parts/_partials/widgets";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { CATEGORY_LIST, DASHBOARD_USER } from "../../ApiUrl";
import { setCategory } from "../../redux/actions/common";

export function DashboardPage(props) {
  const [dashBoardData, setDashBoardData] = useState(undefined);
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const role = users.role; // useSelector(({ users }) => users.role);
  const dispatch = useDispatch();

  useEffect(() => {
    getDashBoardData();
    getCategoriesList();
    return () => { };
  }, [users]);

  useEffect(() => { }, [common]);
  const getCategoriesList = () => {
    axios
      .get(CATEGORY_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        //setCategoryList(res.data.data);
        dispatch(setCategory(res.data.data));
      })
      .catch((error) => {
      });
  };

  const getDashBoardData = () => {
    const values = {
      role: role,
      id: role !== "admin" ? users.user._id : "",
    };

    axios
      .post(DASHBOARD_USER, values, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        // const from = { pathname: "/logout" };
        if (!res.data.error) {
          setDashBoardData(res.data.data);
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          props.history.push("/logout");
        }
      });
  };
  const dashboard_statistics_count = dashBoardData
    ? dashBoardData.dashboard_statistics_count
    : [];
  const company_job_data = dashBoardData
    ? role === "freelancerecruiter"
      ? dashBoardData.latest_five_job_approved
      : dashBoardData.dashboard_statistics_data
    : [];
  const latest_five_candidate = dashBoardData
    ? dashBoardData.latest_five_candidate
    : [];

  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          {dashboard_statistics_count &&
            dashboard_statistics_count.length > 0 ? (
            <MixedWidget1
              role={role}
              dashboard_statistics_count={dashboard_statistics_count}
              className="card-stretch gutter-b"
            />
          ) : null}
        </div>
        <div className="col-lg-6">
          {company_job_data ? (
            <ListsWidget8
              role={role}
              className="card-stretch gutter-b"
              company_job_data={company_job_data}
            />
          ) : null}
        </div>
      </div>
      {role && role !== "candidate" && (
        <div className="row">
          <div className="col-lg-12">
            <AdvanceTablesWidget4
              role={role}
              latest_five_candidate={latest_five_candidate.slice(0, 5)}
              className="card-stretch gutter-b"
            />
          </div>
        </div>
      )}
    </>
  );
}
