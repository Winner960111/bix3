/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import { Card, Col, Empty, Row, Pagination, Typography } from "antd";
import { MESSAGE_LIST_MESSAGES, MESSAGE_UPDATE_FLAG } from "../../../ApiUrl";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import axios from "axios";
import { useSelector } from "react-redux";
import { showError } from "../../pages/utils/helpers";

const { Text } = Typography;

export default function Inbox(props) {
  const [loading,  setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [messages, setMessages] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const users = useSelector(({ users }) => users);

  useEffect(() => {
    getMessages();
    updateMessages();
    return () => {};
  }, [currentPage]);

  const getMessages = () => {
    const userID =
      users.role === "admin" ||
      users.role === "bdm" ||
      users.role === "recruiter" ||
      users.role === "freelancerecruiter"
        ? users.user._id
        : "";
    const param = {
      current_page: currentPage,
      per_page: "10",
      order_direction: "",
      search: "",
      order: "",
      company_id: users.role === "company" ? users.user._id : "",
      opening_id: "",
      candidate_id: users.role === "candidate" ? users.user._id : "",
      user_id: userID,
      contact_id: "",
      role: users.role,
    };
    axios
      .post(MESSAGE_LIST_MESSAGES, param, {
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

  const updateMessages = () => {
    const userID =
      users.role === "admin" ||
      users.role === "bdm" ||
      users.role === "recruiter" ||
      users.role === "freelancerecruiter"
        ? users.user._id
        : "";
    const param = {
      company_id: users.role === "company" ? users.user._id : "",
      candidate_id: users.role === "candidate" ? users.user._id : "",
      user_id: userID,
      contact_id: "",
    };
    axios
      .post(MESSAGE_UPDATE_FLAG, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          //  res.data.data;
          //    setMessages(res.data.data.message_listing);
        }
      })
      .catch((error) => {});
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
    const { message, updated_at, candidates, title } = item;
    const strong = index % 2 === 0 ? "strong" : "";
    // moment.locale('de')
    // const datetime = moment(new Date(updated_at)).format("DD-MMM-YYYY, H:MM:ss, A");
    // const datetime = moment.utc((new Date(updated_at))).format("DD-MMM-YYYY, H:MM:ss, A");
    // const datetime = moment.utc((new Date(updated_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))).format("DD-MMM-YYYY, H:MM:ss, A");
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    let datetime = updated_at
      ? new Date(updated_at).toLocaleString("en-IN", options)
      : "";

    // new Date
    return (
      <div key={index}>
        {showError(success, msgSuccess, error, msgError)}
        <div className="container">
          <Row gutter={24}>
            <Col span={24} className={"p-3"}>
              <ListItem className="d-block">
                <div
                  className={"cursor-pointer"}
                  onClick={() => onSelected(index, item)}
                >
                  <Row gutter={24}>
                    <Col span={6}>
                      <Text strong={strong} type="secondary">
                        {item ? title : ""}
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
                        {item ? message : "-"}
                      </Text>
                    </Col>
                    <Col span={4}>
                      <Text
                        strong={strong}
                        type="secondary"
                        className="text-left"
                      >
                        <Row>{datetime ? datetime.split(",")[0] : "-"}</Row>
                        <Row>{datetime ? datetime.split(",")[1] : ""}</Row>
                      </Text>
                    </Col>
                  </Row>
                </div>
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
          description={<span>No Messages Found</span>}
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
