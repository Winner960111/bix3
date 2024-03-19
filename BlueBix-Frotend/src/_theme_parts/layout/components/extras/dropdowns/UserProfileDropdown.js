/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import SVG from "react-inlinesvg";
import Dropdown from "react-bootstrap/Dropdown";
import { useSelector } from "react-redux";
import objectPath from "object-path";
import { useHtmlClassService } from "../../../_core/Layout";
import { toAbsoluteUrl } from "../../../../_helpers";
import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import { IMAGE_USER_URL, IMAGE_CANDIDATE_URL } from "../../../../../ApiUrl";

export function UserProfileDropdown() {
  const { user, role } = useSelector(({ users }) => users);
  const uiService = useHtmlClassService();
  const layoutProps = useMemo(() => {
    return {
      light:
        objectPath.get(uiService.config, "extras.user.dropdown.style") ===
        "light",
    };
  }, [uiService]);

  // /admin/user-profile

  // For profile picture

  const defaultImg = IMAGE_USER_URL + 'default.png';
  let profilePicUrl = user.profile_picture ? IMAGE_USER_URL + user.profile_picture : defaultImg;
  if (role == 'candidate') {
    profilePicUrl = user.profile_image ? IMAGE_CANDIDATE_URL + user.profile_image : defaultImg;
  }

  return (
    <Dropdown drop="down" alignRight>
      <Dropdown.Toggle
        as={DropdownTopbarItemToggler}
        id="dropdown-toggle-user-profile"
      >
        <div
          className={
            "btn btn-icon w-auto btn-clean d-flex align-items-center btn-lg px-2"
          }
        >
          <span className="text-muted font-weight-bold font-size-base d-none d-md-inline mr-1">
            Hi,
          </span>
          <span className="text-dark-50 font-weight-bolder font-size-base d-none d-md-inline mr-3">
            {user && role === "company"
              ? user.contact_person_details === undefined
                ? user.company_name
                : user.contact_person_details.first_name
              : user.display_name
                ? user.display_name
                : user.first_name}
          </span>
          <span className="symbol symbol-35 symbol-light-success">
            <span className="symbol-label font-size-h5 font-weight-bold">
              {user && role === "company"
                ? user.contact_person_details === undefined
                  ? user.company_name.slice(0, 1)
                  : user.contact_person_details.first_name.slice(0, 1)
                : user.first_name.slice(0, 1)}
            </span>
          </span>
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
        <>
          {/** ClassName should be 'dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl' */}
          {layoutProps.light && (
            <>
              <div className="d-flex align-items-center p-8 rounded-top">
                <div className="symbol symbol-md bg-light-primary mr-3 flex-shrink-0">
                  <img src={toAbsoluteUrl("/media/users/300_21.jpg")} alt="" />
                </div>
                <div className="text-dark m-0 flex-grow-1 mr-3 font-size-h5">
                  {/* {user && user.first_name} {user && user.last_name} */}
                </div>
              </div>
              <div className="separator separator-solid"></div>
            </>
          )}
          {!layoutProps.light && (
            <div
              className="d-flex align-items-center justify-content-between flex-wrap p-8 bgi-size-cover bgi-no-repeat rounded-top"
              style={{
                backgroundImage: `url(${toAbsoluteUrl(
                  "/media/misc/bg-1.jpg"
                )})`,
              }}
            >
              <div className="symbol bg-white-o-15 mr-3">
                {/* <span className="symbol-label text-success font-weight-bold font-size-h4">
                  {user && role === "company"
                    ? user.contact_person_details === undefined
                      ? user.company_name.slice(0, 1)
                      : user.contact_person_details.first_name.slice(0, 1)
                    : user.first_name.slice(0, 1)}
                </span> */}

                {/*<img alt="Pic" className="hidden" src={user.pic} />*/}
                <img
                  alt="Profile Pic"
                  className="hidden"
                  src={profilePicUrl}
                />
              </div>
              <div className="text-white m-0 flex-grow-1 mr-3 font-size-h5">
                {user && role === "company"
                  ? user.contact_person_details === undefined
                    ? user.company_name
                    : user.contact_person_details.first_name
                  : user.display_name ? user.display_name : user.first_name}
              </div>
              {user && role !== "candidate" ? (
                <div className="navi navi-spacer-x-0">
                  <div className="navi-footer px-0 py-4">
                    <Link
                      to={"/" + role + "/user-profile"}
                      className="btn btn-light-primary font-weight-bold d-flex justify-content-center align-items-center"
                    >
                      Profile
                      {/* <span className="svg-icon svg-icon-xl ml-2">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Electric/Shutdown.svg")}
                />
              </span> */}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
        <div className="navi navi-spacer-x-0">
          <div className="navi-footer px-8 py-8">
            <Link
              to="/logout"
              className="btn btn-light-primary font-weight-bold d-flex justify-content-center align-items-center"
            >
              Sign Out
              <span className="svg-icon svg-icon-xl ml-2">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Electric/Shutdown.svg")}
                />
              </span>
            </Link>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
