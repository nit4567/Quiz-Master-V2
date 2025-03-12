// import components
import router from "./utils/router.js";
import Navbar from "./components/Navbar.js";
import store from "./utils/store.js";

new Vue({
  el: "#app",
  router, // In JavaScript, when the key and value have the same name, you can omit the value and just write the key. This is called shorthand property names.
  store,
  components: { Navbar }, // registering Navbar, static components
  template: `
        <div class="vw-100 vh-100 ">
        <div v-if="!in_quiz">
            <navbar></navbar>
        </div>
        
        <router-view class = "h-75 w-100 "></router-view>
        </div>
    `,
  data() {
    return {
      in_quiz: false,
    };
  },
  mounted() {
    this.in_quiz = this.$route.name === "inquiz"; // Initialize on page load
  },
  watch: {
    $route(to) {
      // Match exactly the inquiz route with ID
      this.in_quiz = to.name === "inquiz";
    },
  },
  
});