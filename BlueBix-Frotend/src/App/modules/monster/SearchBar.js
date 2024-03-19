import React from "react";

const SearchBar = (props) => {
  const BarStyling = {
    width: "100%",
    background: "#fff",
    border: "1px solid #d9d9d9",
    padding: "1.0rem",
    outlineColor: "#d9d9d9",
    borderRadius: 2,
  };
  return (
    <input
      style={BarStyling}
      key="random1"
      value={props.input}
      placeholder={props.placeholder}
      onChange={(e) => {
        props.onChange(e.target.value);
      }}
    />
  );
};

export default SearchBar;
