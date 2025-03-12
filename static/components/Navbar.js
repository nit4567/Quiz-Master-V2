import store from "../utils/store.js";

const Navbar = {
  template: 
    `<nav class="navbar navbar-expand-lg bg-indigo text-white shadow-lg px-4 py-3">
      <div class="container-fluid">
        <router-link class="navbar-brand fw-bold text-white" to="/">Quiz Master</router-link>
        <div class="navbar-nav ms-auto d-flex align-items-center">
          <router-link class="nav-link text-white" v-if="!isLoggedIn" to="/login">Login</router-link>
          <router-link class="nav-link text-white" v-if="!isLoggedIn" to="/signup">Signup</router-link>
          <router-link class="nav-link text-white" v-if="isAdmin" to="/admin-dashboard">Admin Dashboard</router-link>
          <router-link class="nav-link text-white" v-if="isUser" to="/user-dashboard">User Dashboard</router-link>
          <router-link class="nav-link text-white" v-if="isAdmin" to="/quiz">Quiz</router-link>
          <router-link class="nav-link text-white" v-if="isAdmin" to="/users">Users</router-link>
          <router-link class="nav-link text-white" v-if="isUser" to="/scores">Scores</router-link>
          <a class="nav-link text-danger fw-bold" v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
        </div>
      </div>
    </nav>`
  ,
  computed: {
    isLoggedIn() {
      return store.getters.isLoggedIn;
    },
    isAdmin() {
      return store.getters.isAdmin;
    },
    isUser() {
      return store.getters.isUser;
    },
  },
  methods: {
    logout() {
      store.commit("logout");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/"; // Redirect to home
    },
  },
};

export default Navbar;