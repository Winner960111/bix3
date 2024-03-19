import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Row, Col } from "antd";
import ProfileCard from "./ProfileCard";
import ProfileQuickLinks from "./ProfileQuickLinks";
import ProfileOverview from "./Profile/ProfileOverview";
import Employment from "./Profile/Employment";
import Education from "./Profile/Education";
import Skills from "./Profile/Skills";
import { CANDIDATE_BY_ID, CATEGORY_LIST } from "../../../ApiUrl";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCategory } from "../../../redux/actions/common";
import { COL } from "../../modules/calrow";

function Profile(props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const dispatch = useDispatch();
  const users = useSelector(({ users }) => users);
  const common = useSelector(({ common }) => common);
  const categoryList = common.category;

  useEffect(() => {
    getUserProfile();
    getCategoriesList();
  }, [users]);

  useEffect(() => {
  }, [common]);
  const getCategoriesList = () => {
    axios
      .get(CATEGORY_LIST, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        //setCategoryList(res.data.data);
        dispatch(setCategory(res.data.data));
      })
      .catch((error) => {
      });
  };

  const getUserProfile = () => {
    axios
      .get(CANDIDATE_BY_ID + "/" + users.user._id, {
        headers: { Authorization: users.token },
      })
      .then((res) => {
        setLoading(false);
        if (!res.data.error) {
          setSuccess(true);
          setLoading(false);
          setError(false);
          setUserProfile(res.data);
          setDefaultState();
        } else {
          setDefaultState();
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          props.history.push("/logout");
        }
        setSuccess(false);
        setLoading(false);
        setError(true);
      });
  };

  const setDefaultState = () => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, 3000);
  };

  const handleUpdateSuccess = (e) => {
    getUserProfile();
  };

  const basicProfile = userProfile.userProfile
    ? userProfile.userProfile.data[0]
    : "";

  // const COL = ({ children, cal }) => {
  //   return (
  //     <Col xs={24} sm={cal} md={cal} lg={cal} xl={cal}>
  //       {children}
  //     </Col>
  //   );
  // };

  return (
    <div>
      <Row gutter={24}>
        <Col span={24} className="mb-6">
          <ProfileCard
            userProfile={userProfile}
            onclick={handleUpdateSuccess}
          />
        </Col>
        <COL cal={6}>
          <ProfileQuickLinks />
        </COL>
        <COL cal={18}>
          <Switch>
            <Redirect
              from="/candidate/profile"
              exact={true}
              to="/candidate/profile/profile-overview"
            />
            <Route
              path="/candidate/profile/profile-overview"
              component={() => (
                <ProfileOverview
                  userProfile={userProfile}
                  onclick={handleUpdateSuccess}
                />
              )}
            />
            <Route
              path="/candidate/profile/employment"
              component={() => (
                <Employment
                  userProfile={userProfile}
                  onclick={handleUpdateSuccess}
                />
              )}
            />
            <Route
              path="/candidate/profile/education"
              component={() => (
                <Education
                  userProfile={userProfile}
                  onclick={handleUpdateSuccess}
                />
              )}
            />
            <Route
              path="/candidate/profile/skills"
              component={() => (
                <Skills
                  userProfile={userProfile}
                  onclick={handleUpdateSuccess}
                />
              )}
            />
          </Switch>
        </COL>
      </Row>
    </div>
  );
}

export default Profile;
