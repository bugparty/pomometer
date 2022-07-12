import React from "react";
import { connect } from "react-redux";
import { addTodo } from "../todoSlice";
import {FormattedMessage} from "react-intl";
import {Dispatch} from "redux";

let AddTodo : React.FC<{ dispatch: Dispatch}> = ({ dispatch}) => {
  let input : HTMLInputElement | null;
  return (
    <div>
      <form
        className="field has-addons"
        onSubmit={(e) => {
          e.preventDefault();
          if (input instanceof HTMLInputElement){
              if (!input.value.trim()) {
                  return;
              }
              dispatch(addTodo(input.value));

              input.value = "";
          }

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
              <FormattedMessage id="todo.add_todo" defaultMessage=
                  "Add Todo"/>
          </button>
        </p>
      </form>
    </div>
  );
};

AddTodo = connect()(AddTodo);

export default AddTodo;
