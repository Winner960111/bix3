import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { JOBS_LIST, JOB_DELETE, JOB_DETAIL } from "../../../ApiUrl";
import { Table, Card, Button, Popconfirm, Space, Input, Select } from "antd";
import { connect } from "react-redux";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { OpeningStatusList } from "../../pages/constant/constant";
import Filters from "../filter";
import { getFormatDate, showError } from "../../pages/utils/helpers";
const { Search } = Input;

class OpeningList extends React.Component {
  columns = [
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
      render: (Code, record, index) => {
        return (
          <Select
            placeholder="Select Status Name"
            value={Code}
            onChange={(status) => {
              this.openingStatusChange(record, status);
            }}
            style={{ width: "100%" }}
          >
            <Option value={""}>{"Select"}</Option>
            {OpeningStatusList !== undefined &&
              OpeningStatusList.map((status, index) => (
                <Option key={index.toString()} value={status.value}>
                  {status.label}
                </Option>
              ))}
          </Select>
        );
      },
    },
    {
      title: "Posted Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return date ? getFormatDate(date) : "";
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (text, record, index) => (
        <Space size="middle">
          <NavLink
            to={{
              pathname: `/${this.props.role}/opening-detail`,
              state: { record: record },
            }}
          >
            <Button type="primary" icon={<EyeOutlined />} />
          </NavLink>
          <NavLink
            to={{
              pathname: `/${this.props.role}/add-opening`,
              state: { record: record },
            }}
          >
            <Button
              // onClick={(e) => {
              //   this.onEdit(record._id, e);
              // }}
              type="primary"
              icon={<EditOutlined />}
            />
          </NavLink>
          <NavLink
            to={{
              state: { record: record },
            }}
          >
            <Popconfirm
              title="Are you sure you want to delete this opening ?"
              onConfirm={() => this.onDelete(record._id)}
              icon={<DeleteOutlined style={{ color: "red" }} />}
            >
              <Button type="danger" icon={<DeleteOutlined />} />
            </Popconfirm>
          </NavLink>
          {/* <a>Edit</a>
            <a>Delete</a> */}
        </Space>
      ),
    },
  ];
  callBackParam = {};
  constructor(props) {
    super(props);
    this.state = {
      categoryList: [],
      openings: "",
      addOpening: false,
      dateRange: [],
      dateRangeValue: [],
      categories: [],
      status: "",
      page: 1,
      search: "",
    };
  }

  componentDidMount() {
    this.getOpeningList();
  }

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },

      function() {
        this.callBack(this.callBackParam);
      }
    );
  };

  getOpeningList = (param) => {
    if (param) {
      axios
        .post(JOBS_LIST, param, {
          headers: { Authorization: this.props.token },
        })
        .then((res) => {
          this.setState({ openings: res.data.data });
        })
        .catch((error) => {});
    }
  };

  callBack = (value) => {
    this.callBackParam = value;
    const param = {
      current_page: this.state.page,
      per_page: "10",
      sort_order: "desc",
      search: this.state.search,
      order: "created_at",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
      company_id: "",
    };

    this.getOpeningList(param);
  };

  onDelete = (recordId) => {
    axios
      .delete(JOB_DELETE + "/" + recordId, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({
          success: true,
          loading: false,
          error: false,
          successMessage: "Opening Delete successfully",
          errorMessage: "",
        });
        this.setDefaultState();
        this.callBack(this.callBackParam);
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
        this.setDefaultState();
      });
  };

  updateOpeningStatus = (record, status) => {
    if (record !== undefined) {
      this.setState({
        success: false,
        loading: true,
        error: false,
        successMessage: "",
        errorMessage: "",
      });
      axios
        .put(
          JOB_DETAIL + "/status/" + record._id,
          { status: status },
          {
            headers: { Authorization: this.props.token },
          }
        )
        .then((res) => {
          if (!res.data.error) {
            // this.callActivity(record, status);
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: res.data.message,
              errorMessage: "",
            });
            this.setDefaultState();
            setTimeout(() => {
              this.callBack(this.callBackParam);
              // this.getOpeningList();
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
          this.setDefaultState();
        });
    }
  };

  setDefaultState = () => {
    setTimeout(() => {
      this.setState({
        error: false,
        success: false,
        loading: false,
        successMessage: "",
        errorMessage: "",
      });
    }, 3000);
  };

  openingStatusChange = (record, status) => {
    this.updateOpeningStatus(record, status);
  };

  render() {
    const jobsOpnings = this.state.openings.job_opening_listing;
    const _this = this;
    const totalRecords = this.state.openings.totalRecords;

    return (
      <div>
        <Filters
          callBack={this.callBack}
          showCategory={true}
          showCompany={false}
        />
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className={`card card-custom card-stretch gutter-b`}>
              <div className="card-body py-3 px-3">
                <Card
                  title="Job Openings List"
                  bordered={false}
                  className="px-0 py-0"
                  extra={
                    <NavLink to={`/${this.props.role}/add-opening`}>
                      <Button type="primary">Add New Opening</Button>
                    </NavLink>
                  }
                >
                  <Search
                    value={this.state.search}
                    placeholder="Search..."
                    onSearch={this.onSearch}
                    onChange={(e) =>
                      this.setState({
                        search: e.target.value,
                      })
                    }
                    style={{ width: 200 }}
                  />
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
                            // _this.getOpeningList();
                            _this.callBack(_this.callBackParam);
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
    common: state.common,
  };
};

export default connect(mapStateToProps)(OpeningList);
