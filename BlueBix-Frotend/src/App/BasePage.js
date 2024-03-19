import React, { Suspense } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { LayoutSplashScreen, ContentRoute } from "../_theme_parts/layout";
import { MyPage } from "./pages/MyPage";
import { DashboardPage } from "./pages/DashboardPage";
import OpeningList from "./modules/Openings/OpeningList";

import UserList from "./modules/Auth/pages/admin/UserList/UserList";
import AddUser from "./modules/Auth/pages/admin/UserList/createUser";
import EditUser from "./modules/Auth/pages/admin/UserList/EditUser";
import UserProfilepage from "./modules/ProfileUser/Profile";
import OpeningsDetail from "./modules/Openings/OpeningsDetail";
import CandidateList from "./modules/Auth/pages/admin/candidate/CandidateList";
import ContactsListAdmin from "./modules/Auth/pages/admin/ContactsList";

import AdminMessages from "./modules/adminMessages/Messages";
import SubscriptionAdmin from "./modules/Subscription/Subscription";
import AddEditSubscription from "./modules/Subscription/AddSubscription";
import AdminReports from "./modules/Auth/pages/admin/reports";
import UserWiseCandidateSubmissionList from "./modules/Openings/UserWiseCandidateSubmissionList";
import ClientsList from "./modules/clients/ClientsList";
import ClientDetail from "./modules/clients/ClientDetail";
import AddCandidate from "./modules/AddCandidate/AddCandidate";
import AiRecruiter from "./modules/AiRecruiter/AiRecruiter";

import AddOpening from "./pages/company/AddOpening/AddOpening";
import AddOpeningBdm from "./pages/bdm/company/AddOpening";

import OpeningCompanyList from "./pages/company/OpeningList";
import OpeningsDetailCompany from "./pages/company/OpeningsDetail";
import CompanyProfile from "./pages/company/CompanyProfile";
import CompanyCandidateList from "./pages/company/CandidateList";
import CandidateProfileDetail from "./pages/company/CandidateProfileDetail";
import Subscription from "./pages/company/Subscription";
import Messages from "./pages/company/Messages";
import ContactsList from "./pages/company/contacts/ContactsList";
import AddContact from "./pages/company/contacts/AddEditContact";
import ContactActivityLogList from "./pages/company/ContactsActivityLog";
import OpeningWiseCandidateList from "./pages/company/OpeningWiseCandidateList";
import CompanyReports from "./pages/company/reports";

import OpeningsDetailBDM from "./pages/bdm/OpeningsDetail";
import AssignJobs from "./pages/bdm/AssignedJobs";
import OpeningCompanyListBDM from "./pages/bdm/company/OpeningCompanyListBDM";
import ContactsListBDM from "./pages/bdm/company/ContactsList";
import AddContactBDM from "./pages/bdm/company/AddEditContact";
import WorkJobsListByFreelancer from "./pages/bdm/WorkJobsListByFreelancer";
import BDMReports from "./pages/bdm/reports";

import FreelancerSearchJobs from "./pages/freelancerecruiter/SearchJobs";
import FreelancerSearchJobDetail from "./pages/freelancerecruiter/SearchJobDetail";

import OpeningsDetailFreelancerecruite from "./pages/freelancerecruiter/OpeningsDetail";
import FreelancerReports from "./pages/freelancerecruiter/reports";
import AssignJobsFreelancer from "./pages/freelancerecruiter/assignedJobs";
import MessagesFreelancer from "./pages/freelancerecruiter/Messages";

import AssignJobsRecruiter from "./pages/recruiter/assignedJobs";
import OpeningsDetailRecruiter from "./pages/recruiter/OpeningsDetail";

import CandidateApplyJobs from "./pages/recruiter/CandidateApplyJobList";

import RecruiterReports from "./pages/recruiter/reports";

import CandidateProfile from "./pages/Candidate/Profile";
import SearchJobs from "./pages/Candidate/SearchJobs";
import MyJobApplication from "./pages/Candidate/MyJobApplication";
import JobDetail from "./pages/Candidate/JobDetail";
import SearchJobDetail from "./pages/Candidate/SearchJobDetail";
import SavedJobs from "./pages/Candidate/SavedJobs";
import CandidateMessages from "./pages/Candidate/Messages";

import { useSelector } from "react-redux";
import { Logout } from "./modules/Auth";
import createCompany from "./pages/company/createCompany";
import editCompany from "./pages/company/editCompany";
import MonsterSearch from "./modules/monster";
import SearchList from "./modules/monster/SearchList";
import SearchDetail from "./modules/monster/SearchDetail";

export default function BasePage() {
  const role = useSelector(({ users }) => users.role);
  localStorage.removeItem('loggedOutUserRole');
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {/* Redirect from root URL to /dashboard. */
        role === "candidate" ? (
          <Redirect exact from="/" to="/candidate/profile" />
        ) : (
          <Redirect exact from="/" to="/dashboard" />
        )}
        {role === "admin" ? (
          <div>
            <ContentRoute path="/dashboard" component={DashboardPage} />
            <ContentRoute path="/my-page" component={MyPage} />
            <ContentRoute path="/current-openings" component={OpeningList} />
            <ContentRoute path="/user/list/:status" component={UserList} />
            <ContentRoute
              path="/admin/opening-detail"
              component={OpeningsDetail}
            />

            <Route path="/admin/add-opening" component={AddOpeningBdm} />
            <Route path="/admin/AIrecruiter" component={AiRecruiter} />
            <ContentRoute path="/user/add-user" component={AddUser} />
            <ContentRoute path="/user/edit-user" component={EditUser} />
            <Route
              path="/admin/candidateProfileDetail"
              component={CandidateProfileDetail}
            />
            <ContentRoute
              path="/user/candidateList"
              component={CandidateList}
            />
            <Route path="/admin/addCandidate" component={AddCandidate} />
            <ContentRoute
              path="/admin/user-profile"
              component={UserProfilepage}
            />
            <Route path="/admin/ClientsList" component={ClientsList} />
            <Route path="/admin/ClientDetail" component={ClientDetail} />

            <Route path="/admin/add-client" component={createCompany}></Route>
            <Route path="/admin/edit-client" component={editCompany}></Route>

            <Route path="/admin/contacts" component={ContactsListAdmin}></Route>
            <Route path="/admin/addContact" component={AddContactBDM}></Route>

            <Route path="/admin/messages" component={AdminMessages} />
            <Route path="/admin/Subscription" component={SubscriptionAdmin} />
            <Route
              path="/admin/AddEditSubscription"
              component={AddEditSubscription}
            />
            <Route path="/admin/reports" component={AdminReports} />
            <Route path="/admin/monsterSearch" component={MonsterSearch} />
            <Route path="/admin/SearchList" component={SearchList} />
            <Route path="/admin/SearchDetail" component={SearchDetail} />
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}
        {role === "company" ? (
          <div>
            <Route path="/dashboard" component={DashboardPage} />
            <Route
              path="/company/job-openings"
              component={OpeningCompanyList}
            />
            <Route path="/company/add-opening" component={AddOpening} />
            <Route
              path="/company/opening-detail"
              component={OpeningsDetailCompany}
            />
            <Route path="/company/user-profile" component={CompanyProfile} />
            <Route
              path="/company/candidates"
              component={CompanyCandidateList}
            />
            <Route path="/company/subscription" component={Subscription} />
            <Route path="/company/messages" component={Messages} />
            <Route
              path="/company/candidateProfileDetail"
              component={CandidateProfileDetail}
            />
            <Route path="/company/Contacts" component={ContactsList} />
            <Route path="/company/AddContact" component={AddContact} />
            <Route
              path="/company/contactActivityLogList"
              component={ContactActivityLogList}
            />
            <Route
              path="/company/OpeningWiseCandidates/:openingid/:companyid/:status"
              component={OpeningWiseCandidateList}
            />
            {/*<Route path="/company/agreements" component={AgreementListing}/>*/}
            <Route path="/company/reports" component={CompanyReports} />
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}
        {role === "bdm" ? (
          <div>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/bdm/ClientsList" component={ClientsList} />
            <Route path="/bdm/assign-jobs" component={AssignJobs} />
            <Route path="/bdm/add-opening" component={AddOpeningBdm} />
            <Route path="/bdm/opening-detail" component={OpeningsDetailBDM} />
            <Route path="/bdm/user-profile" component={UserProfilepage} />
            <Route path="/bdm/job-openings" component={OpeningCompanyListBDM} />
            <Route
              path="/bdm/candidateProfileDetail"
              component={CandidateProfileDetail}
            />
            <Route path="/bdm/AIrecruiter" component={AiRecruiter} />
            <Route path="/bdm/ClientDetail" component={ClientDetail} />
            <Route
              path="/bdm/OpeningWiseCandidates/:openingid/:companyid/:status"
              component={OpeningWiseCandidateList}
            />
            <Route path="/bdm/messages" component={AdminMessages} />
            <Route
              path="/bdm/workJobsList"
              component={WorkJobsListByFreelancer}
            />
            <Route path="/bdm/addCandidate" component={AddCandidate} />

            <Route path="/bdm/CandidateList" component={CandidateList} />

            {/*<Route path="/company/agreements" component={AgreementListing}/>*/}
            <Route path="/bdm/reports" component={BDMReports} />
            <Route
              path="/bdm/userWiseCandidateSubmission/:status"
              component={UserWiseCandidateSubmissionList}
            />
            <Route path="/bdm/add-client" component={createCompany}></Route>
            <Route path="/bdm/edit-client" component={editCompany}></Route>
            <Route path="/bdm/contacts" component={ContactsListBDM}></Route>
            <Route path="/bdm/addContact" component={AddContactBDM}></Route>
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}
        {role === "recruiter" ? (
          <div>
            <Route path="/dashboard" component={DashboardPage} />
            <Route
              path="/recruiter/assign-jobs"
              component={AssignJobsRecruiter}
            />
            <Route
              path="/recruiter/opening-detail"
              component={OpeningsDetailRecruiter}
            />
            <Route path="/recruiter/user-profile" component={UserProfilepage} />
            <Route
              path="/recruiter/candidateProfileDetail"
              component={CandidateProfileDetail}
            />
            <Route path="/recruiter/AIrecruiter" component={AiRecruiter} />
            <Route
              path="/recruiter/OpeningWiseCandidates/:openingid/:companyid/:status"
              component={OpeningWiseCandidateList}
            />
            <Route path="/recruiter/addCandidate" component={AddCandidate} />
            <Route
              path="/recruiter/candidateApplyJobs"
              component={CandidateApplyJobs}
            />
            <Route path="/recruiter/messages" component={AdminMessages} />
            <Route path="/recruiter/reports" component={RecruiterReports} />
            <Route
              path="/recruiter/userWiseCandidateSubmission/:status"
              component={UserWiseCandidateSubmissionList}
            />
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}
        {role === "freelancerecruiter" ? (
          <div>
            <Route path="/dashboard" component={DashboardPage} />
            <Route
              path="/freelancerecruiter/all-jobs"
              component={FreelancerSearchJobs}
            />
            <Route
              path="/freelancerecruiter/assign-jobs"
              component={AssignJobsFreelancer}
            />
            <Route
              path="/freelancerecruiter/SearchJobDetail"
              component={FreelancerSearchJobDetail}
            />
            <Route
              path="/freelancerecruiter/addCandidate"
              component={AddCandidate}
            />
            <Route
              path="/freelancerecruiter/AIrecruiter"
              component={AiRecruiter}
            />

            <Route
              path="/freelancerecruiter/opening-detail"
              component={OpeningsDetailFreelancerecruite}
            />
            <Route
              path="/freelancerecruiter/OpeningWiseCandidates/:openingid/:companyid/:status"
              component={OpeningWiseCandidateList}
            />
            <Route
              path="/freelancerecruiter/user-profile"
              component={UserProfilepage}
            />
            <Route
              path="/freelancerecruiter/candidateProfileDetail"
              component={CandidateProfileDetail}
            />
            <Route
              path="/freelancerecruiter/messages"
              component={MessagesFreelancer}
            />
            <Route
              path="/freelancerecruiter/reports"
              component={FreelancerReports}
            />
            <Route
              path="/freelancerecruiter/userWiseCandidateSubmission/:status"
              component={UserWiseCandidateSubmissionList}
            />
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}

        {role === "candidate" ? (
          <div>
            <Route path="/candidate/SearchJobs" component={SearchJobs} />
            <Route
              path="/candidate/MyJobApplications"
              component={MyJobApplication}
            />
            <Route path="/candidate/JobDetail" component={JobDetail} />
            <Route
              path="/candidate/SearchJobDetail"
              component={SearchJobDetail}
            />
            <Route path="/candidate/messages" component={CandidateMessages} />
            <Route path="/candidate/profile" component={CandidateProfile} />
            <Route path="/candidate/savedJobs" component={SavedJobs} />
            <ContentRoute path="/logout" component={Logout} />
          </div>
        ) : (
          ""
        )}
        <Redirect to="/dashboard" />
        <Redirect to="error/error-v1" />
      </Switch>
    </Suspense>
  );
}
