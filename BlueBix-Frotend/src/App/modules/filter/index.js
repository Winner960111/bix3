import React, { useState, useEffect } from "react";
import { Card, DatePicker, Col, Row, Select, Button } from "antd";
import { OpeningStatusList } from "../../pages/constant/constant";
import { useSelector } from "react-redux";
import {
  COMPANY_NAME_LIST,
  COMPANY_NAME_LIST_RECRUITER,
  OPENING_TITLE_LIST,
} from "../../../ApiUrl";
import axios from "axios";
import { COL } from "../calrow";

const { Option } = Select;
const { RangePicker } = DatePicker;

const Filters = ({
  callBack,
  showCategory,
  showCompany,
  showOpening,
  clearSearch,
  statusObject,
}) => {
  const [companyList, setCompanyList] = useState([]);
  const [openingTitleList, setOpeningTitleList] = useState([]);
  const [status, setStatus] = useState("");
  const [dateRangeValue, setDateRangeValue] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [opening_id, setOpeningId] = useState("");
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;
  const statusList = statusObject ? statusObject : OpeningStatusList;

  useEffect(() => {
    if (users.role === "bdm" || users.role === "recruiter") getAllCompanyList();
    if (users.role === "company") getOpeningTitleList();
    return () => {};
  }, []);

  useEffect(() => {
    const statusObject = statusList.filter((item) => {
      return status === item.value;
    });
    const arrayDateRange =
      dateRange.length > 0 ? [dateRange[0], dateRange[1]] : [];

    const categoryObject = categories.length > 0 ? categories : [];
    const paramValues = {
      arrayDateRange: arrayDateRange,
      categories: categoryObject,
      status: statusObject.length > 0 ? statusObject[0].value : "",
      selectedCompany: selectedCompany,
      opening_id: opening_id,
    };
    callBack(paramValues);

    return () => {};
  }, [dateRange, categories, status, selectedCompany, opening_id]);

  const getAllCompanyList = () => {
    const URL =
      users.role === "bdm" ? COMPANY_NAME_LIST : COMPANY_NAME_LIST_RECRUITER;
    const params =
      users.role === "bdm"
        ? {
            bdm_id: users.user._id,
          }
        : {
            recruiter_id: users.user._id,
          };
    axios
      .post(URL, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setCompanyList(res.data.data);
      })
      .catch((error) => {});
  };
  const getOpeningTitleList = () => {
    const params = { company_id: users.user._id };
    axios
      .post(OPENING_TITLE_LIST, params, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setOpeningTitleList(res.data.data.opening_detail_list);
      })
      .catch((error) => {});
  };

  const onChange = (value, dateString) => {
    const srtdate = dateString[0] === "" ? [] : dateString;
    setDateRangeValue(value);
    setDateRange(srtdate);
  };

  const handleChange = (value) => {
    setCategories(value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
  };

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
  };

  const handleOpeningIdChange = (value) => {
    setOpeningId(value);
  };

  const onResetFilters = () => {
    setDateRangeValue([]);
    setDateRange([]);
    setCategories([]);
    setStatus("");
    setSelectedCompany("");
    setOpeningId("");
    if (clearSearch) {
      clearSearch("");
    }
  };

  return (
    <Card title="Filters" bordered={false} className="px-0 py-0">
      <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 24 }}>
        <COL cal={8}>
          <label for="by_source" title="Date Range">
            Date Range :
          </label>
          <br />
          <RangePicker
            className="mb-3"
            value={dateRangeValue}
            onChange={onChange}
          />
        </COL>
        {showCategory ? (
          <COL cal={6}>
            <label for="by_source" className="" title="Category">
              Category :
            </label>
            <br />
            <Select
              mode="multiple"
              placeholder="Select Category Name"
              onChange={handleChange}
              value={categories}
              style={{ width: "100%" }}
            >
              {categoryList !== undefined &&
                categoryList.map((category, index) => (
                  <Option key={index.toString()} value={category.code}>
                    {category.name}
                  </Option>
                ))}
              ;
            </Select>
          </COL>
        ) : null}
        <COL cal={6}>
          <label for="by_source" className="" title="Status">
            Status :
          </label>
          <br />
          <Select
            placeholder="Select Status Name"
            value={status}
            onChange={handleStatusChange}
            style={{ width: "100%" }}
          >
            <Option value={""}>{"Select"}</Option>
            {statusList != undefined &&
              statusList.map((status, index) => (
                <Option key={index.toString()} value={status.value}>
                  {status.label}
                </Option>
              ))}
          </Select>
        </COL>
        {showCompany ? (
          <COL cal={6}>
            <label for="by_source" title="Company">
              Company :
            </label>
            <br />
            <Select
              placeholder="Select Company"
              value={selectedCompany}
              onChange={handleCompanyChange}
              style={{ width: "100%" }}
            >
              <Option value={""}>{"Select"}</Option>
              {companyList != undefined &&
                companyList.map((status, index) => (
                  <Option key={index.toString()} value={status._id}>
                    {status.company_name}
                  </Option>
                ))}
            </Select>
          </COL>
        ) : null}
        {showOpening ? (
          <COL cal={6}>
            <label for="by_source" className="" title="Status">
              Opening :
            </label>
            <br />
            <Select
              placeholder="Select Opening"
              value={opening_id}
              onChange={handleOpeningIdChange}
              style={{ width: "100%" }}
            >
              <Option value={""}>{"Select"}</Option>
              {openingTitleList !== undefined &&
                openingTitleList.map((item, index) => (
                  <Option key={index.toString()} value={item.opening_id}>
                    {item.opening_title}
                  </Option>
                ))}
            </Select>
          </COL>
        ) : null}
      </Row>
      <Row gutter={24} className="py-5 text-right">
        <Col span={24}>
          <Button
            onClick={() => onResetFilters()}
            type="primary"
            size="small"
            danger
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default Filters;
