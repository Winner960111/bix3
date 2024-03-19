import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, Row, Col, List } from "antd";
import { JOB_REPORT_DOWNLOAD_LIST } from "../../../../ApiUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { OpeningStatusList } from "../../../pages/constant/constant";
import { Table } from "ant-table-extensions";

function BDMJobReport(props) {
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
        const status = OpeningStatusList.find((status) => {
          return status.value === Code;
        });
        return status ? status.label : Code;
      },
    },
  ];

  const [openings, setOpenings] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const newSeries = [];
  const newLabals = [];

  useEffect(() => {
    getOpeningList();
    return () => {};
  }, [currentPage]);

  if (props && props.bdmJobCount) {
    if (props.bdmJobCount.Active) {
      newSeries.push(props.bdmJobCount.Active);
      newLabals.push("Active");
    }
    if (props.bdmJobCount.oh) {
      newSeries.push(props.bdmJobCount.oh);
      newLabals.push("On Hold");
    }
    if (props.bdmJobCount.I) {
      newSeries.push(props.bdmJobCount.I);
      newLabals.push("Interview");
    }
    if (props.bdmJobCount.rs) {
      newSeries.push(props.bdmJobCount.rs);
      newLabals.push("Resume Screening");
    }
    if (props.bdmJobCount.offer) {
      newSeries.push(props.bdmJobCount.offer);
      newLabals.push("Offer");
    }
    if (props.bdmJobCount.ri) {
      newSeries.push(props.bdmJobCount.ri);
      newLabals.push("Closed");
    }
  }

  const users = useSelector(({ users }) => users);

  const getOpeningList = () => {
    const userId = users.user._id;

    const params = {
      current_page: currentPage,
      per_page: "10",
      sort_order: "desc",
      filter_value: "",
      order: "created_at",
      dateRange: props.arrayDateRange,
      categories: [],
      status: props.statusLabal,
      company_id: "",
      bdm_id: userId,
      recruiter_id: props.selectedRecruter,
    };

    axios
      .post(JOB_REPORT_DOWNLOAD_LIST, params, {
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
      <Card title={"Assign Jobs"}>
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
          // exportable
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

export default BDMJobReport;
