import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  REPORTING_MANAGER_LIST,
  ROLE_LIST,
  USER,
  USERS_LIST,
} from "../../../../../../ApiUrl";
import {
  Form,
  Input,
  Row,
  Col,
  Card,
  Select,
  Button,
  Table,
  Space,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import { store } from "../../../../../../redux";
import { companyStatusList } from "../../../../../pages/constant/constant";
import { getFormatDate } from "../../../../../pages/utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;
const { Search } = Input;

class UserList extends React.Component {
  columns = [
    {
      title: "Display Name",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "User Type",
      dataIndex: "assigned_role",
      key: "assigned_role",
      render: (text) =>
        text ? text.charAt(0).toUpperCase() + text.slice(1) : "",
      // render: (profile) => (
      //   <span>
      //     {profile.map((profile) => {
      //       return <span key={profile}>{profile.toUpperCase() + " "}</span>;
      //     })}
      //   </span>
      // ),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return date ? getFormatDate(date) : "";
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (text, record) => (
        <span
        // className={`${this.props.className}-delete`}
        >
          <Space size="middle">
            <NavLink
              to={{
                // pathname: "/opening-detail",
                state: { record: record },
              }}
            >
              <Button
                onClick={(e) => {
                  this.onEdit(record._id, e);
                }}
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
                title="Are you sure you want to delete this User？"
                onConfirm={() => this.onDelete(record._id, record)}
                icon={<DeleteOutlined style={{ color: "red" }} />}
              >
                <Button type="danger" icon={<DeleteOutlined />} />
              </Popconfirm>
            </NavLink>
            {/* <a>Edit</a>
            <a>Delete</a> */}
          </Space>
        </span>
      ),
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      totalRecords: 0,
      users: [],
      reportingManager: [],
      search: "",
      status: "",
      roles: [],
      selectedRole: [],
      selectedManager: "",
      selectedStatus: "",
      loading: true,
    };
  }

  onEdit = (key, e) => {
    e.preventDefault();
    const data = this.state.users.find((item) => item._id === key);
    this.props.history.push({
      pathname: "/user/edit-user",
      state: data, // your data array of objects
    });
  };

  onDelete = (key, record) => {
    //e.preventDefault();
    const data = this.state.users.find((item) => item._id === key);
    let url = USER + "/" + data._id;

    axios
      .delete(url, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          this.setState({
            success: true,
            loading: false,
            error: false,
            successMessage: "User Delete successfully",
            errorMessage: "",
          });
          this.setDefaultState();
          this.fetchUserData();
          //
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
    const propsStatus = this.props.match.params.status
      ? this.props.match.params.status === "active"
        ? "Active" : ''
      : '';
    const status = companyStatusList.filter((status) => {
      return this.state.selectedStatus === status.value;
    });

    axios
      .post(
        USERS_LIST,
        {
          current_page: this.state.current_page,
          per_page: this.state.pageSize,
          order: "created_at",
          order_direction: "desc",
          search: this.state.search,
          role: this.state.selectedRole,
          //status: this.state.selectedStatus,
          status: status.length > 0 ? status[0].value : propsStatus,
          reporting_manager: this.state.selectedManager,
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((resp) => {
        this.setState({
          users: resp.data.data.userlist_details,
          totalPages: resp.data.data.totalPages,
          totalRecords: resp.data.data.totalRecords,
          loading: false,
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
        let errorMessage = "";
        {
          Object.entries(error.response.data.errors).map(([key, value]) => {
            return (errorMessage += value + ", ");
          });
        }
        this.setState({
          error: true,
          loading: false,
          successMessage: "",
          errorMessage: errorMessage,
        });
        this.setDefaultState();
      });
  };

  getReportingManagerList = () => {
    axios
      .get(REPORTING_MANAGER_LIST, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        this.setState({ reportingManager: res.data.data });
      });
  };

  getRolesList = () => {
    axios
      .get(ROLE_LIST, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        this.setState({ roles: res.data.data });
      });
  };

  componentDidMount() {
    this.fetchUserData();
    this.getReportingManagerList();
    this.getRolesList();
  }

  onChange(page) {
    this.setState(
      {
        current_page: page,
      },
      function () {
        this.fetchUserData();
      }
    );
  }

  onResetFilters = () => {
    // this.onChange(null);
    this.setState(
      { selectedRole: [], selectedManager: "", selectedStatus: "", search: "" },
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

  render() {
    const userAll = this.state.users.filter((user) => {
      return user.profile[0] !== "Sales";
    });
    const _this = this;
    const totalRecords = this.state.totalRecords;
    return (
      <>
        <Card title="Filters">
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="Assigned Role">
                <Select
                  mode="multiple"
                  value={this.state.selectedRole}
                  onChange={(value) => {
                    this.setState(
                      {
                        selectedRole: value,
                      },
                      function () {
                        this.fetchUserData();
                      }
                    );
                  }}
                >
                  {this.state.roles.map((user, index) => {
                    return (
                      <Option value={user._id} key={index}>
                        {user.role_name.charAt(0).toUpperCase() +
                          user.role_name.slice(1)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="Reporting Manager">
                <Select
                  value={this.state.selectedManager}
                  onChange={(value) => {
                    this.setState(
                      {
                        selectedManager: value,
                      },
                      function () {
                        this.fetchUserData();
                      }
                    );
                  }}
                >
                  <Option value={""}>{"Select"}</Option>
                  {this.state.reportingManager.map((user, index) => {
                    return (
                      <Option value={user._id} key={index.toString()}>
                        {user.display_name.charAt(0).toUpperCase() +
                          user.display_name.slice(1)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Status">
                <Select
                  value={this.state.selectedStatus}
                  onChange={(value) => {
                    this.setState(
                      {
                        selectedStatus: value,
                      },
                      function () {
                        this.fetchUserData();
                      }
                    );
                  }}
                >
                  <option value={""}>{"Select"}</option>
                  {companyStatusList.map((user, index) => {
                    return (
                      <Option value={user.value} key={index.toString()}>
                        {user.label.charAt(0).toUpperCase() +
                          user.label.slice(1)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24} className="py-0 text-right">
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
        <Card
          title="All User List"
          bordered={false}
          extra={
            <NavLink to="/user/add-user">
              <Button type="primary">Add New User</Button>
            </NavLink>
          }
          className="px-0 py-0"
        >
          <Search
            value={this.state.search}
            placeholder="Search text"
            onSearch={this.onSearch}
            onChange={(e) =>
              this.setState({
                search: e.target.value,
              })
            }
            style={{ width: 200 }}
          />
          {this.state.users ? (
            <>
              <Table
                // pagination={false}
                pagination={{
                  total: totalRecords,
                  //  pageSize: 10,
                  showSizeChanger: false,
                  onChange(current) {
                    _this.setState(
                      {
                        current_page: current,
                      },
                      function () {
                        _this.fetchUserData();
                      }
                    );
                  },
                }}
                dataSource={userAll}
                columns={this.columns}
              />
            </>
          ) : null}
        </Card>
      </>
    );
  }
}

// Map Redux state to React component props
const mapStateToProps = (state) => {
  return {
    token: state.users.token,
  };
};

export default connect(mapStateToProps)(UserList);
