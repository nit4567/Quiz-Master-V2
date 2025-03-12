import router from "../utils/router.js";
import store from "../utils/store.js";

const Logout = {
  template: `
    <div> 
        <h1 v-if="logoutSuccess">Successfully Logged Out</h1>
        <h1 v-else>Logout Unsuccessful</h1>
    </div>
  `,
  data() {
    return {
      logoutSuccess: false,
    };
  },
  async mounted() {  // ✅ Use mounted() for lifecycle logic
    console.log("Logout component mounted!");

    try {
      const res = await fetch("/logout", { method: "POST" });

      if (res.ok) {
        this.logoutSuccess = true;

        // ✅ Clear authentication data
        localStorage.removeItem("token");
        store.commit("setAuth", { token: null, role: null });

        // ✅ Redirect to login page after logout
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
};

export default Logout;
