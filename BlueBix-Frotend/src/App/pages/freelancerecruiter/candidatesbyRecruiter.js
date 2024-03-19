import React, { useEffect, useState } from "react";
import { Table, Col, Row, Card, Button } from "antd";
import axios from "axios";
import { SUBMISSION_BY } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { EyeOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { statusList } from "../constant/constant";

export default function CandidateList({ onSubmit, onDelete, object, opening_details }) {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record, index) => {
        return record && record.candidate_id
          ? record.candidate_id.first_name + " " + record.candidate_id.last_name
          : "";
      },
    },
    {
      title: "Status",
      dataIndex: "submission_status",
      key: "submission_status",
      render: (Code) => {
        const item = statusList.find((status) => {
          return Code.toUpperCase() === status.value.toUpperCase();
        });
        return item ? item.label : Code;
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
              pathname: "/freelancerecruiter/candidateProfileDetail",
              state: { item },
            }}
          >            
            <Button type="primary" icon={<EyeOutlined />} />
          </NavLink>
        )
      }
    },
  ];
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState("");
  const [currentPage, setCurrentPage] = useState("1");
  const perPage = "10";
  const [candidate_list_details, setCandidateListDetails] = useState([]);
  const [selectedRowKeysMe, setSelectedRowKeysMe] = useState([]);
  const users = useSelector(({ users }) => users);

  useEffect(() => {
    if (object) {
      object.bdm_id = "";
      object.current_page = currentPage;
      object.per_page = perPage;
      fetchCandidateList();
    }

    return () => { };
  }, [object, currentPage]);

  const fetchCandidateList = () => {
    axios
      .post(SUBMISSION_BY, object, {
        headers: { Authorization: users.token },
      })
      .then((resp) => {
        setCandidateListDetails(resp.data.data.candidate_submission_listing);
        setTotalRecords(resp.data.data.totalRecords);
        setLoading(false);
      })
      .catch((error) => {
      });
  };

  const onSelectChangeMe = (selectedRowKeys) => {
    setSelectedRowKeysMe(selectedRowKeys);
  };

  const postSubmission = (status) => {
    if (selectedRowKeysMe.length > 0) {
      onSelectChangeMe([]);
      onSubmit(selectedRowKeysMe, status);
    }
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

    return totalRecords > 0 ? (
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
      <Card title={"Submissions by me"} bordered={false} className="px-0 py-0">
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
              Withdraw Candidate
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
