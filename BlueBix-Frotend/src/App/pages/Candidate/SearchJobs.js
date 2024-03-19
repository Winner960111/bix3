import React from "react";
import axios from "axios";
import {
  CANDIDATE_CATEGORY_LIST,
  CANDIDATE_CITY_LIST,
  CANDIDATE_SAVE_JOB,
  CANDIDATE_APPLY_JOB,
  CANDIDATE_JOB_OPENING_LIST,
  CANDIDATE_REMOVE_JOB,
  JOB_ASSIGNMENT_DETAILS
} from "../../../ApiUrl";
import {
  Row,
  Col,
  Card,
  Empty,
  Select,
  Button,  
  Typography,
  Pagination,
} from "antd";
import RoomIcon from "@material-ui/icons/Room";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import SearchBar from "./Profile/SearchBar";
import moment from "moment";
import { connect } from "react-redux";
import { yearsOfExpirance, salaryRange } from "../constant/constant";
import $ from "jquery";
import { showError } from "../utils/helpers";

const { Option } = Select;
const { Text, Title } = Typography;

class SearchJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      candidate_list_details: [],
      categoryList: [],
      locationList: [],
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      totalRecords: 0,
      users: [],
      search: "",
      categories: [],
      salary: [],
      location: [],
      experiance: "",
      selectedManager: "",
      selectedStatus: "",
      opening_id: "",
      loading: false,
      success: false,
      error: false,
      msgSuccess: "",
      msgError: "",
      visitedCandidate: []
    };
  }

  getCategory = (value) => {
    return this.state.categoryList.find((item) => {
      return item.code === value;
    });
  };

  onPageChange = (page) => {
    this.setState(
      {
        current_page: page,
      },
      function () {
        this.fetchUserData();
      }
    );
  };

  setDefaultState = () => {
    setTimeout(() => {
      this.setState({
        error: false,
        success: false,
        loading: false,
        msgSuccess: "",
        msgError: "",
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

    const categories =
      this.state.categories.length > 0 ? this.state.categories : [];

    const params = {
      current_page: this.state.current_page,
      per_page: this.state.pageSize,
      order_direction: "desc",
      search: this.state.search,
      salary: this.state.salary,
      location: this.state.location,
      categories: categories,
      experience: this.state.experiance,
      experience: this.state.experiance,
      candidate_id: this.props.users.user._id,
    };

    axios
      .post(CANDIDATE_JOB_OPENING_LIST, params, {
        headers: { Authorization: this.props.token },
      })
      .then((resp) => {
    
        this.setState({
          candidate_list_details: resp.data.data.job_opening_listing,
          totalPages: resp.data.data.totalPages,
          totalRecords: resp.data.data.totalRecords,
          loading: false,
        });
      })
      .catch((error) => {
      });
  };

  componentDidMount() {
    this.getLocationList();
    this.getCategoriesList();
    this.fetchUserData();
  }

  getCategoriesList = () => {
    axios
      .get(CANDIDATE_CATEGORY_LIST, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({ categoryList: res.data.data.category });
      })
      .catch((error) => {
      });
  };

  getLocationList = () => {
    axios
      .get(CANDIDATE_CITY_LIST, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({ locationList: res.data.data.city });
      })
      .catch((error) => {
      });
  };

  handleChangeCategory = (value) => {
    this.setState({ categories: value }, function () {
      this.fetchUserData();
    });
  };

  handleSalaryChange = (value) => {
    this.setState({ salary: value }, function () {
      this.fetchUserData();
    });
  };

  handleLocationChange = (value) => {
    this.setState({ location: value }, function () {
      this.fetchUserData();
    });
  };
  handleExperianceChange = (value) => {
    this.setState({ experiance: value }, function () {
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
        salary: [],
        experiance: "",
        location: [],
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
  onSelectedJob = (position, item) => {
    this.state.visitedCandidate.push(position);
    this.setState(
      { visitedCandidate: this.state.visitedCandidate },
      function () { }
    );

    this.props.history.push({
      pathname: "/candidate/SearchJobDetail",
      state: { item: item },
    });
  };

  onApplyJob = async (item, token) => {
    if (item && item.job_apply) {
    } else {
      const x = await axios.post(JOB_ASSIGNMENT_DETAILS, { opening_id: item.opening_id }, { headers: { Authorization: this.props.token } });
      let asr = [];
      if (x.data.data.length > 0) {
        x.data.data.forEach(element => {
          if (element.assigned_bdm.length == 0) {
            asr.push(...element.assigned_recruiter)
          }
        });
      }
      const assigned_recruiter = Array.from(new Set(asr));

      const params = {
        candidate_id: this.props.users.user._id,
        job_opening_id: item.opening_id,
        //company_id: "",
        recruiter_id: assigned_recruiter,
        profile_submit: "1",
      };
      this.setState({
        loading: true,
        success: false,
        error: false,
        msgSuccess: "",
        msgError: "",
      });

      // axios 

      axios
        .post(CANDIDATE_APPLY_JOB, params, {
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
              function () {
                this.fetchUserData();
              }
            );
            this.setDefaultState();
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
              error: true,
              msgSuccess: "",
              msgError: errorMessage,
            });
            this.setDefaultState();
          }
        });
    }
  };

  onSaveJob = (item, token) => {
    if (item && item.job_save) {
      this.onRemoveJob(item);
    } else {
      const params = {
        candidate_id: this.props.users.user._id,
        job_opening_id: item.opening_id,
      };
      this.setState({
        loading: true,
        success: false,
        error: false,
        msgSuccess: "",
        msgError: "",
      });

      axios
        .post(CANDIDATE_SAVE_JOB, params, {
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
              function () {
                this.fetchUserData();
              }
            );
            this.setDefaultState();
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
              error: true,
              msgSuccess: "",
              msgError: errorMessage,
            });
            this.setDefaultState();
          }
        });
    }
  };

  onRemoveJob = (item) => {
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
              success: false,
              error: true,
              msgSuccess: "",
              msgError: res.data.message,
            },
            function () {
              this.fetchUserData();
            }
          );
          this.setDefaultState();
        }
      })
      .catch((error) => {
        if (error.response) {
          let errorMessage = "";
          {
            error.response.data &&
              error.response.data.errors &&
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
          this.setDefaultState();
        }
      });
  };

  SubmissionsTableMe = () => {
    return (
      this.state.candidate_list_details &&
      this.state.candidate_list_details.map((item, index) => {
        item.key = item._id;
        const desc = $(item.job_description).text();
        const given = moment(item.created_at, "YYYY-MM-DD");
        const current = moment().startOf("day");
        const datys = moment.duration(current.diff(given)).asDays();

        return (
          <div className="site-card-border-less-wrapper" key={index.toString()}>
            <Card
              bordered={true}
              className="px-0 py-0 mb-10"
              bodyStyle={{ padding: 0 }}
            >
              <Row gutter={24} className="p-13">
                <Col span={24}>
                  <div
                    className={"cursor-pointer"}
                    onClick={() => this.onSelectedJob(index, item)}
                  >
                    <Title level={3}>{item ? item.opening_title : ""}</Title>
                  </div>
                </Col>
                <Col span={24}>
                  <BusinessCenterIcon
                    style={{ fill: "#2381cd", marginRight: "5px" }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    {item ? item.required_experience + " Yrs" : ""}
                  </Text>
                  <AccountBalanceWalletIcon
                    style={{
                      fill: "#2381cd",
                      marginRight: "3px",
                      marginLeft: "5px",
                    }}
                  />
                  <Text level={5} className="mb-0 ml-1">
                    $ {item ? `${item.salary_range_from} - ${item.salary_range_to}` + "  " : ""}
                  </Text>
                  {item && item.city.length ? (
                    <RoomIcon
                      style={{
                        fill: "#2381cd",
                        marginRight: "3px",
                        marginLeft: "0px",
                      }}
                    />
                  ) : null}
                  <Text level={5} className="m b-0 ml-1">
                    {item && item.city.length > 0 ? item.city[0].city : ""}
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
                    IT Skills
                  </Text>
                  {" : "}
                  {item.required_skills.map((item, index) => {
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
                <Col span={18}>
                  <Text strong level={5} className="mb-0 ml-0">
                    {datys > 0 ? datys + " DAY AGO" : " Today"}
                  </Text>
                </Col>
                <Col
                  xs={24}
                  sm={16}
                  md={12}
                  lg={6}
                  xl={6}
                  className="align-text-center text-right"
                >
                  <Button
                    type={item && item.job_save ? "primary" : "default"}
                    htmlType="submit"
                    className="mb-2"
                    onClick={() => this.onSaveJob(item, "")}
                  >
                    {item && item.job_save ? "Saved" : "Save"}
                  </Button>

                  <Button
                    type={item && item.job_apply ? "primary" : "default"}
                    htmlType="submit"
                    className={"ml-5"}
                    onClick={() => this.onApplyJob(item, "")}
                  >
                    {item && item.job_apply ? "Applied" : "Apply"}
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
    const _this = this;
    const totalRecords = this.state.totalRecords;
    return (
      <>
        <Card title={"Search here"} bordered={false} className="px-0 py-0 mb-6">
          <Row gutter={24} className="mb-5">
            <Col span={12}>
              <SearchBar input={this.state.search} onChange={this.onSearch} />
              <Button
                className="ml-5"
                onClick={this.fetchUserData}
                type="primary"
                size="large"
              >
                Search
              </Button>
            </Col>
          </Row>
        </Card>
        <Card title={"Filters"} bordered={false} className="px-0 py-0">
          <Row gutter={24}>
            <Col xs={24} sm={16} md={12} lg={6} xl={6}>
              <label for="by_source" className="" title="Date Range">
                Salary :
              </label>
              <br />
              <Select
                mode="multiple"
                value={this.state.salary}
                onChange={this.handleSalaryChange}
                style={{ width: "100%" }}
              >
                {/*<Option value={""}>{"Select"}</Option>*/}
                {salaryRange != undefined &&
                  salaryRange.map((salaryRange, index) => (
                    <Option key={index.toString()} value={salaryRange.value}>
                      {"$ " + salaryRange.label + "  "}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col xs={24} sm={16} md={12} lg={8} xl={8}>
              <label for="by_source" className="" title="Category">
                Category :
              </label>
              <br />
              <Select
                showSearch
                filterOption={(input, option) =>
                  option ? option.children.toLowerCase().includes(input) : ''
                }
                mode="multiple"
                onChange={this.handleChangeCategory}
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
            <Col xs={24} sm={16} md={12} lg={6} xl={6}>
              <label for="by_source" className="" title="Status">
                Location :
              </label>
              <br />
              <Select
                showSearch
                filterOption={(input, option) =>
                  option ? option.children.toLowerCase().includes(input) : ''
                }
                mode="multiple"
                value={this.state.location}
                onChange={this.handleLocationChange}
                style={{ width: "100%" }}
                filterSort={(optionA, optionB) =>
                  optionA.children
                    .toLowerCase()
                    .localeCompare(optionB.children.toLowerCase())
                }
              >
                {this.state.locationList.map((location, index) => (
                  <Option key={index.toString()} value={location.code}>
                    {location.city}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={16} md={12} lg={3} xl={3}>
              <label for="by_source" className="" title="Status">
                Experiance :
              </label>
              <br />
              <Select
                value={this.state.experiance}
                onChange={this.handleExperianceChange}
                style={{ width: "100%" }}
              >
                <Option value={""}>{"Select"}</Option>
                {yearsOfExpirance != undefined &&
                  yearsOfExpirance.map((option, index) => (
                    <Option key={index.toString()} value={option.value}>
                      {/*{status.label}*/}
                      {option.label +
                        (option.label === "0"
                          ? ""
                          : option.label === "1"
                            ? " year"
                            : " years")}
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
        </Card>
        <br />
        {/*<Card bordered={false} className="px-0 py-0">*/}

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
        {/*</Card>*/}
        {showError(
          this.state.success,
          this.state.msgSuccess,
          this.state.error,
          this.state.msgError
        )}
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

export default connect(mapStateToProps)(SearchJobs);
