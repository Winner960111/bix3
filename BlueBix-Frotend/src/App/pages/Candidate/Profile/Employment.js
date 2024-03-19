/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
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
import { EditOutlined, DeleteOutlined, DiffOutlined } from "@ant-design/icons";
import { noticePeriod, months } from "../../constant/constant";
import {
  CANDIDATE_EMPLOYEE_DETAILS,
  CANDIDATE_EMPLOYEE_DETAILS_EDIT,
  CANDIDATE_EMPLOYEE_REGISTER,
} from "../../../../ApiUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { showError } from "../../utils/helpers";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;

const generateArrayOfYears = () => {
  var max = new Date().getFullYear();
  var min = max - 30;
  var years = [];

  for (var i = max; i >= min; i--) {
    const object = { label: i, value: i };
    years.push(object);
  }
  return years;
};

function Employment(userProfile) {
  const formRef = React.useRef();
  const [editVisible, setEditVisible] = useState(false);
  const [isCurrentCompany, setCurrentCompany] = useState(false);
  const [selectedPosition, setSelectedposition] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");

  const users = useSelector(({ users }) => users);

  useEffect(() => {
    setUserValues();
  }, [selectedPosition]);

  const showDrawer = (position) => {
    setEditVisible(true);
    setSelectedposition(position);
  };
  const deleteItem = (position) => {
    const employees = userProfile.userProfile.data[0].employees[position];
    const url = CANDIDATE_EMPLOYEE_DETAILS + "/" + employees._id;

    if (position !== -1) {
      axios
        .delete(url, {
          data: { candidate_id: users.user._id },
          headers: { Authorization: users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            setSelectedposition(-1);
            userProfile.onclick();
          }
        })
        .catch((error) => {});
    }
  };

  const onClose = () => {
    setEditVisible(false);
    setSelectedposition(-1);
  };

  const onFinish = (values) => {
    let url = CANDIDATE_EMPLOYEE_REGISTER;
    if (selectedPosition !== -1) {
      values.annual_salary = values.annual_salary.toString();
      values.notice_period = values.notice_period ? values.notice_period : " ";

      const employees =
        userProfile.userProfile.data[0].employees[selectedPosition];
      values.candidate_id = employees.candidate_id;
      values._id = employees._id;
      // values.location = employees.location

      values.is_current_company = values.is_current_company;
      values.description = employees.description;
      values.annual_salary_currency_type =
        employees.annual_salary_currency_type;

      url = CANDIDATE_EMPLOYEE_DETAILS_EDIT + "/" + users.user._id;
    } else {
      values.annual_salary = values.annual_salary
        ? values.annual_salary.toString()
        : "";
      values.is_current_company = values.is_current_company
        ? values.is_current_company
        : false;
      values.notice_period = values.notice_period ? values.notice_period : " ";

      values.candidate_id = users.user._id;
      values.description = " ";
      values.annual_salary_currency_type = "Dollars";
      values.work_since_to_present = "no";
    }

    const newValues = { id: users.user._id, employee_details: [values] };

    selectedPosition === -1
      ? axios
          .post(url, newValues, {
            headers: { Authorization: users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              setSuccess(true);
              setMsgSuccess(res.data.message);
              setLoading(false);
              setError(false);
              setTimeout(() => {
                setEditVisible(false);
                setSelectedposition(-1);
                userProfile.onclick();
              }, 3000);
            }
          })
          .catch((error) => {
            setSuccess(false);
            setLoading(false);
            setError(true);
            let errorMessage = "";
            {
              error.response.data &&
                Object.entries(error.response.data.errors).map(
                  ([key, value]) => {
                    return (errorMessage += value + ", ");
                  }
                );
            }
            setmsgError(errorMessage);
            setDefaultState();
          })
      : axios
          .put(url, newValues, {
            headers: { Authorization: users.token },
          })
          .then((res) => {
            if (!res.data.error) {
              setSuccess(true);
              setMsgSuccess(res.data.message);
              setLoading(false);
              setError(false);
              setTimeout(() => {
                setEditVisible(false);
                setSelectedposition(-1);
                userProfile.onclick();
              }, 3000);
            }
          })
          .catch((error) => {
            setSuccess(false);
            setLoading(false);
            setError(true);

            let errorMessage = "";
            {
              error.response.data &&
                Object.entries(error.response.data.errors).map(
                  ([key, value]) => {
                    return (errorMessage += value + ", ");
                  }
                );
            }
            setmsgError(errorMessage);
            setDefaultState();
          });
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const onChange = (e) => {
    setCurrentCompany(e.target.value);
    editModal();
  };

  const setUserValues = () => {
    const employees = userProfile.userProfile.data
      ? userProfile.userProfile.data[0].employees[selectedPosition]
      : undefined;

    if (employees) {
      formRef.current.setFieldsValue({
        designation: employees ? employees.designation : "",
        organization: employees ? employees.organization : "",
        work_since_from_month: employees ? employees.work_since_from_month : "",
        work_since_from_year: employees ? employees.work_since_from_year : "",
        notice_period: employees ? employees.notice_period : "",
        is_current_company: employees ? employees.is_current_company : false,
        work_since_to_year: employees ? employees.work_since_to_year : "",
        work_since_to_month: employees ? employees.work_since_to_month : "",
        annual_salary: employees
          ? employees.annual_salary
            ? employees.annual_salary.toString()
            : ""
          : "",
        location: employees ? employees.location : "",
        description_job_profile: employees
          ? employees.description_job_profile
          : "",
      });
      setCurrentCompany(employees ? employees.is_current_company : false);
    } else {
      if (formRef.current) {
        formRef.current.setFieldsValue({
          designation: "",
          organization: "",
          work_since_from_month: "",
          work_since_from_year: "",
          notice_period: "",
          is_current_company: false,
          work_since_to_year: "",
          work_since_to_month: "",
          annual_salary: "",
          description_job_profile: "",
        });
      }
    }
  };

  const editModal = () => {
    return (
      <Drawer
        title="Edit Employment Details"
        width={620}
        onClose={() => onClose()}
        visible={editVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={() => onClose()} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editEmployment"
              htmlType="submit"
              key="submit"
              type="primary"
            >
              Submit
            </Button>
          </div>
        }
      >
        <Form
          ref={formRef}
          id="editEmployment"
          layout="vertical"
          onFinish={onFinish}
        >
          <Card>
            {showError(success, msgSuccess, error, msgError)}
            <Col span={16}>
              <FormItem
                label="Your Designation"
                name={"designation"}
                rules={[
                  {
                    required: true,
                    message: "Your Designation is required.",
                  },
                ]}
              >
                <Input placeholder="Your Designation" />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="Your Organization"
                name={"organization"}
                rules={[
                  {
                    required: true,
                    message: "Your Organization is required.",
                  },
                ]}
              >
                <Input placeholder="Organization" />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label="Is this your current company?"
                name={"is_current_company"}
                rules={[
                  {
                    required: true,
                    message: "Please select current company.",
                  },
                ]}
              >
                <Radio.Group onChange={onChange}>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem label="Started Working From">
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      label="Years"
                      name={"work_since_from_year"}
                      rules={[
                        {
                          required: true,
                          message: "Please Select Years",
                        },
                      ]}
                    >
                      <Select>
                        <Option value={""}>{"Select"}</Option>
                        {generateArrayOfYears().map((user, index) => {
                          return (
                            <Option value={user.value} key={index}>
                              {user.label + (index < 2 ? " Year" : " Years")}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label="Months"
                      name={"work_since_from_month"}
                      rules={[
                        {
                          required: true,
                          message: "Please Select Months",
                        },
                      ]}
                    >
                      <Select>
                        <Option value={""}>{"Select"}</Option>
                        {months.map((user, index) => {
                          return (
                            <Option value={user.value} key={index}>
                              {user.label}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            </Col>

            {!isCurrentCompany ? (
              <Col span={16}>
                <FormItem label="Worked Till">
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem
                        label="Years"
                        name={"work_since_to_year"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Years",
                          },
                        ]}
                      >
                        <Select>
                          <Option value={""}>{"Select"}</Option>
                          {generateArrayOfYears().map((user, index) => {
                            return (
                              <Option value={user.value} key={index}>
                                {user.label + (index < 2 ? " Year" : " Years")}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        label="Months"
                        name={"work_since_to_month"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Months",
                          },
                        ]}
                      >
                        <Select>
                          <Option value={""}>{"Select"}</Option>
                          {months.map((user, index) => {
                            return (
                              <Option value={user.value} key={index}>
                                {user.label}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            ) : null}

            <Col span={24}>
              <FormItem label="Annual Salary">
                <Row gutter={24}>
                  <Col span={16}>
                    <FormItem
                      label=""
                      name={"annual_salary"}
                      rules={[
                        {
                          required: true,
                          message: "This field is required.",
                        },
                      ]}
                    >
                      <Input
                        prefix={"$"}
                        placeholder="Salary"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </FormItem>
                  </Col>
                </Row>
              </FormItem>
            </Col>

            <Col span={16}>
              <FormItem
                label="Describe your Job Profile"
                name={"description_job_profile"}
                rules={[
                  {
                    required: true,
                    message: "Job Profile is required.",
                  },
                ]}
              >
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  placeholder="Describe your Job Profile"
                />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="Your Location"
                name={"location"}
                rules={[
                  {
                    required: true,
                    message: "Your Location is required.",
                  },
                ]}
              >
                <Input placeholder="Location" />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem label="Notice Period" name={"notice_period"}>
                <Select>
                  <Option value={""}>{"Select"}</Option>
                  {noticePeriod.map((user, index) => {
                    return (
                      <Option value={user.value} key={index}>
                        {user.label}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
          </Card>
        </Form>
      </Drawer>
    );
  };

  const emeployeedata = (employers) => {
    return employers.map((employer, index) => {
      const notice_period_elm = noticePeriod.filter(
        (el) => el.value == employer.notice_period
      );
      const months_from_elm = months.filter(
        (el) => el.value == employer.work_since_from_month
      );
      const months_to_elm = months.filter(
        (el) => el.value == employer.work_since_to_month
      );
      return (
        <Row gutter={24} className="mb-5">
          <Col span={24} className="mb-10">
            <Title level={5} className="mb-0">
              {employer.designation}
              <Tooltip className="ml-3" placement="top" title="Edit Details">
                
                <EditOutlined
                  style={{ fontSize: "15px", color: "#372727" }}
                  onClick={() => showDrawer(index)}
                />
              </Tooltip>
              <Tooltip className="ml-3" placement="top" title="Delete">
                <Popconfirm
                  title="Are you sure you want to delete？"
                  onConfirm={() => deleteItem(index)}
                  icon={<DeleteOutlined style={{ color: "red" }} />}
                >
                  <DeleteOutlined />
                </Popconfirm>
              </Tooltip>
            </Title>
            <Text type="secondary">{employer.organization}</Text>
            <br />
            <Text type="secondary">
              {(months_from_elm[0] ? months_from_elm[0].label : "") +
                "/" +
                employer.work_since_from_year}
              to
              {!employer.is_current_company
                ? (months_to_elm[0] ? months_to_elm[0].label : "") +
                  "/" +
                  employer.work_since_to_year
                : "Present"}
            </Text>
            <br />
            <Text type="secondary">
              {notice_period_elm[0]
                ? "Available to join in + " + notice_period_elm[0].label
                : ""}
            </Text>
            <br />
            <Text type="secondary">{employer.description_job_profile}</Text>
          </Col>
        </Row>
      );
    });
  };

  return (
    <Card
      title="Employment"
      extra={
        <Tooltip placement="top" title="Add Your Employment Details">
          
          <DiffOutlined
            style={{ fontSize: "20px", color: "#372727" }}
            onClick={() => showDrawer(-1)}
          />
        </Tooltip>
      }
    >
      {!userProfile.userProfile.data ? (
        <Empty />
      ) : userProfile.userProfile.data[0].employees.length <= 0 ? (
        <Empty />
      ) : null}
      {userProfile.userProfile.data
        ? emeployeedata(userProfile.userProfile.data[0].employees)
        : null}
      {editModal()}
    </Card>
  );
}

export default Employment;
