import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { ASSIGNED_BDM_LIST, JOB_DETAIL } from "../../../ApiUrl";
import { Table, Card, Button, Select } from "antd";
import { connect } from "react-redux";
import Chip from "@material-ui/core/Chip";
import { EyeOutlined } from "@ant-design/icons";
import { OpeningStatusList } from "../constant/constant";
import Filters from "../../modules/filter";
import { getFormatDate, showError } from "../utils/helpers";

class AssignJobs extends React.Component {
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
        return getFormatDate(date);
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",

      render: (text, record, index) => (
        <NavLink
          to={{
            pathname: "/bdm/opening-detail",
            state: { record: record },
          }}
        >
          
          <Button type="primary" icon={<EyeOutlined />} />
        </NavLink>
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
              pathname:
                candidate_submission_details.length > 0
                  ? "/bdm/OpeningWiseCandidates/" +
                  record.opening_id +
                  "/" +
                  (record.account_name.length > 0
                    ? record.account_name[0]._id
                    : 0) +
                  "/all" +
                  ""
                  : "",
              aboutProps: { record: record },
            }}
          >
            <Chip
              style={{ cursor: "pointer" }}
              label={
                candidate_submission_details.length > 0
                  ? candidate_submission_details[0].total_candidate_submit
                    ? candidate_submission_details[0].total_candidate_submit
                    : candidate_submission_details.length
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
      openings: "",
      page: 1,
    };
  }

  // getOpeningList = (param) => {
  //   if (param) {
  //     axios
  //       .post(JOBS_LIST, param, {
  //         headers: { Authorization: this.props.token },
  //       })
  //       .then((res) => {
  //         // this.setState({ openings: res.data.data });
  //       })
  //       .catch((error) => {
  //       });
  //   }
  // };

  getAssignedJobs = (params) => {
    let param = params ? params : {};
    if (!params) {
      param.bdm_id = this.props.users.user._id;
      param.current_page = this.state.page;
      param.per_page = this.state.per_page;
      param.order = "created_at";
    }
    axios
      .post(ASSIGNED_BDM_LIST, param, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {

        if (res.data.data.job_opening_listing[0])
          this.setState({ openings: res.data.data });

        else
          this.setState({ openings: {} });


      })
      .catch((error) => {
      });

  };


  componentDidMount() {
    // this.getOpeningList();
    this.getAssignedJobs();
  }

  callBack = (value) => {
    this.callBackParam = value;
    const userId = this.props.users.user._id;
    const param = {
      current_page: this.state.page,
      per_page: "10",
      sort_order: "desc",
      filter_value: "",
      order: "created_at",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
      company_id: value.selectedCompany,
      bdm_id: userId,
      recruiter_id: "",
    };

    this.getAssignedJobs(param);
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
      function () {
        this.getOpeningList();
      }
    );
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
    const _this = this;

    const jobsOpnings = this.state.openings.job_opening_listing;
    const totalRecords = this.state.openings.totalRecords;

    return (
      <div>
        <Filters
          callBack={this.callBack}
          showCategory={true}
          showCompany={true}
        />
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
        <div className="row">
          <div className="col-lg-12 py-3">
            <div className={`card card-custom card-stretch gutter-b`}>
              <div className="card-body py-3 px-3">
                <Card
                  title="Assigned Job List"
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
                          function () {
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

export default connect(mapStateToProps)(AssignJobs);
