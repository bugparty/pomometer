import {createSlice} from '@reduxjs/toolkit'

export const VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_COMPLETED: 'SHOW_COMPLETED',
    SHOW_ACTIVE: 'SHOW_ACTIVE'
}
export const visibilityFilterSlice = createSlice({
    name: 'todo_visbility',
    initialState: 'SHOW_ALL',
    reducers: {
        setVisibilityFilter(state, action) {
            return action.payload
        }
    }
})
// console.log(visibilityFilterSlice)

export const { setVisibilityFilter } = visibilityFilterSlice.actions

export default visibilityFilterSlice.reducer