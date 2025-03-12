const quiz = {
    template: `
    <div class="container mt-4">
        <h2 class="mb-4 text-center">Quiz Management</h2>
        <div class="row">
            <div class="col-md-8" style="max-height: 600px; overflow-y: auto;">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Chapter</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Questions</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="quiz in quizzes" :key="quiz.id">
                            <td>{{ quiz.id }}</td>
                            <td>{{ getChapterName(quiz.chapter_id) }}</td>
                            <td>{{ quiz.date_of_quiz }}</td>
                            <td>{{ quiz.time_duration }} mins</td>
                            <td>{{ quiz.no_of_questions }}</td>
                            <td>
                                <button @click="goToQuizDetails(quiz.id)" class="btn btn-primary btn-sm">
                                    Details
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="col-md-4">
                <h4>Add Quiz</h4>
                <div class="form-group">
                    <label>Chapter ID</label>
                    <input v-model="newQuiz.chapter_id" class="form-control" placeholder="Enter Chapter ID">
                </div>
                <div class="form-group">
                    <label>Date of Quiz</label>
                    <input type="date" v-model="newQuiz.date_of_quiz" class="form-control">
                </div>
                <div class="form-group">
                    <label>Time Duration</label>
                    <input type="text" v-model="newQuiz.time_duration" class="form-control" placeholder="hh:mm">
                </div>
                <div class="form-group">
                    <label>Remarks</label>
                    <textarea v-model="newQuiz.remarks" class="form-control" placeholder="Enter remarks"></textarea>
                </div>
                <button class="btn btn-success mt-2" @click="addQuiz">Add Quiz</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            quizzes: [],
            chapters: {},
            newQuiz: { chapter_id: "", date_of_quiz: "", time_duration: "", remarks: "" },
        };
    },
    mounted() {
        this.loadQuizzes();
        this.loadChapters();
    },
    methods: {
        goToQuizDetails(quizId) {
            this.$router.push(`/quiz/${quizId}`);
        },
        async loadQuizzes() {
            try {
                const response = await fetch(`/api/quizzes`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch quizzes");
                const data = await response.json();
                this.quizzes = data.quizzes;
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        },
        async loadChapters() {
            try {
                const response = await fetch(`/api/chapters`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch chapters");
                const data = await response.json();
                this.chapters = Object.fromEntries(data.chapters.map(ch => [ch.id, ch.name]));
            } catch (error) {
                console.error("Error fetching chapters:", error);
            }
        },
        getChapterName(chapter_id) {
            return this.chapters[chapter_id] || "Unknown";
        },
        async addQuiz() {
            if (!this.newQuiz.chapter_id|| !this.newQuiz.date_of_quiz || !this.newQuiz.time_duration) {
                alert("Please fill in all required fields.");
                return;
            }
            try {
                const response = await fetch(`/api/quizzes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    
                    body: JSON.stringify(this.newQuiz),
                });
                if (!response.ok) throw new Error("Failed to add quiz");
                const data = await response.json();
                this.loadQuizzes();
                this.newQuiz = { chapter_id: "", date_of_quiz: "", time_duration: "", remarks: "" };
            } catch (error) {
                console.error("Error adding quiz:", error);
                alert(error.message);
            }
        },
    },
};

export default quiz;
