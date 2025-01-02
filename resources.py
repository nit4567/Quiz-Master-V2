#all CRUD operations do thru here
from flask_restful import Resource, Api, reqparse, marshal_with, fields
from models import  db
from flask_security import auth_required

#parse the data recevived from frontend
parser = reqparse.RequestParser() # if a client is sending data, it will convert into a dict
parser.add_argument('topic', type=str, help = "Topic should be string", required = True)
parser.add_argument('content', type=str, help = "Topic should be string")

api = Api(prefix='/api')

#defining a templete to send data to the frontend