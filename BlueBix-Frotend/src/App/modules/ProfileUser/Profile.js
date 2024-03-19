import React, { Component } from "react";
import axios from "axios";
import {
  ADMIN_PROFILE,
  ADMIN_PROFILE_UPDATE,
  REPORTING_MANAGER_LIST,
  ROLE_LIST,
  UPDATE_USER,
  USERS_LIST,
  IMAGE_USER_URL,
} from "../../../ApiUrl";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Radio,
  Row,
  Upload,
} from "antd";
import { store } from "../../../redux";
import { connect } from "react-redux";
import { setUser } from "../../../redux/actions/users";
import { UploadOutlined } from "@ant-design/icons";
import { getBase64, showError } from "../../pages/utils/helpers";

const FormItem = Form.Item;
class Profile extends Component {
  formRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      reportingManager: [],
      roles: [],
      success: false,
      error: false,
      loading: false,
      successMessage: "",
      errorMessage: "",
      user: {},
      fileList: [],
      selectedImage: "",
    };
  }

  componentDidMount() {
    this.getProfile();
    this.getReportingManagerList();
    this.getRolesList();
  }

  getReportingManagerList = () => {
    axios
      .get(REPORTING_MANAGER_LIST, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        this.setState({ reportingManager: res.data.data });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };
  getRolesList = () => {
    axios
      .get(ROLE_LIST, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        this.setState({ roles: res.data.data });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };

  getRoleNameById = (id) => {
    return this.state.roles
      .find((item) => {
        return item._id === id;
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
      });
  };

  getProfile = () => {
    const users = this.props.users;
    const user = users.user;
    this.setState({ loading: true });
    let url = "";
    if (users.role === "admin") {
      url = ADMIN_PROFILE;
    } else {
      url = USERS_LIST;
    }
    axios
      .get(url + "/" + user._id, {
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
              this.setProfileValues();
            }
          );
        } else {
          this.setState({
            error: true,
            loading: false,
          });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.props.history.push("/logout");
        }
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  setProfileValues = () => {
    const user = this.state.user;
    this.props.setUser(user);
    this.formRef.current.setFieldsValue({
      pic: user.pic,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      phone_home: user.phone_home,
      login_email: user.login_email,
      email: user.email,
      alternate_email: user.alternate_email,
      role: user.assigned_role,
      profile_picture: user.profile_picture,
      default: user.default,
      // current_location: user.current_location,
      status: user.status,
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

  render() {
    const { fileList } = this.state;
    const users = this.props.users;
    const user = this.state.user;
    // const role = "admin";
    // const profile = role;
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
            selectedImage: idCardBase64,
          });
        });
        return false;
      },
      fileList,
    };

    const onFinish = (values) => {
      const paramAdminValues = {
        first_name: values.first_name,
        last_name: values.last_name,
        display_name: values.display_name,
        phone_home: values.phone_home,
        mobile: values.mobile,
        email: values.email,
        alternate_email: values.alternate_email ? values.alternate_email : "",
        login_email: values.login_email,
        profile: user.profile[0], //user.assigned_role,
        role: users.role,
        default: values.default,
        current_location: user.current_location,
        profile_picture: this.state.selectedImage
          ? this.state.selectedImage
          : user.profile_picture,
        status: user.status,
      };

      const paramUserValues = {
        first_name: values.first_name,
        last_name: values.last_name,
        display_name: values.display_name,
        phone_home: values.phone_home,
        mobile: values.mobile,
        login_email: values.login_email,
        email: values.email,
        alternate_email: values.alternate_email,
        profile: user.profile, //user.assigned_role,
        reporting_manager: user.reporting_manager
          ? user.reporting_manager[0]._id
          : "",
        current_location: user.current_location,
        assigned_role: user.assigned_role._id,
        status: user.status,
        default: values.default,
        profile_picture: this.state.selectedImage
          ? this.state.selectedImage
          : user.profile_picture,
      };
      this.setState({ loading: true });

      const paramValues =
        this.props.role === "admin" ? paramAdminValues : paramUserValues;
      const URL =
        this.props.role === "admin"
          ? ADMIN_PROFILE_UPDATE + "/" + user._id
          : UPDATE_USER + "/" + user._id;
      axios
        .put(URL, paramValues, {
          headers: { Authorization: store.getState().users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              successMessage: "Profile update successfully",
              errorMessage: "",
            });
            this.getProfile();
            this.setDefaultState();
          } else {
            this.setDefaultState();
          }
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

    return (
      <Form
        id="Profile"
        ref={this.formRef}
        layout="vertical"
        onFinish={onFinish}
      >
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
        <Card title="User Profile">
          <Row gutter={24}>
            {user && user.profile_picture ? (
              <Col span={6}>
                <FormItem>
                  <Image
                    width={150}
                    preview={false}
                    src={`${IMAGE_USER_URL}${user ? user.profile_picture : ""}`}
                  />
                </FormItem>
                <FormItem
                  label="Upload Profile Picture (only .jpeg, .jpg, .png)"
                  // name={"profile_picture"}
                >
                  <Upload {...propsUpload}>
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </FormItem>
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
                  {this.props.role === "admin" ? (
                    <FormItem label="Default" name="default">
                      <Radio.Group>
                        <Radio value="login_email">Login Email</Radio>
                        <Radio value="email">Email</Radio>
                      </Radio.Group>
                    </FormItem>
                  ) : (
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
                  )}
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
              <Row span={24} className="mt-5">
                {user && user.profile_picture ? (
                  ""
                ) : (
                  <Col span={6}>
                    <FormItem
                      label="Upload Profile Picture (only .jpeg, .jpg, .png)"
                      name={"profile_picture"}
                    >
                      <Upload {...propsUpload}>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    </FormItem>
                  </Col>
                )}
              </Row>
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
                  Save
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
    role: state.users.role,
    users: state.users,
  };
};
const mapDispatchToProps = (dispatch) => ({
  setUser: (data) => {
    dispatch(setUser(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
