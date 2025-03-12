const chapterdetails = {
    template: `
    <div class="container d-flex justify-content-center mt-4">
        <div class="card w-50 p-4 shadow">
            <h3 class="text-center mb-3">Chapter Details</h3>
            <table class="table">
                <tbody>
                    <tr>
                        <th>ID</th>
                        <td>{{ chapterDetails.id }}</td>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <td>
                            <input v-if="isEditing" v-model="chapterDetails.name" class="form-control">
                            <span v-else>{{ chapterDetails.name }}</span>
                        </td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>
                            <textarea v-if="isEditing" v-model="chapterDetails.description" class="form-control"></textarea>
                            <span v-else>{{ chapterDetails.description }}</span>
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
    </div>
    `,
    data() {
        return {
            isEditing: false,
            chapterDetails: {},
            originalChapterDetails: {} // Backup for cancel
        };
    },
    async mounted() {
        await this.loadChapterDetails();
    },
    methods: {
        async loadChapterDetails() {
            try {
                const chapterId = this.$route.params.id;
                const response = await fetch(`/api/chapters/${chapterId}`, {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch chapter details");
                
                this.chapterDetails = await response.json();
                this.originalChapterDetails = { ...this.chapterDetails }; // Save a copy
            } catch (error) {
                console.error("Error fetching chapter details:", error);
            }
        },
        startEditing() {
            this.isEditing = true;
            this.originalChapterDetails = { ...this.chapterDetails }; // Backup
        },
        async saveChanges() {
            try {
                const chapterId = this.$route.params.id;
                const response = await fetch(`/api/chapters/${chapterId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.chapterDetails),
                });
                
                if (!response.ok) throw new Error("Failed to save changes");
                this.isEditing = false;
            } catch (error) {
                console.error("Error saving chapter details:", error);
            }
        },
        cancelEdit() {
            this.chapterDetails = { ...this.originalChapterDetails }; // Restore old values
            this.isEditing = false;
        }
    }
}

export default chapterdetails;
