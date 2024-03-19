import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { CANDIDATE } from "../../../../../../ApiUrl";
import { Button, Card, Input, Space, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import {
  companyStatusList,
  statusList,
} from "../../../../../pages/constant/constant";
import Filters from "../../../../filter";
import { getFormatDate } from "../../../../../pages/utils/helpers";

const { Search } = Input;

class CandidateList extends React.Component {
  columns = [
    {
      title: "Display Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Current Location",
      dataIndex: "current_location",
      key: "current_location",
    },
    {
      title: "Job Category",
      dataIndex: "job_category",
      key: "job_category",
      render: (code) => {
        const category = this.getCategory(code);
        return category ? category.name : "";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      //   render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : '',
      render: (text) => {
        const item = statusList.find((status) => {
          return text.toUpperCase() === status.value.toUpperCase();
        });
        return item ? item.label : "text";
      },
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return date ? getFormatDate(date) : "";
      },
    },
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (text, record) => (
        <span>
          <Space size="middle">
            <NavLink
              to={{
                pathname: `/${this.props.role}/candidateProfileDetail`,
                state: { item: record },
              }}
            >
              <Button type="primary" icon={<EyeOutlined />} />
            </NavLink>
          </Space>
        </span>
      ),
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      candidate_list_details: [],
      categoryList: [],
      current_page: 1,
      pageSize: 10,
      totalPages: 50,
      totalRecords: 0,
      users: [],
      search: "",
      dateRange: [],
      dateRangeValue: [],
      categories: [],
      status: "",
      selectedManager: "",
      selectedStatus: "",
      loading: true,
    };
  }

  getCategory = (value) => {
    const categoryList = this.props.common.category;
    return categoryList.find((item) => {
      return item.code === value;
    });
  };

  fetchUserData = (params) => {
    if (params) {
      axios
        .post(CANDIDATE, params, {
          headers: { Authorization: this.props.token },
        })
        .then((resp) => {
          this.setState({
            candidate_list_details: resp.data.data.candidate_list_details,
            totalPages: resp.data.data.totalPages,
            totalRecords: resp.data.data.totalRecords,
            loading: false,
          });
        })
        .catch((error) => {});
    }
  };

  callBack = (value) => {
    this.callBackParam = value;
    const param = {
      current_page: this.state.current_page,
      per_page: this.state.pageSize,
      order: "created_at",
      order_direction: "desc",
      search: this.state.search,
      job_post_title: "",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
    };
    this.fetchUserData(param);
  };

  componentDidMount() {
    this.fetchUserData(this.callBackParam);
  }

  onSearch = (value) => {
    this.setState(
      {
        search: value,
      },
      function() {
        this.callBack(this.callBackParam);
      }
    );
  };

  render() {
    const candidate_list_details = this.state.candidate_list_details;
    const _this = this;
    const totalRecords = this.state.totalRecords;
    return (
      <>
        <Filters
          callBack={this.callBack}
          showCategory={true}
          showCompany={false}
          clearSearch={this.onSearch}
          statusObject={companyStatusList}
        />
        <br />
        <Card
          title="All Candidate List"
          bordered={false}
          className="px-0 py-0"
          extra={
            <NavLink to={`/${this.props.role}/addCandidate`}>
              <Button type="primary">Add Candidate</Button>
            </NavLink>
          }
        >
          <Search
            value={this.state.search}
            placeholder="Search..."
            onSearch={this.onSearch}
            onChange={(e) =>
              this.setState({
                search: e.target.value,
              })
            }
            style={{ width: 200 }}
          />
          {this.state.users ? (
            <>
              <Table
                // pagination={false}
                pagination={{
                  total: totalRecords,
                  showSizeChanger: false,
                  onChange(current) {
                    _this.setState(
                      {
                        current_page: current,
                      },
                      function() {
                        // _this.fetchUserData();
                        _this.callBack(_this.callBackParam);
                      }
                    );
                  },
                }}
                dataSource={candidate_list_details}
                columns={this.columns}
              />
            </>
          ) : null}
        </Card>
      </>
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

export default connect(mapStateToProps)(CandidateList);
