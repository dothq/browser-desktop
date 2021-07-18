import { createAction, createReducer } from '@reduxjs/toolkit';

interface CounterState {
    value: number
}

const increment = createAction('COUNTER_INCREMENT');
const decrement = createAction('COUNTER_DECREMENT');
const incrementByAmount = createAction<number>('COUNTER_INCREMENT_BY_AMOUNT');

const initialState: CounterState = {
    value: 0
}

export const counterReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(increment, (state, action) => {
            state.value++
        })
        .addCase(decrement, (state, action) => {
            state.value--
        })
        .addCase(incrementByAmount, (state, action) => {
            state.value += action.payload
        })
})