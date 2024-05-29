from typing import List
import fitz  # PyMuPDF
import os
import time
import shutil
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
# import pymongo
import json
import pandas as pd
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pymongo import MongoClient
from pydantic import BaseModel
import bcrypt
from fastapi import FastAPI, Request, HTTPException,responses,UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi.staticfiles import StaticFiles
from mymail import fetch_emails
from response import getResponse,fileList
from test import Watch
import threading
import jwt
from datetime import datetime, timedelta
SECRET_KEY = "jwt_secret"
ALGORITHM = "HS256"
app = FastAPI()
from typing import List
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], 
    allow_credentials=True,
    allow_methods=['*'],  
    allow_headers=['*'],
)


# app.mount("/documents", StaticFiles(directory="C:/Users/HP/Desktop/test2"), name="documents")

@app.get('/api/emails', response_model=List[str])
async def get_email():
    try:
        urllist=[]
        emails =fileList()
        # print(emails)
        # for m in emails:
        #   url = f"/documents/{m}"
        #   urllist.append(url)
        return JSONResponse(content={"emails": emails}, status_code=200)   
    
    except Exception as e:      
       raise HTTPException(status_code=500, detail=str(e))
    
# folder_path = "C:/Users/HP/Desktop/subfolder/"

# app.mount("/documents", StaticFiles(directory="C:/Users/HP/Desktop/test2"), name="documents")
app.mount("/documents", StaticFiles(directory="Folder/test2"), name="documents")

@app.post('/api/filecontent')
async def get_file_content(request: Request):
    try:
        data = await request.json()
        raw_text = data.get('raw_text', None)
        
        if raw_text:
            response = getResponse(raw_text)  
            url = { f"/documents/{raw_text}"} 
            docs = [] 
            
            for res in response:
                document_data = {
                    "type": res['type'],        
                    "text": res['mention_text'], 
                    "Source": res['Source'] ,
                     "id"  : str(res['_id']),
                     'name':(res['name'])
                }
                
                docs.append(document_data) 
            return docs , url
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'raw_text' field is missing or empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
    

@app.post('/api/removefile')    
async def remove_file_content(request: Request):
    try:
        data = await request.json()
        raw_text = data.get('raw_text', None)
        
        if raw_text:
            # selectedpath =f"C:/Users/HP/Desktop/test2/{raw_text}"
            selectedpath =f"Folder/test2/{raw_text}"
            storefile = "Folder/Processing_done_file/"
            # storefile = "C:/Users/HP/Desktop/Processing_done_file/"
            final_name = f"{raw_text}" 
            destination_path = os.path.join(storefile, final_name)
            shutil.move(selectedpath, destination_path)
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'raw_text' field is missing or empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e

@app.get('/api/folder', response_model=List[str])
async def get_email():
    try:
        emails = fetch_emails()
        return JSONResponse(content={"emails": emails}, status_code=200)   
    
    except Exception as e:      
       raise HTTPException(status_code=500, detail=str(e))
    



client = MongoClient("mongodb://localhost:27017")
# client = MongoClient('mongodb://127.0.0.1:27017/')

db = client['my_database']
users_collection = db['User']

# FastAPI app initialization
 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
class User(BaseModel):
    username: str
    password: str
 
# Helper function for password hashing
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # Token expires in 15 minutes
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
# Signup endpoint
@app.post("/api/signup")
async def signup(user: User):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = hash_password(user.password)
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}
 
# Login endpoint
@app.post("/api/login")
async def login(form_data: User):
    user = users_collection.find_one({"username": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user['password']):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user['username']})
    return {"access_token": access_token, "token_type": "bearer",'success':'login succesfully'}

@app.post("/api/uploadjson")
async def postJson(request: Request):
    try:
        data = await request.json()
        # JSONResponse = data.get('json', None)
        if data:
            item = pd.DataFrame(data)
            json_text = item.to_json(orient='records', lines=False) 
            users_collection = db['User_test']
            json_dicts = json.loads(json_text)
            users_collection.insert_many(json_dicts)
            return data
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'json' is empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e



if __name__ == '__main__':
    # get_email()
    # Watch()
    watch_t = threading.Thread(target = fetch_emails())
    watch_t.start()
    watch_thread = threading.Thread(target=Watch)
    watch_thread.start()
    import uvicorn
    uvicorn.run(app, host='localhost', port=8585,)
    # Watch()
    

    