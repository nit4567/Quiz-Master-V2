import Login from "../pages/Login.js";
import Home from "../pages/Home.js";
import Profile from "../pages/Profile.js";
import Signup from "../pages/Signup.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
import DashboardUser from "../pages/DashboardUser.js";
import Subjects from "../pages/Subjects.js";
import UserScores from "../pages/UserScores.js";
import quiz from "../pages/QuizManage.js";
import QuizDetails from "../pages/QuizDetails.js";
import quesdetails from "../pages/QuesDetails.js";
import chapterdetails from "../pages/ChapterDetails.js";
import subdetails from "../pages/SubDetails.js";
import AttemptQuiz from "../pages/AttemptQuiz.js";
import UserDetails from "../pages/UserDetails.js";
import userchart from "../pages/UserChart.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/profile", component: Profile },
  { path: "/signup", component: Signup },
  { path: "/user-dashboard", component: DashboardUser},
  { path: "/admin-dashboard", component: DashboardAdmin},
  { path: "/subjects", component: Subjects },
  { path: "/scores", component: UserScores },
  { path: "/quiz", component: quiz },
  { path: "/quiz/:id", component: QuizDetails },
  { path: "/question/:id", component: quesdetails},
  { path: "/chapter/:id", component: chapterdetails},
  { path: "/subject/:id", component: subdetails},
  { path: "/inquiz/:id", name: "inquiz", component: AttemptQuiz },
  { path: "/users", component: UserDetails },
  { path: "/userchart", component: userchart },
];

const router = new VueRouter({
  routes, // short for `routes: routes`
});

export default router;