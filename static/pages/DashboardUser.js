const DashboardUser = {
  template: `
  <div>
    <h2 class="mb-4 text-center">User Dashboard</h2>

    <div v-if="quizzes.length === 0" class="text-center">
      <p>No quizzes available</p>
    </div>

    <div v-else class="quiz-container">
      <div class="row">
        <div v-for="quiz in quizzes" :key="quiz.id" class="col-md-4 mb-4">
          <div class="card shadow">
            <div class="card-body">
              <h5 class="card-title">Quiz ID: {{ quiz.id }}</h5>
              <p class="card-text"><strong>Questions:</strong> {{ quiz.no_of_questions }}</p>
              <p class="card-text"><strong>Date:</strong> {{ quiz.date_of_quiz }}</p>
              <p class="card-text"><strong>Duration(hh:mm):</strong> {{ quiz.time_duration }} </p>

              <div class="d-flex justify-content-between">
                <router-link :to="'/quiz/'+ quiz.id" class="btn btn-primary  me-2">Details</router-link>
                <router-link :to="'/inquiz/'+ quiz.id" class="btn btn-success ">Start</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      quizzes: [],
    };
  },
  mounted() {
    fetch("/api/quizzes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("token"),
      },
    })
      .then(response => response.json())
      .then(data => {
        this.quizzes = data.quizzes;
      })
      .catch(error => console.error("Error fetching quizzes:", error));
  },
  
};

export default DashboardUser;
