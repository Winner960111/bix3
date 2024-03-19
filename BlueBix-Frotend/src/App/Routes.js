/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React from "react";
import { Redirect, Switch, Route, useLocation } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { Layout } from "../_theme_parts/layout";
import BasePage from "./BasePage";
import { Logout, AuthPage } from "./modules/Auth";
import ErrorsPage from "./modules/ErrorsExamples/ErrorsPage";

export function Routes() {
  const { isAuthorized } = useSelector(
    ({ users }) => ({
      isAuthorized: users.token,
    }),
    shallowEqual
  );
  const pathname = useLocation().pathname;
  const loggedOutUserRole = localStorage.getItem('loggedOutUserRole');
  const redirectPath = '/auth/' + (loggedOutUserRole ? loggedOutUserRole + '/' : '') + 'login';

  return (
    <Switch>
      {!isAuthorized ? (
        /*Redirect to `/auth` when user is not authorized*/
        pathname.startsWith('/auth') ? (<Route>
          <AuthPage />
        </Route>) : (<Redirect to={redirectPath} />)

      ) : (
        <Layout>
          <BasePage />
        </Layout>
      )}

      {!isAuthorized ? (
        /*Render auth page when user at `/auth` and not authorized.*/
        <Route>
          <AuthPage />
        </Route>
      ) : (
        /*Otherwise redirect to root page (`/`)*/
        <Redirect from="/auth" to="/" />
      )}

      <Route path="/error" component={ErrorsPage} />
      <Route path="/logout" component={Logout} />


    </Switch>
  );
}
