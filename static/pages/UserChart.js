


const userchart = {
    template: `
    <div>
        <h2>Performance Overview</h2>
        <canvas id="scoreTrendChart"></canvas>
        <canvas id="accuracyChart"></canvas>
        <canvas id="timeTakenChart"></canvas>
        <canvas id="correctIncorrectChart"></canvas>
  </div>
  `,
  data() {
    return {
      scores: []
    };
  },
  methods: {
    async fetchScores() {
      try {
        const response = await fetch("/api/scores/user", {
          headers: { "Authentication-Token": localStorage.getItem("token") }
        });
        const data = await response.json();
        this.scores = data.scores;
        this.renderCharts();
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    },
    renderCharts() {
      if (!this.scores.length) return;

      const ctx1 = document.getElementById("scoreTrendChart").getContext("2d");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: this.scores.map(s => `Quiz ${s.quiz_id}`),
          datasets: [{
            label: "Total Score",
            data: this.scores.map(s => s.total_scored),
            borderColor: "blue",
            fill: false
          }]
        }
      });

      const ctx2 = document.getElementById("accuracyChart").getContext("2d");
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: this.scores.map(s => `Quiz ${s.quiz_id}`),
          datasets: [{
            label: "Accuracy (%)",
            data: this.scores.map(s => (s.correct_answers / s.total_questions) * 100),
            backgroundColor: "green"
          }]
        }
      });

      const ctx3 = document.getElementById("timeTakenChart").getContext("2d");
      new Chart(ctx3, {
        type: "bar",
        data: {
          labels: this.scores.map(s => `Quiz ${s.quiz_id}`),
          datasets: [{
            label: "Time Taken (s)",
            data: this.scores.map(s => s.time_taken),
            backgroundColor: "orange"
          }]
        }
      });

      const ctx4 = document.getElementById("correctIncorrectChart").getContext("2d");
      new Chart(ctx4, {
        type: "bar",
        data: {
          labels: this.scores.map(s => `Quiz ${s.quiz_id}`),
          datasets: [
            {
              label: "Correct Answers",
              data: this.scores.map(s => s.correct_answers),
              backgroundColor: "green"
            },
            {
              label: "Incorrect Answers",
              data: this.scores.map(s => s.incorrect_answers),
              backgroundColor: "red"
            }
          ]
        }
      });
    }
  },
  mounted() {
    this.fetchScores();
  }
}

export default userchart