import imaplib
import email
import os
import re
import email.header


def decode_email_header(header):
    """
    Decode email header to readable string.
    """
    decoded_header = email.header.decode_header(header)
    decoded_str = ''
    for part, encoding in decoded_header:
        if isinstance(part, bytes):
            decoded_str += part.decode(encoding or 'utf-8')
        else:
            decoded_str += part
    return decoded_str


def save_attachments(part, save_folder, save_folders):
    """
    Save attachments from the email part to the specified folder.
    """
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
    """
    Filter and clean the email body text.
    """
    filtered_body = re.sub(r'\n+', '\n', body)
    filtered_body = re.sub(r'\b(thank|regard)s?\b', '', filtered_body, flags=re.IGNORECASE)
    return filtered_body.strip()


def fetch_emails(data):
    """
    Fetch and process emails from the Gmail inbox.
    """
    user = data['user']
    password = data['password']
    orgId = data['orgId']

    # Connect to the Gmail IMAP server
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(user, password)
    mail.select('inbox')

    # Define folder paths
    save_folder = f"Invoice_Folder/{orgId}/myemails"
    save_folders = f"Invoice_Folder/{orgId}/Watch_Folder"

    # Create directories if they don't exist
    os.makedirs(save_folder, exist_ok=True)
    os.makedirs(save_folders, exist_ok=True)

    emails_data = []

    # Search and fetch all emails
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

        # Extract email body
        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get('Content-Disposition') is None:
                content_type = part.get_content_type()
                if content_type == 'text/plain':
                    body += part.get_payload(decode=True).decode('utf-8', 'ignore')

        body = filter_body_text(body)
        attachments = []

        # Save attachments
        for part in msg.walk():
            if part.get_content_maintype() != 'multipart' and part.get('Content-Disposition') is not None:
                save_attachments(part, save_folder, save_folders)
                attachments.append(decode_email_header(part.get_filename()))

        email_data = {
           
            "Attachments": attachments
        }
        emails_data.append(email_data)

    mail.logout()

    return emails_data

# Example usage

