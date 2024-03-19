import React, { useEffect, useState } from "react";
import { optionEmploymentType } from "../../constant/constant";
import { showError } from "../../utils/helpers";
import { Form, Input, Select, Row, Col, Radio, Modal, Button } from "antd";
import axios from "axios";
import {
  CANDIDATE_CAREER_PROFILE_EDIT,
  US_STATE_LIST,
  US_CITY_LIST,
} from "../../../../ApiUrl";
import { useSelector } from "react-redux";

const { Option } = Select;
const FormItem = Form.Item;

const CareerDetail = ({
  editVisibleProfile,
  categoryList,
  userProfileDetails,
  userProfile,
  onClose,
}) => {
  const formRefCareers = React.useRef();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const users = useSelector(({ users }) => users);

  /**
   * reset state
   */
  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const postEditCareerProfile = (values) => {
    values.job_category =
      values.job_category === undefined
        ? userProfileDetails.job_category[0].code
        : values.job_category;
    setLoading(true);
    axios
      .put(CANDIDATE_CAREER_PROFILE_EDIT + "/" + users.user._id, values, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          onClose();
          setSuccess(true);
          setMsgSuccess(res.data.message);
          setError(false);
          setTimeout(() => {
            userProfile.onclick();
          }, 3000);
          setDefaultState();
        }
      })
      .catch((error) => {
        setSuccess(false);
        setError(true);
        if (error.response.data.statusCode !== 400) {
          let errorMessage = "";
          {
            error.response.data &&
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
        }
        setDefaultState();
      });
  };

  useEffect(() => {
    getStatesList();
  }, []);

  useEffect(() => {
    getCityList(selectedState);
  }, [selectedState]);

  const getStatesList = () => {
    axios
      .get(US_STATE_LIST, {})
      .then((res) => {
        setStateList(res.data.data);
      })
      .catch((error) => {
      });
  };

  const getCityList = (stateId) => {
    axios
      .post(US_CITY_LIST, { state_id: stateId })
      .then((res) => {
        setCityList(res.data.data);
      })
      .catch((error) => {
      });
  };

  /**
   * set values in career profile dialog
   */
  const setCareer = () => {
    if (userProfileDetails) {
      const location =
        userProfileDetails && userProfileDetails.desired_location
          ? userProfileDetails.desired_location.includes(",")
            ? userProfileDetails.desired_location.split(",")
            : ["", ""]
          : ["", ""];
      if (formRefCareers.current) {
        const locationStr = location[1] + " " + location[0];

        formRefCareers.current.setFieldsValue({
          job_category:
            userProfileDetails.job_category.length > 0
              ? userProfileDetails.job_category[0].code
              : "",
          role: userProfileDetails.role,
          desired_job_type: userProfileDetails.desired_job_type,
          desired_employment_type: userProfileDetails.desired_employment_type,
          desired_shift: userProfileDetails.desired_shift,
          desired_location: userProfileDetails.desired_location,
          stateName: location[1] === "" ? selectedState : location[1],
          city: location[0] === "" ? selectedCity : location[0],
        });
      }
    } else {
      if (formRefCareers.current) {
        formRefCareers.current.setFieldsValue({
          job_category: "",
          role: "",
          desired_job_type: "",
          desired_employment_type: "",
          desired_shift: "",
          desired_location: "",
          stateName: "",
          city: "",
        });
      }
    }
  };

  /**
   *  show dialog for edit career profile
   */

  const EditModalCareer = () => {
    useEffect(() => {
      setCareer();
    });

    return (
      <Modal
        title="Career Profile"
        width={500}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisibleProfile}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              form="editCareer"
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
          ref={formRefCareers}
          id="editCareer"
          layout="vertical"
          onFinish={postEditCareerProfile}
        >
          <Row gutter={24}>
            <Col span={16}>
              <FormItem
                label="Job Category"
                name={"job_category"}
                rules={[
                  {
                    required: true,
                    message: "Please select Job Category.",
                  },
                ]}
              >
                <Select
                  placeholder="Select Job Category"
                  style={{ width: "100%" }}
                >
                  {categoryList !== undefined &&
                    categoryList.map((category, index) => (
                      <Option value={category.code} key={index}>
                        {category.name}
                      </Option>
                    ))}
                </Select>
              </FormItem>
            </Col>

            <Col span={16}>
              <FormItem
                label="Role"
                name={"role"}
                rules={[
                  {
                    required: true,
                    message: "Role is required.",
                  },
                ]}
              >
                <Input placeholder="Enter your Role" />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="Desired Job Type"
                name={"desired_job_type"}
                rules={[
                  {
                    required: true,
                    message: "Job Type is required.",
                  },
                ]}
              >
                <Input placeholder="Enter your Job Type" />
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                label="Desired Employment Type"
                name={"desired_employment_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter opening's Employment Type.",
                  },
                ]}
              >
                <Select>
                  {optionEmploymentType.map((item, index) => (
                    <Option value={item.value} key={index}>
                      
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>

            <Col span={24}>
              <FormItem
                label="Desired Shift"
                name={"desired_shift"}
                rules={[
                  {
                    required: true,
                    message: "Please select Shift.",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={"Day"}>Day</Radio>
                  <Radio value={"Night"}>Night</Radio>
                  <Radio value={"Flexible"}>Flexible</Radio>
                </Radio.Group>
              </FormItem>
            </Col>

            <Col span={16}>
              <FormItem
                label="Desired Location"
                name={"desired_location"}
                rules={[
                  {
                    required: true,
                    message: "Location is required.",
                  },
                ]}
              >
                <Input placeholder="Enter Desired Location" />
              </FormItem>

              {/* <FormItem label="Location">
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      label="State"
                      name={"stateName"}
                      rules={[
                        {
                          required: true,
                          message: "Please select State",
                        },
                      ]}
                    >
                      <Select onChange={handleStateChange}>
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
                  <Col span={12}>
                    <FormItem
                      label="City"
                      name={"city"}
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please select City.",
                      //   },
                      // ]}
                    >
                      <Select onChange={handleCityChange}>
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
                </Row>
              </FormItem> */}
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  return (
    <>
      {EditModalCareer()}
      {showError(success, msgSuccess, error, msgError)}
    </>
  );
};

export default CareerDetail;
