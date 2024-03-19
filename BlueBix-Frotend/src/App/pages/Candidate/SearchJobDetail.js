/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Col, Row, Card, Typography, Button } from "antd";
import moment from "moment";
import axios from "axios";
import {
  CANDIDATE_APPLY_JOB,
  CANDIDATE_REMOVE_JOB,
  CANDIDATE_SAVE_JOB,
  JOB_DETAIL,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RoomIcon from "@material-ui/icons/Room";
import { showError } from "../utils/helpers";

const { Text, Title } = Typography;

export default function SearchJobDetail(props) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [openingDetails, setOpeningDetails] = useState("");
  const [CandiadteDetail, setCandiadteDetail] = useState();
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  useEffect(() => {
    getOpeningDetail();
    setCandiadteDetail(location.state ? location.state.item : "");
    return () => { };
  }, []);


  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.item._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
      })
      .catch((error) => {
      });
  };

  const onApplyJob = async (item) => {

    if (item && item.job_apply) {
    } else {
      const x = await axios.post(JOB_ASSIGNMENT_DETAILS, { opening_id: item.opening_id }, { headers: { Authorization: users.token } });
      let asr = [];
      if (x.data.data.length > 0) {
        x.data.data.forEach(element => {
          if (element.assigned_bdm.length == 0) {
            asr.push(...element.assigned_recruiter)
          }
        });
      }
      const assigned_recruiter = Array.from(new Set(asr));

      const params = {
        candidate_id: users.user._id,
        job_opening_id: item.opening_id,
        recruiter_id: assigned_recruiter,
        profile_submit: "1",
      };

      axios
        .post(CANDIDATE_APPLY_JOB, params, {
          headers: {
            Authorization: users.token,
          },
        })
        .then((res) => {
          if (!res.data.error) {
            setSuccess(true);
            setError(false);
            setMsgSuccess(res.data.message);
            setTimeout(() => {
              props.history.goBack();
            }, 3000);
            setDefaultState();
          }
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.data.errors.exists) {
              setSuccess(false);
              setError(true);
              setmsgError(error.response.data.errors.exists);
            } else {
              let errorMessage = "";
              {
                error.response.data &&
                  Object.entries(error.response.data.errors).map(
                    ([, value]) => {
                      return (errorMessage += value + ", ");
                    }
                  );
              }
              setmsgError(errorMessage);
            }
            setDefaultState();
          }
        });
    }
  };

  const onSaveJob = (item) => {
    if (item && item.job_save) {
      onRemoveJob(item);
    } else {
      const params = {
        candidate_id: users.user._id,
        job_opening_id: item.opening_id,
      };

      axios
        .post(CANDIDATE_SAVE_JOB, params, {
          headers: {
            Authorization: users.token,
          },
        })
        .then((res) => {
          if (!res.data.error) {
            props.history.goBack();
          }
        })
        .catch((error) => {
          if (error.response) {
            let errorMessage = "";
            {
              error.response.data &&
                Object.entries(error.response.data.errors).map(([, value]) => {
                  return (errorMessage += value + ", ");
                });
            }
            setDefaultState();
          }
        });
    }
  };

  const onRemoveJob = (item) => {
    axios
      .delete(CANDIDATE_REMOVE_JOB + "/" + item.job_save._id, {
        headers: {
          Authorization: users.token,
        },
      })
      .then((res) => {
        if (!res.data.error) {
          props.history.goBack();
          //this.setDefaultState();
        }
      })
      .catch((error) => {
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data &&
              error.response.data.errors &&
              Object.entries(error.response.data.errors).map(([, value]) => {
                return (errorMessage += value + ", ");
              });
          }
        }
      });
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const createMarkup = () => {
    return { __html: openingDetails.job_description };
  };

  const given = moment(openingDetails.created_at, "YYYY-MM-DD");
  const current = moment().startOf("day");
  const datys = moment.duration(current.diff(given)).asDays();
  return (
    <div>
      {showError(success, msgSuccess, error, msgError)}
      <Row gutter={24}>
        <Col span={24}>
          <Card
            bordered={true}
            className="px-0 py-0 mb-5"
            bodyStyle={{ padding: 0 }}
          >
            <Row gutter={24} className="p-13">
              <Col span={24}>
                <div className={"cursor-pointer"}>
                  <Title level={3}>
                    {openingDetails ? openingDetails.opening_title : ""}
                  </Title>
                </div>
              </Col>
              <Col span={24}>
                <BusinessCenterIcon
                  style={{ fill: "#2381cd", marginRight: "5px" }}
                />
                <Text level={5} className="mb-0 ml-1">
                  {openingDetails
                    ? openingDetails.required_experience + " Yrs"
                    : ""}
                </Text>
                <AccountBalanceWalletIcon
                  style={{
                    fill: "#2381cd",
                    marginRight: "3px",
                    marginLeft: "5px",
                  }}
                />
                <Text level={5} className="mb-0 ml-1">
                  $ {openingDetails ? openingDetails.salary_range + "  " : ""}
                </Text>
                {openingDetails && openingDetails.city.length > 0 ? (
                  <RoomIcon
                    style={{
                      fill: "#2381cd",
                      marginRight: "3px",
                      marginLeft: "0px",
                    }}
                  />
                ) : null}
                <Text level={5} className="mb-0 ml-1">
                  {openingDetails && openingDetails.city.length > 0
                    ? openingDetails.city[0].city
                    : ""}
                </Text>
              </Col>
              <Col span={18} className="mt-5 ml-0">
                <Text strong level={5} className="mb-0 ml-0">
                  {datys > 0 ? datys + " DAY AGO" : " Today"}
                </Text>
              </Col>
              <Col span={6} className="align-text-center text-right">
                <Button
                  type={
                    CandiadteDetail && CandiadteDetail.job_save
                      ? "primary"
                      : "default"
                  }
                  htmlType="submit"
                  onClick={() => onSaveJob(CandiadteDetail, "")}
                >
                  {CandiadteDetail && CandiadteDetail.job_save
                    ? "Saved"
                    : "Save"}
                </Button>
                <Button
                  type={
                    CandiadteDetail && CandiadteDetail.job_apply
                      ? "primary"
                      : "default"
                  }
                  htmlType="submit"
                  className={"ml-5"}
                  onClick={() => onApplyJob(CandiadteDetail, "")}
                >
                  {CandiadteDetail && CandiadteDetail.job_apply
                    ? "Applied"
                    : "Apply"}
                </Button>
              </Col>
            </Row>
          </Card>
          <Card
            title={"Job Description"}
            extra={
              <NavLink
                to={
                  {
                    // pathname: "/company/job-openings",
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
            bordered={false}
            className="px-0 py-0 mb-5"
          >
            <Row gutter={24} className="mb-5">
              <Col span={24}>
                <div
                  dangerouslySetInnerHTML={createMarkup()}
                  className="editor"
                ></div>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Key Skills
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
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
