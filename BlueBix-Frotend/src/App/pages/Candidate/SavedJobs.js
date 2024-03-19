import React from "react";
import axios from "axios";
import { CANDIDATE_SAVE_JOB_LIST, CANDIDATE_REMOVE_JOB } from "../../../ApiUrl";
import { 
  Row,
  Col,
  Card,
  Empty,  
  Button,  
  Typography,
  Pagination,
} from "antd";
import RoomIcon from "@material-ui/icons/Room";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import $ from "jquery";
import moment from "moment";
import { connect } from "react-redux";

const { Text, Title } = Typography;

window.$ = window.jQuery = require("jquery");
class SavedJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      job_list_details: [],
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      totalRecords: 0,
      users: [],
      opening_id: "",
      loading: true,
      visitedCandidate: [],
    };
  }

  getCategory = (value) => {
    return this.state.categoryList.find((item) => {
      return item.code === value;
    });
  };

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
    axios
      .get(CANDIDATE_SAVE_JOB_LIST, {
        headers: { Authorization: this.props.token },
      })
      .then((resp) => {
        this.setState({
          job_list_details: resp.data.data.saved_jobs,
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

  onRemoveJob = (item, token) => {
    this.setState({
      loading: true,
      success: false,
      error: false,
      msgSuccess: "",
      msgError: "",
    });

    axios
      .delete(CANDIDATE_REMOVE_JOB + "/" + item.job_save._id, {
        headers: {
          Authorization: this.props.token,
        },
      })
      .then((res) => {
        if (!res.data.error) {
          this.setState(
            {
              loading: false,
              success: true,
              error: false,
              msgSuccess: res.data.message,
              msgError: "",
            },
            function() {
              this.fetchUserData();
            }
          );
        }
      })
      .catch((error) => {
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          this.setState({
            loading: false,
            success: false,
            error: true,
            msgSuccess: "",
            msgError: errorMessage,
          });
        }
      });
  };

  onSelectedCandidate = (position, item) => {
    this.state.visitedCandidate.push(position);
    this.setState(
      { visitedCandidate: this.state.visitedCandidate },
      function() {}
    );

    this.props.history.push({
      pathname: "/candidate/SearchJobDetail",
      state: { item: item },
    });
  };

  SubmissionsTableMe = () => {
    return (
      this.state.job_list_details &&
      this.state.job_list_details.map((item, index) => {
        item.key = item._id;
        const found = this.state.visitedCandidate.find(
          (element) => element === index
        );
        const job_opening_details = item;

        // const candidate_qualifications_details =
        //   job_opening_details.candidate_qualifications_details;

        // const employee_details = job_opening_details.employess
        //   ? job_opening_details.employess[0]
        //   : undefined;

        // const experience_level = optionsexperienceLevel.find((item) => {
        //   return (
        //     item.value ===
        //     (job_opening_details ? job_opening_details.experience_level : "")
        //   );
        // });

        // const course =
        //   candidate_qualifications_details &&
        //   candidate_qualifications_details.length > 0
        //     ? Courses.find((item) => {
        //         return (
        //           parseInt(item.value) ===
        //           parseInt(candidate_qualifications_details[0].course)
        //         );
        //       })
        //     : undefined;

        // const createMarkup = () => {
        //   return { __html: job_opening_details.job_description };
        // };

        const desc = $(job_opening_details.job_description).text();
        // $('.accor > .head').on('click', function(){
        //     $('.accor > .body').slideUp();
        //     $(this).next().slideDown();
        // });

        const given = moment(job_opening_details.created_at, "YYYY-MM-DD");
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
                    {job_opening_details
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
                    {desc.length > 300 ? desc.substring(0, 300) + "..." : desc}
                  </Text>
                </Col>
                <Col span={24} className={"mt-3 mb-2"}>
                  <Text strong level={5}>
                    Skills
                  </Text>
                  {" : "}
                  {job_opening_details.required_skills &&
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

                <Col span={6} className="align-text-center text-right">
                  {/*<StarOutlined className="mr-2"/>*/}
                  <Button
                    type="default"
                    htmlType="submit"
                    onClick={() => this.onRemoveJob(item, "index")}
                  >
                    Remove
                  </Button>
                  {/* <Button
                      type="primary"
                      htmlType="submit"
                      className={"ml-5"}
                      onClick={() => this.onApplyJob(item, "index")}
                    >
                      Apply
                    </Button> */}
                </Col>
              </Row>
            </Card>
            {/* <Divider plain></Divider> */}
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
          description={<span>No Job Found</span>}
        ></Empty>
      </Card>
    );
  };

  render() {
    const categoryList = this.state.categoryList;
    const job_list_details = this.state.job_list_details;
    const _this = this;
    const totalRecords = this.state.totalRecords;

    return (
      <>
        <Card
          title={"My Saved Jobs"}
          bordered={true}
          className="px-0 py-0 mb-5"
          bodyStyle={{ padding: 0 }}
        ></Card>

        {this.state.users ? (
          <>
            {job_list_details && job_list_details.length > 0
              ? this.SubmissionsTableMe()
              : this.EmptyView()}
            {job_list_details && job_list_details.length ? (
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

export default connect(mapStateToProps)(SavedJobs);
