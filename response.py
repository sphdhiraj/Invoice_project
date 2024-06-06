import pymongo
import os
import re
from pymongo import MongoClient
import requests
MAX_RETRIES = 3
INITIAL_DELAY = 1
YOUR_API_KEY = "AXTMrmGIODuYRtSOlhnFIcsJJbhDcZOfgk"
MODEL_NAME ="mistralai/Mistral-7B-Instruct-v0.2"
RETRY_DELAY = 1
mongo_client = pymongo.MongoClient("mongodb+srv://Root:Root@invoicedatabase.gicc9wm.mongodb.net/")
db = mongo_client["Invoicedatabase"]
collection = db["Invoice_Table"]
collections = db["pdf_format_tbl"]
import json
import pdfplumber
import hashlib
import PyPDF2

known_formats = {}
format_counter = 0

def text_generation_with_retry(user_prompt, model_name=MODEL_NAME, api_key=YOUR_API_KEY):
    url = f"https://api-inference.huggingface.co/models/{model_name}"
    headers = {"Authorization": f"Bearer hf_{api_key}"}
    data = {"inputs": user_prompt,"parameters": {"max_new_tokens": 3000}}
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
                generated_text = response.json()[0]['generated_text']
                token_count = len(generated_text.split())
                return generated_text, token_count


def extract_layout_signature(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        features = []
        
        for page in pdf.pages:
            for char in page.chars:
                if char['size'] > 12: 
                    features.append((char['size'], char['doctop'], char['x0'], char['x1']))
            for rect in page.rects:
                features.append((rect['x0'], rect['top'], rect['x1'], rect['bottom']))
        features.sort()
        features_str = ','.join(map(str, features))
    return hashlib.sha256(features_str.encode('utf-8')).hexdigest()


def get_format_identifiers(pdf_path):
    global format_counter
    layout_signature = extract_layout_signature(pdf_path)
    if layout_signature in known_formats:
        return known_formats[layout_signature]
    else:
        format_id = f"format_{format_counter}"
        known_formats[layout_signature] = format_id
        format_counter += 1
        return format_id


def extract_text_from_pdf(pdf_path):
    all_text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"
    return all_text


def extract_final_json(text):
    marker = "Final Json output:"
    start_index = text.find(marker)
    if start_index == -1:
        print("Final JSON output marker not found.")
        return None
    start_index += len(marker)
    json_str = text[start_index:].strip()
    try:
        return json_str
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
    

def getResponse(file_path,id):
    json_data=[]
    # print('file_path',file_path)
    _, file_extension = os.path.splitext(file_path)
    name_part = re.sub(r'(_\d{4}-\d{2}-\d{2}-\d{6})(.*)', '', file_path)
    if file_extension in ['.pdf']:
        final_name = name_part + file_extension
    else:
        raise ValueError("Unsupported file type")
    print('Looking for file:', final_name)
    file_name = f"Invoice_Folder/{id}/Process_folder/{file_path}"
    # Invoice_Folder
    print(file_name)
    pdf_format_name = list(collections.find({"pdf_name": final_name}))
    print(pdf_format_name)
    format_id = get_format_identifiers(file_name)
    print(format_id)
    docs = list(collection.find({"format_id": format_id}))
    print(docs)
    
    for res in docs:
            document_data_res = {
                        "type": res['type'],        
                        "text": res['mention_text'], 
                        "Source": res['Source'] ,
                    }
            json_data.append(document_data_res)
    
    if res['name'] == final_name:
         return json_data  
    else:
       text = extract_text_from_pdf(file_name)
       user_prompt = f"Given the following extracted text, map it accurately to the JSON format specified . Change only the 'text' values based on the content of the extracted text:\n\nExtracted text:\n{text}\n\nExpected JSON output:\n{json_data}\n\n Final Json output:"
       system_prompt = "You are a specialist in comprehending receipts. Input invoice in the form of receipts will be provided to you, and your task is to respond to create json only"
       full_prompt = f"{system_prompt}\n\n{user_prompt}"
       response_text, _ = text_generation_with_retry(full_prompt)
       res_data = extract_final_json(response_text)
       data_json = json.loads(res_data.replace("'", '"'))
    #    print(json.dumps(data_json, indent=4))             
       return data_json  
           
   



