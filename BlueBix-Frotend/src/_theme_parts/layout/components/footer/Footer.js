import React, {useMemo} from "react";
import {useHtmlClassService} from "../../_core/Layout";

export function Footer() {
  const today = new Date().getFullYear();
  const uiService = useHtmlClassService();

  const layoutProps = useMemo(() => {
    return {
      footerClasses: uiService.getClasses("footer", true),
      footerContainerClasses: uiService.getClasses("footer_container", true)
    };
  }, [uiService]);

  return (
    <div
      className={`footer bg-white py-4 d-flex flex-lg-column  ${layoutProps.footerClasses}`}
      id="kt_footer"
    >
      <div
        className={`${layoutProps.footerContainerClasses} d-flex flex-column flex-md-row align-items-center justify-content-between`}
      >
        <div className="text-dark order-2 order-md-1">
          <span className="text-muted font-weight-bold mr-2">{today.toString()}</span> &copy;
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-75 text-hover-primary"
          >
            BlueBix Recruitment
          </a>
        </div>
        {/* <div className="nav nav-dark order-1 order-md-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link pr-3 pl-0"
          >
            About
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link px-3"
          >
            Team
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link pl-3 pr-0"
          >
            Contact
          </a>
        </div> */}
      </div>
    </div>
  );
}
