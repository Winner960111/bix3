import "./this.css";
import RadioButton from "./RadioButton";
import { getRecruiters } from "./_redux/recruiterCrud";
import { useEffect, useState } from "react";
import axios from "axios";
const AiRecruiter = () => {
  const [jobs, setJobs] = useState([]);
  const [displayJobs, setDisplayJobs] = useState([]);
  const [candidate, setCandidates] = useState([]);
  const [displayCandidate, setDisplayCandidates] = useState([]);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [selectJob, setSelectJob] = useState("");
  const [person, setPerson] = useState([]);
  const [levelStatus, setLevelStatus] = useState("simple");

  const getRecruitersHandler = () => {
    
    getRecruiters()
      .then(res => {
        setJobs(res.data.data.jobOpenings);
        setPerson(res.data.data.candidates);
        setDisplayJobs(res.data.data.jobOpenings);
        setDisplayCandidates(res.data.data.candidates);
    })
  }
  useEffect(() => {
    getRecruitersHandler()
  }, []);

  // useEffect(() => {
  //   setDisplayJobs(
  //     jobs.filter((item) =>
  //       item.opening_title.toLowerCase().includes(title.toLowerCase())
  //     )
  //   );
  // }, [title, jobs]);
 
  // useEffect(() => {
  //   setDisplayCandidates(
  //     candidate.filter((item) =>
  //       item.first_name.toLowerCase().includes(name.toLowerCase())
  //     )
  //   );
  // }, [name, candidate]);
  
  useEffect(() => {
    let tempperson = [];
    person.map(
      (item) => (tempperson = [...tempperson, { ...item, checked: false }])
    );
    setCandidates(tempperson);
  }, [person]);


   const searchJob = () => {
     setDisplayJobs(
       jobs.filter((item) =>
         item.opening_title.toLowerCase().includes(title.toLowerCase())
       )
     );
  };
  
  const searchCandidate = () => {
  setDisplayCandidates(
    candidate.filter((item) =>
      item.first_name.toLowerCase().includes(name.toLowerCase())
    )
  );
  }
  const handleSubmit = async () => {
    setStart(false)
    const sendData = {
      jobInfo: selectJob,
      candidates: candidate.filter((item) => item.checked === true),
      level: levelStatus,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("selected Data = >", sendData);

    const url = "http://88.99.162.157:5005/screen_start";

    await axios
      .post(url, JSON.stringify(sendData), config)
      .then((res) => console.log(res))
      .catch((res) => console.log(res));
  };

  const handleCheckboxClick = (e) => {
    setCandidates(
      candidate.map((item) =>
        e._id === item._id ? { ...item, checked: !item.checked } : item
      )
    );
    setDisplayCandidates(
      displayCandidate.map((item) =>
        e._id === item._id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="AiRecruiter">
      <div className="title_bar">
        <div className="title">AI Recruiter</div>
      </div>
      <div className="main">
        <div className="main_job">
          <div className="main_job_search">
            <input
              type="text"
              className="input"
              placeholder="Search Job"
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="button" onClick={searchJob}>
              Search
            </button>
          </div>
          <div className="main_job_display">
            {displayJobs.length !== 0
              ? displayJobs.map((item, id) => (
                  <RadioButton
                    key={id}
                    sendTitle={item}
                    select={setSelectJob}
                  />
                ))
              : null}
          </div>
        </div>
        <div className="main_candidate">
          <div className="main_candidate_search">
            <input
              type="text"
              className="can_input"
              placeholder="Search candidates"
              onChange={(e) => setName(e.target.value)}
            />
            <button className="can_button" onClick={searchCandidate}>
              Search
            </button>
          </div>
          <div className="main_candidate_display">
            {displayCandidate.map((item, index) => (
              <label key={index} className="lab2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onClick={() => handleCheckboxClick(item)}
                  className="check1"
                  readOnly
                />
                {item.first_name + " " + item.last_name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="start_button">
        <select
          className="select"
          value={levelStatus}
          onChange={(e) => setLevelStatus(e.target.value)}
        >
          <option value={"simple"}>Simple</option>
          <option value={"medium"}>Moderate</option>
          <option value={"complex"}>Complex</option>
        </select>
        <button onClick={handleSubmit} className="start_btn">
          Start recruitment
        </button>
      </div>
    </div>
  );
};
export default AiRecruiter;

// import React from 'react';


// export default () => {

//   return (
//     <div>
//       <h1>Recruiter Page</h1>
//     </div>
//   )
// }
