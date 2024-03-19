import React from "react";
import axios from "axios";
import {
  CANDIDATE_CATEGORY_LIST,
  CANDIDATE_CITY_LIST,
  FREELANCE_JOB_LIST,
  FREELANCE_JOB_WORK_REQUEST,
} from "../../../ApiUrl";
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Empty,
  Select,
  Button,
  Typography,
  Pagination,
  Modal,
} from "antd";
import RoomIcon from "@material-ui/icons/Room";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import SearchBar from "../Candidate/Profile/SearchBar";
import moment from "moment";
import { connect } from "react-redux";
import { Courses, yearsOfExpirance, salaryRange } from "../constant/constant";
import $ from "jquery";
import { showError } from "../utils/helpers";

const { Option } = Select;
const { Text, Title } = Typography;
const FormItem = Form.Item;

class SearchJobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      freelanceJobOpening: [],
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
      visitedCandidate: [],
      editWorkJobVisible: false,
      selectedItem: undefined,
      selectedIndex: -1,
    };
    this.formWorkJob = React.createRef();
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
        this.fetchJobsData();
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

  fetchJobsData = () => {
    const categories =
      this.state.categories.length > 0 ? this.state.categories : [];
    const params = {
      current_page: this.state.current_page,
      per_page: this.state.pageSize,
      order_direction: "desc",
      search: this.state.search.trim(),
      salary: this.state.salary,
      location: this.state.location,
      categories: categories,
      jobdescription: "",
      experience: this.state.experiance,
      freelance_id: this.props.users.user._id,
    };

    axios
      .post(FREELANCE_JOB_LIST, params, {
        headers: { Authorization: this.props.token },
      })
      .then((resp) => {
        this.setState({
          freelanceJobOpening: resp.data.data.job_opening_listing,
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
    this.fetchJobsData();
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
      this.fetchJobsData();
    });
  };

  handleSalaryChange = (value) => {
    this.setState({ salary: value }, function () {
      this.fetchJobsData();
    });
  };

  handleLocationChange = (value) => {
    this.setState({ location: value }, function () {
      this.fetchJobsData();
    });
  };
  handleExperianceChange = (value) => {
    this.setState({ experiance: value }, function () {
      this.fetchJobsData();
    });
  };
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onResetFilters = () => {
    setTimeout(() => {
      this.setState(
        {
          categories: [],
          status: "",
          salary: [],
          experiance: "",
          location: [],
          search: "",
          loading: false,
          success: false,
          error: false,
          msgSuccess: "",
          msgError: "",
        },
        function () {
          this.fetchJobsData();
        }
      );
    }, 3000);
  };

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },
      function () {
        // this.fetchJobsData();
      }
    );
  };
  onSelectedJob = (position, item) => {
    if (item.jobworkapplications || item.assigned_freelancer) {
      if (
        (item.assigned_freelancer &&
          item.assigned_freelancer === this.props.users.user._id) ||
        (item.jobworkapplications &&
          item.jobworkapplications.job_work_status === "Approved") ||
        (item.jobworkapplications &&
          item.jobworkapplications.job_work_status === "Approve")
      ) {
        this.state.visitedCandidate.push(position);
        this.setState(
          { visitedCandidate: this.state.visitedCandidate },
          function () { }
        );
        this.props.history.push({
          pathname: "/freelancerecruiter/opening-detail",
          state: { record: item },
        });
      }
    }
  };

  onWorkJob = (position, item) => {
    this.state.visitedCandidate.push(position);
    this.setState(
      {
        visitedCandidate: this.state.visitedCandidate,
        selectedItem: item,
        selectedIndex: position,
      },
      function () { }
    );

    this.showModalWorkJob(position, item);
  };

  showModalWorkJob = (position, item) => {
    this.setState(
      { editWorkJobVisible: !this.state.editWorkJobVisible },
      function () {
        this.setWorkJobdata();
      }
    );
  };
  onClose = () => {
    this.setState({
      editWorkJobVisible: false,
      selectedItem: undefined,
      selectedIndex: -1,
    });
  };

  FreelanceAllJobs = () => {
    return (
      this.state.freelanceJobOpening &&
      this.state.freelanceJobOpening.map((item, index) => {
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

                  {item && item.city && item.city.length ? (
                    <RoomIcon
                      style={{
                        fill: "#2381cd",
                        marginRight: "3px",
                        marginLeft: "0px",
                      }}
                    />
                  ) : null}
                  <Text level={5} className="mb-0 ml-1">
                    {item && item.city && item.city.length > 0
                      ? item.city[0].city
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
                <Col span={6} className="align-text-center text-right">
                  {item.assigned_freelancer &&
                    item.assigned_freelancer === this.props.users.user._id ? (
                    "Assign"
                  ) : item.jobworkapplications ? (
                    item.jobworkapplications.job_work_status === "Request" ? (
                      "Requested"
                    ) : (
                      item.jobworkapplications.job_work_status
                    )
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={"ml-5"}
                      onClick={() => this.onWorkJob(index, item)}
                    >
                      Request Job
                    </Button>
                  )}
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
          description={<span>No Job Found</span>}
        ></Empty>
      </Card>
    );
  };

  editWorkJob = (item, values) => {
    const params = {
      freelance_id: this.props.users.user._id,
      job_work_status: "Request",
      opening_id: item.opening_id,
      job_id: item._id,
      bdm_id: item.assigned_bdm ? item.assigned_bdm.filter(elm => { if (elm.assigned_bdm) return elm })[0].assigned_bdm : [],
      note: values.work_job_note,
    };

    this.setState({
      loading: true,
      success: false,
      error: false,
      msgSuccess: "",
      msgError: "",
    });

    axios
      .post(FREELANCE_JOB_WORK_REQUEST, params, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        if (!res.data.error) {
          this.setState(
            {
              editWorkJobVisible: !this.state.editWorkJobVisible,
              loading: false,
              success: true,
              error: false,
              msgSuccess: res.data.message,
              msgError: "",
            },
            function () {
              this.onResetFilters();
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
  setWorkJobdata = () => {
    if (this.formWorkJob.current) {
      this.formWorkJob.current.setFieldsValue({
        work_job_note: "",
      });
    }
  };

  EditModalWorkJob = () => {
    const item = this.state.selectedItem;
    const selectedIndex = this.state.selectedIndex;

    return (
      <Modal
        title="Request Job"
        width={620}
        onClose={this.onClose}
        onCancel={this.onClose}
        visible={this.state.editWorkJobVisible}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editWorkJob"
              htmlType="submit"
              key="submit"
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        {item !== undefined ? this.itemView(selectedIndex, item) : null}
        <Form
          ref={this.formWorkJob}
          id="editWorkJob"
          layout="vertical"
          onFinish={(values) => this.editWorkJob(item, values)}
        //  onFinishFailed={onFinishFailed}
        >
          <Row gutter={24}>
            <Col span={24}>
              <FormItem name={"work_job_note"}>
                <Input.TextArea rows={6} placeholder="Type here..." />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  itemView = (index, item) => {
    item.key = item._id;

    const candidate_qualifications_details =
      item.candidate_qualifications_details;

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

    const desc = $(item.job_description).text();

    const given = moment(item.created_at, "YYYY-MM-DD");
    const current = moment().startOf("day");

    const datys = moment.duration(current.diff(given)).asDays();
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
      <div className="site-card-border-less-wrapper">
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
            {/* <Col span={24} className="mb-3 ">
                                    <Text level={5}>
                                        {item ? item.account_name : ''}
                                    </Text>
                                </Col> */}
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
                $ {item ? item.salary_range + "  " : ""}
              </Text>

              {item && item.city && item.city.length ? (
                <RoomIcon
                  style={{
                    fill: "#2381cd",
                    marginRight: "3px",
                    marginLeft: "0px",
                  }}
                />
              ) : null}
              <Text level={5} className="mb-0 ml-1">
                {item && item.city && item.city.length > 0
                  ? item.city[0].city
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
                IT Skills
              </Text>
              {" : "}
              {item.required_skills.map((item, index) => {
                return (
                  <Text key={index.toString()} level={5} className="mb-0 pl-2">
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
          </Row>
        </Card>
        {/* <Divider plain></Divider> */}
      </div>
    );
  };

  render() {
    const categoryList = this.state.categoryList;

    const _this = this;

    const totalRecords = this.state.totalRecords;
    return (
      <>
        <Card title={"Search here"} bordered={false} className="px-0 py-0 mb-6">
          <Row gutter={24} className="mb-0">
            <Col span={12}>
              <SearchBar input={this.state.search} onChange={this.onSearch} />
              <Button
                className="ml-5"
                onClick={this.fetchJobsData}
                type="primary"
                size="large"
              >
                Search
              </Button>
            </Col>
            <Col span={6}> </Col>
          </Row>
        </Card>

        <Card title={"Filters"} bordered={false} className="px-0 py-0">
          <Row gutter={24}>
            <Col span={6}>
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
                      {"$ " + salaryRange.label}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col span={8}>
              <label for="by_source" className="" title="Category">
                Category :
              </label>
              <br />
              <Select
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
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                Location :
              </label>
              <br />
              <Select
                mode="multiple"
                value={this.state.location}
                onChange={this.handleLocationChange}
                style={{ width: "100%" }}
              >
                {this.state.locationList.map((location, index) => (
                  <Option key={index.toString()} value={location.code}>
                    {location.city}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={3}>
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
        {this.state.users ? (
          <>
            {totalRecords > 0 ? this.FreelanceAllJobs() : this.EmptyView()}
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
        {this.EditModalWorkJob()}
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
