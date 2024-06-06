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
from response import getResponse
from watchinvoice import Watch
import threading
import jwt
from mapping import fetch_emails_Credential
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


client = MongoClient("mongodb+srv://Root:Root@invoicedatabase.gicc9wm.mongodb.net/")

db = client['Invoicedatabase']
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
class User(BaseModel):
    username: str
    password: str
# email
class AccountModel(BaseModel):
    contactPerson:str
    contactPersonEmail:str
    contactPersonPhone:str
    invoiceEmail:str
    orgCode:str
    orgId:str
    orgName:str
    orgStatus:str
    smtpPassword:str
    smtpPort:str
    smtpURL:str
    smtpUsername:str

@app.get('/api/emails/{id}')
async def get_email(id: str):
    try:
        sub_folder = f"Invoice_Folder/{id}/Process_folder"
      
        if not os.path.exists(sub_folder):
            raise HTTPException(status_code=404, detail="Folder not found")
        
        files = os.listdir(sub_folder)
        return JSONResponse(content={"emails": files}, status_code=200)   
    
    except Exception as e:      
       raise HTTPException(status_code=500, detail=str(e))
    


# json
@app.post('/api/filecontent')
async def get_file_content(request: Request):
  
    try:
        data = await request.json()
        json_data=[]
        raw_text = data.get('raw_text', None)
        id = data.get('id', None)
        app.mount("/documents", StaticFiles(directory=f"Invoice_Folder/{id}/Process_folder"), name="documents")
        if raw_text:
            response = getResponse(raw_text,id)  
            url = { f"/documents/{raw_text}"} 
            if response:
              print('response',response)
           
              return response, url
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'raw_text' field is missing or empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e
    
# remove
@app.post('/api/removefile')    
async def remove_file_content(request: Request):
    try:
        data = await request.json()
        raw_text = data.get('raw_text', None)
        id = data.get('id', None)
        
        if raw_text:
            selectedpath =f"Invoice_Folder/{id}/Process_folder/{raw_text}"
            storefile = f"Invoice_Folder/{id}/Processing_done_file/"
            final_name = f"{raw_text}" 
            destination_path = os.path.join(storefile, final_name)
            shutil.move(selectedpath, destination_path)
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'raw_text' field is missing or empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@app.post("/api/uploadjson")
async def postJson(request: Request):
    try:
        data = await request.json()
        if data:
            item = pd.DataFrame(data)
            json_text = item.to_json(orient='records', lines=False) 
            if "User_test" not in db.list_collection_names():
              db.create_collection("User_test")
              print("Collection 'users' created!")
            else:
              print("Collection 'users' already exists.")
            users_collection = db['User_test']
            json_dicts = json.loads(json_text)
            users_collection.insert_many(json_dicts)
            return data
        else:
            raise HTTPException(status_code=400, detail="Invalid request: 'json' is empty")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@app.post("/api/getCredential")
async def register_account(account: AccountModel):
    try:
        credential_data = {
            "user": account.smtpUsername,
            "password": account.smtpPassword,
            "orgId": account.orgId,
            "orgName": account.orgName
        }
        fetch_emails(credential_data)
        watch_thread = threading.Thread(target=Watch, args=(credential_data,))
        watch_thread.start()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="An error occurred during registration")
    



if __name__ == '__main__':
    # watch_c = threading.Thread(target= fetch_emails_Credential())
    # watch_c.start()
    # watch_t = threading.Thread(target = fetch_emails())
    # watch_t.start()
  
    # watch_thread = threading.Thread(target=Watch(data=any))
    # watch_thread.start()
    import uvicorn
    uvicorn.run(app, host='localhost', port=8585,)
    

    