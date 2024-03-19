import React from "react";
import axios from "axios";
import {
  COMPANY_CANDIDATE_SUBMISSION_LIST,
  IMAGE_CANDIDATE_URL,
  OPENING_TITLE_LIST,
} from "../../../ApiUrl";
import {
  Row,
  Col,
  Card,
  Empty,
  Typography,
  Pagination,
  Image,
  Avatar,
} from "antd";
import Checkbox from "@material-ui/core/Checkbox";
import { CheckOutlined } from "@ant-design/icons";
import RoomIcon from "@material-ui/icons/Room";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { connect } from "react-redux";
import { Courses, CandidateSubmissionStatus } from "../constant/constant";
import Filters from "../../modules/filter";

const { Text, Title } = Typography;

class CandidateList extends React.Component {
  callBackParam = {};
  constructor(props) {
    super(props);

    this.state = {
      candidate_list_details: [],
      categoryList: [],
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      totalRecords: 0,
      users: [],
      search: "",
      dateRange: [],
      dateRangeValue: [],
      categories: [],
      status: "",
      opening_id: "",
      selectedManager: "",
      selectedStatus: "",
      loading: true,
      visitedCandidate: [],
    };
  }

  onPageChange = (page) => {
    this.setState(
      {
        current_page: page,
      },
      function () {
        //this.fetchUserData();
        this.callBack(this.callBackParam);
      }
    );
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

  fetchUserData = (params) => {
    // const params = {
    //   current_page: this.state.current_page,
    //   per_page: this.state.pageSize,
    //   // order: "created_at",
    //   // order_direction: "desc",
    //   category: categories,
    //   search: this.state.search,
    //   status: status.length > 0 ? status[0].value : "",
    //   dateRange: arrayDateRange,
    //   opening_id: this.state.opening_id,
    //   company_id: this.props.users.user._id,
    // };


    if (params) {
      axios
        .post(COMPANY_CANDIDATE_SUBMISSION_LIST, params, {
          headers: { Authorization: this.props.token },
        })
        .then((resp) => {
          this.setState(
            {
              candidate_list_details:
                resp.data.data.candidate_submission_listing,
              totalPages: resp.data.data.totalPages,
              totalRecords: resp.data.data.totalRecords,
              loading: false,
            },

          );
        })
        .catch((error) => {
        });
    }
  };

  callBack = (value) => {
    this.callBackParam = value;
    const userId = this.props.users.user._id;
    const param = {
      current_page: this.state.current_page,
      per_page: this.state.pageSize,
      search: this.state.search,
      //order: "updated_at",
      //  order_direction: "desc",
      dateRange: value.arrayDateRange,
      category: value.categories,
      status: value.status,
      opening_id: value.opening_id,
      company_id: userId,
    };

    this.fetchUserData(param);
  };

  componentDidMount() {
    const openingId = this.props.location.state
      ? this.props.location.state.item
        ? this.props.location.state.item.opening_id
        : ""
      : "";

    this.handleOpeningIdChange(openingId);

    //this.getopeningTitleList();

    this.fetchUserData();
  }

  getopeningTitleList = () => {
    const params = { company_id: this.props.users.user._id };
    axios
      .post(OPENING_TITLE_LIST, params, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({ openingTitleList: res.data.data.opening_detail_list });
      })
      .catch((error) => {
      });
  };

  onDateChange = (value, dateString) => {
    const srtdate = dateString[0] === "" ? [] : dateString;
    this.setState({ dateRangeValue: value, dateRange: srtdate }, function () {
      this.fetchUserData();
    });
  };

  handleChange = (value) => {
    this.setState({ categories: value }, function () {
      this.fetchUserData();
    });
  };

  handleStatusChange = (value) => {
    this.setState({ status: value }, function () {
      this.fetchUserData();
    });
  };

  handleOpeningIdChange = (value) => {
    this.setState({ opening_id: value }, function () {
      this.fetchUserData();
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
        search: "",
      },
      function () {
        this.fetchUserData();
      }
    );
  };

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },
      function () {
        this.fetchUserData();
      }
    );
  };
  onSelectedCandidate = (position, item) => {
    this.state.visitedCandidate.push(position);
    this.setState(
      { visitedCandidate: this.state.visitedCandidate },
      function () { }
    );
    this.props.history.push({
      pathname: "/company/candidateProfileDetail",
      state: { item: item },
    });
  };

  onChange = (e) => {
    e.preventDefault();

    const position = e.target.getAttribute("id");
    this.state.visitedCandidate.push(position);
    this.setState(
      { visitedCandidate: this.state.visitedCandidate },
      function () { }
    );
  };

  render() {
    // const categoryList = this.state.categoryList;
    const totalRecords = this.state.totalRecords;

    return (
      <>
        <Filters
          callBack={this.callBack}
          showCategory={false}
          showCompany={false}
          clearSearch={this.onSearch}
          statusObject={CandidateSubmissionStatus}
        />
        <br />
        {this.state.users ? (
          <>
            {totalRecords > 0 ? this.SubmissionsTableMe() : this.EmptyView()}
            {totalRecords > 0 ? (
              <div className="text-right mr-10">
                <Pagination
                  showSizeChanger={false}
                  current={this.state.current_page}
                  onChange={this.onPageChange}
                  total={totalRecords}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </>
    );
  }

  SubmissionsTableMe = () => {
    return (
      this.state.candidate_list_details &&
      this.state.candidate_list_details.map((item, index) => {
        item.key = item._id;
        const found = this.state.visitedCandidate.find(
          (element) => element === index
        );

        const candidate_qualifications_details =
          item.candidate_qualifications_details;

        const employee_details = item.employess ? item.employess[0] : undefined;
        const submission_status = item.opening_details
          ? item.opening_details.submission_status
          : "";

        const submissionStatusValue = CandidateSubmissionStatus.find(
          (status) => {
            return status.value === submission_status;
          }
        );

        const course =
          candidate_qualifications_details &&
            candidate_qualifications_details.length > 0
            ? Courses.find((item) => {
              return (
                parseInt(item.value) ===
                parseInt(candidate_qualifications_details[0].course)
              );
            })
            : undefined;


        const Education =
          candidate_qualifications_details &&
            candidate_qualifications_details.length > 0
            ? course
              ? course.label
              : "" +
              " " +
              candidate_qualifications_details[0].university +
              " " +
              candidate_qualifications_details[0].passing_year
            : "";

        return (
          <div className="site-card-border-less-wrapper" key={index.toString()}>
            <Card
              bordered={true}
              className="px-0 py-0 mb-10"
              bodyStyle={{ padding: 0 }}
            >
              <Row>
                <Col span={18} className="p-13">
                  <Row gutter={24} className="mb-3">
                    <Checkbox
                      id={index}
                      className="px-0 py-0"
                      style={{ padding: "0" }}
                      color="default"
                      onChange={this.onChange}
                    />
                    <div
                      className={"cursor-pointer"}
                      onClick={() => this.onSelectedCandidate(index, item)}
                    >
                      <Title
                        level={3}
                        className="mb-0 ml-5 d-flex align-items-center"
                      >
                        {item.name
                          ? item.name.charAt(0, 1).toUpperCase() +
                          item.name.slice(1)
                          : ""}
                      </Title>
                    </div>
                  </Row>
                  <Row>

                    <Col span={24} className=" ml-5 d-flex justify-content-between">
                      <div className="d-flex">
                        {
                          <Title level={5} className="mb-0 ml-1">
                            {"Opening Title : "}
                          </Title>
                        }
                        <Text level={5} className="mb-0 ml-1">
                          {item.opening_details &&
                            item.opening_details.job_opening_details.length > 0
                            ? item.opening_details.job_opening_details[0]
                              .opening_title
                            : ""}
                        </Text>
                      </div>
                      <div className="d-flex">
                        {item.opening_details ? (
                          <Title level={5} className="mb-0 ml-3 mt-0">
                            {"Submission Status  : "}
                          </Title>
                        ) : null}
                        <Text level={5} className="mb-0 ml-1">
                          {submissionStatusValue
                            ? submissionStatusValue.label
                            : ""}
                        </Text>
                      </div>
                    </Col>

                  </Row>
                  <Row gutter={24}>
                    <Col span={24} className="ml-12 mt-4">
                      <Row gutter={24} className="align-items-center">
                        <Row gutter={8} className="align-items-center  mr-5">
                          <BusinessCenterIcon
                            style={{ fill: "#2381cd", marginRight: "3px" }}
                          />
                          <Text level={5} className="mb-0 ml-1">
                            {item.total_work_exp_year +
                              "yr " +
                              item.total_work_exp_month +
                              "m"}
                          </Text>
                        </Row>
                        <Row
                          gutter={8}
                          className="align-items-center ml-5 mr-5"
                        >
                          <AccountBalanceWalletIcon
                            style={{ fill: "#2381cd", marginRight: "3px" }}
                          />
                          <Text level={5} className="mb-0 ml-1">
                            {item.current_ctc
                              ? parseInt(item.current_ctc) > 1000 ? '$ ' + parseInt(item.current_ctc) / 1000 + ' K' : '$ ' + item.current_ctc
                              : "$ 0.0"}
                          </Text>
                        </Row>
                        <Row gutter={8} className="align-items-center ml-5">
                          {item.current_location ? (
                            <RoomIcon
                              style={{ fill: "#2381cd", marginRight: "3px" }}
                            />
                          ) : null}
                          <Text level={5} className="mb-0 ml-1">
                            {item.current_location
                              ? item.current_location
                                .charAt(0, 1)
                                .toUpperCase() +
                              item.current_location.slice(1)
                              : ""}
                          </Text>
                        </Row>
                      </Row>
                    </Col>
                  </Row>
                  <br />
                  <Row gutter={24}>
                    <Col span={24} className="ml-7">
                      <Row gutter={24}>
                        <Col span={4}>
                          <Text strong level={5} className="mb-0 ml-0">
                            Current
                          </Text>
                          {" : "}
                        </Col>
                        <Col span={18} className="align-items-center">
                          <Text level={5} className="mb-0 ml-5">
                            {employee_details
                              ? employee_details.designation +
                              " at " +
                              employee_details.organization
                              : ""}
                          </Text>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={4}>
                          <Text strong level={5} className="mb-0 ml-0">
                            Education
                          </Text>
                          {" : "}
                        </Col>
                        <Col span={18} className="align-items-center">
                          <Text level={5} className="mb-0 ml-5">
                            {Education}
                          </Text>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={4}>
                          <Text strong level={5} className="mb-0 ml-0">
                            Pref Loc
                          </Text>
                          {" : "}
                        </Col>
                        <Col span={18} className="align-items-center">
                          <Text level={5} className="mb-0 ml-5">
                            {item.desired_location
                              ? item.desired_location
                                .charAt(0, 1)
                                .toUpperCase() +
                              item.desired_location.slice(1)
                              : ""}
                          </Text>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col span={4}>
                          <Text strong level={5} className="mb-0 ml-0">
                            Key Skills
                          </Text>
                          {" : "}
                        </Col>
                        <Col span={18} className="align-items-center">
                          {item.key_skills
                            ? item.key_skills.map((item, index) => {
                              return (
                                <Text
                                  key={index.toString()}
                                  level={5}
                                  className="mb-0 ml-5"
                                >
                                  {item + ","}
                                </Text>
                              );
                            })
                            : null}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col
                  span={6}
                  className="p-0"
                  style={{ background: "hsl(207deg 67% 46% / 25%)" }}
                >
                  {found !== undefined ? (
                    <div className="visited">
                      <CheckOutlined />
                    </div>
                  ) : null}
                  <div
                    onClick={() => this.onSelectedCandidate(index, item)}
                    className="text-center p-10 cursor-pointer"
                  >
                    <div>
                      <Avatar
                        style={{ margin: "auto" }}
                        size={100}
                        icon={
                          <Image
                            width={100}
                            preview={false}
                            src={
                              item.profile_image
                                ? IMAGE_CANDIDATE_URL + item.profile_image
                                : ""
                            }
                            fallback="data:image/png;base64,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"
                          />
                        }
                      />
                    </div>

                    <Row gutter={18} className="align-items-center mt-3">
                      <Col span={24}>
                        <Text level={5}>
                          <br />
                          {item.total_work_exp_year +
                            (parseInt(item.total_work_exp_month) > 0
                              ? "+"
                              : "") +
                            "years of experience" +
                            (employee_details
                              ? employee_details.designation +
                              " at " +
                              employee_details.organization
                              : "")}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        );
      })
    );
  };

  EmptyView = () => {
    return (
      <Card>
        <Empty
          imageStyle={{
            height: 60,
          }}
          description={<span>No submissions for any Openings</span>}
        ></Empty>
      </Card>
    );
  };
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

export default connect(mapStateToProps)(CandidateList);
