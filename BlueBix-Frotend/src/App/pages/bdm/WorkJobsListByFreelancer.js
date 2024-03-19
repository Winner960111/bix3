import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  FREELANCE_JOB_WORK_LIST,
  COMPANY_NAME_LIST,
  UPDATE_FREELANCE_JOB_WORK_STATUS,
} from "../../../ApiUrl";
import { Table, Card, Select } from "antd";
import { connect } from "react-redux";
import { statusList } from "../constant/constant";

const { Option } = Select;

const jobRequestStatusList = [
  { label: "Requested", value: "Request" },
  { label: "Approve", value: "Approve" },
  { label: "Reject", value: "Reject" },
];

class WorkJobsListByFreelancer extends React.Component {
  columns = [
    {
      title: "Freelancer Name",
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record, index) => {
        return record.freelancer ? record.freelancer.display_name : "";
      },
      // render: (text, record, index) => {
      //   const param = {
      //     _id: record.opening_id,
      //   };
      //   return (
      //     <NavLink
      //       to={{
      //         // pathname: "/bdm/opening-detail",
      //         state: { record: record },
      //       }}
      //     >
      //       {record
      //         ? // ? record.freelancer.first_name + " " + record.freelancer.last_name
      //           record.freelancer.display_name
      //         : ""}
      //     </NavLink>
      //   );
      // },
    },
    {
      title: "Opening Title",
      dataIndex: "opening_title",
      key: "opening_title",
      render: (text, record, index) => {
        const param = {
          _id: record.job_id,
        };
        return (
          <NavLink
            to={{
              pathname: "/bdm/opening-detail",
              state: { record: record.jobopening },
            }}
          >
            {record.jobopening ? record.jobopening.opening_title : ""}
          </NavLink>
        );
      },
    },
    {
      title: "Job Work Status",
      dataIndex: "job_work_status",
      key: "job_work_status",

      render: (Code, record, index) => {
        // return Code ? Code.charAt(0, 1).toUpperCase() + Code.slice(1) : '';
        return (
          <Select
            placeholder="Select Status Name"
            value={Code}
            onChange={(status) => {
              this.RequestStatusChange(record, status);
            }}
            style={{ width: "100%" }}
          >
            {jobRequestStatusList != undefined &&
              jobRequestStatusList.map((status, index) => (
                <Option key={index.toString()} value={status.value}>
                  {status.label}
                </Option>
              ))}
          </Select>
        );
      },
    },
    {
      title: "Request Note",
      dataIndex: "note",
      key: "note",
    },
    // {
    //   title: "Action",
    //   dataIndex: "",
    //   key: "x",
    //   render: (text, record, index) => (
    //     <NavLink
    //       to={{
    //         pathname: "/bdm/opening-detail",
    //         state: { record: record },
    //       }}
    //     >
    //       
    //       <Button type="primary" icon={<EyeOutlined />} />
    //     </NavLink>
    //   ),
    // },
  ];

  constructor(props) {
    super(props);
    this.state = {
      companyList: [],
      openings: "",
      addOpening: false,
      dateRange: [],
      dateRangeValue: [],
      categories: [],
      status: "",
      page: 1,
      selectedCompany: "",
    };
  }

  getAllCompanyList = () => {
    const params = {
      bdm_id: this.props.users.user._id,
    };
    axios
      .post(COMPANY_NAME_LIST, params, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({
          companyList: res.data.data,
        });
      })
      .catch((error) => {
      });
  };

  getOpeningList = () => {
    const status = statusList.filter((status) => {
      return this.state.status === status.value;
    });

    const arrayDateRange =
      this.state.dateRange.length > 0
        ? [this.state.dateRange[0], this.state.dateRange[1]]
        : [];

    const categories =
      this.state.categories.length > 0 ? this.state.categories : [];

    const userId = this.props.users.user._id;
    axios
      .post(
        FREELANCE_JOB_WORK_LIST,
        {
          current_page: this.state.page,
          per_page: "10",
          sort_order: "desc",
          filter_value: "",
          order: "created_at",
          //   dateRange: arrayDateRange,
          //   categories: categories,
          //   status: status.length > 0 ? status[0].label : "",
          freelanceId: "",
          bdmId: userId,
          openingId: "",
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((res) => {
        this.setState({ openings: res.data.data });
      })
      .catch((error) => {
      });
  };

  RequestStatusChange = (record, status) => {
    if (record != undefined) {
      this.setState({
        success: false,
        loading: true,
        error: false,
        successMessage: "",
        errorMessage: "",
      });
      axios
        .put(
          UPDATE_FREELANCE_JOB_WORK_STATUS + "/" + record._id,
          { job_work_status: status },
          {
            headers: { Authorization: this.props.users.token },
          }
        )
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: res.data.message,
              errorMessage: "",
            });
            setTimeout(() => {
              this.getOpeningList();
            }, 3000);
          }
        })
        .catch((error) => {
          let errorMessage = "";
          {
            Object.entries(error.response.data.errors).map(([key, value]) => {
              return (errorMessage += value + ", ");
            });
          }
          this.setState({
            error: true,
            success: false,
            loading: false,
            successMessage: "",
            errorMessage: errorMessage,
          });
          // this.setDefaultState();
        });
    }
  };

  componentDidMount() {
    this.getOpeningList();

    this.getAllCompanyList();
  }

  onChange = (value, dateString) => {
    const srtdate = dateString[0] === "" ? [] : dateString;
    this.setState({ dateRangeValue: value, dateRange: srtdate }, function() {
      this.getOpeningList();
    });
  };

  handleChange = (value) => {
    const data = value.map((item) => {
      return item;
    });
    this.setState({ categories: value }, function() {
      this.getOpeningList();
    });
  };

  handleStatusChange = (value) => {
    this.setState({ status: value }, function() {
      this.getOpeningList();
    });
  };

  handleCompanyChange = (value) => {
    this.setState({ selectedCompany: value }, function() {
      this.getOpeningList();
    });
  };

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onResetFilters = () => {
    this.setState(
      {
        dateRangeValue: [],
        dateRange: [],
        categories: [],
        status: "",
        selectedCompany: "",
      },
      function() {
        this.getOpeningList();
      }
    );
  };

  render() {
    const _this = this;

    const jobsOpnings = this.state.openings.job_work_application_listing;
    const totalRecords = this.state.openings.totalRecords;

    return (
      <div>
        {/* <Card title="Filters" bordered={false} className="px-0 py-0">
          <Row gutter={24}>
            <Col span={6}>
              <label for="by_source" className="" title="Date Range">
                Date Range :
              </label>
              <br />
              <RangePicker
                value={this.state.dateRangeValue}
                onChange={this.onChange}
              />
            </Col>
            <Col span={6}>
              <label for="by_source" className="" title="Category">
                Category :
              </label>
              <br />
              <Select
                mode="multiple"
                placeholder="Select Category Name"
                onChange={this.handleChange}
                value={this.state.categories}
                style={{ width: "100%" }}
              >
                {categoryList !== undefined &&
                  categoryList.map((category, index) => (
                    <Option key={index.toString()} value={category.code}>
                      {category.name}
                    </Option>
                  ))}
                ;
              </Select>
            </Col>
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                Status :
              </label>
              <br />
              <Select
                placeholder="Select Status Name"
                value={this.state.status}
                onChange={this.handleStatusChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {statusList != undefined &&
                  statusList.map((status, index) => (
                    <Option key={index.toString()} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col span={6}>
              <label for="by_source" className="" title="Company">
                Company :
              </label>
              <br />
              <Select
                placeholder="Select Company"
                value={this.state.selectedCompany}
                onChange={this.handleCompanyChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {this.state.companyList != undefined &&
                  this.state.companyList.map((status, index) => (
                    <Option key={index.toString()} value={status._id}>
                      {status.company_name}
                    </Option>
                  ))}
              </Select>
            </Col>
          </Row>
          <Row gutter={24} className="py-5 text-right">
            <Col span={24}>
              <Button
                onClick={this.onResetFilters}
                type="primary"
                size="small"
                danger
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          
        </Card> */}

        <div className="row">
          <div className="col-lg-12">
            <div className={`card card-custom card-stretch gutter-b`}>
              <div className="card-body py-3 px-3">
                <Card
                  title="work Job List"
                  bordered={false}
                  className="px-0 py-0"
                >
                  <Table
                    pagination={{
                      total: totalRecords,
                      showSizeChanger: false,
                      onChange(current) {
                        _this.setState(
                          {
                            page: current,
                          },
                          function() {
                            _this.getOpeningList();
                          }
                        );
                      },
                    }}
                    dataSource={jobsOpnings}
                    columns={this.columns}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Map Redux state to React component props
const mapStateToProps = (state) => {
  return {
    token: state.users.token,
    role: state.users.role,
    users: state.users,
  };
};

export default connect(mapStateToProps)(WorkJobsListByFreelancer);
