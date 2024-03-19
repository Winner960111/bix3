import React, { Component } from "react";
import axios from "axios";
import {
  SUBSCRIPTION_PLAN_LIST,
  SUBSCRIPTION_PLAN_CREATE,
} from "../../../ApiUrl";
import { Form, Input, Row, Col, Card, Button, InputNumber } from "antd";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { showError } from "../../pages/utils/helpers";

const FormItem = Form.Item;

class AddSubscription extends Component {
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
    };
  }

  componentDidMount() {
    this.getSubscriptions();
  }

  createSubscription(values) {
    this.setState({ loading: true });
    axios
      .post(SUBSCRIPTION_PLAN_CREATE, values, {
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
          this.setDefaultState();
        }
      })
      .catch((error) => {
        if (error.response) {
          let errorMessage = "";
          // eslint-disable-next-line no-lone-blocks
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
        } else {
          this.setState({
            loading: false,
          });
        }
        this.setDefaultState();
      });
  }

  editSubscription(values) {
    const { state } = this.props.location;
    if (state) {
      this.setState({ loading: true });
      axios
        .put(SUBSCRIPTION_PLAN_LIST + "/" + state.record._id, values, {
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
            this.setDefaultState();
          }
        })
        .catch((error) => {
          // if (error.response.data) {
          //     let errorMessage = ''
          //     {
          //         Object.entries(error.response.data.errors).map(([key, value]) => {
          //             return errorMessage += value + ", "
          //         })
          //     }
          //     this.setState({
          //         error: true,
          //         loading: false,
          //         successMessage: '',
          //         errorMessage: errorMessage,
          //     });
          // }
          this.setDefaultState();
        });
    }
  }

  getSubscriptions = () => {
    const { state } = this.props.location;
    const plan = state;
    if (plan) {
      this.setState({ loading: true });
      axios
        .get(SUBSCRIPTION_PLAN_LIST + "/" + plan.record._id, {
          headers: { Authorization: this.props.token },
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
    const plan = this.state.user;
    this.formRef.current.setFieldsValue({
      plan_name: plan.plan_name,
      candidate_view_limit: plan.candidate_view_limit,
      email_limit: plan.email_limit,
      job_opening_limit: plan.job_opening_limit,
      plan_price: plan.plan_price,
      plan_duration: plan.plan_duration,
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

  onFinish = (values) => {
    const paramValues = {
      plan_name: values.plan_name,
      candidate_view_limit: values.candidate_view_limit.toString(),
      email_limit: values.email_limit.toString(),
      job_opening_limit: values.job_opening_limit.toString(),
      plan_price: values.plan_price.toString(),
      plan_duration: values.plan_duration.toString(),
    };
    const { state } = this.props.location;
    if (state) {
      this.editSubscription(paramValues);
    } else {
      this.createSubscription(paramValues);
    }
  };

  render() {
    const { state } = this.props.location;
    return (
      <Form
        id="AddSubscription"
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
          title={state ? "Edit Subscription" : "Add Subscription"}
          extra={
            <NavLink
              to={
                {
                  // pathname: "/subscription/SubscriptionList",
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
            <Col span={6}>
              <FormItem
                label="Plan name"
                name={"plan_name"}
                rules={[
                  {
                    required: true,
                    message: "Plan name is required.",
                  },
                ]}
              >
                <Input placeholder="Plan name" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Candidate View Limit"
                name={"candidate_view_limit"}
                rules={[
                  {
                    required: true,
                    message: "Candidate View Limit is required.",
                  },
                ]}
              >
                <InputNumber
                  className={"w-100"}
                  placeholder="Candidate View Limit"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Email limit"
                name={"email_limit"}
                rules={[
                  {
                    required: true,
                    message: "Email limit is required.",
                  },
                ]}
              >
                <InputNumber className={"w-100"} placeholder="Email limit" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="job opening limit"
                name={"job_opening_limit"}
                rules={[
                  {
                    required: true,
                    message: "job opening limit is required.",
                  },
                ]}
              >
                <InputNumber
                  className={"w-100"}
                  placeholder="job opening limit"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Plan price"
                name={"plan_price"}
                rules={[
                  {
                    required: true,
                    message: "Plan price is required.",
                  },
                ]}
              >
                <InputNumber className={"w-100"} placeholder="Plan price" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Plan duration (Months)"
                name={"plan_duration"}
                rules={[
                  {
                    required: true,
                    message: "Plan duration is required.",
                  },
                ]}
              >
                <InputNumber className={"w-100"} placeholder="Plan duration" />
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
export default connect(mapStateToProps, mapDispatchToProps)(AddSubscription);
