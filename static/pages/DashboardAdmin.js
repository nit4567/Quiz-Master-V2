export default {
    name: "DashboardAdmin",
    data() {
        return {
            subjects: [],
            chapters: {},
            selectedSubject: null,
            showAddChapterModal: false,
            newSubject: { name: "", description: "" },
            newChapter: { name: "", description: "", subjectId: "" },
            selectedSubjectId: null,
        };
    },
    mounted() {
        this.loadSubjectsAndChapters();
    },
    methods: {
        editChapter(chapterId) {
            this.$router.push(`/chapter/${chapterId}`);
        },
        deleteChapter(chapterId) {
            
            fetch(`/api/chapters/${chapterId}`, {
                method: "DELETE",
                headers: {
                    "Authentication-Token": localStorage.getItem("token"),
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete chapter.");
                    }
                    return response.json();
                })
                .then(() => {
                    this.loadSubjectsAndChapters();
                })                
                .catch(error => {
                    console.error("Error deleting chapter:", error);
                    alert(error.message);
                });
        },
        deleteSubject(subjectId) {
            fetch(`/api/subjects/${subjectId}`, {
                method: "DELETE",
                headers: {
                    "Authentication-Token": localStorage.getItem("token"),
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete subject.");
                    }
                    return response.json();
                })
                .then(() => {
                    this.loadSubjectsAndChapters();
                })
                .catch(error => {
                    console.error("Error deleting subject:", error);
                    alert(error.message);
                });
        },
        async addSuject() {
            if (!this.newSubject.name || !this.newSubject.description) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                const response = await fetch("/api/subjects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.newSubject),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to add subject.");
                }

                this.subjects.push(data.subject);
                this.newSubject = { name: "", description: "" };
            } catch (error) {   
                console.error("Error adding subject:", error);
                alert(error.message);
            }
        },
        

        async addChapter() {
            if (!this.newChapter.name || !this.newChapter.description || !this.newChapter.subjectId) {
                alert("Please fill in all fields, including Subject ID.");
                return;
            }
  
            try {
                const response = await fetch(`/api/subjects/${this.newChapter.subjectId}/chapters`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(this.newChapter),
                });
  
                const data = await response.json();
  
                if (!response.ok) {
                    throw new Error(data.error || "Failed to add chapter.");
                }
  
                if (!this.chapters[this.newChapter.subjectId]) {
                    this.chapters[this.newChapter.subjectId] = [];
                }
                this.chapters[this.newChapter.subjectId].push(data.chapter);
                this.newChapter = { name: "", description: "", subjectId: "" };
  
                this.showAddChapterModal = false;
            } catch (error) {
                console.error("Error adding chapter:", error);
                alert(error.message);
            }
        },
        async loadSubjectsAndChapters() {
            try {
                const response = await fetch("/api/subjects", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
  
                const data = await response.json();
                this.subjects = data.subjects;
  
                await Promise.all(this.subjects.map(subject => this.fetchChapters(subject.id)));
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        },
        async fetchChapters(subjectId) {
            try {
                const response = await fetch(`/api/subjects/${subjectId}/chapters`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
  
                const data = await response.json();
                this.$set(this.chapters, subjectId, data.chapters);
  
            } catch (error) {
                console.error("Error fetching chapters for subject ${subjectId}:", error);
            }
        }
    },
    template: `
    <div class="container mt-4">
        
        <div class="row">
            <div class="col-md-8" style="max-height: 600px; overflow-y: auto;">
                <h2>Admin Dashboard</h2>
                <h4>Subjects</h4>
                <div v-for="subject in subjects" :key="subject.id" class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between">
                        <span>{{ subject.id }} - {{ subject.name }}</span>
                        <div>
                            <router-link :to="'/subject/' + subject.id" class="btn btn-success btn-sm me-2">
                                Details
                            </router-link>
                            <button class="btn btn-danger btn-sm" @click="deleteSubject(subject.id)">
                                Delete
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Chapter Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(chapter, index) in chapters[subject.id]" :key="chapter.id">
                                    <td>{{ chapter.id }}</td>
                                    <td>{{ chapter.name }}</td>
                                    <td>
                                        <button class="btn btn-warning btn-sm" @click="editChapter(chapter.id)">
                                            Edit
                                        </button>
                                        <button class="btn btn-danger btn-sm" @click="deleteChapter(chapter.id)">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <h4>Add Subject</h4>
                <div class="form-group">
                    <label>Subject Name</label>
                    <input v-model="newSubject.name" class="form-control" placeholder="Enter subject name">
                </div>
                <div class="form-group">
                    <label>Subject Description</label>
                    <textarea v-model="newSubject.description" class="form-control" placeholder="Enter subject Description"></textarea>
                </div>
                <button class="btn btn-success mb-2" @click="addSuject">Add Subject</button>

                <h4>Add Chapter</h4>
                <div class="form-group">
                    <label>Subject ID</label>
                    <input v-model="newChapter.subjectId" class="form-control" placeholder="Enter subject ID">
                </div>
                <div class="form-group">
                    <label>Chapter Name</label>
                    <input v-model="newChapter.name" class="form-control" placeholder="Enter chapter name">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea v-model="newChapter.description" class="form-control" placeholder="Enter chapter description"></textarea>
                </div>
                <button class="btn btn-success " @click="addChapter">Add Chapter</button>
            </div>
        </div>
    </div>
    ` ,
    styles: `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        width: 300px;
    }
    .form-group {
        margin-bottom: 10px;
    }
    `
  };
  