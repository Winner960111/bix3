import React from "react";
import axios from "axios";
import {
  CANDIDATE_SORT_LIST,
  US_STATE_LIST,
  US_CITY_LIST,
} from "../../../ApiUrl";
import { Row, Col, Card, Empty, Typography, Pagination } from "antd";
import RoomIcon from "@material-ui/icons/Room";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import $ from "jquery";
import moment from "moment";
import { connect } from "react-redux";
import { yearsOfExpirance, salaryRange } from "../constant/constant";

const { Text, Title } = Typography;

window.$ = window.jQuery = require("jquery");

class MyJobApplication extends React.Component {
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
      categories: [],
      salary: "",
      location: "",
      experiance: "",
      selectedManager: "",
      selectedStatus: "",
      opening_id: "",
      loading: true,
      visitedCandidate: [],
    };
  }

  onPageChange = (page) => {
    this.setState({
      current_page: page,
    });
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

  fetchUserData = () => {
    const paramSalary = salaryRange.find((item) => {
      return this.state.salary === item.value;
    });
    const paramExpirance = yearsOfExpirance.find((item) => {
      return this.state.experiance === item.value;
    });


    axios
      .post(
        CANDIDATE_SORT_LIST,
        {
          candidate_id: this.props.users.user._id,
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((resp) => {
        this.setState({
          candidate_list_details: resp.data.data,
          totalPages: resp.data.data.totalPages,
          totalRecords: resp.data.data.totalRecords,
          loading: false,
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };

  componentDidMount() {
    this.fetchUserData();
  }

  getStatesList = () => {
    axios
      .get(US_STATE_LIST, {})
      .then((res) => {
        // setStateList(res.data.data);
        this.setState({ stateList: res.data.data });
      })
      .catch((error) => {
      });
  };

  getCityList = (stateId) => {
    axios
      .post(US_CITY_LIST, { state_id: stateId })
      .then((res) => {
        // setCityList(res.data.data);
        this.setState({ cityList: res.data.data });
      })
      .catch((error) => {
      });
  };

  handleChangeCategory = (value) => {
    const data = value.map((item) => {
      return item;
    });
    this.setState({ categories: value }, function() {
      this.fetchUserData();
    });
  };

  handleSalaryChange = (value) => {
    this.setState({ salary: value }, function() {
      this.fetchUserData();
    });
  };

  handleLocationChange = (value) => {
    this.setState({ location: value }, function() {
      this.fetchUserData();
    });
  };
  handleExperianceChange = (value) => {
    this.setState({ experiance: value }, function() {
      this.fetchUserData();
    });
  };
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onResetFilters = () => {
    this.setState(
      {
        categories: [],
        status: "",
        salary: "",
        experiance: "",
        location: "",
        search: "",
      },
      function() {
        this.fetchUserData();
      }
    );
  };

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },
      function() {
        this.fetchUserData();
      }
    );
  };
  onSelectedCandidate = (position, item) => {
    this.state.visitedCandidate.push(position);
    this.setState(
      { visitedCandidate: this.state.visitedCandidate },
      function() {}
    );

    this.props.history.push({
      pathname: "/candidate/JobDetail",
      state: { item: item },
    });
  };

  SubmissionsTableMe = () => {
    function onChange(e) {
    }

    return (
      this.state.candidate_list_details &&
      this.state.candidate_list_details[0].candidate_submissions.map(
        (item, index) => {
          item.key = item._id;
          const found = this.state.visitedCandidate.find(
            (element) => element === index
          );
          const job_opening_details =
            item.job_opening_details.length > 0
              ? item.job_opening_details[0]
              : undefined;

         
          const desc = $(
            job_opening_details ? job_opening_details.job_description : ""
          ).text();

          const given = moment(
            job_opening_details ? job_opening_details.created_at : "",
            "YYYY-MM-DD"
          );
          const current = moment().startOf("day");

          const datys = moment.duration(current.diff(given)).asDays();
          return (
            <div
              // onClick={() => this.onSelectedCandidate(index, item)}
              className="site-card-border-less-wrapper"
              key={index.toString()}
            >
              <Card
                bordered={true}
                className="px-0 py-0 mb-5"
                bodyStyle={{ padding: 0 }}
              >
                <Row gutter={24} className="p-13">
                  <Col span={24}>
                    <div
                      className={"cursor-pointer"}
                      onClick={() => this.onSelectedCandidate(index, item)}
                    >
                      <Title level={3}>
                        {/*{item.name*/}
                        {/*    ? item.name.charAt(0, 1).toUpperCase() +*/}
                        {/*    item.name.slice(1)*/}
                        {/*    : ""}*/}

                        {job_opening_details
                          ? job_opening_details.opening_title
                          : ""}
                      </Title>
                    </div>
                  </Col>
                  {/* <Col span={24} className="mb-3 ">
                                    <Text level={5}>
                                        {job_opening_details && job_opening_details.account_name.length > 0
                                            ? job_opening_details.account_name[0].company_name
                                            : ""}
                                    </Text>
                                </Col> */}
                  <Col span={24}>
                    <BusinessCenterIcon
                      style={{ fill: "#2381cd", marginRight: "5px" }}
                    />
                    <Text level={5} className="mb-0 ml-1">
                      {/*{item.total_work_exp_year +*/}
                      {/*"yr " +*/}
                      {/*item.total_work_exp_month +*/}
                      {/*"m"}*/}

                      {job_opening_details
                        ? job_opening_details.required_experience + " Yrs"
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
                      {job_opening_details && job_opening_details.salary_range
                        ? job_opening_details.salary_range + "  "
                        : ""}
                    </Text>
                    {job_opening_details &&
                    job_opening_details.city &&
                    job_opening_details.city.length > 0 ? (
                      <RoomIcon
                        style={{
                          fill: "#2381cd",
                          marginRight: "3px",
                          marginLeft: "0px",
                        }}
                      />
                    ) : null}
                    <Text level={5} className="mb-0 ml-1">
                      {/*{item.current_location*/}
                      {/*    ? item.current_location*/}
                      {/*        .charAt(0, 1)*/}
                      {/*        .toUpperCase() +*/}
                      {/*    item.current_location.slice(1)*/}
                      {/*    : ""}*/}

                      {job_opening_details &&
                      job_opening_details.city &&
                      job_opening_details.city.length > 0
                        ? job_opening_details.city[0].city
                        : ""}
                    </Text>
                  </Col>
                  <Col span={24} className="mt-3">
                    <Text strong level={5}>
                      Description
                    </Text>
                    <Text level={5} className={"ml-3 text-muted"}>
                      {/*{job_opening_details ? job_opening_details.job_description : ''}*/}
                      {/*<div*/}
                      {/*    dangerouslySetInnerHTML={createMarkup()}*/}
                      {/*    className="editor"*/}
                      {/*/>*/}
                      {desc.length > 300
                        ? desc.substring(0, 300) + "..."
                        : desc}
                    </Text>
                  </Col>
                  <Col span={24} className={"mt-3 mb-2"}>
                    <Text strong level={5}>
                      Skills
                    </Text>
                    {" : "}
                    {job_opening_details &&
                      job_opening_details.required_skills &&
                      job_opening_details.required_skills.map((item, index) => {
                        return (
                          <Text
                            key={index.toString()}
                            level={5}
                            className="mb-0 pl-2"
                          >
                            {item + ","}
                          </Text>
                        );
                      })}
                  </Col>
                  <Col span={18} className="mt-3 ml-0">
                    <Text strong level={5} className="mb-0 ml-0">
                      {datys > 0 ? datys + " DAY AGO" : " Today"}
                    </Text>
                  </Col>
                  {/* <Col span={6} className="mt-3 align-text-center text-right">
                    <StarOutlined className="mr-2" />
                    <Text strong level={5} className="mb-0 ml-0">
                      Save
                    </Text>
                  </Col> */}
                </Row>
              </Card>
              {/* <Divider plain></Divider> */}
            </div>
          );
        }
      )
    );
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

  render() {
    const candidate_list_details = this.state.candidate_list_details;

    const totalRecords = this.state.totalRecords;

    return (
      <>
        <Card
          title={"My Job Applications"}
          bordered={true}
          className="px-0 py-0 mb-5"
          bodyStyle={{ padding: 0 }}
        ></Card>

        {this.state.users ? (
          <>
            {candidate_list_details &&
            candidate_list_details.length > 0 &&
            candidate_list_details[0].candidate_submissions.length > 0
              ? this.SubmissionsTableMe()
              : this.EmptyView()}
            {candidate_list_details &&
            candidate_list_details.length > 0 &&
            candidate_list_details[0].candidate_submissions.length > 0 ? (
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
        {/*</Card>*/}
      </>
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

export default connect(mapStateToProps)(MyJobApplication);
