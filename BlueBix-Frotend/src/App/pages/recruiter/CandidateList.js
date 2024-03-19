import React, { useEffect, useState } from "react";
import { Table, Col, Row, Card, Button, Input } from "antd";
import axios from "axios";
import { CANDIDATE_SUBMISSION_LIST } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function CandidateList({ onSubmit, object, loading, opening_details }) {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Experience",
      dataIndex: "Experience",
      key: "total_work_exp_year",
      render: (text, record, index) => {
        return record ? record.total_work_exp_year + " Year(s) " : "";
      },
    },
    {
      title: "Skills",
      dataIndex: "key_skills",
      key: "key_skills",
      render: (text) => {
        return text && text.length > 0
          ? text.map((item) => {
            return item.charAt(0, 1).toUpperCase() + item.slice(1) + ", ";
          })
          : "";
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (text, record, index) => {
        const res = record;
        const item = { ...res, opening_details };
        return (<NavLink
          to={{
            pathname: "/recruiter/candidateProfileDetail",
            state: { item },
          }}
        >     
          <Button type="primary" icon={<EyeOutlined />} />
        </NavLink>)
      }
    },
  ];

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState("1");
  const [searchData, setSearchData] = useState("");
  const [candidate_list_details, setCandidateListDetails] = useState([]);
  const [selectedRowKeysMe, setSelectedRowKeysMe] = useState([]);
  const users = useSelector(({ users }) => users);

  useEffect(() => {
    if (object) {
      object.current_page = currentPage;
      object.per_page = 10;
      object.search = searchData;
    }
    setSelectedRowKeysMe([]);
    fetchCandidateList();
  }, [object, currentPage, searchData]);

  const fetchCandidateList = () => {
    axios
      .post(CANDIDATE_SUBMISSION_LIST, object, {
        headers: { Authorization: users.token },
      })
      .then((resp) => {
        setCandidateListDetails(resp.data.data.candidate_submission_listing);
        setTotalRecords(resp.data.data.totalRecords);
      })
      .catch((error) => {
      });
  };

  const onSelectChangeMe = (selectedRowKeys) => {
    setSelectedRowKeysMe(selectedRowKeys);
  };

  const postSubmission = () => {
    if (selectedRowKeysMe.length > 0) {
      onSelectChangeMe([]);
      onSubmit(selectedRowKeysMe);
    }
  };

  const onSearch = (value) => {
    setSearchData(value);
  };

  const SubmissionsTableMe = () => {
    const rowSelection = {
      selectedRowKeysMe,
      onChange: onSelectChangeMe,
    };

    const candidateList =
      candidate_list_details &&
      candidate_list_details.map((item) => {
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
        rowSelection={rowSelection}
        dataSource={candidateList}
        columns={columns}
      />
    );
  };

  return (
    <div>
      <Card title={"All Candidates"} bordered={false} className="px-0 py-0">
        <Search
          placeholder="Search..."
          onSearch={onSearch}
          value={searchData}
          onChange={(e) => setSearchData(e.target.value)}
          style={{ width: 200 }}
        />
        {SubmissionsTableMe()}
      </Card>
      <Card title="Submit Candidate" className="px-0 py-0">
        <Row gutter={24}>
          <Col span={20}>
            <Button type="primary" className="d-flex align-items-center" onClick={() => postSubmission()}>
              Submit
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
