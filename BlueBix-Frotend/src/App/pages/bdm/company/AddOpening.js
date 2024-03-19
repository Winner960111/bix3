/* eslint-disable no-lone-blocks */
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker, 
  Checkbox,
  Row,
  Col,
  Select,
  Button,
  InputNumber,
  AutoComplete,
} from "antd";
import moment from "moment";
import { useHistory, useLocation } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  CONTACT_NAME_LIST,
  JOB_CREATE_BY_USER,
  SUB_CATEGORY_LIST,
  US_CITY_LIST,
  US_STATE_LIST,
  JOB_DETAIL,
  COMPANY_NAMES,
} from "../../../../ApiUrl";
import { NavLink } from "react-router-dom";
import {
  optionEmploymentType,
  optionsexperienceLevel,
  optionsInterviewType,
  optionsSecurity_clearance,
  optionsVisaType,
  yearsOfExpirance,
} from "../../constant/constant";
import {
  PostContactActivity,
  CONTACT_ACTIVITY_MODULE,
} from "./../../company/ActivityLogApiCall";
import { showError } from "../../utils/helpers";

const { Option } = Select;
const FormItem = Form.Item;

export default function CreateOpening(props) {
  const formRef = React.useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [contactNameList, setContactNameList] = React.useState([]);
  const [subCategoryList, setSubCategoryList] = React.useState([]);
  const [descEditor, setDescEditor] = React.useState([]);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [openingId, setOpeningId] = useState("");
  const [stateList, setStateList] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [selectedClient, setSelectedClient] = useState();
  const [cityList, setCityList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [projectStartDate, setprojectStartDate] = useState("");
  const [isDurationEnable, setDurationEnable] = useState(false);
  const [isCityEnable, setCityEnable] = useState(false);
  const [creatingState, setCreatingState] = useState(true);
  let history = useHistory();
  let location = useLocation();
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;

  let editor;
  useEffect(() => {
    setUserValues();
  }, [users]);

  useEffect(() => {
    getClientsByRole();
  }, []);

  useEffect(() => {
    getStatesList();

    if (location.state) {
      setCreatingState(false);
      getOpeningDetail();
    }
  }, []);

  useEffect(() => {
    getCityList(selectedState);
    setCityEnable(selectedState === 3980);
  }, [selectedState]);

  useEffect(() => {
    return () => {};
  }, []);

  const getOpeningDetail = () => {
    axios
      .get(JOB_DETAIL + "/" + location.state.record._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningsValues(res.data.data[0]);
      })
      .catch((error) => {});
  };

  const setOpeningsValues = (values) => {
    setSelectedState(
      values.state.length > 0 ? parseInt(values.state[0].code) : ""
    );
    getContactNameList(values.account_name[0]._id);
    setSelectedClient(values.account_name[0]);
    formRef.current.setFieldsValue({
      company_name: values.account_name[0].company_name,
      country: "United States",
      currency: "USD",
      contact_name:
        values.contact_name.length > 0
          ? values.contact_name.map((user) => user._id)
          : [],
      opening_title: values.opening_title,
      opening_id: values.opening_id,
      required_skills: values.required_skills,
      required_experience: values.required_experience,
      pay_currency: "",
      pay_type: "",
      stateName: values.state.length > 0 ? parseInt(values.state[0].code) : "",
      city: values.city.length > 0 ? parseInt(values.city[0].code) : "",
      zip_code: values.zip_code,
      number_of_openings: values.number_of_openings,
      max_resumes_allowed: values.max_resumes_allowed,
      local_indicator: values.local_indicator,
      security_clearance: values.security_clearance,
      duration: values.duration,
      category: values.category.length > 0 ? values.category[0].code : "",
      sub_category: values.sub_category,
      employment_type: values.employment_type,
      experience_level: values.experience_level,
      interview_type: values.interview_type,
      visa_type:
        values.visa_type.length > 0
          ? values.visa_type.map((item, index) => {
              return item.value;
            })
          : [],
      project_start_date: values.project_start_date
        ? moment(values.project_start_date)
        : "",
      project_close_date: moment(values.project_close_date),
      notes: values.notes,
      from: values.salary_range_from,
      to: values.salary_range_to,
      currency: values.currency,
      salary_type: values.salary_type,
      attachments: values.attachments,
      status: values.status,
      short_description: values.short_description,
    });
    setJobDesc(values.job_description);
    setOpeningId(values.opening_id);
  };
  const setUserValues = () => {
    if (users) {
      formRef.current.setFieldsValue({
        // account_name: users.user.company_name,
        country: "United States",
        currency: "USD",
      });
    }
  };

  const getStatesList = () => {
    axios
      .get(US_STATE_LIST)
      .then((res) => {
        setStateList(res.data.data);
      })
      .catch((error) => {});
  };

  const getCityList = (stateId) => {
    axios
      .post(US_CITY_LIST, { state_id: stateId })
      .then((res) => {
        setCityList(res.data.data);
      })
      .catch((error) => {});
  };

  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    formRef.current.setFieldsValue({
      stateName: stateCode,
      city: "",
      zip_code: "",
    });
  };

  const handleClientNameStateChange = (e) => {
    const selectedObj = clientNames.find((item) => item.company_name == e);
    setSelectedClient(selectedObj);
    getContactNameList(selectedObj._id);
  };

  const getClientsByRole = () => {
    const params = {};
    if (users.role === "bdm") params.bdm_id = users.user._id;
    axios
      .post(COMPANY_NAMES, params, { headers: { Authorization: users.token } })
      .then((res) => {
        setClientNames(res.data.data);
      })
      .catch((error) => {});
  };

  const getContactNameList = (company_id) => {
    const params = { company_id };
    axios
      .post(CONTACT_NAME_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setContactNameList(res.data.data);
      })
      .catch((error) => {});
  };

  const getSubCategoriesList = (categoryCode) => {
    const params = { category_code: categoryCode };
    axios
      .post(SUB_CATEGORY_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setSubCategoryList(res.data.data);
      })
      .catch((error) => {});
  };

  const handleCategoryChange = (value) => {
    getSubCategoriesList(value);
  };

  const mockVal = (str) => {
    return subCategoryList.filter((item) => {
      return item.name === str;
    });
  };

  const onSearchSubCategories = (searchText) => {
    setSubCategoryList(!searchText ? [] : mockVal(searchText));
  };

  const callActivity = (title, description) => {
    if (users.user.contact_person_details) {
      const contact_person_details = users.user.contact_person_details;
      const contactLogObject = {
        company_id: users.user._id,
        contact_id: users.user.contact_person_details._id,
        module: CONTACT_ACTIVITY_MODULE.OPENING,
        title: title,
        description:
          description +
          contact_person_details.first_name +
          " " +
          contact_person_details.last_name,
      };
      PostContactActivity(contactLogObject, users.token);
    }
  };

  const handleClose = () => {
    setLoading(false);
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 2800);
  };

  const createOpening = (newValue) => {
    const title =
      newValue.opening_title + " (#" + newValue.opening_id + ") created";
    const desc = title + " by ";

    axios
      .post(JOB_CREATE_BY_USER, newValue, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          callActivity("Add Opening", desc);
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setDefaultState();
          setTimeout(() => {
            history.goBack();
          }, 3000);
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        let errorMessage = "";
        {
          Object.entries(error.response.data.errors).map(([key, value]) => {
            return (errorMessage += value + ", ");
          });
        }
        setmsgError(errorMessage);
        setDefaultState();
      });
  };

  const updateOpening = (newValue) => {
    const title =
      newValue.opening_title + " (#" + newValue.opening_id + ") details update";

    const desc = title + " by ";

    axios
      .put(JOB_DETAIL + "/" + location.state.record._id, newValue, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          callActivity("Opening update", desc);
          setSuccess(true);
          setLoading(false);
          setError(false);
          setMsgSuccess(res.data.message);
          setDefaultState();
          setTimeout(() => {
            history.goBack();
          }, 3000);
        }
      })
      .catch((error) => {
        setSuccess(false);
        setLoading(false);
        setError(true);
        let errorMessage = "";
        {
          Object.entries(error.response.data.errors).map(([key, value]) => {
            return (errorMessage += value + ", ");
          });
        }
        setmsgError(errorMessage);
        setDefaultState();
      });
  };

  const onFinish = (values) => {
    const editorData = descEditor.getData();
    handleClose();
    const newValue = {
      account_name: selectedClient._id,
      contact_name: values.contact_name,
      opening_title: values.opening_title,
      opening_id: location.state
        ? openingId
        : selectedClient.company_code +
          Math.floor(100000 + Math.random() * 900000),
      required_skills: values.required_skills, //["php","nodejs","reactjs"],
      required_experience: values.required_experience,
      pay_currency: "",
      pay_type: "",
      country: values.country,
      state: values.stateName,
      city: values.city,
      zip_code: values.zip_code,
      number_of_openings: values.number_of_openings,
      max_resumes_allowed: values.max_resumes_allowed,
      local_indicator: values.local_indicator,
      security_clearance: values.security_clearance,
      job_description: editorData,
      duration: isDurationEnable
        ? ""
        : values.duration
        ? values.duration.toString()
        : "",
      category: values.category,
      sub_category: values.sub_category,
      employment_type: values.employment_type,
      experience_level: values.experience_level,
      //   "position_type": values.position_type,
      interview_type: values.interview_type,
      visa_type: values.visa_type,
      project_start_date: values.project_start_date,
      project_close_date: values.project_close_date,
      notes: values.notes,
      salary_range:
        (values.from === undefined ||
        values.from === "undefined" ||
        values.from === null ||
        values.from === "null"
          ? 0
          : values.from) +
        "-" +
        (values.to === undefined ||
        values.to === "undefined" ||
        values.to === null ||
        values.to === "null"
          ? 0
          : values.to),
      currency: values.currency,
      salary_type: values.salary_type,
      attachments: values.attachments,
      status: values.status,
      role: users.role,
      short_description: values.short_description,
      company_name: selectedClient.company_name,
    };

    if (location.state) updateOpening(newValue);
    else createOpening(newValue);
  };

  return (
    <div>
      <Form ref={formRef} onFinish={onFinish} layout="vertical">
        {showError(success, msgSuccess, error, msgError)}

        <Card
          title="Company Information"
          className="mb-6"
          extra={
            <NavLink
              to={
                {
                  // pathname: "/company/job-openings",
                }
              }
            >
              <Button onClick={() => props.history.goBack()} type="Secondary">
                Back
              </Button>
            </NavLink>
          }
        >
          <Row gutter={24}>
            <Col span={8}>
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
                  showSearch
                  onChange={handleClientNameStateChange}
                  disabled={!creatingState}
                >
                  {clientNames.map((item, index) => {
                    return (
                      <option value={item.company_name} key={index.toString()}>
                        {item.company_name}
                      </option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label="Contact Name"
                name={"contact_name"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Contact Name.",
                  },
                ]}
              >
                <Select
                  filterOption={(input, option) =>
                    option ? option.children.toLowerCase().includes(input) : ""
                  }
                  mode={"multiple"}
                  allowClear
                >
                  {contactNameList.map((user, index) => {
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
          </Row>
        </Card>
        <Card title="Opening Information" className="mb-6">
          <Row gutter={24}>
            <Col span={6}>
              <FormItem
                label="Opening Title"
                name={"opening_title"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Opening Title.",
                  },
                ]}
              >
                <Input placeholder="Opening Title" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Required Skills"
                name={"required_skills"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Required Skills.",
                  },
                ]}
              >
                <Input placeholder="Required Skills" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Experience Level"
                name={"experience_level"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Experience Level.",
                  },
                ]}
              >
                <Select>
                  {optionsexperienceLevel.map((item, index) => (
                    <Option value={item.value} key={index.toString()}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Required Experience"
                name={"required_experience"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Required Experience.",
                  },
                ]}
              >
                <Select>
                  {yearsOfExpirance.map((option, index) => (
                    <option key={index.toString()} value={option.value}>
                      {option.label +
                        (option.label === "0"
                          ? ""
                          : option.label === "1"
                          ? " year"
                          : " years")}
                    </option>
                  ))}
                </Select>
              </FormItem>
            </Col>

            <Col span={20}>
              <Row gutter={24}>
                <Col span={8}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem label="Salary Range" name={"from"}>
                        <InputNumber
                          defaultValue={0}
                          className={"w-100"}
                          min={0}
                          placeholder="from"
                        />
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem label=" " name={"to"}>
                        <InputNumber
                          defaultValue={0}
                          className={"w-100"}
                          min={0}
                          placeholder="to"
                        />
                      </FormItem>
                    </Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <FormItem label="Currency" name={"currency"}>
                    <Select>
                      <Option value="USD" selected>
                        $(USD)
                      </Option>
                    </Select>
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label="Pay Type"
                    name={"salary_type"}
                    rules={[
                      {
                        required: true,
                        message: "Please select Pay Type",
                      },
                    ]}
                  >
                    <Select>
                      <Option value="Hourly" selected>
                        Hourly
                      </Option>
                      <Option value="Daily"> Daily </Option>
                      <Option value="Weekly"> Weekly </Option>
                      <Option value="Monthly"> Monthly </Option>
                      <Option value="Yearly"> Yearly </Option>
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </Col>

            <Col span={4}>
              <FormItem label="Country" name={"country"}>
                <Input disabled={true} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="State" name={"stateName"}>
                <Select
                  onChange={handleStateChange}
                  showSearch
                  style={{ width: 250 }}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={
                    (optionA, optionB) => optionA.children.toLowerCase()
                    // .localeCompare(optionB.children.toLowerCase())
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select State.",
                    },
                  ]}
                >
                  {stateList.map((state, index) => {
                    return (
                      <Option value={state.code} key={index.toString()}>
                        {state.state}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="City" name={"city"}>
                <Select
                  disabled={isCityEnable}
                  showSearch
                  style={{ width: 250 }}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children
                      .toLowerCase()
                      .localeCompare(optionB.children.toLowerCase())
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please select City.",
                    },
                  ]}
                >
                  {cityList.map((city, index) => {
                    return (
                      <Option value={city.code} key={index.toString()}>
                        {city.city}
                      </Option>
                    );
                  })}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Zip Code" name={"zip_code"}>
                <Input placeholder="Zip Code" disabled={isCityEnable} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Number of Openings"
                name={"number_of_openings"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Number of Openings.",
                  },
                ]}
              >
                <InputNumber
                  className={"w-100"}
                  placeholder="Number of Openings"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Max Resumes Allowed"
                name={"max_resumes_allowed"}
              >
                <InputNumber
                  className={"w-100"}
                  placeholder="Max Resumes Allowed"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Local Indicator" name={"local_indicator"}>
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row>
                    <Col span={8}>
                      <Checkbox value="Local">Local</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="Nonlocal">Nonlocal</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Security Clearance" name={"security_clearance"}>
                <Select>
                  {optionsSecurity_clearance.map((option, index) => (
                    <option key={index.toString()} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem label="Short Description" name={"short_description"}>
                <Input placeholder=" " />
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label="Job Description"
                name={"job_description"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Job Description.",
                  },
                ]}
              >
                <CKEditor
                  onChange={(event, editor) => {
                    //job_description = editor.getData();
                  }}
                  editor={ClassicEditor}
                  data={jobDesc}
                  onReady={(newEditor) => {
                    editor = newEditor;
                    setDescEditor(newEditor);
                    // You can store the "editor" and use when it is needed.
                  }}
                />
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title="Duration & Type" className="mb-6">
          <Row gutter={24}>
            <Col span={6}>
              <FormItem label="Duration (Month)" name={"duration"}>
                <Input
                  disabled={isDurationEnable}
                  // className={"w-100"}
                  placeholder="Duration"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Category"
                name={"category"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Category.",
                  },
                ]}
              >
                <Select
                  onChange={handleCategoryChange}
                  style={{ width: "100%" }}
                >
                  {categoryList !== undefined &&
                    categoryList.map((category, index) => (
                      <option key={index.toString()} value={category.code}>
                        {category.name}
                      </option>
                    ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="SubCategory" name={"sub_category"}>
                {/* <Select>
                                    {subCategoryList !== undefined &&
                                    subCategoryList.map(({category, index}) => (
                                        <option value={category.name}  key={index} >{category.name}</option>
                                    ))}
                                </Select> */}
                <AutoComplete
                  options={subCategoryList}
                  style={{
                    width: 200,
                  }}
                  onSearch={onSearchSubCategories}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Employment Type"
                name={"employment_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Employment Type.",
                  },
                ]}
              >
                <Select
                  onChange={(value) => {
                    const type = value === "D_FT" ? true : false;
                    setDurationEnable(type);
                  }}
                >
                  {optionEmploymentType.map((item, index) => (
                    <Option value={item.value} key={index.toString()}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Status"
                name={"status"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Status.",
                  },
                ]}
              >
                <Select>
                  <Option value="Active"> Active </Option>
                </Select>
              </FormItem>
            </Col>

            <Col span={6}>
              <FormItem
                label="Interview Type"
                name={"interview_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Interview Type.",
                  },
                ]}
              >
                <Select>
                  {optionsInterviewType.map((item, index) => (
                    <Option key={index.toString()} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Visa Type"
                name={"visa_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Visa Type.",
                  },
                ]}
              >
                <Select mode="multiple">
                  {optionsVisaType.map((visaType, index) => (
                    <Option key={index.toString()} value={visaType.value}>
                      {visaType.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label="Project Start Date"
                name={"project_start_date"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Project Start Date.",
                  },
                ]}
              >
                <DatePicker value={projectStartDate} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Project end Date" name={"project_close_date"}>
                <DatePicker />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="Notes" name={"notes"}>
                <Input placeholder="Notes" />
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card className="mb-6">
          <Row>
            <Button
              type="primary"
              className="d-flex align-items-center"
              htmlType="submit"
            >
              Save
              {loading && <span className="mx-3 spinner spinner-white"> </span>}
            </Button>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
