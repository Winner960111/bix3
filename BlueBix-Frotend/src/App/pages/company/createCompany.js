/* eslint-disable no-lone-blocks */
import React, { Component } from "react";
import axios from "axios";
import { US_STATE_LIST, US_CITY_LIST, JOB_BDM_LIST } from "../../../ApiUrl";
import { Form, Input, Row, Col, Card, Select, Button, Switch } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { showError } from "../utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

import { employeeStrength } from "../../pages/constant/constant";
import {
  registerCompany,
  registerCompanyByUser,
} from "../../modules/Auth/_redux/authCrud";

const industries = [
  {
    value: "AFI",
    name: "Accounting/Finance/Insurance",
  },
  {
    value: "ACL",
    name: "Administrative/Clerical",
  },
  {
    value: "Ar85424",
    name: "Architectural &amp; Planning",
  },
  {
    value: "Au85425",
    name: "Automation",
  },
  {
    value: "BRM",
    name: "Banking/Real Estate/Mortgage Professionals",
  },
  {
    value: "Bi85435",
    name: "Biotechnology",
  },
  {
    value: "Bu85434",
    name: "Building Envelope/Materials",
  },
  {
    value: "BSM",
    name: "Business/Strategic Management",
  },
  {
    value: "EN",
    name: "Civil Engineering",
  },
  {
    value: "BST",
    name: "Construction",
  },
  {
    value: "CDN",
    name: "Creative/Design",
  },
  {
    value: "CSC",
    name: "Customer Support/Client Care",
  },
  {
    value: "EW",
    name: "Editorial/Writing",
  },
  {
    value: "ET",
    name: "Education/Training",
  },
  {
    value: "El85432",
    name: "Electrical &amp; Electronics Manufacturing",
  },
  {
    value: "Fa85428",
    name: "Farming",
  },
  {
    value: "Fo85433",
    name: "Food Processing/ Food Beverages",
  },
  {
    value: "FH",
    name: "Food Production",
  },
  {
    value: "hr",
    name: "Human Resources",
  },
  {
    value: "In85420",
    name: "Industrial",
  },
  {
    value: "it",
    name: "Information Technology",
  },
  {
    value: "IMP",
    name: "Installation/Maintenance/Repair",
  },
  {
    value: "L",
    name: "Legal",
  },
  {
    value: "LT",
    name: "Logistics/Transportation",
  },
  {
    value: "Ma85429",
    name: "Machinery",
  },
  {
    value: "MPO",
    name: "Manufacturing",
  },
  {
    value: "MP",
    name: "Marketing/Product",
  },
  {
    value: "Me85426",
    name: "Mechanical/Industrial Engineering",
  },
  {
    value: "MH",
    name: "Medical Devices",
  },
  {
    value: "Mi85430",
    name: "Mining &amp; Metals",
  },
  {
    value: "Oi85423",
    name: "Oil &amp; Energy",
  },
  {
    value: "Ga85422",
    name: "Oil &amp; Gas",
  },
  {
    value: "O",
    name: "Others",
  },
  {
    value: "Ph85421",
    name: "Pharmaceuticals",
  },
  {
    value: "Pl85427",
    name: "Plastic",
  },
  {
    value: "PPM",
    name: "Project/Program Management",
  },
  {
    value: "QS",
    name: "Quality Assurance/Safety",
  },
  {
    value: "R",
    name: "Research",
  },
  {
    value: "SRB",
    name: "Sales/Retail/Business Development",
  },
  {
    value: "SP",
    name: "Security/Protective Services",
  },
  {
    value: "Ut85431",
    name: "Utility Infrastructure",
  },
];

class createCompany extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      current_page: 1,
      pageSize: 10,
      totalPages: 50,

      allStates: [],
      allCities: [],

      success: false,
      error: false,
      loading: false,
      successMessage: "",
      errorMessage: "",
      fileList: [],
      selectedImage: "",

      allbdms: [],
      selectedBDM: [],
      isCityEnable: true,
      is_email_send: false,
    };
  }

  getStatesList = () => {
    axios
      .get(US_STATE_LIST, {
        // headers: { Authorization: users.token },
      })
      .then((res) => {
        this.setState({ allStates: res.data.data });
      })
      .catch((error) => {});
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
        this.setState({ allCities: res.data.data });
      })
      .catch((error) => {});
  };

  getAllBDMList = () => {
    axios
      .get(JOB_BDM_LIST, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {
        this.setState({ allbdms: res.data.data });
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
    }, 3000);
  };

  componentDidMount() {
    this.getStatesList();
    this.getAllBDMList();
  }

  render() {
    // const { fileList } = this.state;
    // const propsUpload = {
    //     onRemove: (file) => {
    //         this.setState((state) => {
    //             const index = state.fileList.indexOf(file);
    //             const newFileList = state.fileList.slice();
    //             newFileList.splice(index, 1);
    //             return {
    //                 fileList: newFileList,
    //             };
    //         });
    //     },
    //     beforeUpload: (file) => {
    //         this.setState((state) => ({
    //             fileList: [...state.fileList, file],
    //         }));

    //         let idCardBase64 = "";
    //         getBase64(file, (result) => {
    //             idCardBase64 = result;
    //             this.setState({
    //                 selectedImage: result,
    //             });
    //         });
    //         return false;
    //     },
    //     fileList,
    // };

    const handleStateChange = (code) => {
      if (code === 3980) {
        this.setState({ isCityEnable: false });
        this.formRef.current.setFieldsValue({
          city: "",
          street: "",
          zip_code: "",
        });
      } else {
        this.getCityList(code);
        this.setState({ isCityEnable: true });
      }
    };

    const handleBDMChange = (value) => {
      this.setState({ selectedBDM: value });
    };

    const onFinish = (values) => {
      console.log(values);
      const role = "company";
      const profile = role;
      const status = "Active";
      const category = "client";

      // values.profile_picture = this.state.selectedImage
      //     ? this.state.selectedImage
      //     : values.profile_picture;

      values.profile = profile;
      const password = Math.random()
        .toString(16)
        .substring(2, 10);

      const params = [
        values.company_name,
        (values.company_code = values.company_name.replace(/ /g, "")),
        values.contact_person_name,
        "",
        values.company_website,
        values.contact_number,
        values.password ? values.password : password,
        values.confirm_password ? values.confirm_password : password,
        values.acceptTerms,
        role,
        profile,
        status,
        category,
        values.phone_number_1,
        values.phone_number_2,
        values.country,
        values.state_name,
        values.city,
        values.street,
        values.zip_code,
        values.fax,
        values.email_1,
        values.email_2,
        values.employee_strength,
        values.industry_type,
        values.product_services,
        this.props.role === "admin"
          ? this.state.selectedBDM || this.props.users.user._id
          : this.props.users.user._id,
        values.is_email_send,
      ];

      const result = new Promise((resolve) => {
        if (this.props.role === "company") resolve(registerCompany(...params));
        else resolve(registerCompanyByUser(...params, this.props.token));
      });

      result
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: "Client Added successfully",
              errorMessage: "",
            });
            setTimeout(() => {
              this.setDefaultState();
              this.props.history.push(`/${this.props.role}/ClientsList`);
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
          });
          this.setDefaultState();
        });
    };

    return (
      <Form
        ref={this.formRef}
        id="addEditCompany"
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
          title="Client Information"
          extra={
            <NavLink
              to={{
                pathname: `/${this.props.role}/ClientsList`,
              }}
            >
              <Button type="Secondary"> Back</Button>
            </NavLink>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <FormItem
                label="Company name"
                name={"company_name"}
                rules={[
                  {
                    required: true,
                    message: "Company name is required.",
                  },
                ]}
              >
                <Input placeholder="Company name" />
              </FormItem>
            </Col>

            {/* <Col span={8}>
                            <FormItem
                                label="Contact Person name"
                                name={"contact_person_name"}
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: "Contact Person name is required.",
                            //     },
                            // ]}
                            >
                                <Input placeholder="Contact person name" />
                            </FormItem>
                        </Col> */}

            <Col span={12}>
              <FormItem
                label="Company Website"
                name={"company_website"}
                rules={[
                  {
                    required: true,
                    message: "Company website is required.",
                  },
                  {
                    type: "url",
                    message: "This field must be a valid url.",
                  },
                ]}
              >
                <Input placeholder="Company Website" />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                label="Select Industry Type"
                name={"industry_type"}
                rules={[
                  {
                    required: true,
                    message: "Industry Type is required.",
                  },
                ]}
              >
                <Select>
                  {industries.map((industry, index) => {
                    return (
                      <option value={industry.value} key={index.toString()}>
                        {industry.name}
                      </option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                label="Select Employee Strength"
                name={"employee_strength"}
                rules={[
                  {
                    required: true,
                    message: "Employee Strength is required.",
                  },
                ]}
              >
                <Select>
                  {employeeStrength.map((employeeStrength, index) => {
                    return (
                      <option value={employeeStrength.value} key={index}>
                        {employeeStrength.label}
                      </option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>

            {/* <Col span={6}>
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
                        </Col> */}

            <Col span={8}>
              <FormItem
                label="Login Email"
                name={"email_1"}
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Email Address is required.",
                  },
                ]}
              >
                <Input placeholder="Login Email" />
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                label="Alternate Email"
                name={"email_2"}
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                ]}
              >
                <Input placeholder="Alternate Email" />
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                label="Select Country"
                name={"country"}
                rules={[{ required: true, message: "Country is Required" }]}
              >
                <Select>
                  <option value={"United States"} key={"#key"}>
                    United States
                  </option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="Select State"
                name={"state_name"}
                rules={[
                  {
                    required: true,
                    message: "State is required.",
                  },
                ]}
              >
                <Select onChange={handleStateChange}>
                  {this.state.allStates
                    ? this.state.allStates.map((elm, index) => {
                        return (
                          <option value={elm.code} key={index}>
                            {elm.state}
                          </option>
                        );
                      })
                    : ""}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Select City"
                name={"city"}
                rules={[
                  {
                    required: this.state.isCityEnable,
                    message: "City is required.",
                  },
                ]}
              >
                <Select disabled={!this.state.isCityEnable}>
                  {this.state.allCities
                    ? this.state.allCities.map((elm, index) => {
                        return (
                          <option value={elm.code} key={index}>
                            {elm.city}
                          </option>
                        );
                      })
                    : ""}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Street"
                name={"street"}
                rules={[
                  {
                    required: this.state.isCityEnable,
                    message: "Street is required.",
                  },
                ]}
              >
                <Input
                  placeholder="Street"
                  disabled={!this.state.isCityEnable}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Zip Code"
                name={"zip_code"}
                rules={[
                  {
                    required: this.state.isCityEnable,
                    message: "Zipcode Number is required.",
                  },
                ]}
              >
                <Input
                  placeholder="Zip Code"
                  disabled={!this.state.isCityEnable}
                />
              </FormItem>
            </Col>
            {/* <Col span={6}>
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
                        </Col> */}

            {/* <Col span={12}>
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
                        </Col> */}
          </Row>
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="Phone Number"
                name={"phone_number_1"}
                rules={[
                  {
                    required: true,
                    message: "Phone Number is required.",
                  },
                ]}
              >
                <Input placeholder="Phone Number" />
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem label="Alternate Phone" name={"phone_number_2"}>
                <Input placeholder="Alternate Phone" />
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem label="Fax" name={"fax"}>
                <Input placeholder="Fax" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={"Email Send"}
                name="is_email_send"
                className="d-flex align-items-center"
              >
                <Switch
                  className="ml-7"
                  onChange={(checked) =>
                    this.setState({ is_email_send: checked })
                  }
                ></Switch>
              </FormItem>
            </Col>
          </Row>

          {/* <Row gutter={24} className="mt-2">
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
                    </Row> */}
        </Card>
        <br />

        {this.props.role === "admin" ? (
          <Card title="Assign Client to BDM">
            <Col span={6}>
              <label for="by_source" className="" title="Status">
                BDM :
              </label>
              <br />
              <Select
                mode="multiple"
                value={this.state.selectedBDM}
                onChange={handleBDMChange}
                style={{ width: "100%" }}
              >
                {this.state.allbdms
                  ? this.state.allbdms.map((user, index) => {
                      return (
                        <Option value={user._id} key={index.toString()}>
                          {user.display_name.charAt(0).toUpperCase() +
                            user.display_name.slice(1)}
                        </Option>
                      );
                    })
                  : null}
              </Select>
            </Col>
          </Card>
        ) : (
          ""
        )}

        <Card>
          <Row gutter={24}>
            <Col span={24}>
              {this.state.loading ? (
                <Button type="primary" size="large" loading>
                  Saving . .
                </Button>
              ) : (
                <Button type="primary" size="large" htmlType="submit">
                  Save Client
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
    users: state.users,
    role: state.users.role,
  };
};

export default connect(mapStateToProps)(createCompany);
