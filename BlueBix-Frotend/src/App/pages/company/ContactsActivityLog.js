import React from "react";
import axios from "axios";
import { CONTACT_ACTIVITY_LIST } from "../../../ApiUrl";
import { Table, Card, Spin } from "antd";
import { connect } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";
import { } from "../constant/constant";
import { getFormatDate, showError } from "../utils/helpers";

class ContactActivityLogList extends React.Component {
  columns = [
    {
      title: "Section",
      dataIndex: "module",
      key: "module",
    },
    {
      title: "Activity",
      dataIndex: "activity_log",
      key: "activity_log",
    },
    {
      title: "Posted Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => {
        return date ? getFormatDate(date) : "";
      },
    },
    // {
    //   title: "Contact Name",
    //   dataIndex: "contact_id",
    //   key: "contact_id",
    //   render: (contact_id) => {
    //     return contact_id.length > 0 ? contact_id[0].display_name : "";
    //   },
    // },
  ];

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      contactResponse: "",
      order_direction: "desc",
      page: 1,
      per_page: 10,
    };
  }

  getContactActivityList = () => {
    axios
      .post(
        CONTACT_ACTIVITY_LIST,
        {
          current_page: this.state.page,
          per_page: this.state.per_page,
          search: "",
          order: "created_at",
          order_direction: this.state.order_direction,
          contact_id: "",
          company_id: this.props.users.user._id
        },
        {
          headers: { Authorization: this.props.token },
        }
      )
      .then((res) => {
        this.setState({ contactResponse: res.data.data });
      })
      .catch((error) => {
      });
  };

  componentDidMount() {
    this.getContactActivityList();
  }

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
    const contact_list_details = this.state.contactResponse
      .contact_activity_listing;
    const totalRecords = this.state.contactResponse.totalRecords;
    const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
    return (
      <div>
        <Spin indicator={antIcon} spinning={this.state.loading}>
          <Card
            title="Contact Activity List"
            bordered={false}
            className="px-0 py-0"
          >
            {showError(
              this.state.success,
              this.state.successMessage,
              this.state.error,
              this.state.errorMessage
            )}
            <div className="row">
              <div className="col-lg-12">
                <div className={`card card-custom card-stretch gutter-b`}>
                  <div className="card-body py-3 px-3">
                    <Table
                      pagination={{
                        total: totalRecords,
                        showSizeChanger: false,
                        onChange(current) {
                          _this.setState(
                            {
                              page: current,
                            },
                            function () {
                              _this.getContactActivityList();
                            }
                          );
                        },
                      }}
                      dataSource={contact_list_details}
                      columns={this.columns}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
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
  };
};

export default connect(mapStateToProps)(ContactActivityLogList);
