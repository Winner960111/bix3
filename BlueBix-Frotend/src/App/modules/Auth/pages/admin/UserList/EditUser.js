/* eslint-disable no-lone-blocks */
import React, { Component } from "react";
import axios from "axios";
import {
  REPORTING_MANAGER_LIST,
  ROLE_LIST,
  UPDATE_USER,
  USER_CREATE,
  USERS_LIST,
  IMAGE_USER_URL,
} from "../../../../../../ApiUrl";
import {
  Form,
  Input,
  Radio,
  Row,
  Col,
  Card,
  Select,
  Button,
  Image,
} from "antd";
import { store } from "../../../../../../redux";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { getBase64, showError } from "../../../../../pages/utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

class editUser extends Component {
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
    // const users = this.props.users;
    //const user = users.user;
    if (user) {
      this.setState({ loading: true });
      axios
        .get(USERS_LIST + "/" + user._id, {
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

            setTimeout(() => {
              //  <Redirect from="/add-user" to="/user-list" />;
            }, 2000);
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
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        mobile: user.mobile,
        phone_home: user.phone_home,
        phone_work: user.phone_work,
        login_email: user.login_email,
        email: user.email,
        alternate_email: user.alternate_email,
        assigned_role: user.assigned_role ? user.assigned_role._id : "",
        reporting_manager:
          user.reporting_manager !== null
            ? user.reporting_manager.length > 0
              ? user.reporting_manager[0]._id
              : ""
            : "",
        // current_location: user.current_location,
        status: user.status,
        profile_picture: user.profile_picture,
        default: user.default,
        profile: user.profile,
      });
    }
  };

  getReportingManagerName = (id) => {
    return this.state.reportingManager.find((item) => {
      return item._id === id;
    });
  };

  getReportingManagerList = () => {
    axios
      .get(REPORTING_MANAGER_LIST, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        this.setState({ reportingManager: res.data.data }, function() {
          this.setUserValues();
        });
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

  setDefaultState = () => {
    setTimeout(() => {
      this.setState({
        error: false,
        success: false,
        loading: false,
        successMessage: "",
        errorMessage: "",
      });
      //  <Redirect from="/add-user" to="/user-list" />;
    }, 3000);
  };

  componentDidMount() {
    this.getReportingManagerList();
    this.getRolesList();
    this.setUserValues();
    this.getProfile();
  }

  render() {
    const { fileList } = this.state;
    const user = this.state.user;
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

    const onFinish = (values) => {
      const user = this.state.user;
      const selectedRole = this.state.roles.find((role) => {
        return role._id === values.assigned_role;
      });
      const profile = [selectedRole.role_name];
      values.profile = profile;
      values.profile_picture = this.state.selectedImage
        ? this.state.selectedImage
        : user.profile_picture;

      this.setState({ loading: true });
      let url = USER_CREATE;
      const { state } = this.props.location;
      if (state) {
        url = UPDATE_USER + "/" + state._id;
      }
      axios
        .put(url, values, {
          headers: { Authorization: store.getState().users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: "User Profile update successfully",
              errorMessage: "",
            });
            setTimeout(() => {
              this.setDefaultState();
              this.props.history.push("/user/list/all");
            }, 3000);
            //
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
          });
          this.setDefaultState();
        });
    };
    return (
      <Form
        ref={this.formRef}
        id="addEditUser"
        layout="vertical"
        onFinish={onFinish}
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
            {user && user.profile_picture ? (
              <Col span={6}>
                <FormItem
                // name={"profile_picture"}
                >
                  <Image
                    width={150}
                    preview={false}
                    src={`${IMAGE_USER_URL}${user.profile_picture}`}
                  />
                </FormItem>
                {/* <FormItem
                label="Upload Profile Picture (only .jpeg, .jpg, .png)"
              // name={"profile_picture"}
              >
                <Upload {...propsUpload}>
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </FormItem> */}
              </Col>
            ) : (
              ""
            )}
            <Col span={18}>
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
                  <FormItem label="Phone (Home)" name={"phone_home"}>
                    <Input placeholder="Phone (Home)" />
                  </FormItem>
                </Col>
                <Col span={6}>
                  <FormItem label="Phone (Work)" name={"phone_work"}>
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
                    <Select>
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
                {/* <Col span={12}>
                      <FormItem
                        label="Profile"
                        name={"profile"}
                        rules={[
                          {
                            required: true,
                            message: "Please select atlast one user profile.",
                          },
                        ]}
                      >
                        <CheckboxGroup options={profileOptions} />
                      </FormItem>
                    </Col> */}
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
                    <Radio.Group initialValues={""}>
                      <Radio value={"Active"}>Active</Radio>
                      <Radio value={"Inactive"}>In-Active</Radio>
                    </Radio.Group>
                  </FormItem>
                </Col>
                {/* <Col span={24}>
                    <FormItem
                      label="Upload Profile Picture (only .jpeg, .jpg, .png)"
                      name={"profile_picture"}
                    >
                      <Upload {...propsUpload}>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </FormItem>
                  </Col> */}
              </Row>
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

export default connect(mapStateToProps)(editUser);
