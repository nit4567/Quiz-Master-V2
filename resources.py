#all CRUD operations do thru here
from flask_restful import Resource, Api, reqparse, marshal_with, fields
from models import  db
from models import *
from flask_security import auth_required,roles_required,current_user
from flask import jsonify,request
from datetime import datetime

#parse the data recevived from frontend
parser = reqparse.RequestParser() #it creates a parser object, if a client is sending data, it will convert json to dict

parser.add_argument('name', type=str, required=True, help="Name cannot be blank.")
parser.add_argument('description', type=str, required=True, help="Description cannot be blank.")
parser.add_argument("subject_id", type=int, help="Subject ID is required and must be an integer.")


api = Api(prefix='/api')

#defining a templete to send data to the frontend

class AdminUserStatsResource(Resource):
    def get(self):
        page = parser.parse_args()['page']
        per_page = parser.parse_args()['per_page']

        # Paginate user list
        paginated_users = User.query.paginate(page=page, per_page=per_page, error_out=False)

        # Aggregate statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(active=True).count()
        inactive_users = total_users - active_users
        admin_count = User.query.filter(User.roles.any(Role.name == 'admin')).count()
        regular_users = total_users - admin_count

        # Fetch all users
        user_data = [
        {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'roles': [role.name for role in user.roles],
            'active': user.active
        }
        for user in paginated_users.items
    ]
        return {
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
                'admin_count': admin_count,
                'regular_users': regular_users
            },
            'users': user_data,
            'total_pages': paginated_users.pages
        }, 200


class SubjectResource(Resource):
    @auth_required("token")
    def get(self,subject_id=None):
        try:
            
            if subject_id:  # If subject_id is provided, fetch only that subject
                subject = Subject.query.filter_by(id=subject_id).first()
                if not subject:
                    return {"error": "Subject not found"}, 404
                return {
                    "id": subject.id,
                    "name": subject.name,
                    "description": subject.description
                }, 200
            
            # If no subject_id is provided, fetch all subjects
            subjects = Subject.query.all()
            subject_list = [
                {"id": subject.id, "name": subject.name, "description": subject.description}
                for subject in subjects
            ]
            return {"subjects": subject_list}, 200

        except Exception as e:
            print(f"Error fetching subjects: {e}")
            return {"error": "An error occurred while fetching subjects"}, 500

    @auth_required("token")
    @roles_required("admin")
    def post(self):
        try:
            args = parser.parse_args()
            name = args['name']
            description = args['description']

            if not name or not description:
                return {"error": "Missing required fields"}, 400

            existing_subject = Subject.query.filter_by(name=name).first()
            if existing_subject:
                return {"error": "Subject with this name already exists"}, 400

            new_subject = Subject(name=name, description=description)
            # adding is not required in flask security as it is done by the user_datastore
            db.session.add(new_subject)
            db.session.commit()

            return {
                "message": "Subject added successfully",
                "subject": {
                    "id": new_subject.id,
                    "name": new_subject.name,
                    "description": new_subject.description,
                }
            }, 201
        except Exception as e:
            print(f"Error during adding subject: {e}")
            db.session.rollback()
            return {"error": "An error occurred while adding the subject"}, 500

    @auth_required("token")
    @roles_required("admin")
    def put(self, subject_id):
        try:
            args = parser.parse_args()
            name = args['name']
            description = args['description']

            subject = Subject.query.get(subject_id)
            if not subject:
                return {"error": "Subject not found"}, 404

            subject.name = name if name else subject.name
            subject.description = description if description else subject.description
            db.session.commit() # no need to add in a update step directly commit 

            return {
                "message": "Subject updated successfully",
                "subject": {
                    "id": subject.id,
                    "name": subject.name,
                    "description": subject.description,
                }
            }, 200
        except Exception as e:
            print(f"Error during updating subject: {e}")
            db.session.rollback()
            return {"error": "An error occurred while updating the subject"}, 500

    @auth_required("token")
    @roles_required("admin")
    def delete(self, subject_id):
        try:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {"error": "Subject not found"}, 404

            # Delete related questions, quizzes, and chapters
            for chapter in subject.chapters:
                for quiz in chapter.quizzes:
                    Question.query.filter_by(quiz_id=quiz.id).delete()  # Delete all questions in the quiz
                    db.session.delete(quiz)  # Delete quiz itself
                
                db.session.delete(chapter)  # Delete chapter itself

            db.session.delete(subject)  # Delete the subject itself
            db.session.commit()

            return {"message": "Subject and all related data deleted successfully"}, 200

        except Exception as e:
            print(f"Error during deleting subject: {e}")
            db.session.rollback()
            return {"error": "An error occurred while deleting the subject"}, 500



class ChapterResource(Resource):
    @auth_required("token")
    def get(self, subject_id=None, chapter_id=None):
        try:
            # Fetch chapters based on the URL parameters
            if chapter_id:
                chapter = Chapter.query.filter_by(id=chapter_id).first()
                if not chapter:
                    return {"error": "Chapter not found"}, 404
                return {
                    "id": chapter.id,
                    "name": chapter.name,
                    "description": chapter.description,
                    "subject_id": chapter.subject_id,
                    "subject_name": chapter.subject.name,
                }, 200
            
            chapters = Chapter.query.filter_by(subject_id=subject_id).all()
            chapter_list = [
                {
                    "id": chapter.id,
                    "name": chapter.name,
                    "description": chapter.description,
                    "subject_id": chapter.subject_id,
                    "subject_name": chapter.subject.name,
                }
                for chapter in chapters
            ]
            return {"chapters": chapter_list}, 200
        
        except Exception as e:
            print(f"Error fetching chapters: {e}")
            return {"error": "An error occurred while fetching chapters"}, 500

    @auth_required("token")
    @roles_required("admin")
    def post(self, subject_id):
        try:
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON payload"}, 400

            name = data.get("name")
            description = data.get("description")
            if not name or not description:
                return {"error": "Missing required fields: 'name' or 'description'"}, 400

            # Check if the subject exists
            subject = Subject.query.get(subject_id)
            if not subject:
                return {"error": "Subject not found"}, 404

            # Create a new chapter
            new_chapter = Chapter(name=name, description=description, subject_id=subject_id)
            db.session.add(new_chapter)
            db.session.commit()

            return {
                "message": "Chapter added successfully",
                "chapter": {
                    "id": new_chapter.id,
                    "name": new_chapter.name,
                    "description": new_chapter.description,
                    "subject_id": new_chapter.subject_id,
                },
            }, 201

        except Exception as e:
            print(f"Error during adding chapter: {e}")
            db.session.rollback()
            return {"error": "An error occurred while adding the chapter"}, 500

    @auth_required("token")
    @roles_required("admin")
    def put(self, chapter_id):
        try:
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON payload"}, 400

            chapter = Chapter.query.filter_by(id=chapter_id).first()
            if not chapter:
                return {"error": "Chapter not found"}, 404

            chapter.name = data.get("name", chapter.name)
            chapter.description = data.get("description", chapter.description)
            db.session.commit()

            return {
                "message": "Chapter updated successfully",
                "chapter": {
                    "id": chapter.id,
                    "name": chapter.name,
                    "description": chapter.description,
                    "subject_id": chapter.subject_id,
                },
            }, 200

        except Exception as e:
            print(f"Error during updating chapter: {e}")
            db.session.rollback()
            return {"error": "An error occurred while updating the chapter"}, 500

    @auth_required("token")
    @roles_required("admin")
    def delete(self, chapter_id):
        try:
            chapter = Chapter.query.filter_by(id=chapter_id).first()
            if not chapter:
                return {"error": "Chapter not found"}, 404

            # Delete all quizzes under this chapter
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
            for quiz in quizzes:
                # Delete all questions under this quiz
                Question.query.filter_by(quiz_id=quiz.id).delete()
                db.session.delete(quiz)

            # Delete the chapter itself
            db.session.delete(chapter)
            db.session.commit()

            return {"message": "Chapter and related data deleted successfully"}, 200

        
        except Exception as e:
            print(f"Error during deleting chapter: {e}")
            db.session.rollback()
            return {"error": "An error occurred while deleting the chapter"}, 500


class QuizResource(Resource):
    @auth_required("token")
    def get(self, quiz_id=None):
        try:
            if quiz_id:
                quiz = Quiz.query.get(quiz_id)  # No need for chapter_id
                if not quiz:
                    return {"error": "Quiz not found"}, 404
                return {
                    "id": quiz.id,
                    "date_of_quiz": quiz.date_of_quiz.isoformat(),
                    "chapter_id": quiz.chapter_id,
                    "time_duration": quiz.time_duration,
                    "remarks": quiz.remarks,
                    "no_of_questions": len(quiz.questions),
                }, 200

            quizzes = Quiz.query.all()  # Fetch all quizzes
            quiz_list = [
                {
                    "id": quiz.id,
                    "date_of_quiz": quiz.date_of_quiz.isoformat(),
                    "time_duration": quiz.time_duration,
                    "chapter_id": quiz.chapter_id,
                    "remarks": quiz.remarks,
                    "no_of_questions": len(quiz.questions),
                }
                for quiz in quizzes
            ]
            return {"quizzes": quiz_list}, 200

        except Exception as e:
            print(f"Error fetching quizzes: {e}")
            return {"error": "An error occurred while fetching quizzes"}, 500



    @auth_required("token")
    @roles_required("admin")
    def post(self):
        try:
            data = request.get_json()
            chapter_id = data.get("chapter_id")  # Get from request body

            if not chapter_id:
                return {"error": "chapter_id is required"}, 400

            date_of_quiz = data.get("date_of_quiz")
            time_duration = data.get("time_duration")
            remarks = data.get("remarks")


            if not date_of_quiz or not time_duration:
                return {"error": "Missing required fields: 'date_of_quiz' or 'time_duration'"}, 400
            

            date_of_quiz = request.json.get("date_of_quiz")

            # Convert string to a date object
            date_of_quiz = datetime.strptime(date_of_quiz, "%Y-%m-%d").date()


            new_quiz = Quiz(
                chapter_id=chapter_id,
                date_of_quiz=date_of_quiz,
                time_duration=time_duration,
                remarks=remarks,
            )
            db.session.add(new_quiz)
            db.session.commit()

            return {
                "message": "Quiz created successfully",
                "quiz": {
                    "id": new_quiz.id,
                    "date_of_quiz": new_quiz.date_of_quiz.isoformat(),
                    "time_duration": new_quiz.time_duration,
                    "remarks": new_quiz.remarks,
                },
            }, 201
        
        except Exception as e:
            print(f"Error during quiz creation: {e}")
            db.session.rollback()
            return {"error": "An error occurred while creating the quiz"}, 500



class QuestionResource(Resource):
    @auth_required("token")
    def get(self, quiz_id=None, question_id=None):
        try:
            if question_id:
                question = Question.query.filter_by(id=question_id).first()
                if not question:
                    return {"error": "Question not found"}, 404
                return {
                    "id": question.id,
                    "title": question.title,
                    "question_statement": question.question_statement,
                    "option1": question.option1,
                    "option2": question.option2,
                    "option3": question.option3,
                    "option4": question.option4,
                    "correct_option": question.correct_option,
                }, 200
            
            questions = Question.query.filter_by(quiz_id=quiz_id).all()
            question_list = [
                {
                    "id": question.id,
                    "title": question.title,
                    "quiz_id": question.quiz_id,
                    "question_statement": question.question_statement,
                    "options": [
                        question.option1,
                        question.option2,
                        question.option3,
                        question.option4,
                    ],
                    "correct_option": question.correct_option,
                }
                for question in questions
            ]
            return {"questions": question_list}, 200
        
        except Exception as e:
            print(f"Error fetching questions: {e}")
            return {"error": "An error occurred while fetching questions"}, 500

    @auth_required("token")
    @roles_required("admin")
    def post(self, quiz_id):
        try:
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON payload"}, 400

            question_statement = data.get("question_statement")
            title = data.get("title")
            option1 = data.get("option1")
            option2 = data.get("option2")
            option3 = data.get("option3")
            option4 = data.get("option4")
            correct_option = data.get("correct_option")

            if not all([question_statement, option1, option2, correct_option]):
                return {"error": "Missing required fields: 'question_statement', 'option1', 'option2', or 'correct_option'"}, 400

            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {"error": "Quiz not found"}, 404

            new_question = Question(
                quiz_id=quiz_id,
                title = title,
                question_statement=question_statement,
                option1=option1,
                option2=option2,
                option3=option3,
                option4=option4,
                correct_option=correct_option,
            )
            db.session.add(new_question)
            db.session.commit()

            return {
                "message": "Question added successfully",
                "question": {
                    "id": new_question.id,
                    "quiz_id": new_question.quiz_id,
                    "question_statement": new_question.question_statement,
                    "options": [
                        new_question.option1,
                        new_question.option2,
                        new_question.option3,
                        new_question.option4,
                    ],
                    "correct_option": new_question.correct_option,
                },
            }, 201
        
        except Exception as e:
            print(f"Error during question creation: {e}")
            db.session.rollback()
            return {"error": "An error occurred while adding the question"}, 500

    @auth_required("token")
    @roles_required("admin")
    def put(self, quiz_id, question_id):
        try:
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON payload"}, 400

            question = Question.query.filter_by(id=question_id, quiz_id=quiz_id).first()
            if not question:
                return {"error": "Question not found"}, 404
            
            question.title = data.get("title", question.title)
            question.question_statement = data.get("question_statement", question.question_statement)
            question.option1 = data.get("option1", question.option1)
            question.option2 = data.get("option2", question.option2)
            question.option3 = data.get("option3", question.option3)
            question.option4 = data.get("option4", question.option4)
            question.correct_option = data.get("correct_option", question.correct_option)

            db.session.commit()

            return {
                "message": "Question updated successfully",
                "question": {
                    "id": question.id,
                    "quiz_id": question.quiz_id,
                    "question_statement": question.question_statement,
                    "options": [
                        question.option1,
                        question.option2,
                        question.option3,
                        question.option4,
                    ],
                    "correct_option": question.correct_option,
                },
            }, 200
        
        except Exception as e:
            print(f"Error during question update: {e}")
            db.session.rollback()
            return {"error": "An error occurred while updating the question"}, 500

    @auth_required("token")
    @roles_required("admin")
    def delete(self, question_id):
        try:
            question = Question.query.filter_by(id=question_id).first()
            if not question:
                return {"error": "Question not found"}, 404

            db.session.delete(question)
            db.session.commit()
            return {"message": "Question deleted successfully"}, 200
        
        except Exception as e:
            print(f"Error during question deletion: {e}")
            db.session.rollback()
            return {"error": "An error occurred while deleting the question"}, 500


class ScoreResource(Resource):
    @auth_required("token")
    def get(self, user_id=None, quiz_id=None):
        try:
            if user_id and quiz_id:
                score = Score.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()
                if not score:
                    return {"error": "Score not found"}, 404
                return {
                    "id": score.id,
                    "user_id": score.user_id,
                    "quiz_id": score.quiz_id,
                    "total_scored": score.total_scored,
                    "total_questions": score.total_questions,
                    "correct_answers": score.correct_answers,
                    "incorrect_answers": score.incorrect_answers,
                    "time_stamp_of_attempt": score.time_stamp_of_attempt,
                    "time_taken": score.time_taken,
                }, 200
            elif user_id:
                scores = Score.query.filter_by(user_id=user_id).all()
                if not scores:
                    return {"error": "Scores not found"}, 404
                return {
                    "scores": [
                        {
                            "id": score.id,
                            "user_id": score.user_id,
                            "quiz_id": score.quiz_id,
                            "total_scored": score.total_scored,
                            "total_questions": score.total_questions,
                            "correct_answers": score.correct_answers,
                            "incorrect_answers": score.incorrect_answers,
                            "time_stamp_of_attempt": score.time_stamp_of_attempt,
                            "time_taken": score.time_taken,
                        }
                        for score in scores
                    ]
                }, 200
            elif current_user.roles[0] == 'user':
                scores = Score.query.filter_by(user_id=current_user.id).all()
                if not scores:
                    return {"error": "Scores not found"}, 404
                return {
                    "scores": [
                        {
                            "id": score.id,
                            "user_id": score.user_id,
                            "quiz_id": score.quiz_id,
                            "total_scored": score.total_scored,
                            "total_questions": score.total_questions,
                            "correct_answers": score.correct_answers,
                            "incorrect_answers": score.incorrect_answers,
                            "time_stamp_of_attempt": score.time_stamp_of_attempt,
                            "time_taken": score.time_taken,
                        }
                        for score in scores
                    ]
                }, 200
            
            scores = Score.query.all()
            score_list = [
                {
                    "id": score.id,
                    "user_id": score.user_id,
                    "quiz_id": score.quiz_id,
                    "total_scored": score.total_scored,
                    "total_questions": score.total_questions,
                    "correct_answers": score.correct_answers,
                    "incorrect_answers": score.incorrect_answers,
                    "time_stamp_of_attempt": score.time_stamp_of_attempt,
                    "time_taken": score.time_taken,
                }
                for score in scores
            ]
            return {"scores": score_list}, 200
        
        except Exception as e:
            print(f"Error fetching scores: {e}")
            return {"error": "An error occurred while fetching scores"}, 500

    @auth_required("token")
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON payload"}, 400

            quiz_id = data.get("quiz_id")
            total_scored = data.get("total_scored")
            total_questions = data.get("total_questions")
            correct_answers = data.get("correct_answers")
            incorrect_answers = data.get("incorrect_answers")
            time_taken = data.get("time_taken")

            if not all([quiz_id, total_scored, total_questions, correct_answers, incorrect_answers, time_taken]):
                return {"error": "Missing required fields"}, 400

            new_score = Score(
                user_id=current_user.id,
                quiz_id=quiz_id,
                total_scored=total_scored,
                total_questions=total_questions,
                correct_answers=correct_answers,
                incorrect_answers=incorrect_answers,
                time_stamp_of_attempt=datetime.now(),
                time_taken=time_taken,
            )
            db.session.add(new_score)
            db.session.commit()

            return {
                "message": "Score added successfully",
                "score": {
                    "id": new_score.id,
                    "user_id": current_user.id,
                    "quiz_id": new_score.quiz_id,
                    "total_scored": new_score.total_scored,
                    "total_questions": new_score.total_questions,
                    "correct_answers": new_score.correct_answers,
                    "incorrect_answers": new_score.incorrect_answers,
                    "time_stamp_of_attempt": new_score.time_stamp_of_attempt,
                    "time_taken": new_score.time_taken,
                },
            }, 201
        
        except Exception as e:
            print(f"Error during score creation: {e}")
            db.session.rollback()
            return {"error": "An error occurred while adding the score"}, 500


api.add_resource(ScoreResource,
    '/scores',
    '/scores/<int:user_id>',
    '/scores/<int:user_id>/<int:quiz_id>'
)

api.add_resource(QuestionResource,
    '/quizzes/<int:quiz_id>/questions',
    '/question/<int:question_id>',
    '/quizzes/<int:quiz_id>/questions/<int:question_id>'
)

api.add_resource(QuizResource, 
    '/quizzes',  # Get all quizzes, create quiz (POST)
    '/quizzes/<int:quiz_id>'  # Get, update, delete a specific quiz
)


api.add_resource(ChapterResource,
    '/subjects/<int:subject_id>/chapters',
    '/chapters/<int:chapter_id>',
    '/subjects/<int:subject_id>/chapters/<int:chapter_id>'
)
api.add_resource(AdminUserStatsResource, '/admin/users')
api.add_resource(SubjectResource, '/subjects', '/subjects/<int:subject_id>')
  # Attach the resource to '/subjects'
