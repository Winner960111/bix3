import React, { useEffect, useState } from "react";
import { Table, Card, Button } from "antd";
import axios from "axios";
import { EMAIL_SENT_LIST } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { EyeOutlined } from "@ant-design/icons";
import EmailDetailPopup from "./EmailDetailPopup";
import moment from "moment";
import { showError } from "../../pages/utils/helpers";

export default function Sent() {
  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      key: "date",
      render: (text, record) => {
        const dateText =
          record.headerData.date && record.headerData.date.length > 0
            ? moment(record.headerData.date[0]).format("yyyy-MM-DD, hh:mm A")
            : "N/A";
        return dateText;
      },
    },
    {
      title: "To",
      dataIndex: "To",
      key: "to",
      render: (text, record) => {
        const toText =
          record.headerData.to && record.headerData.to.length > 0
            ? record.headerData.to[0]
            : "N/A";
        return toText;
      },
    },
    {
      title: "Subject",
      dataIndex: "Subject",
      key: "subject",
      render: (text, record) => {
        const subjectText =
          record.headerData.subject && record.headerData.subject.length > 0
            ? record.headerData.subject[0]
            : "N/A";
        return subjectText;
      },
    },
    {
      title: "Message",
      dataIndex: "",
      key: "x",
      render: (text, record, index) => {
        return (
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setEmailDetail(record);
              setShowModel(true);
            }}
          />
        );
      },
    },
  ];
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState("1");
  const [loading, setLoading] = useState(true);
  const [sentData, setSentData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const users = useSelector(({ users }) => users);
  const [ShowModel, setShowModel] = useState(false);
  const [emailDetail, setEmailDetail] = useState();
  const [error, setError] = useState(false);
  const [msgError, setmsgError] = useState("");

  useEffect(() => {
    getSentEmail();
  }, [currentPage]);

  const getSentEmail = () => {
    const params = {
      user_id: users.user._id,
      start:
        currentPage === 1 ? currentPage : (currentPage - 1) * itemsPerPage + 1,
      limit: currentPage === 1 ? itemsPerPage : currentPage * itemsPerPage,
    };
    setLoading(true);
    axios
      .post(EMAIL_SENT_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setSentData(res.data.data.messageList);
        setTotalRecords(res.data.data.totalMessageCount);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response.data.statusCode === 422) {
          setmsgError(error.response.data.errors);
          setError(true);
          setLoading(false);
        }
      });
  };

  const TableMe = () => {
    const sentList =
      sentData &&
      sentData.map((item) => {
        item.key = item._id;
        return item;
      });
    return (
      <Table
        pagination={{
          total: totalRecords,
          showSizeChanger: false,
          onChange(current) {
            setCurrentPage(current);
          },
        }}
        dataSource={sentList}
        columns={columns}
        loading={loading}
      />
    );
  };

  return (
    <div>
      <Card title={"Sent"} bordered={false} className="px-0 py-0">
        {TableMe()}
        {ShowModel && (
          <EmailDetailPopup
            show={ShowModel}
            setShow={setShowModel}
            emailDetail={emailDetail}
            setEmailDetail={setEmailDetail}
          />
        )}
        {showError("", "", error, msgError)}
      </Card>
    </div>
  );
}
