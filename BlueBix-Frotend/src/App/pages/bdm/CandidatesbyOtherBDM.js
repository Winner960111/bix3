import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, Table } from "antd";
import axios from "axios";
import { SUBMISSION_BY_OTHER_BDM } from "../../../ApiUrl";
import { statusList } from "../constant/constant";

export default function CandidateList({
    opening_id, isDataUpdate
}) {
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record, index) => {
                return record && record.candidate_details
                    ? record.candidate_details.first_name.charAt(0).toUpperCase() + record.candidate_details.first_name.substr(1) + " " + record.candidate_details.last_name
                    : "";
            },
        },
        {
            title: "BDM Name",
            dataIndex: "bdmName",
            key: "bdmName",
            render: (text, record, index) => {
                return record && record.bdm_details
                    ? record.bdm_details.first_name.charAt(0).toUpperCase() + record.bdm_details.first_name.substr(1) + " " + record.bdm_details.last_name
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

    ];

    const [totalRecords, setTotalRecords] = useState("")
    const [candidate_list_details, setCandidateListDetails] = useState([])
    const [currentPage, setCurrentPage] = useState("1");
    const users = useSelector(({ users }) => users);
    let recObject = {
        opening_id: opening_id,
        candidate_select_by_bdm: 1,
        current_page: currentPage,
        per_page: 10,
        currentbdm: users.user._id
    };

    useEffect(() => {
        if (isDataUpdate) fetchCandidateList();
        return () => { };
    }, [opening_id, isDataUpdate, currentPage]);

    const fetchCandidateList = () => {
        if (opening_id)
            axios
                .post(SUBMISSION_BY_OTHER_BDM, recObject, {
                    headers: { Authorization: users.token },
                })
                .then((resp) => {
                    setCandidateListDetails(resp.data.data.paginatedResults);
                    setTotalRecords(resp.data.data.totalCount);
                })
                .catch((error) => {
                });
    }

    const SubmissionsTableMe = () => {
        // const rowSelection = {
        //     selectedRowKeysMe,
        //     // onChange: onSelectChangeMe,
        // };

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
                // rowSelection={rowSelection}
                dataSource={candidateList}
                columns={columns}
            />
        ) : null;
    };

    return (
        <div>
            <Card title={"Submissions by other BDM"} bordered={false} className="px-0 py-0">
                {SubmissionsTableMe()}
            </Card>
        </div>
    );

}