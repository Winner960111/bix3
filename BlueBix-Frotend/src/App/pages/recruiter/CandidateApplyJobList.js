/* eslint-disable no-lone-blocks */
import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  COMPANY_NAME_LIST_RECRUITER,
  CANDIDATE_CANDIDATE_LIST,
  RECRUITER_APPLY_SUBMISSION,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import { Button, Card, Col, Empty, Row, Typography, Pagination } from "antd";
import { connect } from "react-redux";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RoomIcon from "@material-ui/icons/Room";
import { statusList } from "../constant/constant";
import { EyeOutlined } from "@ant-design/icons";
import $ from "jquery";
import { getFormatDate, showError } from "../utils/helpers";

const { Text, Title } = Typography;

class CandidateApplyJobs extends React.Component {
  columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (Code) => {
        const item = statusList.find((status) => {
          return Code.toUpperCase() === status.value.toUpperCase();
        });
        return item ? item.label : Code;
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
            pathname: "/recruiter/opening-detail",
            state: { record: record },
          }}
        >
          
          <Button type="primary" icon={<EyeOutlined />} />
        </NavLink>
      ),
    },
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
      per_page: 10,
      selectedCompany: "",
    };
  }

  componentDidMount() {
    this.getOpeningList();
    this.getAllCompanyList();
  }

  onPageChange = (page) => {
    this.setState(
      {
        page: page,
      },
      function () {
        this.getOpeningList();
      }
    );
  };

  getAllCompanyList = () => {
    const params = {
      recruiter_id: this.props.users.user._id,
    };
    axios
      .post(COMPANY_NAME_LIST_RECRUITER, params, {
        headers: { Authorization: this.props.users.token },
      })
      .then((res) => {
        this.setState({
          companyList: res.data.data,
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };

  getOpeningList = () => {
    const categories =
      this.state.categories.length > 0 ? this.state.categories : [];
    const userId = this.props.users.user._id;

    axios
      .post(
        CANDIDATE_CANDIDATE_LIST,
        {
          current_page: this.state.page,
          per_page: this.state.per_page,
          order_direction: "desc",
          search: "",
          order: "created_at",
          jobcategory: categories,
          location: "",
          recruiter_id: userId,
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((res) => {
        this.setState({ openings: res.data.data });

      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };

  getJobAssignmentDetails = (id) => {
    axios
      .post(
        JOB_ASSIGNMENT_DETAILS,
        {
          recruiter_id: this.props.users.user._id,
          opening_id: id
        },
        {
          headers: { Authorization: users.token },
        }
      )
      .then((res) => {

      })
      .catch((error) => {
      });
  };

  onChange = (value, dateString) => {
    const srtdate = dateString[0] === "" ? [] : dateString;
    this.setState({ dateRangeValue: value, dateRange: srtdate }, function () {
      this.getOpeningList();
    });
  };

  handleCompanyChange = (value) => {
    this.setState({ selectedCompany: value }, function () {
      this.getOpeningList();
    });
  };

  handleStatusChange = (value) => {
    this.setState({ status: value }, function () {
      this.getOpeningList();
    });
  };
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onResetFilters = () => {
    setTimeout(() => {
      this.setState(
        {
          dateRangeValue: [],
          dateRange: [],
          categories: [],
          status: "",
          selectedCompany: "",
          loading: false,
          success: false,
          msgSuccess: "",
          msgError: "",
          error: false,
        },
        function () {
          this.getOpeningList();
        }
      );
    }, 3000);
  };

  onSubmitCandidate = async (item) => {
    const opening_id = item.jobopenings ? item.jobopenings[0].opening_id : "";

    const res = await axios.post(JOB_ASSIGNMENT_DETAILS,
      {
        recruiter_id: this.props.users.user._id,
        opening_id: opening_id
      },
      {
        headers: { Authorization: this.props.token },
      }
    )

    const bdm_id = res.data.data[0].created_by;

    const candidate_submissionsList =
      item.candidate_submissions && item.candidate_submissions.length > 0
        ? item.candidate_submissions.filter((itemSubmission) => {

          return (
            itemSubmission.candidate_id === item.candidate_id &&
            itemSubmission.opening_id === opening_id
          );
        })
        : [];


    // return false;
    if (candidate_submissionsList.length <= 0) {
      const object = {
        opening_id: item.jobopenings[0].opening_id,
        candidate_id: item.candidate_id,
        recruiter_id: this.props.users.user._id,
        bdm_id,
        company_id: item.jobopenings[0].account_name,
        submission_status: "submission",
      };

      let param = object;
      this.setState({
        loading: true,
        success: false,
        msgSuccess: "",
        msgError: "",
        error: false,
      });
      axios
        .post(RECRUITER_APPLY_SUBMISSION, param, {
          headers: { Authorization: this.props.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              loading: false,
              success: true,
              msgSuccess: res.data.message,
              msgError: "",
              error: false,
            });
            this.onResetFilters();
          }
        })
        .catch((error) => {
          if (error.response) {
            let errorMessage = "";
            {
              error.response.data &&
                Object.entries(error.response.data.errors).map(
                  ([key, value]) => {
                    return (errorMessage += value + ", ");
                  }
                );
            }
            this.setState({
              loading: false,
              success: false,
              msgSuccess: "",
              msgError: errorMessage,
              error: true,
            });
            this.onResetFilters();
          }
        });
    } else {
      this.setState({
        loading: false,
        success: false,
        msgSuccess: "",
        msgError: "Candidate already Submited",
        error: true,
      });
      this.onResetFilters();
    }
  };

  EmptyView = () => {
    return (
      <Card>
        
        <Empty
          imageStyle={{
            height: 60,
          }}
          description={<span>No Job Found</span>}
        ></Empty>
      </Card>
    );
  };

  onSelectedJob = (position, item) => {
    this.props.history.push({
      pathname: "/recruiter/opening-detail",
      state: { record: item.jobopenings[0] },
    });
  };
  onSelectedCandidate = (position, item) => {
    this.props.history.push({
      pathname: "/recruiter/candidateProfileDetail",
      state: { item: item },
    });
  };

  ItemCandidateJob = () => {
    const candidate_listing = this.state.openings.candidate_listing;

    return (
      candidate_listing &&
      candidate_listing.map((item, index) => {
        item.key = item._id;

        const desc = $(
          item.jobopenings ? item.jobopenings[0].job_description : ""
        ).text();

        const opening_id = item.jobopenings ? item.jobopenings[0].opening_id : "";
        const candidate_submissionsList = item.candidate_submissions && item.candidate_submissions.length > 0
          ? item.candidate_submissions.filter((itemSubmission) => {
            return (
              itemSubmission.candidate_id === item.candidate_id &&
              itemSubmission.opening_id === opening_id
            );
          })
          : [];

        return (
          <div className="site-card-border-less-wrapper" key={index.toString()}>
            <Card
              bordered={true}
              className="px-0 py-0 mb-10"
              bodyStyle={{ padding: 0 }}
            >
              <Row gutter={24} className="p-13">
                <Col span={12}>
                  <div
                    className={"cursor-pointer"}
                    onClick={() => this.onSelectedCandidate(index, item)}
                  >
                    <Title level={3}>
                      {item
                        ? item.candidate_details[0].first_name.toUpperCase() +
                        " " +
                        item.candidate_details[0].last_name.toUpperCase()
                        : ""}
                    </Title>
                  </div>
                </Col>
                <Col span={24}>
                  <BusinessCenterIcon
                    style={{ fill: "#2381cd", marginRight: "5px" }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    {item
                      ? item.candidate_details[0].total_work_exp_year +
                      "." +
                      item.candidate_details[0].total_work_exp_month +
                      " Yrs"
                      : ""}
                  </Text>
                  <AccountBalanceWalletIcon
                    style={{
                      fill: "#2381cd",
                      marginRight: "3px",
                      marginLeft: "5px",
                    }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    $
                    {item.jobopenings
                      ? item.jobopenings[0].salary_range_from + " - " + item.jobopenings[0].salary_range_from// " Lacs "
                      : ""}
                  </Text>
                  {item && item.desired_location ? (
                    <RoomIcon
                      style={{
                        fill: "#2381cd",
                        marginRight: "3px",
                        marginLeft: "0px",
                      }}
                    />
                  ) : null}
                  <Text level={5} className="m b-0 ml-1">
                    {item && item.desired_location ? item.desired_location : ""}
                  </Text>
                </Col>
                {item.candidate_details[0].key_skills.length > 0 ? <Col span={24} className={"mt-3 mb-2"}>
                  <Text strong level={5}>
                    Skills
                  </Text>
                  {" : "}
                  {item.candidate_details[0].key_skills.map((item, index) => {
                    return (
                      <Text
                        key={index.toString()}
                        level={5}
                        className="mb-0 pl-2"
                      >
                        {item + ","}
                      </Text>
                    );
                  })
                  }
                </Col> : ''}
                {/* <Col span={24} className="mt-2">
                <Text strong level={5}>
                    Skills 
                  </Text>
                  <Text level={5}>
                    {item.key_skills.map((item, index) => {
                      return (
                        <Text key={index.toString()} level={5}>
                          {item + ", "}
                        </Text>
                      );
                    })}
                  </Text>
                </Col> */}
                <Col span={24}>
                  <div
                    style={{ marginTop: "20px" }}
                    className={"cursor-pointer"}
                    onClick={() => this.onSelectedJob(index, item)}
                  >
                    <Title level={3}>
                      {item.jobopenings
                        ? item.jobopenings[0].opening_title ? item.jobopenings[0].opening_title.toUpperCase() +
                          " - #" +
                          item.jobopenings[0].opening_id
                          : "" : ""}
                    </Title>
                  </div>
                </Col>
                <Col span={24}>
                  <BusinessCenterIcon
                    style={{ fill: "#2381cd", marginRight: "5px" }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    {item.jobopenings
                      ? item.jobopenings[0].required_experience + " Yrs"
                      : ""}
                  </Text>
                  <AccountBalanceWalletIcon
                    style={{
                      fill: "#2381cd",
                      marginRight: "3px",
                      marginLeft: "5px",
                    }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    $
                    {item.jobopenings
                      ? item.jobopenings[0].salary_range_from + " - " + item.jobopenings[0].salary_range_to //" Lacs "
                      : ""}
                  </Text>
                  {item.jobopenings &&
                    item.jobopenings.city &&
                    item.jobopenings.city.length ? (
                    <RoomIcon
                      style={{
                        fill: "#2381cd",
                        marginRight: "3px",
                        marginLeft: "0px",
                      }}
                    />
                  ) : null}
                  <Text level={5} className="m b-0 ml-1">
                    {item.jobopenings &&
                      item.jobopenings[0].city &&
                      item.jobopenings[0].city.length > 0
                      ? item.jobopenings[0].city[0].city
                      : ""}
                  </Text>
                </Col>
                <Col span={24} className="mt-3">
                  <Text strong level={5}>
                    Description
                  </Text>
                  <Text level={5} className={"ml-3 text-muted"}>
                    {desc.length > 300 ? desc.substring(0, 300) + "..." : desc}
                  </Text>
                </Col>
                <Col span={24} className={"mt-3 mb-2"}>
                  <Text strong level={5}>
                    Required Skills
                  </Text>
                  {" : "}
                  {item.jobopenings
                    ? item.jobopenings[0].required_skills.map((item, index) => {
                      return (
                        <Text
                          key={index.toString()}
                          level={5}
                          className="mb-0 pl-2"
                        >
                          {item + ","}
                        </Text>
                      );
                    })
                    : ""}
                </Col>
                <Col span={18}></Col>
                <Col span={6} className="align-text-center text-right">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={"ml-5"}
                    onClick={() => this.onSubmitCandidate(item, "index")}
                  >
                    {candidate_submissionsList.length > 0
                      ? "Submited"
                      : "Submit"}
                  </Button>
                </Col>
              </Row>
            </Card>
            {/* <Divider plain></Divider> */}
          </div>
        );
      })
    );
  };

  render() {
    const _this = this;
    const candidate_listing = this.state.openings.candidate_listing;
    const totalRecords = this.state.openings.totalRecords;

    return (
      <div>
        <div className="row">
          <div className="col-lg-12 gutter-b">
            <div className={`card card-custom card-stretch gutter-b`}>
              <div className="card-body py-3 px-3">
                <Card
                  title="Candidate Applied Job List"
                  bordered={false}
                  className="px-0 py-0"
                >
                  {candidate_listing && candidate_listing.length > 0
                    ? this.ItemCandidateJob()
                    : this.EmptyView()}
                </Card>
              </div>
            </div>
            <div className="text-right mr-10">
              <Pagination
                showSizeChanger={false}
                current={this.state.page}
                onChange={this.onPageChange}
                total={totalRecords}
              />
            </div>
          </div>
        </div>
        {showError(
          this.state.success,
          this.state.msgSuccess,
          this.state.error,
          this.state.msgError
        )}
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

export default connect(mapStateToProps)(CandidateApplyJobs);
