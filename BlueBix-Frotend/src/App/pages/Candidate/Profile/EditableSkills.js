import React from "react";
import { Tag, Input } from "antd";
import { TweenOneGroup } from "rc-tween-one";
import { PlusOutlined } from "@ant-design/icons";
import { CANDIDATE_EDIT } from "../../../../ApiUrl";
import axios from "axios";
import { store } from "../../../../redux";

export default class EditableSkills extends React.Component {
  state = {
    tags: [],
    inputVisible: false,
    inputValue: "",
  };

  componentDidMount() {
    this.setState({
      tags: this.props.key_skills,
    });
  }

  editProfile = (values) => {
    const basicProfile = this.props.userProfile.userProfile
      ? this.props.userProfile.userProfile.data[0]
      : "";
    values.first_name = basicProfile.first_name;
    values.middle_name = basicProfile.middle_name;
    values.last_name = basicProfile.last_name;
    values.email = basicProfile.email;
    values.mobile = basicProfile.mobile;
    values.total_work_exp_year = basicProfile.total_work_exp_year;
    values.total_work_exp_month = basicProfile.total_work_exp_month;
    values.status = basicProfile.status;
    values.current_location = basicProfile.current_location;

    axios
      .put(CANDIDATE_EDIT + "/" + store.getState().users.user._id, values, {
        headers: { Authorization: store.getState().users.token },
      })
      .then((res) => {
        if (!res.data.error) {
          this.props.userProfile.onclick();
        }
      })
      .catch((error) => {});
  };

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag);
    this.setState({ tags }, function() {
      this.editProfile({ key_skills: this.state.tags });
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState(
      {
        tags,
        inputVisible: false,
        inputValue: "",
      },
      function() {
        this.editProfile({ key_skills: this.state.tags });
      }
    );
  };

  saveInputRef = (input) => {
    this.input = input;
  };

  forMap = (tag) => {
    const tagElem = (
      <Tag
        closable
        onClose={(e) => {
          e.preventDefault();
          this.handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: "inline-block" }}>
        {tagElem}
      </span>
    );
  };

  render() {
    const { tags, inputVisible, inputValue } = this.state;
    const tagChild = tags ? tags.map(this.forMap) : "";
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <TweenOneGroup
            enter={{
              scale: 0.8,
              opacity: 0,
              type: "from",
              duration: 100,
              onComplete: (e) => {
                e.target.style = "";
              },
            }}
            leave={{
              opacity: 0,
              width: 0,
              scale: 0,
              duration: 200,
            }}
            appear={false}
          >
            {tagChild}
          </TweenOneGroup>
        </div>
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} className="site-tag-plus">
            <PlusOutlined /> New Tag
          </Tag>
        )}
      </>
    );
  }
}
