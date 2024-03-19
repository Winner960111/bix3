/* eslint-disable no-lone-blocks */
import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { CONTACTS, CONTACTS_ADMIN } from "../../../../../ApiUrl";
import { Table, Card, Button, Popconfirm, Spin } from "antd";
import { connect } from "react-redux";
import {
    EditOutlined,
    DeleteOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { } from "../../../../pages/constant/constant";
import { getFormatDate, showError } from "../../../../pages/utils/helpers";

class ContactsList extends React.Component {
    columns = [
        {
            title: "First Name",
            dataIndex: "first_name",
            key: "first_name",
        },
        {
            title: "Last Name",
            dataIndex: "last_name",
            key: "last_name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Posted Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => {
                return date ? getFormatDate(date) : "";
                //  return date ? date : '';
            },
        },
        {
            title: "Action",
            dataIndex: "",
            key: "x",
            render: (text, record, index) => (
                <>
                    <NavLink
                        to={{
                            pathname: `/${this.props.role}/addContact`,
                            state: { record: record },
                        }}
                    >                        
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: "#1890ff" }} />}
                        />
                    </NavLink>
                    <Popconfirm
                        title="Are you sure you want to delete？"
                        onConfirm={() => this.deleteItem(record)}
                        icon={<DeleteOutlined style={{ color: "red" }} />}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                        />
                    </Popconfirm>
                </>
            ),
        },
    ];

    columns1 = [
        {
            title: "First Name",
            dataIndex: "first_name",
            key: "first_name",
        },
        {
            title: "Last Name",
            dataIndex: "last_name",
            key: "last_name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Posted Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => {
                return date ? getFormatDate(date) : "";
                //  return date ? date : '';
            },
        },
    ];

    //candidate_submission_details
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            contacts: [],
            order_direction: "desc",
            page: 1,
            per_page: 10,
        };
    }

    getContactList = () => {
        axios
            .post(
                CONTACTS_ADMIN,
                {
                    current_page: this.state.page,
                    per_page: this.state.per_page,
                    order_direction: this.state.order_direction,
                    search: "",
                    order: "updated_at",
                },
                {
                    headers: { Authorization: this.props.token },
                }
            )
            .then((res) => {
                this.setState({ contacts: res.data.data });
                // this.setState({ contactResponse: res.data.data });
            })
            .catch((error) => {
            });
    };

    componentDidMount() {
        this.getContactList();
        // this.getContactList2();
    }

    deleteItem = (record) => {
        if (record != undefined) {
            axios
                .delete(CONTACTS + "/" + record._id, {
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
                        setTimeout(() => {
                            this.setDefaultState();
                            this.getContactList();
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
        const contact_list_details = this.state.contacts.paginatedResults;
        const totalRecords = this.state.contacts.count;
        const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
        const isCompanyProfileEditable =
            this.props.users.user.contact_person_details === undefined ? false : true;
        return (
            <div>
                <Spin indicator={antIcon} spinning={this.state.loading}>
                    <Card
                        title="Contact List"
                        bordered={false}
                        className="px-0 py-0"
                        extra={
                            isCompanyProfileEditable === false ? (
                                <NavLink to={`/${this.props.role}/addContact`}>
                                    <Button type="primary">Add New Contact</Button>
                                </NavLink>
                            ) : null
                        }
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
                                                // onChange(current) {
                                                //   _this.setState(
                                                //     {
                                                //       page: current,
                                                //     },
                                                //     function() {
                                                //       _this.getContactList();
                                                //     }
                                                //   );
                                                // },
                                            }}
                                            dataSource={contact_list_details}
                                            columns={
                                                isCompanyProfileEditable === false
                                                    ? this.columns
                                                    : this.columns1
                                            }
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

export default connect(mapStateToProps)(ContactsList);
