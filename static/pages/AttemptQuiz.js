const AttemptQuiz = {
    template: `
    <div class="container-fluid vh-100 d-flex flex-column">
  
  <!-- Top Panel -->
  <div class="d-flex justify-content-between align-items-center p-3 bg-light border-bottom shadow-sm">
    <h4 class="m-0">Quiz Info</h4>
    <p class="m-0">Questions: {{ questions.length }}</p>
    <button class="btn btn-success" @click="submitQuiz">Submit</button>
  </div>

  <div class="row flex-grow-1 m-0">
    
    <!-- Left Sidebar (col-3) -->
    <div class="col-3 p-3 d-flex flex-column border-right shadow-sm">
      <!-- Timer -->
      <div class="text-center mb-3">
        <h5>Time Left</h5>
        <p class="fs-1">{{ formattedTime }}</p>
      </div>

      <!-- Question Navigation -->
      <div class="overflow-auto flex-grow-1">
        <h6>Questions</h6>
        <div class="d-flex flex-wrap" style="gap: 8px;">
          <button v-for="(q, index) in questions" :key="index" 
                  @click="quesvisited(index)"
                  class="btn border"
                  :class="{
                    'btn-secondary': !q.visited,
                    'btn-danger': q.visited && !q.answered,
                    'btn-success': q.answered
                  }"
                  style="margin: 3px;">
            {{ index + 1 }}
          </button>
        </div>
      </div>
    </div>

    <!-- Right Content (col-9) inside a card -->
    <div class="col-9 p-4 d-flex flex-column border-left shadow-sm">
      <div class="card p-3">
        <h2>Question {{ currentQuestionIndex + 1 }}</h2>
        <div v-if="questions.length > 0 && questions[currentQuestionIndex]">
          <p class="h4 font-weight-normal">{{ questions[currentQuestionIndex].question_statement }}</p>
        
          <!-- Options -->
          <div class="mb-3">
            <label v-for="(option, index) in questions[currentQuestionIndex].options" :key="index" class="d-block">
              <input type="radio" :name="'q' + currentQuestionIndex" :value="option" v-model="questions[currentQuestionIndex].selected">
              {{ option }}
            </label>
          </div>
        </div>
        <button class="btn btn-primary mt-auto align-self-end" @click="saveAndNext">Save & Next</button>
      </div>
    </div>
  </div>
</div>
    `,

    data() {
      return {
        quizId: this.$route.params.id,
        timeString: "00:09", // Time received as a string from API (hh:mm format)
        timeLeft: 10, 
        currentQuestionIndex: 0,
        questions: [{}],
        quiz: null,
        timer: null
      };
    },

    computed: {
        formattedTime() {
            let h = Math.floor(this.timeLeft / 3600);
            let m = Math.floor((this.timeLeft % 3600) / 60);
            let s = this.timeLeft % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
    },

    methods: {
        quesvisited(index) {
            if (this.questions.length > 0 && this.questions[index]) {
                this.currentQuestionIndex = index;
                this.questions[this.currentQuestionIndex].visited = true;
            }
        },

        async loadQuizDetails() {
            try {
                const quizId = this.$route.params.id;
                const response = await fetch(`/api/quizzes/${quizId}`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch quiz details");
                this.quiz = await response.json();
                return this.quiz;
            } catch (error) {
                console.error("Error fetching quiz details:", error);
            }
        },

        async loadQuestions() {
            try {
                const quizId = this.$route.params.id;
                const response = await fetch(`/api/quizzes/${quizId}/questions`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch questions");
                this.questions = (await response.json()).questions;
                return this.questions;
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        },

        startTimer() {
            this.timer = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                } else {
                    alert("Time is up! Submitting the quiz.");
                    this.submitQuiz();
                }
            }, 1000);
        },

        convertTimeStringToSeconds(data) {
            let [hours, minutes] = data.time_duration.split(":").map(Number);
            this.timeLeft = hours * 3600 + minutes * 60;
        },

        saveAndNext() {
            let currentQ = this.questions[this.currentQuestionIndex];
            currentQ.visited = true;
            currentQ.answered = currentQ.selected !== null;
            currentQ.selectedOption = currentQ.selected;
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
            }
            this.quesvisited(this.currentQuestionIndex);
        },

        submitQuiz() {
          clearInterval(this.timer);
      
          let correctAnswers = this.questions.filter(q => q.selectedOption === q.correctOption).length;
          let totalQuestions = this.questions.length;
          let incorrectAnswers = totalQuestions - correctAnswers;
          let totalScored = (correctAnswers / totalQuestions) * 100;
          let timeTaken = this.convertSecondsToTimeFormat(this.timeLeft);
      
          const scoreData = {
              quiz_id: this.quizId,
              total_scored: totalScored,
              total_questions: totalQuestions,
              correct_answers: correctAnswers,
              incorrect_answers: incorrectAnswers,
              time_taken: timeTaken
          };
      
          fetch("/api/scores", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("token")
              },
              body: JSON.stringify(scoreData),
          })
          .then(response => response.json())
          .then(() => this.$router.push("/user-dashboard"))
          .catch(error => console.error("Error submitting score:", error));
      },
      
      convertSecondsToTimeFormat(seconds) {
          let h = Math.floor(seconds / 3600);
          let m = Math.floor((seconds % 3600) / 60);
          let s = seconds % 60;
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      
    },

    async mounted() {
        this.quiz = await this.loadQuizDetails();
        if (this.quiz) { this.convertTimeStringToSeconds(this.quiz); }
        this.questions = await this.loadQuestions();
        if (this.questions.length > 0) { this.quesvisited(0); }
        this.startTimer();
    },

    beforeUnmount() {
        clearInterval(this.timer);
    }
};

export default AttemptQuiz;
