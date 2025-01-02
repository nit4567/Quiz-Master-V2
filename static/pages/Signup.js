import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4">
        <h3 class="card-title text-center mb-4">Sign Up</h3>
        <div class="form-group mb-3">
          <input v-model="full_name" type="text" class="form-control" placeholder="Full Name" required />
        </div>
        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required />
        </div>
        <div class="form-group mb-3">
          <input v-model="qualification" type="text" class="form-control" placeholder="Qualification (Optional)" />
        </div>
        <div class="form-group mb-3">
          <input v-model="dob" type="date" class="form-control" placeholder="Date of Birth (Optional)" />
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required />
        </div>
        <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
      </div>
    </div>
  `,

  data() {
    return {
      full_name: "",
      email: "",
      qualification: "",
      dob: "",
      password: "",
    };
  },
  methods: {
    async submitInfo() {
      const origin = window.location.origin;
      const url = `${origin}/register`;
  
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: this.full_name,
          email: this.email,
          qualification: this.qualification,
          dob: this.dob,
          password: this.password,
          role: "user", // Role is hardcoded as "User"
        }),
        credentials: "same-origin",
      });
  
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        router.push("/login"); // Redirect to login after successful registration
      } else {
        const errorData = await res.json();
        console.error("Sign up failed:", errorData);
        alert(errorData.error || "Sign up failed. Please try again.");
      }
    },
  },
}
  
export default Signup;