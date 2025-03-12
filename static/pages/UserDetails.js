const UserDetails = {
    template: `
    <div class="container mt-5">
        <h2 class="text-center">User Details</h2>
        <div class="table-responsive">
            <table class="table table-bordered table-striped text-center mt-3">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Qualification</th>
                        <th>Date of Birth</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.full_name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.qualification }}</td>
                        <td>{{ user.dob }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    
    data() {
        return {
            users: []
        };
    },
    
    methods: {
        async fetchUsers() {
            try {
                const response = await fetch('/api/users', {
                    headers: { "Authentication-Token": localStorage.getItem("token") }
                });
                if (!response.ok) throw new Error("Failed to fetch users");
                const data = await response.json();
                this.users = data.users;
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    },
    
    mounted() {
        this.fetchUsers();
    }
};

export default UserDetails;
