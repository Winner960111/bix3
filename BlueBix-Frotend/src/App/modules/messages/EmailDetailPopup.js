import { Button, Modal } from "antd";
import React from "react";

const EmailDetailPopup = ({ show, setShow, emailDetail, setEmailDetail }) => {
  const handleClose = () => {
    setShow(false);
    setEmailDetail(undefined);
  };
  return (
    <div>
      <Modal
        visible={show}
        title="Email Detail"
        width={620}
        onClose={handleClose}
        onCancel={handleClose}
        bodyStyle={{ height: 620 }}
        footer={
          <div
            style={{
              textAlign: "right",
            }}
          >
            <Button onClick={handleClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
          </div>
        }
      >
        <iframe
          srcdoc={emailDetail.html ? emailDetail.html : "N/A"}
          title="email detail"
          width={"100%"}
          height={"100%"}
        />
      </Modal>
    </div>
  );
};

export default EmailDetailPopup;
