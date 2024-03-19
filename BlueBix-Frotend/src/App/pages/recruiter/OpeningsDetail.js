/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import axios from "axios";
import {
  SUBMISSION_BY_RECRUITER,
  JOB_DETAIL,
  JOB_CANDIDATE_WITHDRAW_RECRUITER,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import CandidateList from "./CandidateList";
import CandidatesbyRecruiter from "./candidatesbyRecruiter";
import ActivityLogUI from "../../modules/ActivityLog";
import { showError } from "../utils/helpers";
import OpeningDetailUi from "../../modules/Openings/OpeningDetailUI";

export default function OpeningsDetail(props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [bdmId, setBdmId] = useState("");
  const [openingDetails, setOpeningDetails] = useState("");
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  const history = useHistory();

  useEffect(() => {
    getOpeningDetail();
    return () => { };
  }, []);

  const getOpeningDetail = () => {
    if (location?.state?.record) {
      axios
        .get(JOB_DETAIL + "/" + location.state.record._id, {
          headers: { Authorization: users.token },
        })
        .then((res) => {
          setOpeningDetails(res.data.data[0]);
          getJobAssignmentDetails(res.data.data[0].opening_id)
        })
        .catch((error) => {
        });
    } else {
      history.push('/recruiter/assign-jobs')
    };
  }

  const onSubmit = (selecterIds) => {
    let candidate_submission_by_recruiter = [];
    if (bdmId) {
      selecterIds.map((item) => {
        const object = {
          opening_id: openingDetails.opening_id,
          candidate_id: item,
          recruiter_id: users.user._id,
          company_id:
            openingDetails.account_name.length > 0
              ? openingDetails.account_name[0]._id
              : null,
          bdm_id: bdmId,
          submission_status: "submission",
        };
        candidate_submission_by_recruiter.push(object);
      });

      let param = {
        candidate_submission_by_recruiter: candidate_submission_by_recruiter,
      };

      if (selecterIds.length > 0 && openingDetails.account_name.length) {
        setLoading(true);
        axios
          .post(SUBMISSION_BY_RECRUITER, param, {
            headers: { Authorization: users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              setSuccess(true);
              setMsgSuccess(res.data.message);
              setLoading(false);
              setError(false);
              setDefaultState();
              getOpeningDetail();
            }
          })
          .catch((error) => {
            setSuccess(false);
            setLoading(false);
            setError(true);
            if (error.response) {
              let errorMessage = "";
              {
                error.response.data &&
                  Object.entries(error.response.data.errors).map(
                    ([key, value]) => {
                      return (errorMessage += value + ", ");
                    }
                  );
              }
              setmsgError(errorMessage);
            }
            setDefaultState();
          });
      } else {
        setSuccess(false);
        setLoading(false);
        setError(true);
        const errorMessage = "please select candidate";
        setmsgError(errorMessage);
        setDefaultState();
      }
    }
  };

  const getJobAssignmentDetails = (id) => {
    axios
      .post(
        JOB_ASSIGNMENT_DETAILS,
        {
          recruiter_id: users.user._id,
          opening_id: id
        },
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        setBdmId(res.data.data[0].created_by);

      })
      .catch((error) => {
      });

  };

  const withdrawCandidate = (selecterIds, status) => {

    let candidate_withdraw_by_recruiter = [];
    selecterIds.map((item) => {
      const object = {
        opening_id: openingDetails.opening_id,
        _id: item,
        recruiter_id: users.user._id,
      };
      candidate_withdraw_by_recruiter.push(object);
    });

    let param = {
      candidate_withdraw_by_recruiter: candidate_withdraw_by_recruiter,
    };


    if (selecterIds.length > 0) {
      setLoading(true);
      axios
        .post(JOB_CANDIDATE_WITHDRAW_RECRUITER, param, {
          headers: { Authorization: users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            setSuccess(true);
            setMsgSuccess(res.data.message);
            setLoading(false);
            setError(false);
            setDefaultState();
          }
        })
        .catch((error) => {
          setSuccess(false);
          setLoading(false);
          setError(true);
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
          setDefaultState();
        });
    } else {
      setSuccess(false);
      setLoading(false);
      setError(true);
      const errorMessage = "please select candidate";
      setmsgError(errorMessage);
      setDefaultState();
    }
  };

  const onDelete = (selecterIds) => {
    if (selecterIds.length > 0) {
      setLoading(true);
      axios
        .delete("url", {
          headers: { Authorization: users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            setSuccess(true);
            setMsgSuccess(res.data.message);
            setLoading(false);
            setError(false);
          }
        })
        .catch((error) => {
          setSuccess(false);
          setLoading(false);
          setError(true);
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
          setDefaultState();
        });
    }
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const object = openingDetails
    ? {
      opening_id: openingDetails ? openingDetails.opening_id : "",
      recruiter_id: users.user._id,
    }
    : undefined;

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
      <br />
      <Row gutter={24}>
        <Col span={12}>
          {
            <CandidatesbyRecruiter
              onSubmit={withdrawCandidate}
              onDelete={onDelete}
              object={object}
              loading={loading}
              opening_details={openingDetails}
            />
          }
        </Col>
        <Col span={12}>
          <CandidateList
            onSubmit={onSubmit}
            object={{ opening_id: openingDetails.opening_id }}
            loading={loading}
            opening_details={openingDetails}
          />
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>{showError(success, msgSuccess, error, msgError)}</Col>
      </Row>
    </div>
  );
}
