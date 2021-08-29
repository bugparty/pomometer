import React from "react";
import { connect } from "react-redux";
import { addTodo } from "../todoSlice";

let AddTodo = ({ dispatch }) => {
  let input;
  return (
    <div>
      <form
        className="field has-addons"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(addTodo(input.value));

          input.value = "";
        }}
      >
        <p className="control">
          <input
            className="input"
            ref={(node) => {
              input = node;
            }}
          />
        </p>
        <p className="control">
          <button type="submit" className="button">
            Add Todo
          </button>
        </p>
      </form>
    </div>
  );
};

AddTodo = connect()(AddTodo);

export default AddTodo;
