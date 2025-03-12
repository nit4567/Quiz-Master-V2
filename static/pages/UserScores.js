export default {
    name: 'UserScores',
    data() {
        return {
            scores: [],
            message: ''
        };
    },
    
    mounted() {
        fetch("/api/scores", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("token")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.scores && data.scores.length === 0) {
                this.message = "No quiz given";
            } else if (data.scores) {
                this.scores = data.scores;
            }
        })
        .catch(error => {
            console.error("Error fetching scores:", error);
            this.message = "Failed to fetch scores";
        });
    },
    
    template: `
    <div class="container mt-4">
        <h2 class="text-center">Your Scores</h2>
        <router-link :to="'/userchart'" class="btn btn-primary mb-3">Overall Performance</router-link>
        <p v-if="message" class="text-center text-danger">{{ message }}</p>
        <table v-else class="table table-bordered table-striped text-center">
            <thead class="thead-dark">
                <tr>
                    <th>Quiz ID</th>
                    <th>Score</th>
                    <th>Attempted On</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="score in scores" :key="score.quiz_id">
                    <td>{{ score.quiz_id }}</td>
                    <td>{{ score.total_scored }}</td>
                    <td>{{ new Date(score.timestamp).toLocaleString() }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    `
};
