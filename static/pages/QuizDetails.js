
const QuizDetails = {
    template: `
    <div class="row">
        <!-- Quiz Details & Questions List (8-part) -->
        <div v-if="quiz" class="col-md-6 mb-4 offset-md-3">
            <h2 class="mb-4 text-center">Quiz Details</h2>
        <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Quiz Details</h5>
                        <table class="table table-sm">
                            <tbody>
                                <tr><th>ID</th><td>{{ quiz.id }}</td></tr>
                                <tr><th>Chapter</th><td v-if="chapter">{{ chapter.name }}</td></tr>
                                <tr><th>Date</th><td>{{ quiz.date_of_quiz }}</td></tr>
                                <tr><th>Duration</th><td>{{ quiz.time_duration }} mins</td></tr>
                                <tr><th>Number of Questions</th><td>{{ questions.length }}</td></tr>
                                <tr><th>Remarks</th><td>{{ quiz.remarks || 'N/A' }}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        <div v-if ="role=='admin'" class="col-md-8">
            
            <div v-if="quiz">
                
        
                <h3 class="mt-4">Questions</h3>
                <div style="max-height: 600px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">
                    <table class="table table-striped" v-if="questions.length">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="q in questions" :key="q.id">
                                <td>{{ q.id }}</td>
                                <td>{{ q.title }}</td>
                                <td>
                                    <button class="btn btn-primary me-2" @click="goToQuestionDetails(q.id)">Details</button>
                                    <button class="btn btn-danger" @click="deleteQuestion(q.id)">Delete</button>
                                </td>

                            </tr>
                        </tbody>
                    </table>
                    <p v-else>No questions added yet.</p>
                </div>
            </div>
            <p v-else>Loading...</p>
        </div>

        <!-- Add Question Form (4-part) -->
        <div v-if ="role=='admin'" class="col-md-4">
            <h3 class="mb-3">Add New Question</h3>
            <form @submit.prevent="addQuestion">
                <div class="mb-2">
                    <label>Question Title</label>
                    <input v-model="newQuestion.title" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Question:</label>
                    <input v-model="newQuestion.question_statement" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Option 1:</label>
                    <input v-model="newQuestion.option1" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Option 2:</label>
                    <input v-model="newQuestion.option2" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Option 3:</label>
                    <input v-model="newQuestion.option3" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Option 4:</label>
                    <input v-model="newQuestion.option4" class="form-control" required />
                </div>
                <div class="mb-2">
                    <label>Correct Answer:</label>
                    <select v-model="newQuestion.correct_option" class="form-control" required>
                        <option v-for="opt in [1, 2, 3, 4]" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-100 mt-2">Add Question</button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            quiz: null,
            chapter: null,
            role:null,
            questions: [],
            newQuestion: {
                question_statement: '',
                title: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: '',
            }
        };
    },
    computed: {
        optionsList() {
            return [
                this.newQuestion.option1,
                this.newQuestion.option2,
                this.newQuestion.option3,
                this.newQuestion.option4
            ].filter(opt => opt); // Remove empty options
        }
    },
    mounted() { 
        this.loadrole();
        this.loadQuizDetails().then((data) => this.loadChapter(data.chapter_id)); // Ensure quiz is loaded first
        this.loadQuestions();
    },
    methods: {
        loadrole(){
            this.role = localStorage.getItem("role");
        },
        deleteQuestion(id) {
            
            fetch(`/api/question/${id}`, {
                method: "DELETE",
                headers: { "Authentication-Token": localStorage.getItem("token") }
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to delete question");
                this.loadQuestions(); // Refresh question list
            })
            .catch(error => console.error("Error deleting question:", error));
        },

        goToQuestionDetails(id) {
            this.$router.push(`/question/${id}`);
        },

        async loadChapter(chapterId) {
            try {
                const response = await fetch(`/api/chapters/${chapterId}`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
    
                if (!response.ok) throw new Error("Failed to fetch chapter");
    
                this.chapter = await response.json();
            } catch (error) {
                console.error("Error fetching chapter:", error);
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
                console.log(this.quiz);
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
                console.log(this.questions);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        },
        async addQuestion() {
            try {
                const quizId = this.$route.params.id;
                const response = await fetch(`/api/quizzes/${quizId}/questions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.newQuestion),
                });
                if (!response.ok) throw new Error("Failed to add question");
                
                this.loadQuestions();  // Refresh question list
                this.newQuestion = { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' }; 
            } catch (error) {
                console.error("Error adding question:", error);
            }
        }
    }
};

export default QuizDetails;
