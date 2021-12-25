import {createSlice, Draft, PayloadAction} from "@reduxjs/toolkit";

export enum VisibilityFilters {
  SHOW_ALL= "SHOW_ALL",
  SHOW_COMPLETED= "SHOW_COMPLETED",
  SHOW_ACTIVE= "SHOW_ACTIVE",
}
export interface TodoVisibilityFilterState{
  filter: VisibilityFilters
}
const initialState : TodoVisibilityFilterState = {
  filter: VisibilityFilters.SHOW_ALL
}

export const visibilityFilterSlice = createSlice({
  name: "todo_visbility",
  initialState,
  reducers: {
    setVisibilityFilter:{
      reducer(state: Draft<TodoVisibilityFilterState>, action : PayloadAction<VisibilityFilters>) {
        state.filter = action.payload;
      },
      prepare(filter:VisibilityFilters){
        return {
          payload: filter
        }
      }
    },
  },
});
// console.log(visibilityFilterSlice)

export const { setVisibilityFilter } = visibilityFilterSlice.actions;

export default visibilityFilterSlice.reducer;
