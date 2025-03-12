const quesdetails = {
    template: `
    <div class="container d-flex justify-content-center mt-4">
        <div class="card w-50 p-4 shadow">
            <h3 class="text-center mb-3">Question Details</h3>
            <table class="table">
                <tbody>
                    <tr>
                        <th>ID</th>
                        <td>{{ questionDetails.id }}</td>
                    </tr>
                    <tr>
                        <th>Title</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.title" class="form-control">
                            <span v-else>{{ questionDetails.title }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Question</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.question_statement" class="form-control">
                            <span v-else>{{ questionDetails.question_statement }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Option 1</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.option1" class="form-control">
                            <span v-else>{{ questionDetails.option1 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Option 2</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.option2" class="form-control">
                            <span v-else>{{ questionDetails.option2 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Option 3</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.option3" class="form-control">
                            <span v-else>{{ questionDetails.option3 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Option 4</th>
                        <td>
                            <input v-if="isEditing" v-model="questionDetails.option4" class="form-control">
                            <span v-else>{{ questionDetails.option4 }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Correct Option</th>
                        <td>
                            <select v-if="isEditing" v-model="questionDetails.correct_option" class="form-control">
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                                <option value="3">Option 3</option>
                                <option value="4">Option 4</option>
                            </select>
                            <span v-else>Option {{ questionDetails.correct_option }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Edit, Save, and Cancel Buttons -->
            <div class="text-center mt-3">
                <button v-if="!isEditing" class="btn btn-warning w-100" @click="startEditing">Edit</button>
                <div v-if="isEditing" class="d-flex gap-2">
                    <button class="btn btn-success flex-fill" @click="saveChanges">Save</button>
                    <button class="btn btn-secondary flex-fill" @click="cancelEdit">Cancel</button>
                </div>
            </div>
        </div>
    </div>`
    ,
    data() {
        return {
            isEditing: false,
            questionDetails: {},
            originalQuestionDetails: {} // Backup for cancel
        };
    },
    async mounted() {
        await this.loadQuestionDetails();
    },
    methods: {
        async loadQuestionDetails() {
            try {
                const questionId = this.$route.params.id;
                const response = await fetch(`/api/question/${questionId}`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch question details");

                this.questionDetails = await response.json();
                console.log(this.questionDetails);
                this.originalQuestionDetails = { ...this.questionDetails }; // Save a copy
            } catch (error) {
                console.error("Error fetching question details:", error);
            }
        },
        startEditing() {
            this.isEditing = true;
            this.originalQuestionDetails = { ...this.questionDetails }; // Backup
        },
        async saveChanges() {
            try {
                const quizId = this.$route.params.quizId;
                const questionId = this.$route.params.questionId;
                const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.questionDetails),
                });

                if (!response.ok) throw new Error("Failed to save changes");
                this.isEditing = false;
            } catch (error) {
                console.error("Error saving question details:", error);
            }
        },
        cancelEdit() {
            this.questionDetails = { ...this.originalQuestionDetails }; // Restore old values
            this.isEditing = false;
        }
    }
}

export default quesdetails;