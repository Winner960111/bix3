/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Col, Row, Card, Typography, Divider, Button } from "antd";
import {
  optionsSecurity_clearance,
  optionsCurrency,
  optionsInterviewType,
  optionEmploymentType,
} from "../../pages/constant/constant";

import axios from "axios";
import {
  SUBMISSION_BY_RECRUITER,
  JOB_DETAIL,
  JOB_CANDIDATE_WITHDRAW_RECRUITER,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import CandidateList from "./CandidateList";
import CandidatesbyRecruiter from "./candidatesbyRecruiter";
import ActivityLogUI from "../../modules/ActivityLog";
import { showError } from "../utils/helpers";

const { Text, Title } = Typography;

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
  useEffect(() => {
    getOpeningDetail();
    return () => { };
  }, []);

  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.record._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
        getJobAssignmentDetails(res.data.data[0].opening_id);
      })
      .catch((error) => {
      });
  };

  const currency = optionsCurrency.find((item) => {
    return item.value === openingDetails.currency;
  });

  const interview_type = optionsInterviewType.find((item) => {
    return item.value === (openingDetails ? openingDetails.interview_type : "");
  });
  const security_clearance = optionsSecurity_clearance.find((item) => {
    return (
      item.value === (openingDetails ? openingDetails.security_clearance : "")
    );
  });

  const employment_type = optionEmploymentType.find((item) => {
    return (
      item.value === (openingDetails ? openingDetails.employment_type : "")
    );
  });

  const createMarkup = () => {
    return { __html: openingDetails.job_description };
  };

  const onSubmit = (selecterIds) => {
    let candidate_submission_by_recruiter = [];
    if (bdmId) {
      selecterIds.map((item) => {
        const object = {
          opening_id: openingDetails.opening_id,
          candidate_id: item,
          freelancer_recruiter_id: users.user._id,
          company_id:
            openingDetails.account_name.length > 0
              ? openingDetails.account_name[0]._id
              : "",
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
              // eslint-disable-next-line no-lone-blocks
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
          freelancer_id: users.user._id,
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
        freelancer_recruiter_id: users.user._id,
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
      freelancer_recruiter_id: users.user._id,
    }
    : undefined;

  return (
    <div>
      <Row gutter={24}>
        <Col span={14}>
          <Card
            title={
              openingDetails.opening_title //+ " - #" + openingDetails.opening_id
            }
            bordered={false}
            extra={
              <NavLink
                to={
                  {
                    // pathname: "/freelancerecruiter/all-jobs",
                  }
                }
              >          
                <Button
                  onClick={() => {
                    props.history.goBack();
                  }}
                  type="Secondary"
                >                  
                  Back
                </Button>
              </NavLink>
            }
            className="px-0 py-0"
          >
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Account Owner
                </Title>
                <Text type="secondary">-</Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Primary Recruiter
                </Title>
                <Text type="secondary">-</Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Assigner More Recruiters
                </Title>
                <Text type="secondary">-</Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Number of Openings
                </Title>
                <Text type="secondary">
                  {openingDetails.number_of_openings}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Location
                </Title>
                <Text type="secondary">
                  {(openingDetails && openingDetails.city.length > 0
                    ? openingDetails.city[0].city + ", "
                    : "") +
                    (openingDetails && openingDetails.state.length > 0
                      ? openingDetails.state[0].state + ", "
                      : "") +
                    (openingDetails.country
                      ? "United States"
                      : "United States")}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Zip Code
                </Title>
                <Text type="secondary">{openingDetails.zip_code}</Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Skills Required
                </Title>
                {openingDetails
                  ? openingDetails.required_skills.map((item, index) => {
                    return (
                      <Text key={index.toString()} type="secondary">
                        {item + ", "}
                      </Text>
                    );
                  })
                  : ""}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Required Experience
                </Title>
                <Text type="secondary">
                  {openingDetails.required_experience + " years"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Category
                </Title>
                <Text type="secondary">
                  {openingDetails
                    ? openingDetails.category.length > 0
                      ? openingDetails.category[0].name
                      : ""
                    : ""}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Employment Type
                </Title>
                <Text type="secondary">
                  {openingDetails
                    ? employment_type
                      ? employment_type.label
                      : openingDetails.employment_type
                    : ""}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Published Sites
                </Title>
                <Text type="secondary">-</Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Bill Rate
                </Title>
                {currency === undefined ? (
                  <Text type="secondary">""</Text>
                ) : (
                  <>
                    <Text type="secondary">
                      {openingDetails.salary_range +
                        " " +
                        (currency === undefined ? "" : currency.label) +
                        "/" +
                        openingDetails.salary_type}
                    </Text>
                  </>
                )}
              </Col>
            </Row>
            <Divider />
            <Row gutter={24} className="mb-5">
              <Col span={24}>
                <Title level={5} className="mb-0">
                  Job Description
                </Title>
                <div
                  dangerouslySetInnerHTML={createMarkup()}
                  className="editor"
                ></div>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Local Indicator
                </Title>
                {openingDetails &&
                  openingDetails.local_indicator &&
                  openingDetails.local_indicator.map((item, index) => {
                    return (
                      <Text key={index.toString()} type="secondary">
                        {item + ", "}
                      </Text>
                    );
                  })}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  SecurityClearance
                </Title>
                <Text type="secondary">                  
                  {openingDetails && security_clearance
                    ? security_clearance.label
                    : ""}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Visa Type
                </Title>
                {openingDetails
                  ? openingDetails.visa_type.map((item, index) => {
                    return (
                      <Text key={index.toString()} type="secondary">
                        {item.label + ", "}
                      </Text>
                    );
                  })
                  : ""}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Interview Type
                </Title>
                <Text type="secondary">
                  {openingDetails && interview_type ? interview_type.label : ""}
                </Text>
              </Col>
            </Row>
          </Card>
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
              opening_details={openingDetails}
            />
          }
        </Col>
        <Col span={12}>
          <CandidateList
            onSubmit={onSubmit}
            object={{ opening_id: openingDetails.opening_id }}
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
