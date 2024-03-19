import React, { useEffect, useState } from "react";
import { Table, Col, Row, Card, Button } from "antd";
import axios from "axios";
import { CANDIDATE_SUBMISSION_REJECT } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { CandidateSubmissionStatus } from "../constant/constant";

export default function CandidateList({
  onSubmit,
  object,
  isDataUpdate,
  loading,
  opening_details
}) {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => {
        return record.candidate_id
          ? record.candidate_id.first_name + " " + record.candidate_id.last_name
          : "";
      },
    },
    {
      title: "Status",
      dataIndex: "submission_status",
      key: "submission_status",
      render: (Code) => {
        const item = CandidateSubmissionStatus.find((status) => {
          return Code.toUpperCase() === status.value.toUpperCase();
        });
        return item
          ? item.label
          : Code.charAt(0, 1).toUpperCase() + Code.slice(1);
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (text, record, index) => {

        const res = record.candidate_id;
        const item = { ...res, opening_details };
        return (
          <NavLink
            to={{
              pathname: "/bdm/candidateProfileDetail",
              state: { item },
            }}
          >            
            <Button type="primary" icon={<EyeOutlined />} />
          </NavLink>)
      },
    },
  ];

  const [totalRecords, setTotalRecords] = useState("");
  const [currentPage, setCurrentPage] = useState("1");
  const [candidate_list_details, setCandidateListDetails] = useState([]);
  const [selectedRowKeysMe, setSelectedRowKeysMe] = useState([]);

  const users = useSelector(({ users }) => users);
  let recObject = {
    ...object,
    current_page: currentPage,
    per_page: 10,
  };
  useEffect(() => {
    // if (object) {
    //     //opening_id: opening_id;
    //     object.current_page = currentPage;
    //     object.per_page = 10;
    // }
    if (isDataUpdate) fetchCandidateList();
    return () => { };
  }, [object, isDataUpdate, currentPage]);

  const fetchCandidateList = () => {
    axios
      .post(CANDIDATE_SUBMISSION_REJECT, recObject, {
        headers: { Authorization: users.token },
      })
      .then((resp) => {
        setCandidateListDetails(resp.data.data.reject_candidate_list);
        setTotalRecords(resp.data.data.totalRecords);
      })
      .catch((error) => {
      });
  };

  const postSubmission = (status) => {
    if (selectedRowKeysMe.length > 0) {
      onSelectChangeMe([]);
      onSubmit(selectedRowKeysMe, status);
    }
  };

  const onSelectChangeMe = (selectedRowKeys) => {
    setSelectedRowKeysMe(selectedRowKeys);
  };

  const SubmissionsTableMe = () => {
    const rowSelection = {
      selectedRowKeysMe,
      onChange: onSelectChangeMe,
    };

    const candidateList =
      candidate_list_details &&
      candidate_list_details.map((item, index) => {
        item.key = item._id;
        return item;
      });
    return candidate_list_details !== undefined ? (
      <Table
        pagination={{
          total: totalRecords,
          showSizeChanger: false,
          onChange(current) {
            setCurrentPage(current);
          },
        }}
        rowSelection={rowSelection}
        dataSource={candidateList}
        columns={columns}
      />
    ) : null;
  };

  return (
    <div>
      <Card title={"Rejected by me"} bordered={false} className="px-0 py-0">
        {SubmissionsTableMe()}
      </Card>
      <Card title="" className="px-0 py-0">
        <Row gutter={24}>
          <Col span={20}>
            <Button
              className="ml-10 d-flex align-items-center"
              type="Default"
              onClick={() => postSubmission("")}
            >
              Retrieve back
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
