import React, { useEffect, useState } from "react";
import { Form, Col, Row, Card, Select, Button } from "antd";
import axios from "axios";
import {
  JOB_DETAIL,
  ASSIGN_JOB,
  JOB_BDM_LIST,
  JOB_ASSIGNMENT_DETAILS,
} from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import ActivityLogUI from "../ActivityLog";
import { showError } from "../../pages/utils/helpers";
import OpeningDetailUi from "./OpeningDetailUI";

const { Option } = Select;
const FormItem = Form.Item;

export default function OpeningsDetail(props) {
  const [openingDetails, setOpeningDetails] = useState("");
  const [allBDM, setAllBDM] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [selectedBDM, setSelectedBDM] = useState([]);
  const users = useSelector(({ users }) => users);
  let location = useLocation();

  useEffect(() => {
    getAllBDMList();
    getOpeningDetail();
    return () => {};
  }, []);

  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.record._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningDetails(res.data.data[0]);
        getJobAssignmentDetails(res.data.data[0].opening_id);
        setSelectedBDM(res.data.data[0].assigned_bdm.map((e) => e._id));
      })
      .catch((error) => {});
  };

  const getJobAssignmentDetails = (id) => {
    axios
      .post(
        JOB_ASSIGNMENT_DETAILS,
        {
          created_by: users.user._id,
          opening_id: id,
        },
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        setSelectedBDM(res.data.data[0].assigned_bdm);
      })
      .catch((error) => {});
  };

  const getAllBDMList = () => {
    axios
      .get(JOB_BDM_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setAllBDM(res.data.data);
      })
      .catch((error) => {});
  };

  const handleAssignChange = (value) => {
    setSelectedBDM(value);
  };

  const postAssignJob = () => {
    const param = {
      opening_id: openingDetails.opening_id,
      bdm_id: selectedBDM,
      recruiter_id: [],
      company_id: openingDetails.account_name[0]._id,
      freelance_id: "",
      created_by: users.user._id,
    };
    setLoading(true);
    axios
      .put(ASSIGN_JOB, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        setSuccess(true);
        setSelectedBDM([]);
        setMsgSuccess(res.data.message);
        getOpeningDetail();
        setDefaultState();
      })
      .catch((error) => {
        setLoading(false);
        setError(true);
        let errorMessage = "";
        {
          error.response.data.keys.length > 0 &&
            Object.entries(error.response.data.errors).map(([key, value]) => {
              return (errorMessage += value + ", ");
            });
        }
        setmsgError(errorMessage);
        setDefaultState();
      });
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

  return (
    <div>
      <Row gutter={24}>
        <Col span={14}>
          <OpeningDetailUi
            openingDetails={openingDetails}
            goBack={props.history.goBack}
          />
          <br />
          <ActivityLogUI param={openingDetails} isActivityLogs={false} />
        </Col>
        <Col span={10}>
          <ActivityLogUI param={openingDetails} isActivityLogs={true} />
          <br />
          <Card title="Assign Job" className="px-0 py-0">
            <Row gutter={24}>
              <Col span={20}>
                {/*{openingDetails && openingDetails.assigned_bdm.length <= 0 ? (*/}
                <FormItem label="Assigned Job to BDM">
                  <Select
                    mode="multiple"
                    value={selectedBDM}
                    onChange={handleAssignChange}
                    placeholder="Select"
                  >
                    {allBDM !== undefined &&
                      allBDM.map((user, index) => {
                        return (
                          <Option value={user._id} key={index.toString()}>
                            {user.display_name.charAt(0).toUpperCase() +
                              user.display_name.slice(1)}
                          </Option>
                        );
                      })}
                  </Select>
                  <Button
                    className="mt-5 d-flex align-items-center"
                    type="primary"
                    onClick={postAssignJob}
                  >
                    Save
                    {loading && (
                      <span className="mx-3 spinner spinner-white"> </span>
                    )}
                  </Button>
                </FormItem>
                {/*) : (*/}
                <>
                  {/* <Text type="secondary">{"Job Assigned to "}</Text>
                  <Text type="primary">
                    {openingDetails && openingDetails.assigned_bdm.length > 0
                      ? openingDetails.assigned_bdm.map(e => {
                        return e.display_name + ', '
                      })
                      : ""}
                  </Text> */}
                </>
                {/*)}*/}
                {showError(success, msgSuccess, error, msgError)}
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
