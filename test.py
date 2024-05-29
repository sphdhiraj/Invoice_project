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

# Define the folder paths
# main_folder = "C:/Users/HP/Desktop/test/"
main_folder = "Folder/test/"
# sub_folder = "C:/Users/HP/Desktop/test2/"
sub_folder = "Folder/test2/"
import re
def process_pdf(file_path):
    _, file_extension = os.path.splitext(file_path)
    file_extension = file_extension
    file_name = os.path.basename(file_path)
    if file_extension == '.pdf':
        mime_type = 'application/pdf'
   
    else:
        raise ValueError("Unsupported file type")
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
                        "name":file_name
                    }
            entities.append(extracted_entity)
                    
    if res:
         for entity in res:
                ent = entity.properties
                for prop in ent:
                        extracted_entity = {
                            "type": prop.type_,
                            "mention_text": prop.mention_text,
                            "name":file_name
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
    mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
    # mongo_client = pymongo.Mongo("mongodb://127.0.0.1:27017/")

    
    # mongo_client = pymongo.MongoClient('mongodb://host.docker.internal:27017/')
    
    db = mongo_client["my_database"]
    collection = db["json_table"]
    json_dict = json.loads(json_text)
    collection.insert_many(json_dict)
#     print(categories)
#     print(line_items)
    print("name_part",file_name)

def move_file(src, dest):
    
    try:
        base_filename, _ = os.path.splitext(os.path.basename(src))
        current_datetime = time.strftime("%Y-%m-%d-%H%M%S")
        new_filename = f"{base_filename}_{current_datetime}.pdf"
        shutil.move(src, os.path.join(dest, new_filename))
        logger.info(f"File moved from {src} to {os.path.join(dest, new_filename)}")
        
        # Check if the source file still exists after the move operation
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
        
        # Check if the source file still exists after the conversion
        if os.path.exists(image_path):
            os.remove(image_path)
            logger.info(f"Removed original image file: {image_path}")
    except Exception as e:
        logger.error(f"Error converting image to PDF: {e}")

class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        logger.info(f"New file detected: {event.src_path}")
        file_name, extension = os.path.splitext(event.src_path)
        if extension.lower() == '.pdf':
            process_pdf(event.src_path)
            move_file(event.src_path, sub_folder)
        elif extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
            pdf_path = os.path.join(sub_folder, os.path.basename(file_name) + '.pdf')
            convert_to_pdf(event.src_path, pdf_path)
            process_pdf(pdf_path)
            move_file(pdf_path, sub_folder)

def process_existing_files(folder_path):
    for root, _, files in os.walk(folder_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            if os.path.isfile(file_path):
                handle_existing_file(file_path)

def handle_existing_file(file_path):
    file_name, extension = os.path.splitext(file_path)
    if extension.lower() == '.pdf':
        process_pdf(file_path)
        move_file(file_path, sub_folder)
    elif extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
        pdf_path = os.path.join(sub_folder, os.path.basename(file_name) + '.pdf')
        convert_to_pdf(file_path, pdf_path)
        process_pdf(pdf_path)
        move_file(pdf_path, sub_folder)


# if __name__ == "__main__":
def Watch():
    process_existing_files(main_folder)
    event_handler = MyHandler()
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

   
