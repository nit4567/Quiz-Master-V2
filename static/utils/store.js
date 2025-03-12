Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    loggedIn: !!localStorage.getItem("token"),
    role: localStorage.getItem("role"),
  },
  mutations: {
    setAuth(state, { token, role }) {
      state.loggedIn = true;
      state.role = role;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    },
    logout(state) {
      state.loggedIn = false;
      state.role = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
  getters: {
    isLoggedIn: (state) => state.loggedIn,
    isAdmin: (state) => state.role === "admin",
    isUser: (state) => state.role === "user",
  },
});

export default store;