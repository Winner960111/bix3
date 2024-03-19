import React, { useEffect, useState } from "react";
import { Table, Card, Button } from "antd";
import axios from "axios";
import { SUBMISSION_BY } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { statusList } from "../constant/constant";

export default function CandidateList({ onSubmit, object, isDataUpdate, opening_id }) {
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
        const item = { ...res, opening_details: opening_id };

        return (<NavLink
          to={{
            pathname: "/bdm/candidateProfileDetail",
            state: { item }
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

  let recObject = { ...object, current_page: currentPage, per_page: 10 };
  useEffect(() => {
    if (isDataUpdate) fetchCandidateList();
    return () => { };
  }, [object, isDataUpdate, currentPage]);

  const fetchCandidateList = () => {
    axios
      .post(SUBMISSION_BY, recObject, {
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
      <Card title={"Submissions by me"} bordered={false} className="px-0 py-0">
        {SubmissionsTableMe()}
      </Card>
    </div>
  );
}
