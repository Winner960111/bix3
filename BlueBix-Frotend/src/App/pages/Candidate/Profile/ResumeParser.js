import React, { useState } from "react";
import {
  DownloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Spin, Form, Typography, Upload } from "antd";
import Modal from "antd/lib/modal/Modal";
import { showError } from "../../utils/helpers";
const { Text, Title } = Typography;

const ResumeParser = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setmsgError] = useState("");
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [showResumeParser, setShowResumeParser] = useState(false);
  const [Resume, setResume] = useState("");
  const [ResultUploadResume, setResultUploadResume] = useState("");

  // const onUpload =  (file) => {

  //   //  const fileInput = document.querySelector("input");
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("fileName", "myCustomFilename.pdf");
  //   formData.append("workspace", "cpMdnLUL");
  //   formData.append("rejectDuplicates", "false");

  // };

  const setDefaultState = (timeout = 3000) => {
    setTimeout(() => {
      setSuccess(false);
      setLoading(false);
      setError(false);
      setMsgSuccess("");
      setmsgError("");
    }, timeout);
  };

  const getResumeRes = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", "myCustomFilename.pdf");
    formData.append("workspace", process.env.REACT_APP_AFFINDA_WORKSPACE);
    formData.append("rejectDuplicates", "false");


    fetch("https://api.affinda.com/v3/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_AFFINDA_KEY}`,
        Accept: "application/json",
        // If you add this, upload won't work
        // 'Content-Type': 'multipart/form-data'
      },
      body: formData,
    })
      .then((resp) => {
        return new Promise(
          (resolve, reject) => {
            setTimeout(() => {
              resolve(resp.json())
            }, 1000)
          })
      })
      .then(result => {
        setLoading(false);
        if (result.error.errorDetail) {
          setError(true);
          setmsgError(result.error.errorDetail);
          setDefaultState(7000);
          return false;
        }
        setShowResumeParser(true);
        setResume(result.data);
      })
      .catch(err =>{});
  };

  const ResumeModal = () => {
    return (
      <Modal
        title="Resume Parser"
        width={620}
        onClose={onClose}
        onCancel={onClose}
        open={showResumeParser}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
          </div>
        }
      >
        <Form>
          <Col span={24}>
            <Row gutter={12}>
              <Text strong>Name : </Text>
              {" " + Resume.name ? Resume.name.raw : ""}
            </Row>
            <Row gutter={12}>
              <Text strong>Emails : </Text>
              {Resume.emails
                ? Resume.emails.map((s, index) => <div key={index}>{" " + s}</div>)
                : ""}
            </Row>
            <Row gutter={12}>
              <Text strong>Phone Numbers : </Text>
              {Resume.phoneNumbers
                ? Resume.phoneNumbers.map((s, index) => <div key={index}>{" " + s}</div>)
                : ""}
            </Row>
            <Row gutter={12}>
              <Text className={"text-bold"}>
                <Text strong>Summary : </Text>
                {" " + Resume.summary ? Resume.summary : ""}
              </Text>
            </Row>
            <Row gutter={12}>
              <Text>
                <Text strong>Location : </Text>
                {Resume.location ? Resume.location.formatted : ""}
              </Text>
            </Row>
            <Row gutter={12}>
              <Text strong>Skills : </Text>
              {Resume.skills
                ? Resume.skills.map((skill, index) => {
                  return (
                    <div key={index} className="mr-20">
                      <div>
                        <Text strong>Name : </Text>
                        <Text>
                          {skill.name
                            ? skill.name
                            : ""}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Last Used : </Text>
                        <Text>
                          {skill.lastUsed
                            ? skill.lastUsed
                            : ""}
                        </Text>
                      </div>
                      <div>
                        <Text strong>Exp. (months) : </Text>
                        {skill.numberOfMonths ? (
                          <Text>{skill.numberOfMonths}</Text>
                        ) : null}
                      </div>
                      <div>
                        <Text strong>Type : </Text>
                        <Text>
                          {skill.type ? skill.type : ""}
                        </Text>
                      </div>
                      <br />
                    </div>
                  );
                })
                : ""}
            </Row>
            <Row gutter={12}>
              <Text strong>Total Years Experience : </Text>
              <Text>
                {" " + Resume.totalYearsExperience
                  ? Resume.totalYearsExperience
                  : ""}
              </Text>
            </Row>
            <Row gutter={12}>
              <Text strong>Resume Probability : </Text>
              <Text>
                {" " + Resume.isResumeProbability
                  ? Resume.isResumeProbability
                  : ""}
              </Text>
            </Row>
            <Row gutter={12}>
              <Text strong>Education : </Text>
              {Resume.education
                ? Resume.education.map((education, index) => {
                  return (
                    <div key={index}>
                      <Text>
                        {education.organization
                          ? education.organization
                          : ""}
                      </Text>
                      <br />
                      <Text>
                        {education.accreditation
                          ? education.accreditation.education
                          : ""}
                      </Text>
                      <br />
                      {education.location ? (
                        <Text>{education.location.formatted}</Text>
                      ) : null}
                      <br />
                      <Text>
                        {education.dates ? education.dates.dates : ""}
                      </Text>
                      <br />
                    </div>
                  );
                })
                : ""}
            </Row>
            <Row gutter={12}>
              <Text strong>Work Experience : </Text>
              {Resume.workExperience
                ? Resume.workExperience.map((workExperience, index) => {
                  return (
                    <div key={index}>
                      <Text>
                        {workExperience.jobTitle
                          ? workExperience.jobTitle
                          : ""}
                      </Text>
                      <br />
                      <Text>
                        {workExperience.organization
                          ? workExperience.organization
                          : ""}
                      </Text>
                      <br />
                      {workExperience.location ? (
                        <Text>{workExperience.location.formatted}</Text>
                      ) : null}
                      <br />
                      {workExperience.dates ? (
                        <Text>{workExperience.dates.endDate}</Text>
                      ) : null}
                      <br />
                      <Text>
                        {workExperience.jobDescription
                          ? workExperience.jobDescription
                          : ""}
                      </Text>
                      <br />
                    </div>
                  );
                })
                : ""}
            </Row>
          </Col>
        </Form>
      </Modal>
    );
  };

  const onClose = () => {
    setShowResumeParser(false);
  };

  const propsUpload = {
    onRemove: (file) => {
      const index = selectedFileList.indexOf(file);
      const newFileList = selectedFileList.slice();
      newFileList.splice(index, 1);
      setSelectedFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.size > 5000000) {
        setError(true);
        setmsgError("File should be less than 5 MB.");
        setDefaultState();
        return false;
      }
      if (
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        file.type !== "application/msword" &&
        file.type !== "application/pdf") {
        setError(true);
        setmsgError("Not a supported file format.");
        setDefaultState();
        return false;
      }
      setSelectedFileList([...selectedFileList, file]);
      setSelectedFile(file);
      // onUpload(file);
      return false;
    },
    selectedFileList,
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;
  return (
    <Spin indicator={antIcon} spinning={loading}>
      <Card title="Resume Parser" className="mb-6">
        <Row gutter={24} className="mb-5">
          <Col span={12} offset={6}>
            <Title level={5} className="mb-0"></Title>
            <div className="text-center">
              <Upload {...propsUpload} accept=".pdf, .doc, .docx">
                <Button>UPLOAD RESUME</Button>
              </Upload>
              <Text type="secondary">
                Supported Formats: doc, pdf, upto 5 MB
              </Text>
            </div>

            {selectedFile ?
              <div className="text-center mt-5" >
                <Button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      getResumeRes();
                      //getResumeParserNew()
                    }, 2000);
                  }}
                  type="primary"
                  icon={<DownloadOutlined />}
                >
                  Parse Resume
                </Button>
              </div>
              : ''}
          </Col>
        </Row>

        {Resume ? ResumeModal(Resume) : null}
      </Card>
      {showError(success, msgSuccess, error, msgError)}
    </Spin>
  );
};

export default ResumeParser;
