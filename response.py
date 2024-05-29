import pymongo
import os
import re
# Connect to the MongoDB server
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
# mongo_client = pymongo.MongoClient('mongodb://host.docker.internal:27017/')
# mongo_client =  pymongo.MongoClient('mongodb://127.0.0.1:27017/')

db = mongo_client["my_database"]
collection = db["json_table"]

def getResponse(file_path):
    _, file_extension = os.path.splitext(file_path)
    name_part = re.sub(r'(_\d{4}-\d{2}-\d{2}-\d{6})(.*)', '', file_path)
    if file_extension in ['.pdf']:
        final_name = name_part + file_extension
    else:
        raise ValueError("Unsupported file type")
    # final_file_path = f"C:/Users/HP/Desktop/test/{final_name}"
    print('Looking for file:', name_part)
    docs = list(collection.find({"name": final_name}))
    # print(docs)
    return docs

def fileList():
    # sub_folder = "C:/Users/HP/Desktop/test2/"
    sub_folder = "Folder/test2/"
    files = os.listdir(sub_folder)
    return files