import React, { useEffect, useState } from "react";
import axios from "axios";
import { JOB_ACTIVITY_LOG } from "../../../ApiUrl";
import { Col, Row, Card, Timeline, Typography, Progress } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";

const { Text, Title } = Typography;

const ActivityLogUI = (param) => {
  const [activityLog, setActivityLog] = useState("");
  const users = useSelector(({ users }) => users);
  const openingDetails = param.param;
  const isActivityLogs = param.isActivityLogs;
  useEffect(() => {
    getActivityLog();
  }, [openingDetails]);

  const getActivityLog = () => {
    let param = {
      opening_id: openingDetails.opening_id,
      recruiter_id: users.role === "recruiter" ? users.user._id : "",
      freelance_id: users.role === "freelancerecruiter" ? users.user._id : "",
      bdm_id: users.role === "bdm" ? users.user._id : "",
    };
    axios
      .post(JOB_ACTIVITY_LOG, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          setActivityLog(res.data.data);
        }
      })
      .catch((error) => {});
  };

  const statatic =
    users.role === "company" ? (
      <Card bordered={false} className="px-0 py-0">
        <Row gutter={24}>
          <Col span={8}>
            <Card hoverable className="bg-light-success hoverable cursor">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_submitted ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/company/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "all" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "submit",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Submissions
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_submitted
                        ? activityLog.total_candidate_submitted
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    style={{ width: "70%", margin: "auto" }}
                    percent={
                      activityLog.total_candidate_submitted
                        ? (activityLog.total_candidate_submitted /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_submitted > 0 &&
                      activityLog.total_candidate_submission
                        ? Number.parseFloat(
                            (activityLog.total_candidate_submitted /
                              activityLog.total_candidate_submission) *
                              100
                          ).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable className="bg-light-warning hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_client_review ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/company/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "client_review" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "client_review",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Client review
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_client_review
                        ? activityLog.total_client_review
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_client_review
                        ? (activityLog.total_client_review /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#4caf50",
                      "100%": "#4caf50",
                    }}
                    format={(percent) =>
                      activityLog.total_client_review > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable className="bg-light-danger hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_rejected ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/company/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "reject" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "reject",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Rejected
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_rejected
                        ? activityLog.total_candidate_rejected
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_rejected
                        ? (activityLog.total_candidate_rejected /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_rejected > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card hoverable className="bg-light-primary hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_interview ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/company/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "interview" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "interview",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Interviews
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_interview
                        ? activityLog.total_candidate_interview
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_interview
                        ? (activityLog.total_candidate_interview /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#4caf50",
                      "100%": "#4caf50",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_interview > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card hoverable className="bg-success hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_placed ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/company/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "placed" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "placed",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Placed
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_placed
                        ? activityLog.total_candidate_placed
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_placed
                        ? (activityLog.total_candidate_placed /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_placed > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    ) : users.role !== "admin" ? (
      <Card bordered={false} className="px-0 py-0">
        <Row gutter={24}>
          <Col span={8}>
            <Card hoverable className="bg-light-success hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_submission ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "all" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "all",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Submissions
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_submission
                        ? activityLog.total_candidate_submission
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_submission
                        ? (activityLog.total_candidate_submission /
                            openingDetails.number_of_openings) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_submission
                        ? Number.parseFloat(
                            (activityLog.total_candidate_submission /
                              openingDetails.number_of_openings) *
                              100
                          ).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable className="bg-light-primary hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_submitted ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "submit" +
                          ""
                        : "",
                      //state: { item: openingDetails },
                      aboutProps: {
                        record: openingDetails,
                        status: "submit",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Submitted
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_submitted
                        ? activityLog.total_candidate_submitted
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_submitted
                        ? (activityLog.total_candidate_submitted /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_submitted > 0 &&
                      activityLog.total_candidate_submission
                        ? Number.parseFloat(
                            (activityLog.total_candidate_submitted /
                              activityLog.total_candidate_submission) *
                              100
                          ).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card hoverable className="bg-light-warning hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_client_review ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "client_review" +
                          ""
                        : "",
                      aboutProps: {
                        record: openingDetails,
                        status: "client_review",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Client review
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_client_review
                        ? activityLog.total_client_review
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_client_review
                        ? (activityLog.total_client_review /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_client_review > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card hoverable className="bg-light-danger hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_rejected ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "reject" +
                          ""
                        : "",
                      aboutProps: {
                        record: openingDetails,
                        status: "reject",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Rejected
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_rejected
                        ? activityLog.total_candidate_rejected
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_rejected
                        ? (activityLog.total_candidate_rejected /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_rejected > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card hoverable className="bg-light-success hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_interview ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "interview" +
                          ""
                        : "",
                      aboutProps: {
                        record: openingDetails,
                        status: "interview",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Interviews
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_interview
                        ? activityLog.total_candidate_interview
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_interview
                        ? (activityLog.total_candidate_interview /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#4caf50",
                      "100%": "#4caf50",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_interview > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card hoverable className="bg-success hoverable">
              <div
                onClick={() => {
                  if (activityLog.total_candidate_placed ? true : false) {
                    param.props.history.push({
                      pathname: openingDetails
                        ? "/" +
                          users.role +
                          "/OpeningWiseCandidates/" +
                          openingDetails.opening_id +
                          "/" +
                          openingDetails.account_name[0]._id +
                          "/" +
                          "placed" +
                          ""
                        : "",
                      aboutProps: {
                        record: openingDetails,
                        status: "placed",
                      },
                    });
                  }
                }}
              >
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Text level={5} className="mb-2">
                      Placed
                    </Text>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24} className="mb-2 text-center">
                    <Title level={3} className="mb-2">
                      {activityLog.total_candidate_placed
                        ? activityLog.total_candidate_placed
                        : 0}
                    </Title>
                  </Col>
                </Row>
                <Row gutter={6} className={"text-center"}>
                  <Progress
                    percent={
                      activityLog.total_candidate_placed
                        ? (activityLog.total_candidate_placed /
                            activityLog.total_candidate_submission) *
                          100
                        : 0
                    }
                    strokeColor={{
                      "0%": "#87d068",
                      "100%": "#87d068",
                    }}
                    format={(percent) =>
                      activityLog.total_candidate_placed > 0
                        ? Number.parseFloat(percent).toFixed(0) + "%"
                        : 0 + "%"
                    }
                  />
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    ) : (
      <Card bordered={false} className="px-0 py-0">
        <Row gutter={24}>
          <Col span={8}>
            <Card className="bg-light-success hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Submissions
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_candidate_submission
                      ? activityLog.total_candidate_submission
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_candidate_submission
                      ? (activityLog.total_candidate_submission /
                          openingDetails.number_of_openings) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#87d068",
                    "100%": "#87d068",
                  }}
                  format={(percent) =>
                    activityLog.total_candidate_submission
                      ? Number.parseFloat(
                          (activityLog.total_candidate_submission /
                            openingDetails.number_of_openings) *
                            100
                        ).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="bg-light-primary hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Submitted
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_candidate_submitted
                      ? activityLog.total_candidate_submitted
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_candidate_submitted
                      ? (activityLog.total_candidate_submitted /
                          activityLog.total_candidate_submission) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#87d068",
                    "100%": "#87d068",
                  }}
                  format={(percent) =>
                    activityLog.total_candidate_submitted > 0 &&
                    activityLog.total_candidate_submission
                      ? Number.parseFloat(
                          (activityLog.total_candidate_submitted /
                            activityLog.total_candidate_submission) *
                            100
                        ).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card className="bg-light-warning hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Client review
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_client_review
                      ? activityLog.total_client_review
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_client_review
                      ? (activityLog.total_client_review /
                          activityLog.total_candidate_submission) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#87d068",
                    "100%": "#87d068",
                  }}
                  format={(percent) =>
                    activityLog.total_client_review > 0
                      ? Number.parseFloat(percent).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card className="bg-light-danger hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Rejected
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_candidate_rejected
                      ? activityLog.total_candidate_rejected
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_candidate_rejected
                      ? (activityLog.total_candidate_rejected /
                          activityLog.total_candidate_submission) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#87d068",
                    "100%": "#87d068",
                  }}
                  format={(percent) =>
                    activityLog.total_candidate_rejected > 0
                      ? Number.parseFloat(percent).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card className="bg-light-success hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Interviews
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_candidate_interview
                      ? activityLog.total_candidate_interview
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_candidate_interview
                      ? (activityLog.total_candidate_interview /
                          activityLog.total_candidate_submission) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#4caf50",
                    "100%": "#4caf50",
                  }}
                  format={(percent) =>
                    activityLog.total_candidate_interview > 0
                      ? Number.parseFloat(percent).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
          <Col span={8} className="mt-5">
            <Card className="bg-success hoverable">
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Text level={5} className="mb-2">
                    Placed
                  </Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24} className="mb-2 text-center">
                  <Title level={3} className="mb-2">
                    {activityLog.total_candidate_placed
                      ? activityLog.total_candidate_placed
                      : 0}
                  </Title>
                </Col>
              </Row>
              <Row gutter={6} className={"text-center"}>
                <Progress
                  percent={
                    activityLog.total_candidate_placed
                      ? (activityLog.total_candidate_placed /
                          activityLog.total_candidate_submission) *
                        100
                      : 0
                  }
                  strokeColor={{
                    "0%": "#87d068",
                    "100%": "#87d068",
                  }}
                  format={(percent) =>
                    activityLog.total_candidate_placed > 0
                      ? Number.parseFloat(percent).toFixed(0) + "%"
                      : 0 + "%"
                  }
                />
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    );

  return isActivityLogs ? (
    <Card
      title="Activity"
      bodyStyle={{ paddingBottom: "20px" }}
      bordered={false}
      className="px-0 py-5 custom-scroller"
    >
      <Timeline>
        {activityLog.job_activity_log
          ? activityLog.job_activity_log.map((item, index) => {
              return (
                <Timeline.Item key={index.toString()}>
                  {item.activity_log}
                  <br />
                  <Text type="secondary">
                    {" " +
                      moment(item.created_at).format("YYYY-MM-DD, hh:mm A")}
                  </Text>
                </Timeline.Item>
              );
            })
          : null}
      </Timeline>
    </Card>
  ) : (
    statatic
  );
};

export default ActivityLogUI;
