import expect from "expect";
import visibilityFilter, { VisibilityFilters } from "./visibilityFilterSlice";
import todos, {
  addSubTodo,
  addTodo,
  deleteSubTodo,
  deleteTodo,
  toggleSubTodo,
  toggleTodo,
  focusSubTodo,
} from "./todoSlice";
import { combineReducers } from "redux";

const todoAppReducers = combineReducers({
  visibilityFilter,
  todos,
});
describe("Reducer", () => {
  it("returns the initial state", () => {
    expect(todoAppReducers(undefined, {})).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
  });

  it("handles the addTodo action", () => {
    const text = "hello";
    const ret = todoAppReducers(undefined, addTodo(text));
    expect(ret).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            completed: false,
            text: text,
            subItems: [],
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
    ret.todos.todos.forEach((todo) => expect(todo.createdDate).toBeDefined());
  });

  it("handles the toggleTodo action", () => {
    const text = "hello";
    const state = todoAppReducers(undefined, addTodo(text));
    const id = state.todos.todos[1].id;
    expect(todoAppReducers(state, toggleTodo(id, true))).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            id: id,
            completed: true,
            text: text,
            subItems: [],
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
  });

  it("handles the deleteTodo action", () => {
    const text = "hello";
    const state = todoAppReducers(undefined, addTodo(text));
    const id = state.todos.todos[1].id;
    expect(todoAppReducers(state, deleteTodo(id))).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            id: id,
            text: text,
            deleted: true
          }
        ],
      },
      visibilityFilter:{
        filter: VisibilityFilters.SHOW_ALL
      },
    });
  });

  it("handles the addSubTodo action", () => {
    const text = "hello";
    const state = todoAppReducers(undefined, addTodo(text));
    const id = state.todos.todos[1].id;
    const subtext = "sub hello";
    const ret = todoAppReducers(state, addSubTodo(id, subtext));
    expect(ret).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            completed: false,
            text: text,
            subItems: [
              {
                completed: false,
                text: subtext,
              },
            ],
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
    ret.todos.todos.forEach((todo) =>
      todo.subItems.forEach((subtodo) =>
        expect(subtodo.createdDate).toBeDefined()
      )
    );
  });

  it("handles the toggleSubTodo action", () => {
    const text = "hello";
    let state = todoAppReducers(undefined, addTodo(text));
    const id = state.todos.todos[1].id;
    const subtext = "sub hello";
    state = todoAppReducers(state, addSubTodo(id, subtext));
    const subid = state.todos.todos[1].subItems[0].id;

    expect(todoAppReducers(state, toggleSubTodo(id, subid, true))).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            completed: false,
            text: text,
            subItems: [
              {
                id: subid,
                completed: true,
                text: subtext,
              },
            ],
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
  });

  it("handles the deleteSubTodo action", () => {
    const text = "hello";
    let state = todoAppReducers(undefined, addTodo(text));
    const id = state.todos.todos[1].id;
    const subtext = "sub hello";
    state = todoAppReducers(state, addSubTodo(id, subtext));
    const subid = state.todos.todos[1].subItems[0].id;

    expect(todoAppReducers(state, deleteSubTodo(id, subid))).toMatchObject({
      todos: {
        focusTodo: undefined,
        focusSubTodo: undefined,
        todos: [
          {
            id: "default",
            text: "default",
          },
          {
            completed: false,
            text: text,
            subItems: [],
          },
        ],
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
  });
  it("handles the focusSubTodo action", () => {
    const state = todoAppReducers(undefined, addTodo("1"));
    let ret = todoAppReducers(state, addTodo("2"));
    ret = todoAppReducers(ret, focusSubTodo("1", undefined));
    expect(ret).toMatchObject({
      todos: {
        focusTodo: "1",
        focusSubTodo: undefined,
      },
      visibilityFilter: {
        filter: VisibilityFilters.SHOW_ALL
      },
    });
    expect(ret.todos).toMatchObject({
      todos: [
        {
          id: "default",
          text: "default",
        },
        {
          text: "1",
          subItems: [],
        },
        {
          text: "2",
          subItems: [],
        },
      ],
    });
    ret.todos.todos.forEach((todo) =>
      todo.subItems.forEach((subtodo) =>
        expect(subtodo.createdDate).toBeDefined()
      )
    );
  });
});
