
/* eslint-disable no-lone-blocks */
/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Modal,
  Typography,
  Button,
  Avatar,
} from "antd";
import RoomIcon from "@material-ui/icons/Room";
import CallIcon from "@material-ui/icons/Call";
import EmailIcon from "@material-ui/icons/Email";
import CalendarViewDayIcon from "@material-ui/icons/DateRangeOutlined";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { CANDIDATE_RESUME_URL, COMPANY_CANDIDATE_DETAILS, IMAGE_CANDIDATE_URL } from "../../../ApiUrl";
import './monster.css';

const { Text, Title } = Typography;
const MonsterCandidateDetail = ({ showModel, setShowModel, candidateId, viewHistory }) => {
  const [userProfileDetails, setUserProfileDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const users = useSelector(({ users }) => users);
  const onClose = () => {
    setShowModel(false);
  };

  const docs = [
    {
      // uri: "https://calibre-ebook.com/downloads/demos/demo.docx",
    }
  ];


  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  useEffect(() => {
    if (candidateId) getCandidateDetail();
  }, [candidateId]);

  const getCandidateDetail = () => {
    let param = {
      candidate_id: candidateId
    };
    setLoading(true);
    axios
      .post(COMPANY_CANDIDATE_DETAILS, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          setUserProfileDetails(res.data.data[0]);
          setLoading(false);
          setError(false);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data && error.response.data.errors &&
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
  };

  return (
    <div>
      <Modal
        title="Personal Details"
        width={1000}
        onClose={onClose}
        onCancel={onClose}
        open={showModel}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editDetails"
              htmlType="submit"
              key="submit"
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Card>
          <Row gutter={24}>
            <Col span={8} style={{ background: "#fff" }}>
              <div className="text-align-center" style={{ textAlign: 'center' }}>
                <Avatar
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ed7206",
                  }}
                  size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                  icon={
                    userProfileDetails.profile_image
                      ? <Image
                        width={150}
                        preview={false}
                        src={
                          IMAGE_CANDIDATE_URL + userProfileDetails.profile_image
                        }
                      />
                      : <Title className="mb-0 text-white">
                        {userProfileDetails?.first_name
                          ? userProfileDetails?.first_name.charAt(0).toUpperCase()
                          : ''}
                      </Title>
                  }
                >
                </Avatar>
                <Title level={5} className="b-0 ml-1 mt-2">
                  {userProfileDetails?.first_name + (userProfileDetails.middle_name ? ` ${userProfileDetails.middle_name} ` : ' ') + userProfileDetails.last_name}
                </Title>
              </div>
              <div className="contact-wrapper">
                <Title level={5} strong className="b-0 ml-1 mt-0">
                  {"CONTACT"}
                </Title>
                <div className="contact-item">
                  <EmailIcon
                    style={{ color: "#000", marginRight: "3px" }}
                  />
                  <Text level={5} style={{ fontSize: 14, marginLeft: 10, marginBottom: 10 }}>
                    {userProfileDetails?.email}
                  </Text>
                </div>
                <div className="contact-item">
                  <CallIcon
                    style={{ color: "#000", marginRight: "3px" }}
                  />
                  <Text level={5} style={{ fontSize: 14, marginLeft: 10, marginBottom: 10 }}>
                    {userProfileDetails?.mobile}
                  </Text>
                </div>
                <div className="contact-item">
                  <RoomIcon
                    style={{ color: "#000", marginRight: "3px" }}
                  />
                  <Text level={5} style={{ fontSize: 14, marginLeft: 10, marginBottom: 10 }}>
                    {userProfileDetails?.current_location}
                  </Text>
                </div>
                <Title level={5} strong className="b-0 ml-1 mt-5">
                  {"CREATED DATE  "}
                </Title>
                <div className="contact-item">
                  <CalendarViewDayIcon
                    style={{ color: "#000", marginRight: "3px" }}
                  />
                  <Text level={5} style={{ fontSize: 14, marginLeft: 10, marginBottom: 10 }}>
                    {new Date(userProfileDetails?.created_at).toLocaleDateString()}
                  </Text>
                </div>
                <Title level={5} strong className="b-0 ml-1 mt-5">
                  {"VIEWED HISTORY"}
                </Title>
                <div className="contact-item">
                  {/* <CalendarViewDayIcon
                    style={{ color: "#000", marginRight: "3px" }}
                  /> */}
                  <Text level={5} style={{ fontSize: 14, marginLeft: 10 }}>
                    <div class="viewed-history-table">
                      <div class="cell cell-heading">Viewed By</div>
                      <div class="cell cell-heading">Count</div>
                      {viewHistory.map((element, index) => (
                        <>
                          <div className="cell">{element.name}</div>
                          <div className="cell text-center">{element.count}</div>
                        </>
                      )
                      )}
                    </div>
                  </Text>
                </div>
              </div>
            </Col>
            <div style={{ display: "inline-flex", flexDirection: 'column', width: 1, background: "rgba(0,0,0,.06)" }}></div>
            <Col span={15}>
              <Text level={5} style={{ fontSize: 14, width: "50%" }}>
                <DocViewer documents={[
                  {
                    uri: CANDIDATE_RESUME_URL + userProfileDetails.attachments
                  }
                ]} pluginRenderers={DocViewerRenderers} />;

              </Text>
            </Col>
          </Row>
        </Card>
      </Modal>
    </div>
  )
};

export default MonsterCandidateDetail;