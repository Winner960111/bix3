import React, { Component } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Select,
  Tag,
  Tooltip,
  Button,
} from "antd";
import axios from "axios";
import {
  COMPANY_DETAIL,
  COMPANY_PROFILE_UPDAT,
  US_STATE_LIST,
  US_CITY_LIST,
  CONTACTS_EDIT,
} from "../../../ApiUrl";
import { connect } from "react-redux";
import { PlusOutlined } from "@ant-design/icons";
import { employeeStrength } from "../constant/constant";
import { setUser } from "../../../redux/actions/users";
import { store } from "../../../redux";
import { showError } from "../utils/helpers";

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

class CompanyProfile extends Component {
  formRef = React.createRef();
  formRefContact = React.createRef();

  state = {
    clientres: "",
    tags: ["Service1"],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
    categoryList: [],
    stateList: [],
    cityList: [],
    selectedState: "",
    successMessage: "",
    errorMessage: "",
  };

  componentDidMount() {
    this.getStatesList();
    this.getClient();
  }

  getStatesList = () => {
    axios
      .get(US_STATE_LIST, {})
      .then((res) => {
        this.setState({
          stateList: res.data.data,
        });
      })
      .catch((error) => {
      });
  };

  getCityList = (stateId) => {
    axios
      .post(
        US_CITY_LIST,
        { state_id: stateId },
        {
          // headers: { Authorization: users.token },
        }
      )
      .then((res) => {
        this.setState({ cityList: res.data.data }, function () {
          this.setCityValues();
        });
      })
      .catch((error) => {
      });
  };
  handleStateChange = (stateCode) => {
    this.setState(
      {
        selectedState: stateCode,
      },
      function () {
        this.getCityList(this.state.selectedState);
      }
    );
  };

  getClient = () => {
    const user = this.props.users.user;
    axios
      .post(
        COMPANY_DETAIL,
        {
          company_id: user._id,
          contact_id:
            user.contact_person_details !== undefined
              ? user.contact_person_details._id
              : "",
        },
        {
          headers: {
            Authorization: this.props.token,
          },
        }
      )
      .then((res) => {
        let user = res.data.data.user_detail;
        if (res.data.data.contact_person_details) {
          user.contact_person_details = res.data.data.contact_person_details;
        }
        this.setState({ clientres: user }, function () {
          this.setUserValues();
        });
      })
      .catch((error) => {
      });
  };

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    this.setState({ tags });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;

    if (tags === undefined) {
      tags = [];
    }
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: "",
    });
  };

  handleEditInputChange = (e) => {
    this.setState({ editInputValue: e.target.value });
  };

  handleEditInputConfirm = () => {
    this.setState(({ tags, editInputIndex, editInputValue }) => {
      const newTags = [...tags];
      newTags[editInputIndex] = editInputValue;
      return {
        tags: newTags,
        editInputIndex: -1,
        editInputValue: "",
      };
    });
  };

  saveInputRef = (input) => {
    this.input = input;
  };

  saveEditInputRef = (input) => {
    this.editInput = input;
  };

  saveCompanyProfile = (values) => {
    const company = this.state.clientres;

    values.product_services = this.state.tags;
    values.category = company.category;
    values.company_code = company.company_code;
    values.status = company.status;
    this.setState({ loading: true });

    axios
      .put(COMPANY_PROFILE_UPDAT + "/" + this.props.users.user._id, values, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          this.setState({
            success: true,
            error: false,
            loading: false,
            successMessage: "Profile updated successfully",
          });
          this.getClient();
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

  setUserValues = () => {
    const company = this.state.clientres;
    this.props.setUser(company);
    if (company) {
      this.formRef.current.setFieldsValue({
        company_name: company.company_name,
        // industry_type: company.industry_type,
        industry_type: company
          ? company.industry_type.length > 0
            ? company.industry_type[0].code
            : ""
          : "",
        employee_strength: company.employee_strength,
        product_services: company.product_services,
        website: company.website,
        description: company.description,
        email_1: company.email_1,
        email_2: company.email_2,
        phone_number_1: company.phone_number_1,
        phone_number_2: company.phone_number_2,
        country: "1", //company.country,
        state: company.state.length > 0 ? company.state[0].code : "",
        city: company.city.length > 0 ? company.city[0].code : "",
        zip_code: company.zip_code,
        category: company.category,
        company_code: company.company_code,
      });
      this.setState(
        {
          tags: company.product_services,
          selectedState: company.state,
        },
        function () {
          this.getCityList(
            company.state.length > 0 ? company.state[0].code : ""
          );
        }
      );
    }
  };

  setCityValues = () => {
    const company = this.state.clientres[0];
    if (company) {
      this.formRef.current.setFieldsValue({
        city: company.city.length > 0 ? parseInt(company.city[0].code) : "",
      });
    }
  };
  // contact_person_details

  saveContactDetails = (values) => {
    const paramValues = {
      first_name: values.first_name,
      last_name: values.last_name,
      display_name: values.display_name,
      phone: values.phone,
      mobile: values.mobile,
      email: values.email,
      alternative_email: values.alternative_email,
      profile_picture: this.state.selectedImage,
      company_id: this.props.users.user._id,
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
    this.editContact(paramValues);
  };

  editContact(values) {
    this.setState({ loading: true });
    axios
      .put(
        CONTACTS_EDIT + "/" + this.props.users.user.contact_person_details._id,
        values,
        {
          headers: { Authorization: this.props.users.token },
        }
      )
      .then((res) => {
        if (!res.data.error) {
          this.setState({
            success: true,
            loading: false,
            successMessage: res.data.message,
            errorMessage: "",
          });
          this.getClient();
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

  setContactValues = (contact_person_details) => {
    if (this.formRefContact && contact_person_details) {
      this.formRefContact.current.setFieldsValue({
        profile_picture: contact_person_details.profile_picture,
        display_name: contact_person_details.display_name,
        first_name: contact_person_details.first_name,
        last_name: contact_person_details.last_name,
        mobile: contact_person_details.mobile,
        phone: contact_person_details.phone,
        email: contact_person_details.email,
        alternative_email: contact_person_details.alternative_email,
        role: contact_person_details.assigned_role,
        status: contact_person_details.status,
      });
    }
  };

  contactProfile = () => {
    const form = (
      <Form
        id=" ContactProfile"
        ref={this.formRefContact}
        layout="vertical"
        onFinish={this.saveContactDetails}
      >
        <Card title={"Contact Profile"}>
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
              <FormItem label="Alternate Email" name={"alternative_email"}>
                <Input placeholder="Alternate Email" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Password" name={""}>
                <Input disabled={true} placeholder="bluebix#123" />
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

    if (
      this.props.users.user.contact_person_details &&
      this.formRefContact.current
    ) {
      this.setContactValues(this.props.users.user.contact_person_details);
    }
    return form;
  };

  render() {
    const {
      clientres,
      tags,
      inputVisible,
      inputValue,
      editInputIndex,
      editInputValue,
      success,
      successMessage,
      error,
      errorMessage,
    } = this.state;

    const categoryList = this.props.common.category;

    const layout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
    };

    const isCompanyProfileEditable =
      this.props.users.user.contact_person_details === undefined ? false : true;

    return (
      <div>
        <Form ref={this.formRef} onFinish={this.saveCompanyProfile} {...layout}>
          {showError(success, successMessage, error, errorMessage)}
          <Row>
            <Col span={24}>
              <Row gutter={24}>
                <Col span={12}>
                  <div className="card card-custom">
                    <div className="card-header py-3">
                      <div className="card-title align-items-start flex-column">
                        <h3 className="card-label font-weight-bolder text-dark">
                          General Information
                        </h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <FormItem
                        label="Company Name"
                        name={"company_name"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Company Name",
                          },
                        ]}
                      >
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Company Name"
                        />
                      </FormItem>

                      <FormItem
                        label="Industry"
                        name={"industry_type"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Industry Type",
                          },
                        ]}
                      >
                        <Select disabled={isCompanyProfileEditable}>
                          {categoryList.map((industry, index) => {
                            return (
                              <Option
                                value={industry.code}
                                key={index.toString()}
                              >
                                {industry.name.charAt(0).toUpperCase() +
                                  industry.name.slice(1)}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>

                      <FormItem
                        label="Employees Strength"
                        name={"employee_strength"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Employees Strength",
                          },
                        ]}
                      >
                        <Select disabled={isCompanyProfileEditable}>
                          {employeeStrength.map((employeeStrength, index) => {
                            return (
                              <Option
                                key={index.toString()}
                                value={employeeStrength.value}
                              >
                                {employeeStrength.label}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                      <FormItem
                        label="Description"
                        name={"description"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter description",
                          },
                        ]}
                      >
                        {/*<Input placeholder="Description"/>*/}
                        <TextArea
                          disabled={isCompanyProfileEditable}
                          placeholder="Description"
                          rows={8}
                        />
                      </FormItem>

                      <div className="form-group row">
                        <label className="col-lg-5 col-form-label text-right p-0">
                          Products/ Services :
                        </label>
                        <div className="col-lg-6">
                          <div className="d-flex align-center flex-wrap">
                            {tags &&
                              tags.map((tag, index) => {
                                if (editInputIndex === index) {
                                  return (
                                    <Input
                                      ref={this.saveEditInputRef}
                                      key={tag}
                                      size="small"
                                      className="tag-input"
                                      value={editInputValue}
                                      onChange={this.handleEditInputChange}
                                      onBlur={this.handleEditInputConfirm}
                                      onPressEnter={this.handleEditInputConfirm}
                                    />
                                  );
                                }

                                const isLongTag = tag.length > 20;

                                const tagElem = (
                                  <Tag
                                    className="edit-tag"
                                    key={tag}
                                    closable={index !== 0}
                                    onClose={() => this.handleClose(tag)}
                                  >
                                    <span
                                      onDoubleClick={(e) => {
                                        if (index !== 0) {
                                          this.setState(
                                            {
                                              editInputIndex: index,
                                              editInputValue: tag,
                                            },
                                            () => {
                                              this.editInput.focus();
                                            }
                                          );
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      {isLongTag
                                        ? `${tag.slice(0, 20)}...`
                                        : tag}
                                    </span>
                                  </Tag>
                                );
                                return isLongTag ? (
                                  <Tooltip title={tag} key={tag}>
                                    {tagElem}
                                  </Tooltip>
                                ) : (
                                  tagElem
                                );
                              })}
                            {inputVisible && (
                              <Input
                                ref={this.saveInputRef}
                                type="text"
                                size="small"
                                className="tag-input"
                                value={inputValue}
                                onChange={this.handleInputChange}
                                onBlur={this.handleInputConfirm}
                                onPressEnter={this.handleInputConfirm}
                                disabled={isCompanyProfileEditable}
                              />
                            )}
                            {!inputVisible && (
                              <Tag
                                className="site-tag-plus d-flex align-items-center"
                                onClick={this.showInput}
                              >
                                <PlusOutlined /> New Tag
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>

                      <FormItem
                        label="Website"
                        name={"website"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter website",
                          },
                        ]}
                      >
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Website"
                        />
                      </FormItem>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="card card-custom">
                    <div className="card-header py-3">
                      <div className="card-title align-items-start flex-column">
                        <h3 className="card-label font-weight-bolder text-dark">
                          Contact Information
                        </h3>
                      </div>
                    </div>
                    <div className="card-body">
                      <FormItem
                        label="Email "
                        name={"email_1"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter email",
                          },
                        ]}
                      >
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Email"
                        />
                      </FormItem>
                      <FormItem label="Email 2" name={"email_2"}>
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Email 2"
                        />
                      </FormItem>
                      <FormItem
                        label="Phone number"
                        name={"phone_number_1"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter phone number 1",
                          },
                        ]}
                      >
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Phone number"
                        />
                      </FormItem>

                      <FormItem label="Phone number 2" name={"phone_number_2"}>
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Phone number 2"
                        />
                      </FormItem>
                      <FormItem
                        label="Country"
                        name={"country"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Country",
                          },
                        ]}
                      >
                        <Select disabled={isCompanyProfileEditable}>
                          <Option selected="selected" value="1">                            
                            United States
                          </Option>
                        </Select>
                      </FormItem>
                      <FormItem
                        label="State"
                        name={"state"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter state",
                          },
                        ]}
                      >
                        <Select
                          disabled={isCompanyProfileEditable}
                          onChange={this.handleStateChange}
                        >
                          {this.state.stateList.map((state, index) => {
                            return (
                              <Option value={state.code} key={index.toString()}>
                                {state.state}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                      <FormItem
                        label="City"
                        name={"city"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter City",
                          },
                        ]}
                      >
                        <Select disabled={isCompanyProfileEditable}>
                          {this.state.cityList.map((city, index) => {
                            return (
                              <Option value={city.code} key={index.toString()}>
                                {city.city}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                      <FormItem
                        label="Zip Code"
                        name={"zip_code"}
                        rules={[
                          {
                            required: true,
                            message: "Please Enter Zip Code",
                          },
                        ]}
                      >
                        <Input
                          disabled={isCompanyProfileEditable}
                          placeholder="Zip Code"
                        />
                      </FormItem>
                    </div>
                  </div>
                </Col>
              </Row>
              {isCompanyProfileEditable === false ? (
                <Row className={"mt-5"} gutter={24}>
                  <Col span={24}>
                    <div className="card card-custom">
                      <div className="card-body text-right">
                        <button
                          disabled={isCompanyProfileEditable}
                          className="btn btn-primary"
                        >                          
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </Col>
                </Row>
              ) : null}
            </Col>
          </Row>
        </Form>
        <Col className={"mt-5"} span={24}>
          {isCompanyProfileEditable === true ? this.contactProfile() : null}
        </Col>
      </div>
    );
  }
}

// Map Redux state to React component props
const mapStateToProps = (state) => {
  return {
    token: state.users.token,
    role: state.users.role,
    users: state.users,
    common: state.common,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setUser: (data) => {
    dispatch(setUser(data));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CompanyProfile);
