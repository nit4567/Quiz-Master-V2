const subdetails = {
    template: `
    <div class="container d-flex justify-content-center mt-4">
        <div class="card w-50 p-4 shadow">
            <h3 class="text-center mb-3">Subject Details</h3>
            <table class="table">
                <tbody>
                    <tr>
                        <th>ID</th>
                        <td>{{ subjectDetails.id }}</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <td>
                            <input v-if="isEditing" v-model="subjectDetails.name" class="form-control">
                            <span v-else>{{ subjectDetails.name }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>
                            <textarea v-if="isEditing" v-model="subjectDetails.description" class="form-control"></textarea>
                            <span v-else>{{ subjectDetails.description }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="text-center mt-3">
                <button v-if="!isEditing" class="btn btn-warning w-100" @click="startEditing">Edit</button>
                <div v-if="isEditing" class="d-flex gap-2">
                    <button class="btn btn-success flex-fill" @click="saveChanges">Save</button>
                    <button class="btn btn-secondary flex-fill" @click="cancelEdit">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            isEditing: false,
            subjectDetails: {},
            originalSubjectDetails: {} // Backup for cancel
        };
    },
    async mounted() {
        await this.loadSubjectDetails();
    },
    methods: {
        async loadSubjectDetails() {
            try {
                const subjectId = this.$route.params.id;
                const response = await fetch(`/api/subjects/${subjectId}`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch subject details");

                this.subjectDetails = await response.json();
                this.originalSubjectDetails = { ...this.subjectDetails }; // Save a copy
            } catch (error) {
                console.error("Error fetching subject details:", error);
            }
        },
        startEditing() {
            this.isEditing = true;
            this.originalSubjectDetails = { ...this.subjectDetails }; // Backup
        },
        async saveChanges() {
            try {
                const subjectId = this.$route.params.id;
                const response = await fetch(`/api/subjects/${subjectId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.subjectDetails),
                });

                if (!response.ok) throw new Error("Failed to save changes");
                this.isEditing = false;
            } catch (error) {
                console.error("Error saving subject details:", error);
            }
        },
        cancelEdit() {
            this.subjectDetails = { ...this.originalSubjectDetails }; // Restore old values
            this.isEditing = false;
        }
    }
};

export default subdetails;
