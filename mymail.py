"""
Extract selected mails from your gmail account

1. Make sure you enable IMAP in your gmail settings
(Log on to your Gmail account and go to Settings, See All Settings, and select
 Forwarding and POP/IMAP tab. In the "IMAP access" section, select Enable IMAP.)

2. If you have 2-factor authentication, gmail requires you to create an application
specific password that you need to use. 
Go to your Google account settings and click on 'Security'.
Scroll down to App Passwords under 2 step verification.
Select Mail under Select App. and Other under Select Device. (Give a name, e.g., python)
The system gives you a password that you need to use to authenticate from python.
"""

import imaplib
import email
import json
import time
import os
import imaplib
import email
import json
import email.header
import re

def decode_email_header(header):
    decoded_header = email.header.decode_header(header)
    decoded_str = ''
    for part, encoding in decoded_header:
        if isinstance(part, bytes):
            decoded_str += part.decode(encoding or 'utf-8')
        else:
            decoded_str += part
    return decoded_str
# save_folders = f"C:\\Users\\HP\\Desktop\\test"
save_folders = "Folder/test"
def save_attachments(part, save_folder):
    filename = decode_email_header(part.get_filename())
    if filename:
        filepath = os.path.join(save_folder, filename)
        filepaths = os.path.join(save_folders, filename)
        if not os.path.exists(filepath):
            print("Downloading attachment:", filename)
            with open(filepath, 'wb') as f:
                f.write(part.get_payload(decode=True))
            with open(filepaths, 'wb') as f:
                f.write(part.get_payload(decode=True))
        else:
            print("Attachment already downloaded:", filename)

def filter_body_text(body):
    filtered_body = re.sub(r'\n+', '\n', body)  
    filtered_body = re.sub(r'\b(thank|regard)s?\b', '', filtered_body, flags=re.IGNORECASE)  # Remove 'thank' and 'regard' content
    return filtered_body.strip()

def fetch_emails():
    with open("credential.json", "r") as file:
        my_credentials = json.load(file)

    user = my_credentials["user"]
    password = my_credentials["password"]

    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(user, password)
    mail.select('inbox')

    # save_folder = "mail_attachments"
    # save_folder = f"C:\\Users\\HP\\Desktop\\myemails"
    save_folder = "Folder/myemails"
    

    if not os.path.exists(save_folder):
        os.makedirs(save_folder)
    
    emails_data = []

    typ, data = mail.search(None, 'ALL')
    mail_ids = data[0].split()

    for num in mail_ids:
        typ, data = mail.fetch(num, '(RFC822)')
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)
        subject = decode_email_header(msg['Subject'])
        sender = decode_email_header(msg['From'])
        recipient = decode_email_header(msg['To'])
        body = ''

        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get('Content-Disposition') is None:
               
                content_type = part.get_content_type()
                if content_type == 'text/plain':
                    body += part.get_payload(decode=True).decode('utf-8', 'ignore')
                elif content_type == 'text/html':
                  
                    pass

        body = filter_body_text(body)
        attachments = []

        for part in msg.walk():
            if part.get_content_maintype() != 'multipart' and part.get('Content-Disposition') is not None:
                save_attachments(part, save_folder)
                attachments.append(decode_email_header(part.get_filename()))

        email_data = {
           
            "Attachments": attachments
        }
        emails_data.append(email_data)

    mail.logout()

    return emails_data

# if __name__ == "__main__":
#     fetch_emails()