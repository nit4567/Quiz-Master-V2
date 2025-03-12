import router from "../utils/router.js";
import store from "../utils/store.js";

const Login = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-70">
      <div class="card shadow p-4 border rounded-3">
        <h3 class="card-title text-center mb-4">Login</h3>
        <div v-if="errorMessage" class="alert alert-danger text-center">{{ errorMessage }}</div>
        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required />
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required />
        </div>
        <button class="btn btn-primary w-100 mb-3" @click="submitInfo" :disabled="loading">
          {{ loading ? "Logging in..." : "Submit" }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },
  methods: {
    async submitInfo() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await fetch("/user-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed.");
        }

        const data = await response.json();

        // ✅ Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // ✅ Also update Vuex for reactivity (if still needed)
        store.commit("setAuth", { token: data.token, role: data.role });

        // Redirect based on user role
        router.push(data.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};

export default Login;
