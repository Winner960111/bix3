/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Form, Col, Row, Card, Typography, Select, Button, Tabs } from "antd";

import axios from "axios";

import CandidatesbyMe from "./CandidatesbyMe";
import OnHoldCandidates from "./OnHoldCandidates";
import RejectedCandidate from "./RejectedCandidate";
import CandidatesbyRecruiter from "./CandidatesbyRecruiter";
import CandidatesbyBDM from "./CandidatesbyBDM";
import CandidatesbyOtherBDM from "./CandidatesbyOtherBDM";

import {
  JOB_DETAIL,
  SUBMISSION_BY_BDM,
  CANDIDATE_SUBMISSION_RE_SUBMISSION,
  ASSIGN_JOB,
  JOB_RECRUITER_LIST,
  BDM_FREELANCER_LIST,
  BDM_UPDATE_SUBMISSION_COUNT,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import { useSelector } from "react-redux";

import { useLocation } from "react-router-dom";
import ActivityLogUI from "../../modules/ActivityLog";
import { showError } from "../utils/helpers";
import OpeningDetailUi from "../../modules/Openings/OpeningDetailUI";

const { Text } = Typography;

const { Option } = Select;
const FormItem = Form.Item;
const { TabPane } = Tabs;

export default function OpeningsDetail(props) {
  const [openingDetails, setOpeningDetails] = useState("");
  const [recruterList, setAllRecruterList] = useState([]);
  const [freelancerList, setAllFreelancerList] = useState([]);
  const [selectedRecruter, setSelectedRecruter] = useState([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState([]);

  // const [assignedRecruter, setAssignedRecruter] = useState([]);
  // const [assignedFreelancer, setAssignedFreelancer] = useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [isOpeningUpdate, setOpeningUpdate] = useState(false);

  const users = useSelector(({ users }) => users);
  let location = useLocation();

  useEffect(() => {
    getAllRecruterList();
    getAllFreelancerList();
    getOpeningDetail();

    return () => { };
  }, []);

  useEffect(() => {
    updateSubmissionCount();
    return () => { };
  }, [openingDetails]);

  const getOpeningDetail = () => {
    axios
      .get(
        JOB_DETAIL + "/" + (location.state ? location.state.record._id : ""),
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
        getJobAssignmentDetails(res.data.data[0].opening_id);

        setOpeningUpdate(true);
      })
      .catch((error) => {
      });
  };

  const getJobAssignmentDetails = (id) => {
    axios
      .post(
        JOB_ASSIGNMENT_DETAILS,
        {
          created_by: users.user._id,
          // notforbdm: 1,
          opening_id: id
        },
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        const data = res.data.data;
        if (data.length > 0) {
          let assigned_rec_arr = [];
          let assigned_free_arr = [];
          data.forEach(element => {
            assigned_rec_arr.push(...element.assigned_recruiter);
            assigned_free_arr.push(...element.assigned_freelancer)
          });
          setSelectedRecruter(assigned_rec_arr);
          setSelectedFreelancer(assigned_free_arr);
        }

        // getJobAssignmentDetailsWithoutBdm(id);

      })
      .catch((error) => {
      });

  };

  // const getJobAssignmentDetailsWithoutBdm = (id) => {
  //   axios
  //     .post(
  //       JOB_ASSIGNMENT_DETAILS,
  //       {
  //         opening_id: id
  //       },
  //       {
  //         headers: { Authorization: users.token },
  //       }
  //     )
  //     .then((res) => {
  //       const data = res.data.data;
  //       if (data.length > 0) {
  //         removeAlreadySetAssignments(data)
  //       }
  //     })
  //     .catch((error) => {
  //     });

  // };

  // const removeAlreadySetAssignments = (data) => {

  //   let alreadySelectedRecruiter = [];
  //   let alreadySelectedFreelancer = [];
  //   data.forEach(element => {
  //     alreadySelectedRecruiter.push(...element.assigned_recruiter)
  //     alreadySelectedFreelancer.push(...element.assigned_freelancer)
  //   });

  //   setAssignedRecruter(alreadySelectedRecruiter);
  //   setAssignedFreelancer(alreadySelectedFreelancer);

  // }

  // recruterList.forEach((item, index) => {
  //   if (selectedRecruter.includes(item._id)) {
  //     if (assignedRecruter.includes(item._id) && !selectedRecruter.includes(item._id)) recruterList.splice(index, 1);
  //   }
  //   else {
  //     if (assignedRecruter.includes(item._id)) recruterList.splice(index, 1);
  //   }



  // })

  // freelancerList.forEach((item, index) => {
  //   if (selectedFreelancer.includes(item._id)) {
  //     if (assignedFreelancer.includes(item._id) && !selectedFreelancer.includes(item._id)) freelancerList.splice(index, 1);
  //   }
  //   else {
  //     if (assignedFreelancer.includes(item._id)) freelancerList.splice(index, 1);
  //   }
  // })


  const updateSubmissionCount = () => {
    if (openingDetails) {
      axios
        .post(
          BDM_UPDATE_SUBMISSION_COUNT,
          {
            bdm_id: users.user._id,
            opening_id: openingDetails.opening_id,
          },
          {
            headers: { Authorization: users.token },
          }
        )
        .then((res) => { })
        .catch((error) => {
        });
    }
  };

  const getAllRecruterList = () => {
    axios
      .get(JOB_RECRUITER_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllRecruterList(res.data.data);
      })
      .catch((error) => {
      });
  };
  const getAllFreelancerList = () => {
    axios
      .get(BDM_FREELANCER_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllFreelancerList(res.data.data);
      })
      .catch((error) => {
      });
  };

  const postAssignJob = (text) => {
    const paramRecruter = {
      opening_id: openingDetails.opening_id,
      assigned_by_bdm: users.user._id,
      recruiter_id: selectedRecruter,
      freelance_id: selectedFreelancer,
    };

    const request = axios.put(ASSIGN_JOB, paramRecruter, {
      headers: { Authorization: users.token },
    });

    setLoading(true);
    request
      .then((res) => {
        setLoading(false);
        setSuccess(true);
        setMsgSuccess(res.data.message);
        setSelectedRecruter([]);
        setSelectedFreelancer([]);
        setDefaultState();
        getOpeningDetail();
        getJobAssignmentDetails(openingDetails.opening_id)
      })
      .catch((error) => {
        setLoading(false);
        setError(true);
        setmsgError(error.message ? error.message : " ");
        setDefaultState();
      });
  };

  const handleAssignChange = (value) => {
    setSelectedRecruter(value);
  };

  const handleChangeFreelancer = (value) => {
    setSelectedFreelancer(value);
  };

  const RetrieveBack = (selecterIds, status) => {
    let candidate_submission_by_bdm = [];
    selecterIds.map((item) => {
      const object = {
        opening_id: openingDetails.opening_id,
        bdm_id: users.user._id,
        _id: item,
        company_id: openingDetails.account_name[0]._id,
      };
      candidate_submission_by_bdm.push(object);
    });

    let param = {
      candidate_submission_by_bdm: candidate_submission_by_bdm,
    };

    if (selecterIds.length > 0) {
      setLoading(true);
      axios
        .post(CANDIDATE_SUBMISSION_RE_SUBMISSION, param, {
          headers: { Authorization: users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            setSuccess(true);
            setMsgSuccess(res.data.message);
            setLoading(false);
            setError(false);
            getOpeningDetail();
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

  const onSubmit = (selecterIds, status) => {
    let candidate_submission_by_bdm = [];
    selecterIds.map((item) => {
      const object = {
        opening_id: openingDetails.opening_id,
        _id: item,
        bdm_id: users.user._id,
        company_id: openingDetails.account_name[0]._id,
        submission_status: status,
        candidate_select_by_bdm: status === "submit" ? "1" : "0",
      };
      candidate_submission_by_bdm.push(object);
    });

    let param = {
      candidate_submission_by_bdm: candidate_submission_by_bdm,
    };



    if (selecterIds.length > 0) {
      setLoading(true);
      axios
        .post(SUBMISSION_BY_BDM, param, {
          headers: { Authorization: users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            setSuccess(true);
            setMsgSuccess(res.data.message);
            setLoading(false);
            setError(false);
            getOpeningDetail();
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

  const showResult = (result) => {
    result.then((res) => {
      if (!res.data.error) {
        setSuccess(true);
        setMsgSuccess(res.data.message);
        setLoading(false);
        setError(false);
        getOpeningDetail();
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
  }


  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setOpeningUpdate(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const objectRec = openingDetails
    ? {
      opening_id: openingDetails ? openingDetails.opening_id : "",
      // recruiter_id: openingDetails
      //   ? openingDetails.assigned_recruiter.length > 0
      //     ? openingDetails.assigned_recruiter.map(item => item._id)
      //     : ""
      //   : "",
      bdm_id: users.user._id,
      // freelancer_recruiter_id: openingDetails
      //   ? openingDetails.assigned_freelancer.length > 0
      //     ? openingDetails.assigned_freelancer.map(item => item._id)
      //     : ""
      //   : "",
      company_id: openingDetails.account_name[0]._id
    }
    : undefined;

  const objectBDM = openingDetails
    ? {
      opening_id: openingDetails ? openingDetails.opening_id : "",
      recruiter_id: "",
      bdm_id: users.user._id,
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
          <br />
          <Card title="Assign Job" className="px-0 py-0">

            <Col span={20}>
              <Text>Assigned Job to Recruiter :</Text>
              <FormItem className="mt-2">
                <Row className="d-flex justify-content-between">
                  <Col span={15}>
                    <Select
                      mode="multiple"
                      value={selectedRecruter}
                      onChange={handleAssignChange}
                      placeholder="Select"
                    >

                      {recruterList.length > 0
                        ? recruterList.map((user, index) => {
                          return (
                            <Option value={user._id} key={index.toString()}>
                              {user.display_name ? user.display_name.charAt(0).toUpperCase() +
                                user.display_name.slice(1) : ''}
                            </Option>
                          );
                        })
                        : null}
                    </Select>
                  </Col>

                  <Button
                    className="d-flex align-items-center"
                    type="primary"
                    onClick={() => postAssignJob("Recruiter")}
                  >
                    Save
                    {loading && (
                      <span className="mx-3 spinner spinner-white"> </span>
                    )}
                  </Button>

                </Row>
              </FormItem>
              {/* <div className="mb-2">
                <Text type="secondary">{"Job Assigned to "}</Text>
                <Text type="primary">
                  {selectedRecruter.length > 0
                    ? selectedRecruter.map((element) => {
                      return element.display_name + ", ";
                    })
                    : ""}

                </Text>
              </div> */}
              <br />

              <Text >Assigned Job to Freelancer :</Text>
              <FormItem className="mt-2">
                <Row className="d-flex justify-content-between">
                  <Col span={15}>
                    <Select
                      mode="multiple"
                      value={selectedFreelancer}
                      onChange={handleChangeFreelancer}
                      placeholder="Select"
                    >

                      {freelancerList.length > 0
                        ? freelancerList.map((user, index) => {
                          return (
                            <Option value={user._id} key={index.toString()}>
                              {user.display_name ? user.display_name.charAt(0).toUpperCase() +
                                user.display_name.slice(1) : ''}
                            </Option>
                          );
                        })
                        : null}
                    </Select>
                  </Col>
                  <Button
                    className="d-flex align-items-center"
                    type="primary"
                    onClick={() => postAssignJob("Freelancer")}
                  >
                    Save
                    {loading && (
                      <span className="mx-3 spinner spinner-white"> </span>
                    )}
                  </Button>
                </Row>
              </FormItem>
              {/*) : (*/}
              {/* <>
                <Text type="secondary ">{"Job Assigned to "}</Text>
                <Text type="primary">

                  {selectedFreelancer.length > 0
                    ? selectedFreelancer.map((element) => {
                      return element.display_name + ", ";
                    })
                    : ""}
                </Text>
              </> */}
              {/*)}*/}
            </Col>

          </Card>
        </Col>
      </Row>
      <br />
      <Row gutter={24}>
        {/* {selectedRecruter.length > 0 ||
          selectedFreelancer.length > 0 ? ( */}
        <>
          <Col span={12}>
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="Submited" key="1">
                  <CandidatesbyMe
                    object={objectBDM}
                    isDataUpdate={isOpeningUpdate}
                    opening_id={openingDetails}
                  />
                </TabPane>
                <TabPane tab="On Hold" key="2">
                  <OnHoldCandidates
                    onSubmit={RetrieveBack}
                    object={objectBDM}
                    isDataUpdate={true}
                    loading={loading}
                    opening_details={openingDetails}
                  />
                </TabPane>
                <TabPane tab="Rejected" key="3">
                  <RejectedCandidate
                    onSubmit={RetrieveBack}
                    object={objectBDM}
                    isDataUpdate={true}
                    loading={loading}
                    opening_details={openingDetails}
                  />
                </TabPane>
                <TabPane tab="Other Submissions" key="4">
                  <CandidatesbyOtherBDM
                    opening_id={openingDetails.opening_id}
                    isDataUpdate={true}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
          <Col span={12}>
            <Col>
              <CandidatesbyRecruiter
                onSubmit={onSubmit}
                object={objectRec}
                isDataUpdate={isOpeningUpdate}
                loading={loading}
                opening_details={openingDetails}
              />
            </Col>

            <Col className="mt-10">
              <CandidatesbyBDM
                onSubmit={onSubmit}
                object={objectRec}
                isDataUpdate={isOpeningUpdate}
                loading={loading}
                opening_details={openingDetails}
                result={showResult}
              />
            </Col>
          </Col>
        </>
        {/* 
        ) : null} */}
      </Row>


      <Row gutter={24}>
        <Col span={24}>{showError(success, msgSuccess, error, msgError)}</Col>
      </Row>
    </div>
  );
}