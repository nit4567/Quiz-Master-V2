from flask_security import UserMixin,RoleMixin 
from flask_security.models import fsqla_v3 as fsq
from extensions import db


fsq.FsModels.set_db_info(db)


class User(db.Model, UserMixin):
    __tablename__ = 'user'

    # Primary user attributes
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, nullable = False, unique = True)
    password = db.Column(db.String(255), nullable=False)  # Compatible with Flask-Security hashing
    full_name = db.Column(db.String(128), nullable=False)
    qualification = db.Column(db.String(128), nullable=True)
    dob = db.Column(db.Date, nullable=True)

    # Flask-Security specific fields
    # datastore automatically creates these fields
    fs_uniquifier = db.Column(db.String, nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True)

    # Relationships
    roles = db.relationship('Role', backref='bearers', secondary='user_roles')  # Flask-Security roles
    quiz_attempts = db.relationship('Score', backref='user', lazy=True)  # One-to-many relationship with scores


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable  = False)
    description = db.Column(db.String, nullable = False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Subject(db.Model):
    __tablename__ = 'subject'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    chapters = db.relationship('Chapter', backref='subject', lazy=True)

class Chapter(db.Model):
    __tablename__ = 'chapter'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True)

class Quiz(db.Model):
    __tablename__ = 'quiz'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    date_of_quiz = db.Column(db.Date, nullable=False)
    time_duration = db.Column(db.String(8), nullable=False)  # Format: 'hh:mm'
    remarks = db.Column(db.Text, nullable=True)
    questions = db.relationship('Question', backref='quiz', lazy=True)
    scores = db.relationship('Score', backref='quiz', lazy=True)

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    title = db.Column(db.String(20), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(128), nullable=False)
    option2 = db.Column(db.String(128), nullable=False)
    option3 = db.Column(db.String(128), nullable=True)
    option4 = db.Column(db.String(128), nullable=True)
    correct_option = db.Column(db.String(128), nullable=False)

class Score(db.Model):
    __tablename__ = 'score'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime, nullable=False)
    total_scored = db.Column(db.Float, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    incorrect_answers = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Float, nullable=False)


