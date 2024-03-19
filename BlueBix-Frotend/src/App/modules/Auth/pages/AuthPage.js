/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { lazy, Suspense } from "react";
import { Switch, Redirect, Route, useLocation } from "react-router-dom";
import { LayoutSplashScreen } from "../../../../_theme_parts/layout";
import "../../../../_theme_parts/_assets/sass/pages/login/classic/login-1.scss";
import { useSelector } from "react-redux";
import NotFound from "../../ErrorsExamples/NotFound";
// ADMIN
const AdminAuth = lazy(() => import("./admin/AdminAuth"));
// Recruitment
const RecruiterAuth = lazy(() => import("./recruiter/RecruiterAuth"));
const FreelanceRecruiterecruiterAuth = lazy(() =>
  import("./freelanceRecruiter/FreelanceRecruiterecruiterAuth")
);
// BDM
const BDMAuth = lazy(() => import("./bdm/BDMAuth"));
// Company
const CompanyAuth = lazy(() => import("./company/Auth"));
// Candidate
const CandidateAuth = lazy(() => import("./CandidateAuth"));


export function AuthPage() {
  const location = useLocation().pathname.toString();
  // const to_login = getAuthLink(location, "login");
  // const to_register = getAuthLink(location, "registration");
  const { isAuthorized } = useSelector(({ users }) => ({
    isAuthorized: users.token,
  }));
  const isShowRegister =
    location.includes("bdm") || location.includes("recruiter");

  // if(!isAuthorized && isAuthorized !== '') {
  //   return (
  //     <Redirect from="/" exact={true} to="/auth/login" />
  //   )
  // }

  return (
    <>
      <Suspense fallback={<LayoutSplashScreen />}>
        <Switch>
          <Route path="/auth/admin" component={AdminAuth} />
          <Route path="/auth/recruiter" component={RecruiterAuth} />
          <Route
            path="/auth/freelanceRecruiter"
            component={FreelanceRecruiterecruiterAuth}
          />
          <Route path="/auth/bdm" component={BDMAuth} />
          <Route path="/auth/company" component={CompanyAuth} />
          <Route path="/auth/" component={CandidateAuth} />
          <Redirect from="/auth" exact={true} to="/auth/login" />
          <Redirect
            from="/auth/candidate/login"
            exact={true}
            to="/auth/login"
          />
          <Redirect from="/" exact={true} to="/auth/login" />
          <Redirect from="/candidates" exact={true} to="/auth/login" />
          <Redirect from="/candidates" exact={true} to="/auth/login" />
          <Route path={"*"} name={"*"} element={<NotFound />} />
        </Switch>
      </Suspense>
    </>
  );
}
