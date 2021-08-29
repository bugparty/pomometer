import expect from "expect";
import { combineReducers } from "redux";
import visibilityFilter, {
  setVisibilityFilter,
  VisibilityFilters,
} from "./visibilityFilterSlice";
import todos, { addTodo } from "./todoSlice";

const todoAppReducers = combineReducers({
  visibilityFilter,
  todos,
});

describe("VisibilityFilterReducer", () => {
  it("returns the initial state", () => {
    expect(todoAppReducers(undefined, {})).toMatchObject({
      todos: {},
      visibilityFilter: VisibilityFilters.SHOW_ALL,
    });
  });
  // build a test state
  let state = todoAppReducers(undefined, addTodo("abc"));
  state = todoAppReducers(state, addTodo("bcd"));
  let id1 = state.todos.todos[1].id;
  let id2 = state.todos.todos[2].id;

  it("handles the SHOW_ALL action", () => {
    expect(
      todoAppReducers(state, setVisibilityFilter(VisibilityFilters.SHOW_ALL))
    ).toMatchObject({
      visibilityFilter: VisibilityFilters.SHOW_ALL,
    });
  });

  it("handles the SHOW_ACTIVE action", () => {
    expect(
      todoAppReducers(state, setVisibilityFilter(VisibilityFilters.SHOW_ACTIVE))
    ).toMatchObject({
      visibilityFilter: VisibilityFilters.SHOW_ACTIVE,
    });
  });

  it("handles the SHOW_COMPLETED action", () => {
    expect(
      todoAppReducers(
        state,
        setVisibilityFilter(VisibilityFilters.SHOW_COMPLETED)
      )
    ).toMatchObject({
      visibilityFilter: VisibilityFilters.SHOW_COMPLETED,
    });
  });
});
