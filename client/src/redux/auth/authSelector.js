export const selectAuthState = (state) => state.auth

export const selectAccountId = (state) => selectAuthState(state).accountId

export const selectToken = (state) => selectAuthState(state).token

export const selectRole = (state) => selectAuthState(state).role

export const selectAuthLoading = (state) => selectAuthState(state).loading

export const selectIsAuthenticated = (state) => selectAuthState(state).isAuthenticated

export const selectAuthError = (state) => selectAuthState(state).error