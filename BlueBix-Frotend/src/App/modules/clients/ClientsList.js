import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import {
  Table,
  Card,
  Select,
  Button,
  Spin,
  Space,
  Input,
} from "antd";
import { connect } from "react-redux";
import { EyeOutlined, LoadingOutlined, EditOutlined } from "@ant-design/icons";
import { companyStatusList } from "../../pages/constant/constant";
import { COMPANY } from "../../../ApiUrl";
import Filters from "../filter";
import { getFormatDate, showError } from "../../pages/utils/helpers";

const { Search } = Input;
const { Option } = Select;
class Clients extends React.Component {
  columns = [
    {
      title: "Company Code",
      dataIndex: "company_code",
      key: "company_code",
      render: (Code) => {
        return "#" + Code;
      },
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (Code, record, index) => {
        return this.props.role === "bdm"
          ? Code.charAt(0).toUpperCase() + Code.slice(1)
          : this.statusItemView(Code, record, index);
      },
    },
    {
      title: "Create Date",
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
      //render: () => <Button type="primary" icon={<EyeOutlined />} />,
      render: (text, record, index) => (
        <Space size="middle">
          <NavLink
            to={{
              state: { record: record },
            }}
          >
            <Button
              onClick={(e) => {
                this.onEdit(record._id, e);
              }}
              type="primary"
              icon={<EditOutlined />}
            />
          </NavLink>
          <NavLink
            to={{
              pathname: `/${this.props.role}/ClientDetail`,
              state: { record: record },
            }}
          >
            <Button type="primary" icon={<EyeOutlined />} />
          </NavLink>
        </Space>
      ),
    },
  ];
  callBackParam = {};
  constructor(props) {
    super(props);
    this.state = {
      clientres: "",
      clientsList: "",
      loading: false,
      page: 1,
      search: "",
    };
  }
  statusItemView = (Code, record, index) => {
    return (
      <Select
        placeholder="Select Status Name"
        value={Code}
        onChange={(status) => {
          this.updateClientStatus(record, status);
        }}
        style={{ width: "100%" }}
      >
        <Option value={""}>{"Select"}</Option>
        {companyStatusList !== undefined &&
          companyStatusList.map((status, index) => (
            <Option key={index.toString()} value={status.value}>
              {status.label}
            </Option>
          ))}
      </Select>
    );
  };
  componentDidMount() {
    this.getClientList();
  }
  getClientList = function(param) {
    if (param) {
      axios
        .post(COMPANY, param, { headers: { Authorization: this.props.token } })
        .then((res) => {
          this.setState({ clientres: res.data.data });
        })
        .catch((error) => {});
    }
  };
  onEdit = (key, e) => {
    e.preventDefault();
    const data = this.state.clientres
      ? this.state.clientres.company_list_details.find(
          (item) => item._id === key
        )
      : [];
    this.props.history.push({
      pathname: `/${this.props.role}/edit-client`,
      state: data, // your data array of objects
    });
  };
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

  callBack = (value) => {
    const user = this.props.users;
    this.callBackParam = value;
    const param = {
      current_page: this.state.page,
      per_page: "10",
      order_direction: "desc",
      search: this.state.search.replaceAll("#", ""),
      order: "created_at",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
      bdm_id: user ? (user.role == "bdm" ? user.user._id : null) : "",
      //  company_id: "",
    };
    this.getClientList(param);
  };

  updateClientStatus = (record, status) => {
    if (record) {
      this.setState({
        success: false,
        loading: true,
        error: false,
        successMessage: "",
        errorMessage: "",
      });
      const param = { status: status };
      axios
        .post(COMPANY + "/status/" + record._id, param, {
          headers: { Authorization: this.props.users.token },
        })
        .then((res) => {
          if (!res.data.error) {
            this.setState({
              success: true,
              loading: false,
              error: false,
              successMessage: res.data.message,
              errorMessage: "",
            });
            this.setDefaultState();
            setTimeout(() => {
              this.callBack(this.callBackParam);
            }, 3000);
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
  render() {
    const _this = this;
    const ClientsList = this.state.clientres
      ? this.state.clientres.company_list_details
      : [];
    const totalRecords = this.state.clientres.totalRecords;
    const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
    return (
      <div>
        <Spin indicator={antIcon} spinning={this.state.loading}>
          <Filters
            callBack={this.callBack}
            showCategory={true}
            showCompany={false}
            statusObject={companyStatusList}
          />
          {showError(
            this.state.success,
            this.state.successMessage,
            this.state.error,
            this.state.errorMessage
          )}
          <div className="row">
            <div className="card-body py-3 px-3">
              <Card
                title="Clients Stats"
                bordered={false}
                className="px-0 py-0"
                extra={
                  <NavLink to={`/${this.props.role}/add-client`}>
                    <Button type="primary">Add New Client</Button>
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
                {ClientsList !== undefined ? (
                  <Table
                    pagination={{
                      total: totalRecords,
                      showSizeChanger: false,
                      onChange(current) {
                        _this.setState(
                          {
                            page: current,
                          },
                          function() {
                            _this.callBack(_this.callBackParam);
                          }
                        );
                      },
                    }}
                    dataSource={ClientsList}
                    columns={this.columns}
                  />
                ) : null}
              </Card>
            </div>
          </div>
        </Spin>
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

export default connect(mapStateToProps)(Clients);
