from typing import Optional
from myfunction import *
from flask import Flask, request, make_response
from flask_cors import CORS
import os
import sqlite3
import pickle

from openai import OpenAI

from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from base64 import urlsafe_b64decode, urlsafe_b64encode

from email.mime.text import MIMEText
from mimetypes import guess_type as guess_mime_type
import time
import json

import re
# from twilio.rest import Client
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, origins='*')
openai_api_key = os.environ.get("OPENAI_API_KEY")
SCOPES = ['https://mail.google.com/']
our_email = 'testrecbluebix@gmail.com'

openai_client = OpenAI(api_key=openai_api_key)

states = {}
timeslot = {}
with open('log.txt', 'w') as file:
    # Clear the contents of the file
    file.truncate(0)

def gmail_authenticate():
    creds = None
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)
    return build('gmail', 'v1', credentials=creds)

service = gmail_authenticate()

async def build_email(destination, obj, body, attachments=[]):
    message = MIMEText(body)
    message['to'] = destination
    message['from'] = our_email
    message['subject'] = obj
    return {'raw': urlsafe_b64encode(message.as_bytes()).decode()}

async def send_email(destination, body):
    try:
        # Send the email...
        send_response = service.users().messages().send(userId="me", body= await build_email(
            destination, "Message for Candidate", body)).execute()

        # Log the successful response
        print(f"Email sent; Message ID: {send_response['id']}")
    except Exception as e:
        print(f"An error occurred while sending an email===>{e}")
        send_email(destination, body)
        
    filename = 'log.txt'

    # Open the file in append mode
    with open(filename, 'a') as file:
        # Append the new content to the file
        file.write(f"To candidate => {body}\n")

async def email_mark_as_read(id):
    service.users().messages().batchModify(userId='me', body={
        'ids': [id], 'removeLabelIds': ['UNREAD']}).execute()
    print(f"It's done===>{id}")

async def clean_msg(message):
    pattern = re.compile(
        r"On [A-Za-z]{3}, \w+ \d{1,2}, \d{4} at \d{1,2}:\d{2} (AM|PM)")
    clean_snippet = re.split(pattern, message)[0].strip()
    return clean_snippet
async def set_step(email, step):
    conn = sqlite3.connect("mydb.sqlite")
    cur = conn.cursor()
    cur.execute("UPDATE resume SET step = ? WHERE email = ?",
                (step, email))
    conn.commit()
    cur.close()
    conn.close()

# send  simple email

async def read_simple_email():
    try:
        global states, timeslot
        email_items = []
        # get the emails from SQLite DB
        with sqlite3.connect('mydb.sqlite') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT email FROM resume")
            email_items = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        for from_email in email_items:

            results = service.users().messages().list(
                userId='me', q=f"from:{from_email}").execute()
            email_messages = results.get('messages', [])

            with sqlite3.connect('mydb.sqlite') as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT step FROM resume WHERE email = ?", (from_email,))
                step = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            print(f"On {from_email} current step is =>{step}")
            if step != 10:
                for message in email_messages:
                    msg = service.users().messages().get(
                        userId='me', id=message['id']).execute()

                    if 'UNREAD' in msg['labelIds']:
                        filename = 'log.txt'

                        # Open the file in append mode
                        with open(filename, 'a') as file:
                            # Append the new content to the file
                            file.write(
                                f"From candidate => {await clean_msg(msg['snippet'])}\n")

                        if step == 1:
                            res = await init_answer(from_email, await clean_msg(msg['snippet']))
                            print(res)
                            if (res == 'Yes'):
                                await set_step(from_email, 2)
                                res = await show_JD(from_email)
                                print(res)
                                await send_email(from_email, res)
                            elif (res == 'No'):
                                res = await reason_message()
                                print(res)
                                await send_email(from_email, res)
                                await set_step(from_email, 0)
                            else:
                                res = await init_message(from_email, True)
                                print(res)
                                await send_email(from_email, res)
                        elif step == 0:
                            res = (await clean_msg(msg['snippet']))
                            print(res)
                            await send_email(from_email, end_message())
                            await set_step(from_email, 10)
                        elif step == 2:
                            res = await show_JD_answer(from_email, await clean_msg(msg['snippet']))
                            print(res)
                            if res == "Yes":
                                await set_step(from_email, 3)
                                timeslot[from_email] = await calendar_show()
                                print(timeslot[from_email])
                                await send_email(from_email, timeslot[from_email])
                            elif res == "No":
                                call_res = await end_message()
                                print(call_res)
                                await send_email(from_email, call_res)
                            else:
                                call_res = await show_JD(from_email)
                                print(call_res)
                                await send_email(from_email, call_res)
                            res = await JD_recruiter_answer(
                                from_email, await clean_msg(msg['snippet']))
                            print(res)
                        elif step == 3:
                            res = await calendar_book(timeslot[from_email], await clean_msg(
                                msg['snippet']), from_email)
                            print(res)
                            if res == "None":
                                timeslot[from_email] = await calendar_show()
                                print(timeslot[from_email])
                                await send_email(from_email, timeslot[from_email])
                            else:
                                call_res = await reserve_message(from_email, res)
                                await set_step(from_email, 10)
                                print(call_res)
                                await send_email(from_email, call_res)
                    
                        await email_mark_as_read(message['id'])
    except Exception as e:
        print(e)

# send medium email
async def read_md_email():
    try:
        global states, timeslot
        email_items = []
        # get the emails from SQLite DB
        with sqlite3.connect('mydb.sqlite') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT email FROM resume")
            email_items = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        for from_email in email_items:

            results = service.users().messages().list(
                userId='me', q=f"from:{from_email}").execute()
            email_messages = results.get('messages', [])

            with sqlite3.connect('mydb.sqlite') as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT step FROM resume WHERE email = ?", (from_email,))
                step = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            print(f"On {from_email} current step is =>{step}")
            for message in email_messages:
                msg = service.users().messages().get(
                    userId='me', id=message['id']).execute()

                if 'UNREAD' in msg['labelIds']:
                    filename = 'log.txt'

                    # Open the file in append mode
                    with open(filename, 'a') as file:
                        # Append the new content to the file
                        file.write(
                            f"From candidate => {await clean_msg(msg['snippet'])}\n")

                    if step == 1:
                        res = await init_answer(from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if (res == 'Yes'):
                            await set_step(from_email, 2)
                            res = await JD_recruiter(from_email, False)
                            print(res)
                            await send_email(from_email, res)
                        elif (res == 'No'):
                            res = await reason_message()
                            print(res)
                            await send_email(from_email, res)
                            await set_step(from_email, 0)
                        else:
                            res = await init_message(from_email, True)
                            print(res)
                            await send_email(from_email, res)
                    elif step == 0:
                        res = (await clean_msg(msg['snippet']))
                        print(res)
                        await send_email(from_email, end_message())
                        await set_step(from_email, 10)
                    elif step == 2:
                        res = JD_recruiter_answer(
                            from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if (res == 'Go'):
                            await set_step(from_email, 3)
                            states[from_email] = 'Go'
                            res_job = show_JD(from_email)
                            print(res_job)
                            await send_email(from_email, res_job)
                        elif (res == 'Interview'):
                            await set_step(from_email, 3)
                            states[from_email] = "Interview"
                            timeslot[from_email] = await calendar_show()
                            print(timeslot[from_email])
                            await send_email(from_email, timeslot[from_email])
                        else:
                            res = JD_recruiter(from_email, True)
                            print(res)
                            await send_email(from_email, res)
                    elif step == 3:
                        if states[from_email] == "Go":
                            res = show_JD_answer(
                                from_email, await clean_msg(msg['snippet']))
                            print(res)
                            if res == "Yes":
                                await set_step(from_email, 4)
                                call_res = open_job(from_email)
                                print(call_res)
                                await send_email(from_email, call_res)
                            elif res == "No":
                                call_res = end_message()
                                print(call_res)
                                await send_email(from_email, call_res)
                            else:
                                call_res = show_JD(from_email)
                                print(call_res)
                                await send_email(from_email, call_res)
                        else:
                            res = await calendar_book(timeslot[from_email], await clean_msg(
                                msg['snippet']), from_email)
                            print(res)
                            if res == "None":
                                timeslot[from_email] = await calendar_show()
                                print(timeslot[from_email])
                                await send_email(from_email, timeslot[from_email])
                            else:
                                call_res = await reserve_message(from_email, res)
                                await set_step(from_email, 10)
                                print(call_res)
                                await send_email(from_email, call_res)
                    elif step == 4:
                        res = open_job_answer(
                            from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if res == "Yes":
                            await set_step(from_email, 5)
                            call_res = commute_job(from_email)
                            print(call_res)
                            await send_email(from_email, call_res)
                        else:
                            call_res = end_message()
                            print(call_res)
                            await send_email(from_email, call_res)
                            await set_step(from_email, 10)
                    elif step == 5:
                        res = commute_job_answer(
                            from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if res == "Yes":
                            await set_step(from_email, 6)
                            timeslot[from_email] = await calendar_show()
                            print(timeslot[from_email])
                            await send_email(from_email, timeslot[from_email])
                        else:
                            call_res = commute_job(from_email)
                            print(call_res)
                            await send_email(from_email, call_res)
                    elif step == 6:
                        res = await calendar_book(timeslot[from_email], await clean_msg(
                            msg['snippet']), from_email)
                        print(res)
                        if res != "None":
                            call_res = await reserve_message(
                                from_email, await clean_msg(msg['snippet']))
                            print(call_res)
                            await send_email(from_email, call_res)
                            await set_step(from_email, 10)
                        else:
                            timeslot[from_email] = await calendar_show()
                            print(timeslot[from_email])
                            await send_email(from_email, timeslot[from_email])

                    email_mark_as_read(message['id'])
    except Exception as e:
        print(e)

# send complex email
async def read_email():
    try:
        global states, timeslot
        email_items = []
        # get the emails from SQLite DB
        with sqlite3.connect('mydb.sqlite') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT email FROM resume")
            email_items = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()

        for from_email in email_items:

            results = service.users().messages().list(
                userId='me', q=f"from:{from_email}").execute()
            email_messages = results.get('messages', [])

            with sqlite3.connect('mydb.sqlite') as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT step FROM resume WHERE email = ?", (from_email,))
                step = cursor.fetchone()[0]
            cursor.close()
            conn.close()

            print(f"On {from_email} current step is =>{step}")
            for message in email_messages:
                msg = service.users().messages().get(
                    userId='me', id=message['id']).execute()

                if 'UNREAD' in msg['labelIds']:
                    filename = 'log.txt'

                    # Open the file in append mode
                    with open(filename, 'a') as file:
                        # Append the new content to the file
                        file.write(f"From candidate => {await clean_msg(msg['snippet'])}\n")

                    if step == 1:
                        res = await init_answer(from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if (res == 'Yes'):
                            await set_step(from_email, 2)
                            res = await JD_recruiter(from_email, False)
                            print(res)
                            await send_email(from_email, res)
                        elif (res == 'No'):
                            res = await reason_message()
                            print(res)
                            await send_email(from_email, res)
                            await set_step(from_email, 0)
                        else:
                            res = await init_message(from_email, True)
                            print(res)
                            await send_email(from_email, res)
                    elif step == 0:
                        res = (await clean_msg(msg['snippet']))
                        print(res)
                        await send_email(from_email, end_message())
                        await set_step(from_email, 10)
                    elif step == 2:
                        res = JD_recruiter_answer(from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if (res == 'Go'):
                            await set_step(from_email, 3)
                            states[from_email] = 'Go'
                            res_job = show_JD(from_email)
                            print(res_job)
                            await send_email(from_email, res_job)
                        elif (res == 'Interview'):
                            await set_step(from_email, 3)
                            states[from_email] = "Interview"
                            timeslot[from_email] = await calendar_show()
                            print(timeslot[from_email])
                            await send_email(from_email, timeslot[from_email])
                        else:
                            res = JD_recruiter(from_email, True)
                            print(res)
                            await send_email(from_email, res)
                    elif step == 3:
                        if states[from_email] == "Go":
                            res = show_JD_answer(
                                from_email, await clean_msg(msg['snippet']))
                            print(res)
                            if res == "Yes":
                                await set_step(from_email, 4)
                                call_res = confirm_screening(
                                    from_email)
                                print(call_res)
                                await send_email(from_email, call_res)
                            elif res == "No":
                                call_res = end_message()
                                print(call_res)
                                await send_email(from_email, call_res)
                            else:
                                call_res = show_JD(from_email)
                                print(call_res)
                                await send_email(from_email, call_res)
                        else:
                            res = await calendar_book(timeslot[from_email], await clean_msg(msg['snippet']), from_email)
                            print(res)
                            if res == "None":
                                timeslot[from_email] = await calendar_show()
                                print(timeslot[from_email])
                                await send_email(from_email, timeslot[from_email])
                            else:
                                call_res = await reserve_message(from_email, res)
                                await set_step(from_email, 10)
                                print(call_res)
                                await send_email(from_email, call_res)
                    elif step == 4:
                        res = confirm_screening_answer(
                            from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if res == "Yes":
                            await set_step(from_email, 5)
                            call_res = screening_question(from_email)
                            print(call_res)
                            await send_email(from_email, call_res)
                        else:
                            call_res = other_skill_end()
                            print(call_res)
                            await send_email(from_email, call_res)
                            await set_step(from_email, 10)
                    elif step == 5:
                        res = screening_question_answer(from_email, await clean_msg(msg['snippet']))
                        print(res)
                        if res == "Yes":
                            await set_step(from_email, 6)
                            call_res = question_motivate(from_email)
                            print(call_res)
                            await send_email(from_email, call_res)
                        elif res == "No":
                            call_res = screening_question(from_email)
                            print(call_res)
                            await send_email(from_email, call_res)
                    elif step == 6:
                        print(await clean_msg(msg['snippet']))
                        await set_step(from_email, 7)
                        res = await question_salary(from_email)
                        print(res)
                        await send_email(from_email, res)
                    elif step == 7:
                        print(await clean_msg(msg['snippet']))
                        await set_step(from_email, 8)
                        res = await more_question(from_email)
                        print(res)
                        await send_email(from_email, res)
                    elif step == 8:
                        print(await clean_msg(msg['snippet']))
                        await set_step(from_email, 9)
                        timeslot[from_email] = await calendar_show()
                        print(timeslot[from_email])
                        await send_email(from_email, timeslot[from_email])
                    elif step == 9:
                        res = await calendar_book(timeslot[from_email], await clean_msg(msg['snippet']), from_email)
                        print(res)
                        if res != "None":
                            call_res = await reserve_message(
                                from_email, await clean_msg(msg['snippet']))
                            print(call_res)
                            await send_email(from_email, call_res)
                            await set_step(from_email, 10)
                        else:
                            timeslot[from_email] = await calendar_show()
                            print(timeslot[from_email])
                            await send_email(from_email, timeslot[from_email])

                    await email_mark_as_read(message['id'])
    except Exception as e:
        print(e)

async def mark_as_read_all(email):
        print(f"\nI am all of mark read position====>{email}")
        results = service.users().messages().list(
            userId='me', q=f"from:{email}").execute()
        email_messages = results.get('messages', [])
        for message in email_messages:
            msg = service.users().messages().get(
                userId='me', id=message['id']).execute()

            if 'UNREAD' in msg['labelIds']:
               await email_mark_as_read(message['id'])
        

async def clean_DB():
    # Connect to the database
    conn = sqlite3.connect('mydb.sqlite')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM resume;')
    conn.commit()
    # Close the connection
    cursor.close()
    conn.close()

async def insert_resume_db(resume_data):
    conn = sqlite3.connect('mydb.sqlite')
    cur = conn.cursor()

    first_name = resume_data['first_name']
    last_name = resume_data['last_name']
    email = resume_data['email']
    mobile = resume_data['mobile']
    filename = resume_data['filename']
    step = 1
    cur.execute('SELECT * FROM resume WHERE filename = ?', (filename,))

    row = cur.fetchone()
    if not row:
        try:
            cur.execute('INSERT INTO resume (first_name, last_name, email, mobile, filename, step) VALUES (?, ?, ?, ?, ?,?)',
                        (first_name, last_name, email, mobile, filename, step))
            conn.commit()
        except sqlite3.Error as e:
            print(f"Database error: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            cur.close()
            conn.close()

@app.route('/log', methods=['GET', 'POST'])
async def log():
    filename = 'log.txt'
    message = None
    with open(filename, 'r') as file:
        message = file.read()

    status_code = 200
    response = await make_response(message, status_code)
    response.headers['Content-Type'] = 'text/plain'
    return response

@app.route('/screen_start', methods=['POST'])
async def screen_start():
    try:
        if request.method == 'POST':
            await clean_DB()
            res = request.json
            print(res)
            job_id = res['jobInfo']['opening_title']
            level = res['level']
            job_description = res['jobInfo']['job_description']
            
            print(f"job description =====>{job_description}")

            for candidate in res['candidates']:
                email = candidate['email']
                number = candidate['mobile']
                first_name = candidate['first_name']
                last_name = candidate['last_name']
                name = f"{first_name} {last_name}"

                # async define the data to be written
                data = {
                    "job_description": job_description,
                    "job_title": job_id,
                    "candidate_name": name
                }

                # Open the file for writing
                with open('info.json', 'w') as file:
                    # Write the data to the file in JSON format
                    json.dump(data, file)
                
                await mark_as_read_all(email)

                resume_data = {}
                resume_data['first_name'] = first_name
                resume_data['last_name'] = last_name
                resume_data['email'] = email
                resume_data['mobile'] = number

                resume_data['filename'] = f"{first_name} {last_name}_{number}"
                func_res = await init_message(email, False)
                await send_email(email, func_res)
                # set step in DB
                await insert_resume_db(resume_data)

            while (True):
                if level == "complex":
                    await read_email()
                elif level == "medium":
                    await read_md_email()
                else:
                    await read_simple_email()
                time.sleep(20)

        return "Good"
    except Exception as e:
        print(e)
        return "Bad"

if __name__ == '__main__':
    app.run(debug=True, port=5005, host=('0.0.0.0'))
