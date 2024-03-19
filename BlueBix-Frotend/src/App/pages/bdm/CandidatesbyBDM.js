import React, { useEffect, useState } from "react";
import { Table, Row, Card, Button } from "antd";
import axios from "axios";
import { CANDIDATE_SUBMISSION_LIST, SUBMISSION_BY_RECRUITER } from "../../../ApiUrl";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { CandidateSubmissionStatus } from "../constant/constant";

export default function CandidateList({
    onSubmit,
    object,
    isDataUpdate,
    loading,
    opening_details,
    result
}) {
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record, index) => {
                return record
                    ? record.name
                    : "";
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
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

                const res = record;
                const item = { ...res, opening_details };
                return (<NavLink
                    to={{
                        pathname: "/bdm/candidateProfileDetail",
                        state: { item },
                    }}
                >
                    
                    < Button type="primary" icon={< EyeOutlined />} />
                </NavLink >)

            },
        },
    ];
    //const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState("1");
    const [candidate_list_details, setCandidateListDetails] = useState([]);

    const [selectedRowKeysMe, setSelectedRowKeysMe] = useState([]);

    const users = useSelector(({ users }) => users);

    let recObject = {
        ...object,
        current_page: currentPage,
        per_page: 10,
        opening_id: opening_details.opening_id
    }; //  Object.assign({}, object); //{...object}
    useEffect(() => {
        if (object) {
            // recObject = { ...object, current_page: currentPage, per_page: 10 };
            //opening_id: opening_id;
            //  recObject.current_page = currentPage;
            //  recObject.per_page = 10;
        }
        if (isDataUpdate) {
            onSelectChangeMe([]);
            fetchCandidateList();
        }

        return () => { };
    }, [object, isDataUpdate, currentPage]);

    const fetchCandidateList = () => {
        if (recObject) {
            if (users.role === 'bdm') recObject.created_by = users.user._id;

            axios
                .post(CANDIDATE_SUBMISSION_LIST, recObject, {
                    headers: { Authorization: users.token },
                })
                .then((resp) => {
                    setCandidateListDetails(resp.data.data.candidate_submission_listing);
                    setTotalRecords(resp.data.data.totalRecords);
                })
                .catch((error) => {
                });
        }
    };

    const onSelectChangeMe = (selectedRowKeys) => {
        setSelectedRowKeysMe(selectedRowKeys);
    };

    const postSubmission = () => {
        if (selectedRowKeysMe.length > 0) {
            onSelectChangeMe([]);

            let candidate_submission_by_recruiter = [];

            selectedRowKeysMe.map((item) => {
                const object = {
                    opening_id: opening_details.opening_id,
                    candidate_id: item,
                    recruiter_id: users.user._id,
                    company_id:
                        opening_details.account_name.length > 0
                            ? opening_details.account_name[0]._id
                            : undefined,
                    bdm_id: users.user._id,
                    submission_status: "submit",
                    candidate_select_by_bdm: 1
                };
                candidate_submission_by_recruiter.push(object);
            });

            let param = {
                candidate_submission_by_recruiter: candidate_submission_by_recruiter,
            };


            if (selectedRowKeysMe.length > 0 && opening_details.account_name.length) {
                const submissionResultBdm = axios
                    .post(SUBMISSION_BY_RECRUITER, param, {
                        headers: { Authorization: users.token },
                    });

                submissionResultBdm.then(() => {
                    fetchCandidateList();
                });

                result(submissionResultBdm);
            }
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
            <Card
                title={"Direct Submissions"}
                bordered={false}
                className="px-0 py-0"
            >
                {SubmissionsTableMe()}
            </Card>
            <Card className="px-0 py-0">
                <Row gutter={24}>

                    <Button
                        className="d-flex align-items-center mx-2 mb-2"
                        type="primary"
                        onClick={() => postSubmission()}>
                        Submit
                        {loading && <span className="mx-3 spinner spinner-white"> </span>}
                    </Button>

                </Row>
            </Card>
        </div>
    );
}
