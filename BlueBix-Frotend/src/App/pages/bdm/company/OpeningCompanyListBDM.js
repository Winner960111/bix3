/* eslint-disable no-lone-blocks */
import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { JOBS_LIST_BDM, JOB_DETAIL } from "../../../../ApiUrl";
import { Table, Card, Input, Select, Button, Popconfirm, Spin } from "antd";
import { connect } from "react-redux";
import {
  PostContactActivity,
  CONTACT_ACTIVITY_MODULE,
} from "../../company/ActivityLogApiCall";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { OpeningStatusList } from "../../constant/constant";
import Chip from "@material-ui/core/Chip";
import { getFormatDate, showError } from "../../utils/helpers";
import Filters from "../../../modules/filter";

const { Option } = Select;
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
        <>
          <NavLink
            to={{
              pathname: "/bdm/opening-detail",
              state: { record: record },
            }}
          >
            <Button type="text" icon={<EyeOutlined />} />
          </NavLink>
          <NavLink
            to={{
              pathname: "/bdm/add-opening",
              state: { record: record },
            }}
          >
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#1890ff" }} />}
            />
          </NavLink>
          <Popconfirm
            title="Are you sure you want to delete？"
            onConfirm={() => this.deleteItem(record)}
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "red" }} />}
            />
          </Popconfirm>
        </>
      ),
    },
    {
      title: "Number of submission",
      dataIndex: "candidate_submission_details",
      key: "candidate_submission_details",
      render: (candidate_submission_details, record, index) => (
        <>
          <NavLink
            to={{
              pathname: candidate_submission_details
                ? candidate_submission_details.length > 0
                  ? "/bdm/OpeningWiseCandidates/" +
                    record.opening_id +
                    "/" +
                    record.account_name[0]._id +
                    "/all" +
                    ""
                  : ""
                : "",
              aboutProps: {
                record: record,
                status: "",
              },
            }}
          >
            <Chip
              style={{ cursor: "pointer" }}
              label={
                candidate_submission_details
                  ? candidate_submission_details.length > 0
                    ? candidate_submission_details[0].total_candidate_submit
                      ? candidate_submission_details[0].total_candidate_submit
                      : candidate_submission_details.length
                    : "0"
                  : "0"
              }
            />
          </NavLink>
        </>
      ),
    },
  ];
  callBackParam = {};
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      categoryList: [],
      openings: "",
      search: "",
      addOpening: false,
      categories: [],
      status: "",
      page: 1,
    };
  }

  componentDidMount() {
    this.getOpeningList();
  }

  getOpeningList = (param) => {
    if (param) {
      axios
        .post(JOBS_LIST_BDM, param, {
          headers: { Authorization: this.props.token },
        })
        .then((res) => {
          this.setState({ openings: res.data.data });
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.props.history.push("/logout");
          }
        });
    }
  };

  callBack = (value) => {
    this.callBackParam = value;
    const userId = this.props.users.user._id;
    const param = {
      current_page: this.state.page,
      per_page: "10",
      order_direction: "desc",
      search: this.state.search,
      order: "created_at",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
      company_id: "",
      bdm_id: userId,
    };

    this.getOpeningList(param);
  };

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },
      () => {
        this.callBack(this.callBackParam);
      }
    );
  };

  deleteItem = (record) => {
    if (record !== undefined) {
      axios
        .delete(JOB_DETAIL + "/" + record._id, {
          headers: { Authorization: this.props.users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.callActivity(record, undefined);
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: res.data.message,
              errorMessage: "",
            });
            setTimeout(() => {
              this.setDefaultState();
              this.callBack(this.callBackParam);
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

  callActivity = (record, status) => {
    let title = "";
    if (status) {
      const statusObject = OpeningStatusList.find((item) => {
        return status === item.value;
      });
      const opening_status = statusObject
        ? statusObject.label
        : status.charAt(0, 1).toUpperCase() + status.slice(1);

      title =
        record.opening_title +
        " (#" +
        record.opening_id +
        ") status update to " +
        opening_status;
    } else {
      title = record.opening_title + " (#" + record.opening_id + ")  deleted";
    }

    const desc = title + " by ";

    if (this.props.users.user.contact_person_details) {
      const contact_person_details = this.props.users.user
        .contact_person_details;
      const contactLogObject = {
        company_id: this.props.users.user._id,
        contact_id: this.props.users.user.contact_person_details._id,
        module: CONTACT_ACTIVITY_MODULE.OPENING,
        title: "Opening Status",
        description:
          desc +
          contact_person_details.first_name +
          " " +
          contact_person_details.last_name,
      };
      PostContactActivity(contactLogObject, this.props.users.token);
    }
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
            headers: { Authorization: this.props.users.token },
          }
        )
        .then((res) => {
          if (!res.data.error) {
            this.callActivity(record, status);
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
    const _this = this;

    const jobsOpnings = this.state.openings.job_opening_listing;
    const totalRecords = this.state.openings.totalRecords;
    const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
    return (
      <div>
        <Spin indicator={antIcon} spinning={this.state.loading}>
          <Filters
            callBack={this.callBack}
            showCategory={false}
            showCompany={false}
            clearSearch={this.onSearch}
          />

          {showError(
            this.state.success,
            this.state.successMessage,
            this.state.error,
            this.state.errorMessage
          )}
          <div className="row">
            <div className="col-lg-12">
              <div className={`card card-custom card-stretch gutter-b`}>
                <div className="card-body py-3 px-3">
                  <Card
                    title="Job Openings List"
                    bordered={false}
                    extra={
                      <NavLink to="/bdm/add-opening">
                        <Button type="primary">Add New Opening</Button>
                      </NavLink>
                    }
                    className="px-0 py-0"
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
        </Spin>
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
