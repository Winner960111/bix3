import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { Col, Row, Card, Typography, Divider, Button, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { COMPANY_DETAIL, JOBS_LIST } from "../../../ApiUrl";
import { employeeStrength, statusList } from "../../pages/constant/constant";
import { getFormatDate } from "../../pages/utils/helpers";

const { Text, Title } = Typography;

export default function ClientDetail(props) {
  const columns = [
    {
      title: "Opening Title",
      dataIndex: "opening_title",
      key: "opening_title",
    },
    {
      title: "Opening id",
      dataIndex: "opening_id",
      key: "opening_id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (Code) => {
        const item = statusList.find((status) => {
          return Code.toUpperCase() === status.value.toUpperCase();
        });
        return item ? item.label : Code;
      },
    },
    {
      title: "Posted Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return getFormatDate(date);
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (text, record, index) => (
        <NavLink
          to={{
            pathname: `/${users.role}/opening-detail`,
            state: { record: record },
          }}
        >
          <Button type="primary" icon={<EyeOutlined />} />
        </NavLink>
      ),
    },
  ];

  const [clientDetails, setClientDetails] = useState("");
  const [openings, setOpenings] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const users = useSelector(({ users }) => users);
  let location = useLocation();
  useEffect(() => {
    getClientDetail();
    getOpeningList();
    return () => {};
  }, []);

  useEffect(() => {
    getOpeningList();
  }, [currentPage]);

  const getClientDetail = () => {
    const params = {
      company_id: location.state.record._id,
      contact_id: "",
    };
    axios
      .post(COMPANY_DETAIL, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setClientDetails(res.data.data.user_detail);
      })
      .catch((error) => {});
  };

  const getOpeningList = () => {
    const params = {
      current_page: currentPage,
      per_page: "10",
      sort_order: "desc",
      filter_value: "",
      order: "created_at",
      dateRange: [],
      categories: [],
      status: "",
      company_id: location.state.record._id,
      bdm_id: users.role === "bdm" ? users.user._id : null,
      recruiter_id: "",
    };
    axios
      .post(JOBS_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpenings(res.data.data);
      })
      .catch((error) => {});
  };

  const setUserValues = () => {
    const params = {
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
      state: company.state.length > 0 ? company.state[0].code : "", // parseInt(company.state),
      // city: parseInt(company.city),
      zip_code: company.zip_code,
      category: company.category,
      company_code: company.company_code,
    };
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
        state: company.state.length > 0 ? company.state[0].code : "", // parseInt(company.state),
        // city: parseInt(company.city),
        zip_code: company.zip_code,
        category: company.category,
        company_code: company.company_code,
      });
      this.setState(
        {
          tags: company.product_services,
          selectedState: company.state,
        },
        function() {
          this.getCityList(
            company.state.length > 0 ? company.state[0].code : ""
          );
        }
      );
    }
  };

  const jobsOpnings = openings ? openings.job_opening_listing : [];
  const totalRecords = openings.totalRecords;
  const company = clientDetails ? clientDetails : undefined;
  const strength = company
    ? employeeStrength.find((strength) => {
        return strength.value === company.employee_strength;
      })
    : undefined;

  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={"Company Information"}
            bordered={false}
            extra={
              <NavLink to={{}}>
                <Button onClick={() => props.history.goBack()} type="Secondary">
                  Back
                </Button>
              </NavLink>
            }
            className="px-0 py-0"
          >
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Company Name
                </Title>
                <Text type="secondary">
                  {company ? company.company_name : ""}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Industry
                </Title>
                <Text type="secondary">
                  {company && company.industry_type.length > 0
                    ? company.industry_type[0].name
                    : ""}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Employees Strength
                </Title>
                <Text type="secondary">
                  {strength
                    ? strength.label
                    : company
                    ? company.employee_strength
                    : ""}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Description
                </Title>
                <Text type="secondary">
                  {company ? company.description : "-"}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Products/ Services
                </Title>
                <Text type="secondary">
                  {company
                    ? company.product_services
                      ? company.product_services.toString()
                      : ""
                    : ""}
                </Text>
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Website
                </Title>
                <Text type="secondary">{company ? company.website : ""}</Text>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Email
                </Title>
                {company ? company.email_1 : ""}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Email 2
                </Title>
                <Text type="secondary"> {company ? company.email_2 : ""}</Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Phone number
                </Title>
                {company ? company.phone_number_1 : ""}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Phone number 2
                </Title>
                <Text type="secondary">
                  {company ? company.phone_number_2 : ""}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Country
                </Title>
                {"United States"}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  State
                </Title>
                <Text type="secondary">
                  {company && company.state.length > 0
                    ? company.state[0].state
                    : ""}
                </Text>
              </Col>
            </Row>
            <Row gutter={24} className="mb-5">
              <Col span={12}>
                <Title level={5} className="mb-0">
                  City
                </Title>
                {company && company.city.length > 0 ? company.city[0].city : ""}
              </Col>
              <Col span={12}>
                <Title level={5} className="mb-0">
                  Zip Code
                </Title>
                <Text type="secondary">{company ? company.zip_code : ""}</Text>
              </Col>
            </Row>
          </Card>
          <br />
          <Card
            title={"Assigned Job List"}
            bordered={false}
            className="px-0 py-0"
          >
            <Table
              pagination={{
                total: totalRecords,
                showSizeChanger: false,
                onChange(current) {
                  setCurrentPage(current);
                },
              }}
              dataSource={jobsOpnings}
              columns={columns}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
