import React, { Component } from "react";
import axios from "axios";
import {
  CONTACTS_CREATE,
  CONTACTS,
  CONTACTS_EDIT,
  COMPANY_NAMES,
} from "../../../../ApiUrl";
import { Form, Input, Row, Col, Card, Select, Button } from "antd";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { showError } from "../../utils/helpers";

const FormItem = Form.Item;

class AddEditContact extends Component {
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
      clientNames: [],
      selectedClient: {},
    };
  }

  componentDidMount() {
    this.getProfile();
    this.getClientsByRole();
  }

  createContact(values) {
    this.setState({ loading: true });
    axios
      .post(CONTACTS_CREATE, values, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        if (!res.data.error) {
          this.setState({
            success: true,
            loading: false,
            successMessage: res.data.message,
            errorMessage: "",
          });
          setTimeout(() => {
            this.props.history.goBack();
          }, 2000);
          this.getProfile();
          this.setDefaultState();
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
          loading: false,
          successMessage: "",
          errorMessage: errorMessage,
        });
        this.setDefaultState();
      });
  }

  editContact(values) {
    const { state } = this.props.location;
    if (state) {
      this.setState({ loading: true });
      axios
        .put(CONTACTS_EDIT + "/" + state.record._id, values, {
          headers: { Authorization: this.props.users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              successMessage: res.data.message,
              errorMessage: "",
            });
            setTimeout(() => {
              this.props.history.goBack();
            }, 2000);
            this.getProfile();
            this.setDefaultState();
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
            loading: false,
            successMessage: "",
            errorMessage: errorMessage,
          });
          this.setDefaultState();
        });
    }
  }

  getClientsByRole = () => {
    const params = {};
    if (this.props.role === "bdm") params.bdm_id = this.props.users.user._id;
    axios
      .post(COMPANY_NAMES, params, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({
          clientNames: res.data.data,
        });
      })
      .catch((error) => {});
  };

  getProfile = () => {
    const { state } = this.props.location;
    const user = state;
    if (user) {
      if (user) {
        this.setState({ loading: true });
        axios
          .get(CONTACTS + "/" + user.record._id, {
            headers: { Authorization: this.props.users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              this.setState(
                {
                  // success: true,
                  loading: false,
                  user: res.data.data[0],
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
    }
  };

  handleClientNameStateChange = (e) => {
    const selectedObj = this.state.clientNames.find(
      (item) => item.company_name == e
    );
    this.setState({
      selectedClient: selectedObj,
    });
  };

  setUserValues = () => {
    const user = this.state.user;
    this.formRef.current.setFieldsValue({
      profile_picture: user.profile_picture,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      mobile: user.mobile,
      phone: user.phone,
      email: user.email,
      alternative_email: user.alternative_email,
      role: user.assigned_role,
      status: user.status,
      company_name: user.company_id[0].company_name,
    });
    this.setState({ selectedClient: user.company_id[0] });
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

  onFinish = (values) => {
    const paramValues = {
      first_name: values.first_name,
      last_name: values.last_name,
      display_name: values.display_name,
      phone: values.phone,
      mobile: values.mobile,
      email: values.email,
      alternative_email: values.alternative_email,
      profile_picture: this.state.selectedImage,
      company_id: this.state.selectedClient._id,
      access: "public",
      fax: "",
      skype_id: "",
      twitter_id: "",
      contact_status: "active",
      category: "client",
      country: "United States",
      state: "",
      city: "",
      street_1: "",
      street_2: "",
      zip_code: "",
      description: "",
    };

    const { state } = this.props.location;
    if (state) {
      this.editContact(paramValues);
    } else {
      this.createContact(paramValues);
    }
  };

  render() {
    const { fileList } = this.state;
    const { state } = this.props.location;
    return (
      <Form
        id="AddContact"
        ref={this.formRef}
        layout="vertical"
        onFinish={this.onFinish}
      >
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
        <Card
          title={state ? "Edit Contact" : "Add Contact"}
          extra={
            <NavLink
              to={
                {
                  // pathname: "/contact/ContactList",
                }
              }
            >
              <Button
                onClick={() => this.props.history.goBack()}
                type="Secondary"
              >
                Back
              </Button>
            </NavLink>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                label="Company Name"
                name={"company_name"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Company Name.",
                  },
                ]}
              >
                {/* <Input dplaceholder="Company Name" /> */}
                <Select
                  onChange={this.handleClientNameStateChange}
                  // disabled={!creatingState}
                >
                  {this.state.clientNames.map((item, index) => {
                    return (
                      <option value={item.company_name} key={index.toString()}>
                        {item.company_name}
                      </option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
          </Row>
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
          </Row>
          <Row gutter={24}>
            <Col span={9}>
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
            <Col span={9}>
              <FormItem label="Alternate Email" name={"alternative_email"}>
                <Input placeholder="Alternate Email" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="Mobile"
                name={"mobile"}
                rules={[
                  {
                    required: true,
                    message: "Mobile is required.",
                  },
                ]}
              >
                <Input placeholder="Mobile" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Phone (Home)" name={"phone"}>
                <Input placeholder="Phone (Home)" />
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
const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(AddEditContact);
