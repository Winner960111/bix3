import React from "react";
import { Link, Switch, Redirect, Route, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_theme_parts/_helpers";
import Login from "./Login";
import Registration from "./Registration";
import Logout from "./Logout";
import ResetPassword from "./ResetPassword";
import ForgotPassword from "./ForgotPassword";
import { ContentRoute } from "../../../../_theme_parts/layout";
import BaseRegistration from "./BaseRegistration";

const getAuthLink = (location, page) => {
  // return "/auth/" + page;
  if (location.indexOf("admin") !== -1) {
    return "/auth/admin/" + page;
  } else if (location.indexOf("recruiter") !== -1) {
    return "/auth/recruiter/" + page;
  } else if (location.indexOf("bdm") !== -1) {
    return "/auth/bdm/" + page;
  } else if (location.indexOf("company") !== -1) {
    return "/auth/company/" + page;
  } else {
    return "/auth/" + page;
  }
};

export default function RecruiterAuth() {
  const location = useLocation().pathname.toString();
  const to_login = getAuthLink(location, "login");
  const to_register = getAuthLink(location, "registration");
  const isShowRegister =
    location.includes("bdm") || location.includes("recruiter");

  return (
    <div className="d-flex flex-column flex-root">
      {/*begin::Login*/}
      <div
        className="login login-1 login-signin-on d-flex flex-column flex-lg-row flex-column-fluid bg-white"
        id="kt_login"
      >
        {/*begin::Aside*/}
        <div
          className="login-aside d-flex flex-row-auto bgi-size-cover bgi-no-repeat p-10 p-lg-10"
          style={{
            backgroundImage: `url(${toAbsoluteUrl("/media/bg/bg-11.jpg")})`,
          }}
        >
          {/*begin: Aside Container*/}
          <div className="d-flex flex-row-fluid flex-column justify-content-between">
            {/* start:: Aside header */}
            <Link to="/" className="flex-column-auto mt-5 pb-lg-0 pb-10">
              <img
                alt="Logo"
                className="max-h-70px"
                src={toAbsoluteUrl("/media/logos/bluebix-logo-alphabet-b.png")}
              />
            </Link>
            {/* end:: Aside header */}
            {/* start:: Aside content */}
            <div className="flex-column-fluid d-flex flex-column justify-content-center">
              <h3 className="font-size-h1 mb-5 text-white">
                Welcome to BlueBix Recruitment
              </h3>
            </div>
            {/* end:: Aside content */}
          </div>
          {/*end: Aside Container*/}
        </div>
        {/*begin::Aside*/}
        {/*begin::Content*/}
        <div className="d-flex flex-column flex-row-fluid position-relative p-7 overflow-hidden">
          {/*begin::Content header*/}
          <div className="position-absolute top-0 right-0 text-right mt-5 mb-15 mb-lg-0 flex-column-auto justify-content-center py-5 px-10">
            {location.indexOf("registration") !== -1 ? (
              <>
                <span className="font-weight-bold text-dark-50">
                  Already Registred?
                </span>
                <Link
                  to={to_login}
                  className="font-weight-bold ml-2"
                  id="kt_login_signup"
                >
                  Sign In!
                </Link>
              </>
            ) : !isShowRegister ? (
              <>
                <span className="font-weight-bold text-dark-50">
                  Don't have an account yet?
                </span>
                <Link
                  to={to_register}
                  className="font-weight-bold ml-2"
                  id="kt_login_signup"
                >
                  Sign Up!
                </Link>
              </>
            ) : (
              <></>
            )}
          </div>
          {/*end::Content header*/}
          {/* begin::Content body */}
          <div className="d-flex flex-column-fluid flex-center mt-30 mt-lg-0">
            <Switch>
              {
                <Redirect
                  exact={true}
                  from="/auth/"
                  to="/auth/login"
                ></Redirect>
              }
              <ContentRoute path="/auth/login" component={Login} />
              {/* <ContentRoute
                path="/auth/registration"
                component={Registration}
              /> */}
              <ContentRoute
                path="/auth/registration"
                component={BaseRegistration}
              />
              <ContentRoute
                path="/auth/forgot-password"
                component={ForgotPassword}
              />
              <ContentRoute path="/auth/logout" component={Logout} />
              <Route
                path="/auth/reset-password/:id"
                component={ResetPassword}
              />
            </Switch>
          </div>
          {/*end::Content body*/}
        </div>
        {/*end::Content*/}
      </div>
      {/*end::Login*/}
    </div>
  );
}
