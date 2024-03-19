/* eslint-disable no-lone-blocks */
import React, { Component } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Radio,
  Typography,
  Tooltip,
  Drawer,
  Button,
  Popconfirm,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DiffOutlined,
} from "@ant-design/icons";
import {
  CANDIDATE_QUALIFICATION_DETAILS,
  CANDIDATE_QUALIFICATION_DETAILS_EDIT,
  CANDIDATE_QUALIFICATION_REGISTER,
} from "../../../../ApiUrl";
import { EducationList, Courses } from "../../constant/constant";
import axios from "axios";
import { store } from "../../../../redux";
import { showError } from "../../utils/helpers";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

export default class Education extends Component {
  formRef = React.createRef();
  // export default  function Education(userProfile) {

  state = {
    visible: false,
    courseType: "",
    selectedqualification: -1,
  };

  showDrawer = (position) => {
    this.setState(
      {
        visible: true,
        selectedqualification: position,
      },
      function() {
        this.setUserValues();
      }
    );
  };

  onClose = () => {
    this.setState(
      {
        visible: false,
        selectedqualification: -1,
      },
      function() {
        this.setUserValues();
      }
    );
  };

  onChange = (e) => {
    this.setState({
      courseType: e.target.value,
    });
  };

  deleteItem = (position) => {
    const qualification = this.props.userProfile.data[0]
      .candidate_qualifications[position];
    const url = CANDIDATE_QUALIFICATION_DETAILS + "/" + qualification._id;

    if (position != -1) {
      axios
        .delete(url, {
          data: { candidate_id: this.props.userProfile.data[0]._id },
          headers: { Authorization: store.getState().users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              selectedqualification: -1,
            });
            this.props.onclick();
          }
        })
        .catch((error) => {});
    }
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
    let url = CANDIDATE_QUALIFICATION_REGISTER;
    if (this.state.selectedqualification !== -1) {
      const qualifications = this.props.userProfile.data[0]
        .candidate_qualifications[this.state.selectedqualification];

      values._id = qualifications._id;

      url =
        CANDIDATE_QUALIFICATION_DETAILS_EDIT +
        "/" +
        store.getState().users.user._id;
    }

    values.course = values.course.toString();
    values.qualification = values.qualification.toString();
    values.specialization = "Specialization";
    values.candidate_id = store.getState().users.user._id;

    const newValues = {
      id: store.getState().users.user._id,
      qualification_details: [values],
    };
    this.state.selectedqualification === -1
      ? axios
          .post(url, newValues, {
            headers: { Authorization: store.getState().users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              this.setState({
                success: true,
                loading: false,
                visible: false,
                error: false,
                selectedqualification: -1,
                successMessage: res.data.message,
                errorMessage: "",
              });
              setTimeout(() => {
                this.setState({
                  selectedqualification: -1,
                });
                this.props.onclick();
              }, 3000);
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
          })
      : axios
          .put(url, newValues, {
            headers: { Authorization: store.getState().users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              this.setState({
                success: true,
                loading: false,
                visible: false,
                error: false,
                selectedqualification: -1,
                successMessage: res.data.message,
                errorMessage: "",
              });
              setTimeout(() => {
                this.setState({
                  selectedqualification: -1,
                });
                this.props.onclick();
              }, 3000);
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

  setUserValues = () => {
    const qualification = this.props.userProfile.data[0]
      .candidate_qualifications[this.state.selectedqualification];

    if (qualification) {
      this.formRef.current.setFieldsValue({
        qualification: qualification
          ? parseInt(qualification.qualification)
          : "",
        course: qualification ? parseInt(qualification.course) : "",
        university: qualification ? qualification.university : "",
        course_type: qualification ? qualification.course_type : "",
        passing_year: qualification ? qualification.passing_year : "",
      });
    } else {
      this.formRef.current.setFieldsValue({
        qualification: "",
        course: "",
        university: "",
        course_type: "",
        passing_year: "",
        qualification: "",
      });
    }
  };

  editModal = () => {
    return (
      <Drawer
        title="Edit Educational Details"
        width={620}
        onClose={this.onClose}
        visible={this.state.visible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={() => this.onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editEducation"
              htmlType="submit"
              key="submit"
              onClick={() => this.onClose}
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          ref={this.formRef}
          id="editEducation"
          layout="vertical"
          onFinish={this.onFinish}
        >
          <Card>
            <Col span={16}>
              <FormItem label="Education" name={"qualification"}>
                <Select>
                  <Option value={""}>{"Select"}</Option>
                  {EducationList.map((item, index) => {
                    return (
                      <Option value={item.value} key={index}>
                        {item.label}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>

            <Col span={16}>
              <FormItem label="Course" name={"course"}>
                <Select>
                  <Option value={""}>{"Select"}</Option>
                  {Courses.map((item, index) => {
                    return (
                      <Option value={item.value} key={index}>
                        {item.label}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="University/Institute"
                name={"university"}
                rules={[
                  {
                    required: true,
                    message: "Your University/Institute is required.",
                  },
                ]}
              >
                <Input placeholder="University Institute" />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label="Course Type"
                name={"course_type"}
                rules={[
                  {
                    required: true,
                    message: "Please select Course Type.",
                  },
                ]}
              >
                <Radio.Group onChange={this.onChange}>
                  <Radio value={"fullTime"}>Full Time</Radio>
                  <Radio value={"partTime"}>Part Time</Radio>
                  <Radio value={"distanceLearning"}>
                    Correspondence/Distance learning
                  </Radio>
                </Radio.Group>
              </FormItem>
            </Col>

            <Col span={16}>
              <FormItem
                label="Passing out Year"
                name={"passing_year"}
                rules={[
                  {
                    required: true,
                    message: "Passing Year is required.",
                  },
                ]}
              >
                <Input placeholder="Passing Year" />
              </FormItem>
            </Col>
          </Card>
        </Form>
      </Drawer>
    );
  };

  qualificationsdata = () => {
    const qualifications = this.props.userProfile.data[0]
      .candidate_qualifications;

    return qualifications.map((qualification, index) => {
      const course = Courses.find((item) => {
        return parseInt(item.value) === parseInt(qualification.course);
      });
      return (
        <Row key={index} gutter={24} className="mb-5">
          <Col span={24} className="mb-10">
            <Title level={5} className="mb-0">
              {course ? course.label : ""}
              <Tooltip className="ml-3" placement="top" title="Edit Details">
                
                <EditOutlined
                  style={{ fontSize: "15px", color: "#372727" }}
                  onClick={() => this.showDrawer(index)}
                />
              </Tooltip>
              <Tooltip className="ml-3" placement="top" title="Delete">
                
                <Popconfirm
                  title="Are you sure you want to delete？"
                  onConfirm={() => this.deleteItem(index)}
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                >
                  <DeleteOutlined />
                </Popconfirm>
              </Tooltip>
            </Title>

            <Text type="secondary">{qualification.university}</Text>
            <br />
            <Text type="secondary">
              {qualification.passing_year} ({qualification.course_type})
            </Text>
            <br />
          </Col>
        </Row>
      );
    });
  };

  render() {
    return (
      <Card
        title="Education"
        extra={
          <Tooltip placement="top" title="Add Your Education Details">
            
            <DiffOutlined
              style={{ fontSize: "20px", color: "#372727" }}
              onClick={() => this.showDrawer(-1)}
            />
          </Tooltip>
        }
      >
        {!this.props.userProfile.data ? (
          <Empty />
        ) : this.props.userProfile.data[0].candidate_qualifications.length <=
          0 ? (
          <Empty />
        ) : null}
        {this.props.userProfile.data
          ? this.qualificationsdata(
              this.props.userProfile.data[0].candidate_qualifications
            )
          : null}
        {this.editModal()}
        {showError(
          this.state.success,
          this.state.successMessage,
          this.state.error,
          this.state.errorMessage
        )}
      </Card>
    );
  }
}
