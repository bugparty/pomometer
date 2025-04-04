import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export enum OpVisibilityFilter{
    SHOW_TODAY = '@@SHOW_TODAY',
    SHOW_THIS_WEEK = '@@SHOW_THIS_WEEK',
    SHOW_ALL = '@@SHOW_ALL'
}
export interface OpVisibilityFilterState{
    value : OpVisibilityFilter
}
const initialState: OpVisibilityFilterState = {
    value : OpVisibilityFilter.SHOW_TODAY
}
export const OpVisibilityFilterSlice = createSlice({
    name: "op_visibility",
    initialState,
    reducers: {
        setVisibilityFilter(state, action: PayloadAction<OpVisibilityFilterState>) {
            return action.payload;
        },
    },
});
export const { setVisibilityFilter } = OpVisibilityFilterSlice.actions;

export default OpVisibilityFilterSlice.reducer;
