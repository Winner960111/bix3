import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, useHistory } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { PersistGate } from "redux-persist/integration/react";
import { Routes } from "../App/Routes";
import {
  LayoutSplashScreen,
  BlueBixThemeProvider,
} from "../_theme_parts/layout";
//import "antd/dist/antd.css";
import 'antd/dist/antd.min.css';
export default function App({ store, basename, persistor }) {

  // moment.tz.setDefault("Asia/Kolkata");

  let history = useHistory();
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<LayoutSplashScreen />}>
          <React.Suspense fallback={<LayoutSplashScreen />}>
            <BrowserRouter basename={basename}>
              <BlueBixThemeProvider>
                <Routes history={history} />
              </BlueBixThemeProvider>
            </BrowserRouter>
          </React.Suspense>
        </PersistGate>
      </Provider>
    </IntlProvider>
  );
}
