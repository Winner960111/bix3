import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { onLogout } from "../../../../redux/actions/users";

class Logout extends Component {
  componentDidMount() {
    this.props.logout();
  }
  render() {
    const { hasAuthToken, users } = this.props;
    if (users.role !== "candidate") {
      localStorage.setItem("loggedOutUserRole", users.role);
      // return <Redirect to={"/auth/" + users.role + "/login"} />;
      return <Redirect to={"/auth/login"} />;
    } else return <Redirect to={"/auth/login"} />;
    //   return(<></>)
  }
}

// Map Redux state to React component props
const mapStateToProps = (state) => {
  return {
    hasAuthToken: state.users.token,
    users: state.users,
  };
};

const mapDispatchToProps = (dispatch) => ({
  logout: () => {
    dispatch(onLogout());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
