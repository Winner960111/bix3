import React, { useState } from 'react'
import CandidateRegistration from "./Registration";
import FreelanceRegistration from "./freelanceRecruiter/Registration";
import { Radio } from 'antd';
import NewRegistration from './NewRegistration';


const UserRoleValues = [
    { label: 'Candidate', value: 'candidate' },
    { label: 'Freelance Recruiter', value: 'freelancerecruiter' },
];

const BaseRegistration = (props) => {

    console.log('props', props)

    const [role, setRole] = useState('candidate');

    const onChange = (e) => {
        setRole(e.target.value);
    };

    return (
        <div
            className="login-form login-signin"
            style={{ display: "block", maxWidth: "75%" }}
        >
            <div className="text-center mb-10 mb-lg-20">
                <h3 className="font-size-h1">Register with BlueBix Recruitment</h3>
                <p className="text-muted font-weight-bold">
                    Enter your details to create your account
                </p>
                <Radio.Group onChange={onChange} value={role}>
                    {
                        UserRoleValues.map((item, index) => {
                            return <Radio key={index} value={item.value}>{item.label}</Radio>
                        })
                    }
                </Radio.Group>
            </div>
            <div className="mt-10 mb-lg-10" />
            {/* {role == 'candidate' ? <CandidateRegistration /> : <FreelanceRegistration />} */}
            {role == 'candidate' ? <NewRegistration props={props} /> : <FreelanceRegistration  props={props}/>}
        </div>
    )
}

export default BaseRegistration