import Login from "../pages/Login.js";
import Home from "../pages/Home.js";
import Profile from "../pages/Profile.js";
import Signup from "../pages/Signup.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
import DashboardUser from "../pages/DashboardUser.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/profile", component: Profile },
  { path: "/signup", component: Signup },
  { path: "/user-dashboard", component: DashboardUser},
  { path: "/admin-dashboard", component: DashboardAdmin},
];

const router = new VueRouter({
  routes,
});

export default router;