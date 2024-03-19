import React from 'react';
import ReactDOM from 'react-dom';
// import axios from "axios";
import App from './App/App';
import {store, persistor} from "./redux";
import "./index.scss"; // Standard version
import "./_theme_parts/_assets/plugins/keenthemes-icons/font/ki.css";
import "socicon/css/socicon.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./_theme_parts/_assets/plugins/flaticon/flaticon.css";
import "./_theme_parts/_assets/plugins/flaticon2/flaticon.css";
import "react-datepicker/dist/react-datepicker.css";
import {
  LayoutProvider,
  SplashScreenProvider,
  SubheaderProvider
} from "./_theme_parts/layout";
// import {I18nProvider} from "./_theme_parts/i18n";

const { PUBLIC_URL } = process.env;

ReactDOM.render(
  <>
    <LayoutProvider>
      <SubheaderProvider>
        <SplashScreenProvider>
          <App store={store} persistor={persistor} basename={PUBLIC_URL} />
        </SplashScreenProvider>
      </SubheaderProvider>
    </LayoutProvider>
  </>,
  document.getElementById('root')
);

