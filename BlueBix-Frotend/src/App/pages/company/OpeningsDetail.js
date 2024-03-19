import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import axios from "axios";
import { COMPANY_UPDATE_SUBMISSION_COUNT, JOB_DETAIL } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ActivityLogUI from "../../modules/ActivityLog";
import OpeningDetailUi from "../../modules/Openings/OpeningDetailUI";

export default function OpeningsDetail(props) {
  const [openingDetails, setOpeningDetails] = useState("");
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  useEffect(() => {
    getOpeningDetail();
    return () => { };
  }, []);
  useEffect(() => {
    updateSubmissionCount();
    return () => { };
  }, [openingDetails]);

  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.record._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
      })
      .catch((error) => {
      });
  };
  const updateSubmissionCount = () => {
    if (openingDetails) {
      axios
        .post(
          COMPANY_UPDATE_SUBMISSION_COUNT,
          { company_id: users.user._id, opening_id: openingDetails.opening_id },
          {
            headers: { Authorization: users.token },
          }
        )
        .then((res) => { })
        .catch((error) => {
        });
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={14}>
          <OpeningDetailUi
            openingDetails={openingDetails}
            goBack={props.history.goBack}
          />
          <br />
          <ActivityLogUI
            props={props}
            param={openingDetails}
            isActivityLogs={false}
          />
        </Col>
        <Col span={10}>
          <ActivityLogUI
            props={props}
            param={openingDetails}
            isActivityLogs={true}
          />
        </Col>
      </Row>
    </div>
  );
}
