import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, Row, Col, List } from "antd";
import { Table } from "ant-table-extensions";
import { CANDIDATE_SUBMISSION_BY_COMPANY_LIST } from "../../../../ApiUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { statusList } from "../../../pages/constant/constant";

function CandidateReport(props) {
  const columns = [
    {
      title: "Display Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Current Location",
      dataIndex: "current_location",
      key: "current_location",
    },
    {
      title: "Job Category",
      dataIndex: "job_category",
      key: "job_category",
      render: (code) => {
        const category = getCategory(code);
        return category ? category.name : "";
      },
    },
    {
      title: "Submission status",
      dataIndex: "status",
      key: "status",
      render: (text, record, index) => {
        const submission_status = record.opening_details
          ? record.opening_details.submission_status
          : "";
        const submissionStatus = statusList.find((status) => {
          return status.value === submission_status;
        });
        return submissionStatus ? submissionStatus.label : text;
      },
    },
  ];

  const [candidateListRes, setcandidateListRes] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [chartStatus, setChartStatus] = useState("");
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;

  const newSeries = [];
  const newLabals = [];

  if (props && props.candidateJobCount) {
    if (props.candidateJobCount.Active) {
      newSeries.push(props.candidateJobCount.Active);
      newLabals.push("Active");
    }
    if (props.candidateJobCount.reject) {
      newSeries.push(props.candidateJobCount.reject);
      newLabals.push("Rejected");
    }
    if (props.candidateJobCount.I) {
      newSeries.push(props.candidateJobCount.I);
      newLabals.push("Interview");
    }
    if (props.candidateJobCount.oh) {
      newSeries.push(props.candidateJobCount.oh);
      newLabals.push("On Hold");
    }
    if (props.candidateJobCount.ri) {
      newSeries.push(props.candidateJobCount.ri);
      newLabals.push("Closed");
    }
    if (props.candidateJobCount.submit) {
      newSeries.push(props.candidateJobCount.submit);
      newLabals.push("submit");
    }
    if (props.candidateJobCount.submitted) {
      newSeries.push(props.candidateJobCount.submitted);
      newLabals.push("Submitted");
    }
    if (props.candidateJobCount.submission) {
      newSeries.push(props.candidateJobCount.submission);
      newLabals.push("submission");
    }
  }

  const users = useSelector(({ users }) => users);

  const getCategory = (value) => {
    return categoryList.find((item) => {
      return item.code === value;
    });
  };

  useEffect(() => {
    props.setCandidateTabSelected(true);
  }, []);

  useEffect(() => {
    getCandidateList();
    return () => {};
  }, [currentPage, chartStatus]);

  const getCandidateList = () => {
    const userId = users.user._id;
    const params = {
      dateRange: props.arrayDateRange,
      categories: [],
      status: props.statusLabal,
      opening_id: props.openingId,
      company_id: userId,
    };

    axios
      .post(CANDIDATE_SUBMISSION_BY_COMPANY_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setcandidateListRes(res.data.data);
      })
      .catch((error) => {});
  };

  const data = {
    series: newSeries,
    options: {
      chart: {
        type: "donut",
        events: {
          dataPointSelection: (event, chartContext, config) => {
            setChartStatus(config.w.config.labels[config.dataPointIndex]);
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      labels: newLabals,
    },
  };

  const DoughnutChart = () => (
    <>
      <Card title={"All Candidates"}>
        <Row gutter={24}>
          <Col span={12}>
            <div id="chart">
              <Chart
                options={data.options}
                series={data.series}
                type="donut"
                width="400"
              />
            </div>
          </Col>
          <Col span={12}>
            <List
              dataSource={newLabals}
              itemLayout={"horizontal"}
              bordered={false}
              renderItem={(item, index) => (
                <List.Item
                  style={{ "border-bottom": 0, padding: "5px 0" }}
                  key={index.toString()}
                >
                  <Col span={18} style={{ textAlign: "right" }}>
                    {item} :
                  </Col>
                  <Col span={6}>{newSeries[index]}</Col>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>
      <br />
    </>
  );

  const fields = {
    display_name: {
      header: "Display Name",
      formatter: (_fieldValue, record) => {
        return record?.name;
      },
    },
    current_location: {
      header: "Current Location",
      formatter: (_fieldValue, record) => {
        return record?.current_location;
      },
    },
    job_category: {
      header: "Job Category",
      formatter: (_fieldValue, record) => {
        const category = getCategory(record.job_category);
        return category ? category.name : "";
      },
    },
    status: {
      header: "Submission status",
      formatter: (_fieldValue, record) => {
        const submission_status = record.opening_details
          ? record.opening_details.submission_status
          : "";
        const submissionStatus = statusList.find((status) => {
          return status.value === submission_status;
        });
        return submissionStatus ? submissionStatus.label : record.status;
      },
    },
  };

  const candidatesData = () => (
    <>
      <Card title="Candidates Data" bordered={false} className="px-0 py-0">
        <Table
          pagination={{
            total: totalRecords,
            showSizeChanger: false,
            onChange(current) {
              setCurrentPage(current);
            },
          }}
          dataSource={candidate_list_details}
          columns={columns}
          exportableProps={{ fields, fileName: "Candidate Data" }}
        />
      </Card>
    </>
  );

  const candidate_list_details = candidateListRes
    ? candidateListRes.candidate_submission_listing
    : [];
  const totalRecords = candidateListRes ? candidateListRes.totalRecords : 0;

  return (
    <>
      {DoughnutChart()} {candidatesData()}
    </>
  );
}

export default CandidateReport;
