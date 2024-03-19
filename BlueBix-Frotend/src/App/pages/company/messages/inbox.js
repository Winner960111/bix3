import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Empty,
  Row,
  Pagination,
  Typography,
} from "antd";
import { NavLink } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import axios from "axios";
import { useSelector } from "react-redux";
import { MESSAGE_LIST_BY_USER } from "../../../../ApiUrl";
import { showError } from "../../utils/helpers";
import moment from "moment";

const { Text } = Typography;

export default function Inbox(props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [messages, setMessages] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const users = useSelector(({ users }) => users);
  const onSelected = (position, item) => { };

  useEffect(() => {
    getMessages();
    return () => { };
  }, [currentPage]);

  const getMessages = () => {
    const param = {
      current_page: currentPage,
      per_page: "10",
      company_id: users.user._id,
      status: "",
      opening_id: "",
      bdm_id: "",
      comment: "",
      submission_id: "",
      freelancer_recruiter_id: "",
      candidate_id: "",
    };
    axios
      .post(MESSAGE_LIST_BY_USER, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          setLoading(false);
          setError(false);
          setMessages(res.data.data.message_listing);
          setTotalRecords(res.data.data.totalRecords);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        // setError(true);
        if (error.data) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(error.message);
        } else {
          // setmsgError(error.message);
        }
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

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const singleItem = (item, index) => {

    const {
      status,
      message,
      date_of_interview,
      time_of_interview,
      updated_at,
      candidates,
    } = item;
    const strong = index % 2 === 0 ? "strong" : "";
    const datetime = moment(updated_at).format("DD-MMM-YYYY, H:MM A");
    return (
      <div key={index}>
        {showError(success, msgSuccess, error, msgError)}
        <div className="container">
          <Row gutter={24}>
            <Col span={24} className={"p-3"}>
              <ListItem className="d-block">
                <NavLink
                  to={{
                    pathname: `/${users.role}/messages/MailDetail`,
                    state: { item: item },
                  }}
                >
                  <div
                    className={"cursor-pointer"}
                    onClick={() => onSelected(index, item)}
                  >
                    <Row gutter={24}>
                      <Col span={6}>
                        <Text strong={strong} type="secondary">
                          {status === "I" ? "Interview Schedule" : ""}
                        </Text>
                      </Col>
                      <Col span={14}>
                        <Text strong={strong} type="secondary">
                          {candidates
                            ? candidates.first_name +
                            " " +
                            candidates.last_name +
                            "'s "
                            : ""}
                          {item
                            ? message +
                            moment(date_of_interview).format("DD-MM-YYYY") +
                            " " +
                            (time_of_interview === "0:00 AM"
                              ? "12:00 AM"
                              : time_of_interview)
                            : "-"}
                        </Text>
                      </Col>
                      <Col span={4}>
                        <Text
                          strong={strong}
                          type="secondary"
                          className="text-right"
                        >
                          <Row>
                            {datetime ? datetime.split(',')[0] : ''}
                          </Row><Row>
                            {datetime ? datetime.split(',')[1] : ''}
                          </Row>
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </NavLink>
              </ListItem>
            </Col>
          </Row>
        </div>
        <Divider />
      </div>
    );
  };

  const EmptyView = () => {
    return (
      <Card>
        <Empty
          imageStyle={{
            height: 60,
          }}
          description={<span>No Mail Found</span>}
        ></Empty>
      </Card>
    );
  };

  return (
    <div>
      <div className="container">
        <Card
          title="Message List"
          className="mb-6 p-0"
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={24}>
            <Col span={24}>
              {/*<List  className={classes.root} aria-label="mailbox folders">*/}
              {messages.length > 0
                ? messages.map((item, i) => {
                  return singleItem(item, i);
                })
                : EmptyView()}
            </Col>
          </Row>
          {totalRecords > 0 ? (
            <div className="text-right mr-10 mt-10 pb-5">
              <Pagination
                showSizeChanger={false}
                current={currentPage}
                onChange={onPageChange}
                total={totalRecords}
              />
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
