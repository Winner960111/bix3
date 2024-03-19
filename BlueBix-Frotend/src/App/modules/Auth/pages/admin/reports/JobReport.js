import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, Row, Col, List } from "antd";
import { Table } from "ant-table-extensions";
import { JOB_REPORT_DOWNLOAD_LIST } from "../../../../../../ApiUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { OpeningStatusList } from "../../../../../pages/constant/constant";

function JobReport(props) {
  const columns = [
    {
      title: "Opening Title",
      dataIndex: "opening_title",
      key: "opening_title",
    },
    {
      title: "Opening id",
      dataIndex: "opening_id",
      key: "opening_id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (Code) => {
        return OpeningStatusList.map((status, index) => {
          return status.value === Code ? status.label : "";
        });
      },
    },
  ];

  const [openings, setOpenings] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartStatus, setChartStatus] = useState("");

  const newSeries = [];
  const newLabals = [];

  if (props && props.JobCountStatus) {
    if (props.JobCountStatus.Active) {
      newSeries.push(props.JobCountStatus.Active);
      newLabals.push("Active");
    }
    if (props.JobCountStatus.oh) {
      newSeries.push(props.JobCountStatus.oh);
      newLabals.push("On Hold");
    }
    if (props.JobCountStatus.I) {
      newSeries.push(props.JobCountStatus.I);
      newLabals.push("Interview");
    }
    if (props.JobCountStatus.rs) {
      newSeries.push(props.JobCountStatus.rs);
      newLabals.push("Resume Screening");
    }
    if (props.JobCountStatus.offer) {
      newSeries.push(props.JobCountStatus.offer);
      newLabals.push("Offer");
    }
    if (props.JobCountStatus.ri) {
      newSeries.push(props.JobCountStatus.ri);
      newLabals.push("Closed");
    }
  }

  useEffect(() => {
    getOpeningList();
    return () => {};
  }, [currentPage, chartStatus]);

  const users = useSelector(({ users }) => users);

  const getOpeningList = () => {
    const jobStatus = OpeningStatusList.find((status) => {
      return status.label === chartStatus;
    });
    const param = {
      current_page: currentPage,
      per_page: "10",
      sort_order: "desc",
      filter_value: "",
      order: "created_at",
      dateRange: props.arrayDateRange,
      categories: [],
      status:
        props.statusLabal === ""
          ? jobStatus
            ? jobStatus.value
            : ""
          : props.statusLabal,
      company_id: "",
      bdm_id: props.bdm_id,
      recruiter_id: props.recruiter_id,
    };

    axios
      .post(JOB_REPORT_DOWNLOAD_LIST, param, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpenings(res.data.data);
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
            const submissionStatus = OpeningStatusList.find((status) => {
              return (
                status.label === config.w.config.labels[config.dataPointIndex]
              );
            });
            setChartStatus(
              submissionStatus !== undefined
                ? submissionStatus.label
                : config.w.config.labels[config.dataPointIndex]
            );
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
      <Card title={"All Jobs"}>
        <Row gutter={24}>
          <Col span={12}>
            <div id="chart">
              <Chart
                options={data.options}
                series={data.series}
                type="donut"
                width="380"
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
    opening_id: {
      header: "Opening id",
      formatter: (_fieldValue, record) => {
        return record?.opening_id;
      },
    },
    opening_title: {
      header: "Opening Title",
      formatter: (_fieldValue, record) => {
        return record?.opening_title;
      },
    },
    status: {
      header: "Status",
      formatter: (_fieldValue, record) => {
        const status = OpeningStatusList.find((status) => {
          return status.value === record.status;
        });
        return status ? status.label : record.status;
      },
    },
  };

  const openingData = () => (
    <>
      <Card title="JOB Data" bordered={false} className="px-0 py-0">
        <Table
          pagination={{
            total: totalRecords,
            showSizeChanger: false,
            onChange(current) {
              setCurrentPage(current);
            },
          }}
          dataSource={jobsOpnings}
          columns={columns}
          exportableProps={{ fields, fileName: "JOB Data" }}
        />
      </Card>
    </>
  );

  const jobsOpnings = openings.job_opening_listing;
  const totalRecords = openings.totalRecords;

  return (
    <>
      {DoughnutChart()} {openingData()}
    </>
  );
}

export default JobReport;
