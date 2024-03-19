import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { ASSIGNED_RECRUITER_LIST } from "../../../ApiUrl";
import { Button, Card, Table } from "antd";
import { connect } from "react-redux";
import { OpeningStatusList } from "../constant/constant";
import { EyeOutlined } from "@ant-design/icons";
import Filters from "../../modules/filter";
import { getFormatDate } from "../utils/helpers";

class AssignJobs extends React.Component {
  columns = [
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
        const item = OpeningStatusList.find((status) => {
          return Code.toUpperCase() === status.value.toUpperCase();
        });
        return item ? item.label : Code;
      },
    },
    {
      title: "Posted Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date, record, index) => {
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
            pathname: "/freelancerecruiter/opening-detail",
            state: { record: record },
          }}
        >          
          <Button type="primary" icon={<EyeOutlined />} />
        </NavLink>
      ),
    },
  ];
  callBackParam = {};
  constructor(props) {
    super(props);
    this.state = {
      openings: "",
      page: 1,
      per_page: 10,
    };
  }

  componentDidMount() {
    // this.getOpeningList();
    this.getAssignedJobs();
  }

  // getOpeningList = (params) => {
  //   if (params) {
  //     axios
  //       .post(JOBS_LIST, params, {
  //         headers: { Authorization: this.props.token },
  //       })
  //       .then((res) => {
  //         this.setState({ openings: res.data.data });
  //       })
  //       .catch((error) => {
  //         if (error.response && error.response.status === 401) {
  //           this.props.history.push("/logout");
  //         }
  //       });
  //   }
  // };




  getAssignedJobs = (params) => {
    let param = params ? params : {};
    if (!params) {
      param.freelance_id = this.props.users.user._id;
      param.current_page = this.state.page;
      param.per_page = this.state.per_page;
      param.order = "created_at";
    }
    axios
      .post(ASSIGNED_RECRUITER_LIST, param, {
        headers: { Authorization: this.props.token },
      })
      .then((res) => {

        if (res.data.data.job_opening_listing[0])
          this.setState({ openings: res.data.data });

        else
          this.setState({ openings: {} });


      })
      .catch((error) => {
      });

  };

  callBack = (value) => {
    this.callBackParam = value;
    const userId = this.props.users.user._id;
    const param = {
      current_page: this.state.page,
      per_page: this.state.per_page,
      sort_order: "desc",
      filter_value: "",
      order: "created_at",
      dateRange: value.arrayDateRange,
      categories: value.categories,
      status: value.status,
      company_id: value.selectedCompany,
      freelance_id: userId,
    };
    this.getAssignedJobs(param);
    new Promise((resolve, reject) => { });
  };

  render() {
    const _this = this;
    const jobsOpnings = this.state.openings.job_opening_listing;
    const totalRecords = this.state.openings.totalRecords;

    return (
      <div>
        <Filters
          callBack={this.callBack}
          showCategory={true}
          showCompany={false}
        />
        <div className="row">
          <div className="col-lg-12">
            <div className={`card card-custom card-stretch gutter-b`}>
              <div className="card-body py-3 px-3">
                <Card
                  title="Assigned Job List"
                  bordered={false}
                  className="px-0 py-0"
                >
                  <Table
                    pagination={{
                      total: totalRecords,
                      showSizeChanger: false,
                      onChange(current) {
                        _this.setState({ page: current }, function () {
                          // _this.getOpeningList();
                          _this.callBack(_this.callBackParam);
                        });
                      },
                    }}
                    dataSource={jobsOpnings}
                    columns={this.columns}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
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

export default connect(mapStateToProps)(AssignJobs);
