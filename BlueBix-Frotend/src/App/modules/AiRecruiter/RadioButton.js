function RadioButton(props) {
  const select_job_title = () => {
    return props.select(props.sendTitle);
  };

  return (
    <div className="radio_button">
      <label className="lab1">
        <input
          type="radio"
          name="job"
          id="radio"
          className="radio1"
          onClick={select_job_title}
        />
        {props.sendTitle.opening_title}
      </label>
    </div>
  );
}

export default RadioButton;
