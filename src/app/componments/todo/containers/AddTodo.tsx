import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { todoSyncActions } from "../todoSyncActions";
import {FormattedMessage} from "react-intl";
import {Dispatch} from "redux";

interface AddTodoProps {
  dispatch: Dispatch;
}

const AddTodoComponent: React.FC<AddTodoProps> = ({ dispatch }) => {
  let input : HTMLInputElement | null;
  return (
    <div>
      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (input instanceof HTMLInputElement){
              if (!input.value.trim()) {
                  return;
              }
              todoSyncActions.addTodo(input.value);

              input.value = "";
          }

        }}
      >
        <div className="flex-1">
          <input
            data-testid="todo-input"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ref={(node) => {
              input = node;
            }}
          />
        </div>
        <div>
          <button data-testid="add-todo-button" type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <FormattedMessage id="todo.add_todo" defaultMessage=
                  "Add Todo"/>
          </button>
        </div>
      </form>
    </div>
  );
};

const AddTodo = connect()(AddTodoComponent);

export default AddTodo;
