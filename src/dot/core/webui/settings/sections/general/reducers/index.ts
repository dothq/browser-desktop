// // import {
// //     createSlice,
// //     PayloadAction
// // } from "@reduxjs/toolkit";

// interface State {
//     selectedProfileId: string;
// }

// const initialState: State = {
//     selectedProfileId: ""
// };

// export const generalSlice = createSlice({
//     name: "general",
//     initialState,
//     reducers: {
//         setProfile: (
//             state: State,
//             action: PayloadAction<string>
//         ) => {
//             state.selectedProfileId = action.payload;
//         }
//     }
// });

// export const { setProfile } = generalSlice.actions;

// export default generalSlice.reducer;
