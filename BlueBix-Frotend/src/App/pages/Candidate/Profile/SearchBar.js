import React from "react";

const SearchBar = (props) => {
  const BarStyling = {
    width: "20rem",
    background: "#F2F1F9",
    border: "0",
    padding: "1.0rem",
    outlineColor: "#40a9ff",
    borderRadius: 5
  };
  return (
    <input
      style={BarStyling}
      key="random1"
      className={"text-muted"}
      value={props.input}
      placeholder={"Skills, Designations"}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    />
  );
};

export default SearchBar;
