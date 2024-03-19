/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import {
  Table,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Tooltip,
  Button,
  Space,
  Modal,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined, DiffOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import EditableSkills from "./EditableSkills";
import { monthsOfExpirance, yearsOfExpirance } from "../../constant/constant";
import {
  CANDIDATE_IT_SKILLS_REGISTER,
  CANDIDATE_IT_SKILLS_EDIT,
  CANDIDATE_IT_SKILLS,
} from "../../../../ApiUrl";
import { useSelector } from "react-redux";
import axios from "axios";
import { showError } from "../../utils/helpers";

const FormItem = Form.Item;
const { Option } = Select;

function Skills(userProfile) {
  const columns = [
    {
      title: "Skill",
      dataIndex: "skill",
      key: "skill",
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
    },
    {
      title: "Last Used",
      dataIndex: "last_used",
      key: "last_used",
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (text, record, index) => (
        <span>
          <Space size="middle">
            <NavLink
              to={{
                // pathname: "/opening-detail",
                state: { record: record },
              }}
            >              
              <Button
                onClick={(e) => onEdit(record._id, e, index)}
                type="primary"
                icon={<EditOutlined />}
              />
            </NavLink>
            <NavLink
              to={{
                state: { record: record },
              }}
            >
              <Popconfirm
                title="Are you sure you want to delete？"
                onConfirm={() => onDelete(record._id, index)}
                icon={<DeleteOutlined style={{ color: "red" }} />}
              >
                <Button type="danger" icon={<DeleteOutlined />} />
              </Popconfirm>
            </NavLink>
          </Space>
        </span>
      ),
    },
  ];
  const formRef = React.useRef();
  const [editVisible, setEditVisible] = useState(false);
  const [selectedPosition, setSelectedposition] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const users = useSelector(({ users }) => users);

  const basicProfile = userProfile.userProfile
    ? userProfile.userProfile.data[0]
    : "";

  const key_skills = basicProfile.key_skills;
  const candidate_it_skills = basicProfile.candidate_it_skills;

  const showDrawer = (position) => {
    setEditVisible(true);
    setSelectedposition(position);
  };

  useEffect(() => {
    setUserValues();
  }, [editVisible]);

  const onClose = () => {
    setEditVisible(false);
  };

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

  const onEdit = (key, e, position) => {
    e.preventDefault();
    showDrawer(position);
    //  setUserValues()
  };

  const onDelete = (key, position) => {
    // const it_skills = this.props.userProfile.data[0].it_skills_details[position];
    const url = CANDIDATE_IT_SKILLS + "/" + key;

    if (position != -1) {
      axios
        .delete(url, {
          data: { candidate_id: basicProfile._id },
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
              Object.entries(error.response.data.errors).map(([key, value]) => {
                return (errorMessage += value + ", ");
              });
          }
          setmsgError(errorMessage);
          setDefaultState();
        });
    }
  };

  const onFinish = (values) => {
    const candidate_it_skill = candidate_it_skills[selectedPosition];

    let url = CANDIDATE_IT_SKILLS_REGISTER;
    if (selectedPosition !== -1) {
      url = CANDIDATE_IT_SKILLS_EDIT + "/" + users.user._id;
      values.experience =
        values.experience_year +
        " years " +
        values.experience_month +
        " months";
      values._id = candidate_it_skill._id;
      values.candidate_id = users.user._id;
    } else {
      values.experience =
        values.experience_year +
        " years " +
        values.experience_month +
        " months";
    }

    const newValues = { id: users.user._id, it_skills_details: [values] };
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
              setEditVisible(false);
              setTimeout(() => {
                //  setSelectedposition(-1);
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
              setEditVisible(false);
              setTimeout(() => {
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

  const setUserValues = () => {
    const candidate_it_skill = candidate_it_skills
      ? candidate_it_skills[selectedPosition]
      : undefined;

    if (candidate_it_skill) {
      if (formRef.current) {
        formRef.current.setFieldsValue({
          skill: candidate_it_skill.skill,
          version: candidate_it_skill.version,
          last_used: candidate_it_skill.last_used,
          experience: candidate_it_skill.experience,
          experience_year: candidate_it_skill.experience.split(" ")[0],
          experience_month: candidate_it_skill.experience.split(" ")[2],
        });
      }
    } else {
      if (formRef.current) {
        formRef.current.setFieldsValue({
          skill: "",
          version: "",
          last_used: "",
          experience: "",
        });
      }
    }
  };

  const editModal = () => {
    //  useEffect(() => {
    //    setUserValues();
    //  },[]);
    setUserValues();
    return (
      <Modal
        title="Edit Skills"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        visible={editVisible}
        bodyStyle={{ paddingBottom: 80 }}
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
              form="editItSkills"
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
          id="editItSkills"
          layout="vertical"
          onFinish={onFinish}
        >
          <Card>
            <Row gutter={16}>
              <Col span={16}>
                <FormItem
                  label="IT Skills"
                  name={"skill"}
                  rules={[
                    {
                      required: true,
                      message: "IT Skills is required.",
                    },
                  ]}
                >
                  <Input placeholder="please enter IT Skills" />
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem
                  label="Version"
                  name={"version"}
                  rules={[
                    {
                      required: true,
                      message: "Version is required.",
                    },
                  ]}
                >
                  <Input placeholder="Version" />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="Last Used" name={"last_used"}>
                  <Select placeholder="Last Used">
                    <Option value={""}>{"Select"}</Option>
                    {generateArrayOfYears().map((item, index) => {
                      return (
                        <Option value={item.value} key={index}>
                          {item.label}
                        </Option>
                      );
                    })}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={16}>
                <FormItem label="Experience" name="experience">
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem
                      label="Years"
                        name={"experience_year"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Years",
                          },
                        ]}
                      >
                        <Select placeholder="Years">
                          <Option value={""}>{"Select"}</Option>
                          {yearsOfExpirance.map((user, index) => {
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
                        name={"experience_month"}
                        rules={[
                          {
                            required: true,
                            message: "Please Select Months",
                          },
                        ]}
                      >
                        <Select name="experience_month" placeholder="Months">
                          <Option value={""}>{"Select"}</Option>
                          {monthsOfExpirance.map((user, index) => {
                            return (
                              <Option value={user.value} key={index}>
                                {user.label +
                                  (index < 2 ? " Month" : " Months")}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    );
  };

  return (
    <>
      <Card title="Key Skills" className="mb-5">
        {<EditableSkills userProfile={userProfile} key_skills={key_skills} />}
      </Card>
      <Card
        title="IT Skills"
        extra={
          <Tooltip placement="top" title="Edit Your IT Skills Details">
            
            <DiffOutlined
              style={{ fontSize: "20px", color: "#372727" }}
              onClick={() => showDrawer(-1)}
            />
          </Tooltip>
        }
      >
        {editModal()}
        {showError(success, msgSuccess, error, msgError)}
        <Table dataSource={candidate_it_skills} columns={columns} />
      </Card>
    </>
  );
}

export default Skills;
