/* eslint-disable no-lone-blocks */
import React, { Component } from "react";
import axios from "axios";
import {
  ADMIN_PROFILE,
  REPORTING_MANAGER_LIST,
  ROLE_LIST,
  USER_CREATE,
  USERS_LIST,
} from "../../../../../../ApiUrl";
import {
  Form,
  Input,
  Radio,
  Row,
  Col,
  Card,
  Select,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { store } from "../../../../../../redux";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { getBase64, showError } from "../../../../../pages/utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

class createUser extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      selectedRole: "",
      selectedManager: "",
      selectedStatus: "",
      AllUsers: [],
      reportingManager: [],
      roles: [],
      success: false,
      error: false,
      loading: false,
      successMessage: "",
      errorMessage: "",
      fileList: [],
      selectedImage: "",
    };
  }

  getProfile = () => {
    const { state } = this.props.location;
    const user = state;

    if (user) {
      this.setState({ loading: true });
      axios
        .get(ADMIN_PROFILE + "/" + user._id, {
          headers: { Authorization: store.getState().users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState(
              {
                // success: true,
                loading: false,
                user: res.data.data,
              },
              function() {
                this.setUserValues();
              }
            );
          } else {
            this.setState({
              error: true,
              loading: false,
            });
          }
        })
        .catch((err) => {
          this.setState({
            error: true,
            loading: false,
          });
        });
    }
  };

  setUserValues = () => {
    const user = this.state.user;
    if (user) {
      this.formRef.current.setFieldsValue({
        pic: user.pic,
        display_name: user.first_name,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        phone_home: user.phone_home,
        phone_work: user.phone_work,
        login_email: user.login_email,
        email: user.email,
        alternate_email: user.alternate_email,
        role: user.assigned_role,
        // current_location: user.current_location,
        status: user.status,
        profile_picture: user.profile_picture,
        default: user.default,
        profile: user.profile,
      });
    }
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

  fetchUserData = () => {
    axios
      .post(
        USERS_LIST,
        {
          current_page: this.state.current_page,
          per_page: this.state.pageSize,
          order: "first_name",
          order_direction: "desc",
          search: "",
          role: this.state.selectedRole,
          status: this.state.selectedStatus,
          reporting_manager: this.state.selectedManager,
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((resp) => {
        this.setState({
          AllUsers: resp.data.data.userlist_details,
          loading: false,
        });
      })
      .catch((error) => {});
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
    }, 1000);
  };

  componentDidMount() {
    this.getReportingManagerList();
    this.getRolesList();
    this.setUserValues();
    this.fetchUserData();
    this.getProfile();
  }

  render() {
    const { fileList } = this.state;
    const propsUpload = {
      onRemove: (file) => {
        this.setState((state) => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));
        let idCardBase64 = "";
        getBase64(file, (result) => {
          idCardBase64 = result;
          this.setState({
            selectedImage: result,
          });
        });
        return false;
      },
      fileList,
    };
    const onFinishFailed = (errorInfo) => {};

    const onFinish = (values) => {
      const selectedRole = this.state.roles.find((role) => {
        return role._id === values.assigned_role;
      });

      const profile = [selectedRole.role_name];
      values.profile = profile;
      values.profile_picture = this.state.selectedImage
        ? this.state.selectedImage
        : values.profile_picture;

      this.setState({ loading: true });
      axios
        .post(USER_CREATE, values, {
          headers: { Authorization: store.getState().users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: "User Added successfully",
              errorMessage: "",
            });
            setTimeout(() => {
              this.setDefaultState();
              this.props.history.push("/user/list/all");
            }, 3000);
          } else {
            this.setDefaultState();
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
            function(params) {
              this.setDefaultState();
            },
          });
        });
    };

    return (
      <Form
        ref={this.formRef}
        id="addEditUser"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
        <Card
          title="User Information"
          extra={
            <NavLink
              to={{
                pathname: "/user/list/all",
              }}
            >              
              <Button type="Secondary"> Back</Button>
            </NavLink>
          }
        >
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="First name"
                name={"first_name"}
                rules={[
                  {
                    required: true,
                    message: "First name is required.",
                  },
                ]}
              >
                <Input placeholder="First name" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Last name"
                name={"last_name"}
                rules={[
                  {
                    required: true,
                    message: "Last name is required.",
                  },
                ]}
              >
                <Input placeholder="Last name" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Display name"
                name={"display_name"}
                rules={[
                  {
                    required: true,
                    message: "Display name is required.",
                  },
                ]}
              >
                <Input placeholder="Display name" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Default"
                rules={[
                  {
                    required: true,
                    message: "Please select your Default Email.",
                  },
                ]}
                name="default"
              >
                <Radio.Group>
                  <Radio value="login_email">Login Email</Radio>
                  <Radio value="email">Email</Radio>
                </Radio.Group>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Login Email"
                name={"login_email"}
                rules={[
                  {
                    required: true,
                    message: "Please enter Login Email address.",
                  },
                ]}
              >
                <Input placeholder="Login Email" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Email"
                name={"email"}
                rules={[
                  {
                    required: true,
                    message: "Email Address is required.",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Alternate Email" name={"alternate_email"}>
                <Input placeholder="Alternate Email" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="Phone (Home)"
                name={"phone_home"}
                // rules={[
                //   {
                //     required: true,
                //     message: "Phone is required.",
                //   },
                // ]}
              >
                <Input placeholder="Phone (Home)" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Phone (Work)" name={"phone_work"} rules={[
                  {
                    required: true,
                    message: "Phone is required.",
                  },
                ]}>
                <Input placeholder="Phone (Work)" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Mobile" name={"mobile"}>
                <Input placeholder="Mobile" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Reporting Manager"
                name={"reporting_manager"}
                rules={[
                  {
                    required: true,
                    message: "Please Select Reporting Manager.",
                  },
                ]}
              >
                <Select
                  showSearch
                  filterOption={(input, option) =>
                    option ? option.children.toLowerCase().includes(input) : ""
                  }
                >
                  {this.state.reportingManager.map((user, index) => {
                    return (
                      <Option value={user._id} key={index}>
                        {user.display_name.charAt(0).toUpperCase() +
                          user.display_name.slice(1)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Status"
                name={"status"}
                rules={[
                  {
                    required: true,
                    message: "Please select Status.",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={"Active"}>Active</Radio>
                  <Radio value={"Inactive"}>In-Active</Radio>
                </Radio.Group>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label="Upload Profile Picture (only .jpeg, .jpg, .png)"
                name={"profile_picture"}
              >
                <Upload {...propsUpload}>
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </FormItem>
            </Col>
          </Row>
        </Card>
        <br />
        <Card title="Assign Role">
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label="Assigned Role"
                name={"assigned_role"}
                rules={[
                  {
                    required: true,
                    message: "Please select Appropriate role for user",
                  },
                ]}
              >
                <Select>
                  {this.state.roles.map((user, index) => {
                    return (
                      <Option value={user._id} key={index.toString()}>
                        {user.role_name.charAt(0).toUpperCase() +
                          user.role_name.slice(1)}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={24}>
            <Col span={24}>
              {this.state.loading ? (
                <Button type="primary" size="large" loading>
                  Saving . .
                </Button>
              ) : (
                <Button type="primary" size="large" htmlType="submit">
                  Save User
                </Button>
              )}
            </Col>
          </Row>
        </Card>
      </Form>
    );
  }
}

// Map Redux state to React component props
const mapStateToProps = (state) => {
  return {
    token: state.users.token,
  };
};

export default connect(mapStateToProps)(createUser);
