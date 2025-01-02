from flask import render_template_string,render_template,request,jsonify,Flask
from flask_security import auth_required, current_user, roles_required
from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password,verify_password
from datetime import datetime

def create_views(app : Flask, user_datastore : SQLAlchemySessionUserDatastore, db ):

    # homepage
    @app.route('/')
    def home():
        return render_template('index.html') # entry point to vue frontend
    
    @app.route('/user-login', methods=['POST'])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message' : 'email or password not provided'}), 400
        
        user = user_datastore.find_user(email = email)

        if not user:
            return jsonify({'message' : 'invalid user'}), 400
        
        if verify_password(password, user.password):
            return jsonify({'token' : user.get_auth_token(), 'user' : user.email, 'role' : user.roles[0].name}), 200
        else :
            return jsonify({'message' : 'invalid password'}), 400

    @app.route('/register', methods=['POST'])
    def register_user():
        try:
            # Parse JSON data from the request
            data = request.get_json()
            full_name = data.get("full_name")
            email = data.get("email")
            password = data.get("password")
            qualification = data.get("qualification", None)
            dob = data.get("dob", None)
            role = data.get("role", "user")  # Default to 'User' role if not provided

            # Validate required fields
            if not full_name or not email or not password:
                return jsonify({"error": "Missing required fields"}), 400
            
            dob_date = None
            if dob:
                try:
                    dob_date = datetime.strptime(dob, "%Y-%m-%d").date()
                except ValueError:
                    return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400


            # Check if the user already exists
            existing_user = user_datastore.find_user(email=email)
            if existing_user:
                return jsonify({"error": "User with this email already exists"}), 409

            # Create the user
            new_user = user_datastore.create_user(
                full_name=full_name,
                email=email,
                password=hash_password(password),  # Hash the password
                qualification=qualification,
                dob=dob_date 

            )

            # Assign the role to the user
            user_datastore.add_role_to_user(new_user, role)

            # Commit changes to the database
            user_datastore.commit()

            return jsonify({"message": "User registered successfully"}), 201

        except Exception as e:
            print(f"Error during user registration: {e}")
            db.session.rollback()
            return jsonify({"error": "An error occurred while registering the user"}), 500
        

    # profile
    @app.route('/profile')
    @auth_required('token')
    def profile():
        return render_template_string(
            """
                <h1> this is homepage </h1>
                <p> Welcome, {{current_user.email}}</p>
                <p><a href="/logout">Logout</a></p>
            """
        )
    
    
    
    @app.route('/user-dashboard')
    @roles_required('user')
    def user_dashboard():
        return render_template_string(
            """
                <h1>this is user dashboard</h1>
                <p>This should only be accessable to user</p>
            """
        )