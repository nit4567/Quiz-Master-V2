const Subjects = {
  template: `
    <div class="container mt-5">
      <h2 class="text-center">Subjects</h2>
      <div v-if="loading" class="text-center">Loading...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else>
        <ul class="list-group">
          <li v-for="subject in subjects" :key="subject.id" class="list-group-item">
            <h5>{{ subject.name }}</h5>
            <p>{{ subject.description }}</p>
          </li>
        </ul>
      </div>
    </div>
  `,
  data() {
    return {
      subjects: [],
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchSubjects();
  },
  methods: {
    async fetchSubjects() {
      try {
        const token =  localStorage.getItem("token") ; // Get token from Vuex or localStorage
        if (!token) throw new Error("Not authenticated");

        const response = await fetch("/api/subjects", {
          headers: { Authorization: `${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        this.subjects = data.subjects;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};

export default Subjects;
