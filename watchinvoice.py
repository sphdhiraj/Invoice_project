import fitz  # PyMuPDF
import os
import time
import shutil
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
import os
import time
import shutil
from PIL import Image
import pymongo
import json
import pandas as pd
service_key = "invoice-reading-fb6b7ac10832.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = service_key
invoice_parser = "projects/789897058876/locations/us/processors/737f471756bac33f"
# invoice_parser = "projects/789897058876/locations/us/processors/28850cb9ac68d859"
# https://us-documentai.googleapis.com/v1/projects/789897058876/locations/us/processors/28850cb9ac68d859:process
location='us'
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from pymongo import MongoClient
import pdfplumber
import hashlib
import re
credential=[]
# main_folder = "Folder/test/"
# sub_folder = "Folder/test2/"



# def getjson(file_path):
#     _, file_extension = os.path.splitext(file_path)
#     file_extension = file_extension
#     file_name = os.path.basename(file_path)
#     if file_extension == '.pdf':
#         mime_type = 'application/pdf'
   
#     else:
#         raise ValueError("Unsupported file type")
#     opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
#     client = documentai.DocumentProcessorServiceClient(client_options=opts)
#     with open(file_path, "rb") as file:
#         content = file.read()
#     request = {
#         "name": invoice_parser,
#         "raw_document": {
#             "content": content,
#             "mime_type": mime_type
#         },
#     }

  
#     result = client.process_document(request=request)
#     res = result.document.entities
#     return res

# known_formats = {}
# format_counter = 0

# def extract_layout_signature(pdf_path):
#     with pdfplumber.open(pdf_path) as pdf:
#         features = []
        
#         for page in pdf.pages:
#             for char in page.chars:
#                 if char['size'] > 12: 
#                     features.append((char['size'], char['doctop'], char['x0'], char['x1']))
#             for rect in page.rects:
#                 features.append((rect['x0'], rect['top'], rect['x1'], rect['bottom']))
#         features.sort()
#         features_str = ','.join(map(str, features))
#     return hashlib.sha256(features_str.encode('utf-8')).hexdigest()

# def get_format_identifiers(pdf_path):
#     global format_counter
#     layout_signature = extract_layout_signature(pdf_path)
    
#     if layout_signature in known_formats:
#         return known_formats[layout_signature]
#     else:
#         format_id = f"format_{format_counter}"
#         known_formats[layout_signature] = format_id
#         format_counter += 1
#         return format_id

def process_pdf(file_path,orgId):
    mongo_client = pymongo.MongoClient("mongodb+srv://Root:Root@invoicedatabase.gicc9wm.mongodb.net/")
   
    db = mongo_client["Invoicedatabase"]
    collection = db["Invoice_Table"]
    # colections = db["pdf_format_tbl"]
    # format_id = get_format_identifiers(file_path)
    _, file_extension = os.path.splitext(file_path)
    file_extension = file_extension
    file_name = os.path.basename(file_path)
    if file_extension == '.pdf':
        mime_type = 'application/pdf'
   
    else:
        raise ValueError("Unsupported file type")
    
    # for mistral
    # matching_format_id = collection.find_one({"format_id": format_id})
    # if matching_format_id :
    #         colections.insert_one({
    #         "format_id": format_id,
    #         "pdf_name": file_name,
        
    #         })
    #         print(f"Document with format_id {format_id} already processed.")
    #         return 
    # print(orgId)
    file_upNmae= (os.path.basename(file_path))
    # print('file_upNmae',file_upNmae)
    newFileName = f"{orgId}/{file_upNmae}"
    # print('newFileName',newFileName)

    # return 
    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)
    with open(file_path, "rb") as file:
        content = file.read()
    request = {
        "name": invoice_parser,
        "raw_document": {
            "content": content,
            "mime_type": mime_type
        },
    }
    
  
    result = client.process_document(request=request)
    res = result.document.entities
    print(res)
    entities = []
    categories = []
            
    if res:
        for entity in res:
            extracted_entity = {
                        "type": entity.type_,
                        "mention_text": entity.mention_text,
                        "name":newFileName,
                    }
            entities.append(extracted_entity)
                    
    if res:
         for entity in res:
                ent = entity.properties
                for prop in ent:
                        extracted_entity = {
                            "type": prop.type_,
                            "mention_text": prop.mention_text,
                            "name":newFileName,
                       }
                        categories.append(extracted_entity)
    line_items = []         
    for i, item in enumerate(entities):
                if item['type'] != 'line_item':
                    line_items.append(item)
    df_categories = pd.DataFrame(categories)
    df_line_items = pd.DataFrame(line_items)

    df_line_items['Source'] = 'Entity'
    df_categories['Source'] = 'Item'

    combined_df = pd.concat([df_line_items,df_categories ], ignore_index=True)
    json_text = combined_df.to_json(orient='records', lines=False) 
   
    json_dict = json.loads(json_text)
    
    collection.insert_many(json_dict)


def move_file(src, dest):
    
    try:
        base_filename, _ = os.path.splitext(os.path.basename(src))
        current_datetime = time.strftime("%Y-%m-%d-%H%M%S")
        new_filename = f"{base_filename}_{current_datetime}.pdf"
        print('src',src)
        print('dest',dest)
        move_path =f"{dest}/{new_filename}"
        # shutil.move(src, os.path.join(dest, new_filename))
        shutil.move(src, move_path)
        logger.info(f"File moved from {src} to {move_path}")
        
        if os.path.exists(src):
            os.remove(src)
            logger.info(f"Removed original image file: {src}")
    except Exception as e:
        logger.error(f"Error moving file: {e}")

def convert_to_pdf(image_path, output_pdf_path):
    try:
        img = Image.open(image_path)
        img.save(output_pdf_path, "PDF", resolution=100.0)
        logger.info(f"Converted {image_path} to PDF: {output_pdf_path}")
        
        if os.path.exists(image_path):
            os.remove(image_path)
            logger.info(f"Removed original image file: {image_path}")
    except Exception as e:
        logger.error(f"Error converting image to PDF: {e}")

class MyHandler(FileSystemEventHandler):
    def __init__(self, sub_folder,orgId):
        self.sub_folder = sub_folder
        self.orgId = orgId
        print(self.orgId)
    def on_created(self, event):
        if event.is_directory:
            return
        logger.info(f"New file detected: {event.src_path}")
        file_name, extension = os.path.splitext(event.src_path)
        if extension.lower() == '.pdf':
            process_pdf(event.src_path,self.orgId)
            move_file(event.src_path, self.sub_folder)
        elif extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
            # pdf_path = os.path.join(self.sub_folder, os.path.basename(file_name) + '.pdf')
            pdf_name = os.path.basename(file_name) + '.pdf'
            pdf_path = f"{self.sub_folder}/{pdf_name}"
            convert_to_pdf(event.src_path, pdf_path)
            process_pdf(pdf_path,self.orgId)

            move_file(pdf_path, self.sub_folder)
from pathlib import Path
def process_existing_files(folder_path,sub_folder,orgId):
    for root, _, files in os.walk(folder_path):
        for file_name in files:
            # file_path = os.path.join(root, file_name)
            file_path = f"{root}/{file_name}"
           
            if os.path.isfile(file_path):
                handle_existing_file(file_path,sub_folder,orgId)

def handle_existing_file(file_path,sub_folder,orgId):
    file_name, extension = os.path.splitext(file_path)
    if extension.lower() == '.pdf':
        # print('file_path1',file_path)
        process_pdf(file_path,orgId)
        move_file(file_path, sub_folder)
    elif extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
        pdf_name = os.path.basename(file_name) + '.pdf'
        pdf_path = f"{sub_folder}/{pdf_name}"
        # pdf_path = os.path.join(sub_folder, os.path.basename(file_name) + '.pdf')
        convert_to_pdf(file_path, pdf_path)
        process_pdf(pdf_path,orgId)
        move_file(pdf_path, sub_folder)



def Watch(data):
    print(data)
    user = data['user']
    password = data['password']
    orgId = data['orgId']
    main_folder = f"Invoice_Folder/{orgId}/Watch_Folder"
    sub_folder = f"Invoice_Folder/{orgId}/Process_folder"
    process_existing_files(main_folder,sub_folder,orgId)
    event_handler = MyHandler(sub_folder,orgId)
    observer = Observer()
    observer.schedule(event_handler, main_folder, recursive=False)
    # try:
    observer.start()
    logger.info(f"Monitoring folder: {main_folder}")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

   
