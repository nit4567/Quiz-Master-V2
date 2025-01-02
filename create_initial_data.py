from flask_security import SQLAlchemySessionUserDatastore
from extensions import db
from flask_security.utils import hash_password

def create_data(user_datastore: SQLAlchemySessionUserDatastore):
    print("Creating roles and users")  # For debugging purposes

    # Create roles
    user_datastore.find_or_create_role(name='admin', description="Administrator")
    user_datastore.find_or_create_role(name='user', description="User")

    # Create admin account
    if not user_datastore.find_user(email="admin@iitm.ac.in"):
        user_datastore.create_user(
            email="admin@iitm.ac.in",
            password=hash_password("pass"),
            full_name="Administrator",  
            roles=['admin']
        )

    # Create user account
    if not user_datastore.find_user(email="user@iitm.ac.in"):
        user_datastore.create_user(
            email="user@iitm.ac.in",
            password=hash_password("pass"),
            full_name="First User",  
            roles=['user']
        )

    # Commit changes to the database
    db.session.commit()
