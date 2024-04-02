from bs4 import BeautifulSoup
import sqlite3
from datetime import datetime, timedelta, timezone
import pytz
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
load_dotenv()

openai_api_key = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=openai_api_key)
chat_message = {}
# generate message using chatGTP
job_description = ''
job_title = ''
utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)

async def remove_html_tags(text):
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text()

calendar_tools = [
    {
        "type": "function",
        "function": {
            "name": "get_time_slot",
            "description": "Get the selected time slot",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_datetime": {
                        "type": "string",
                        "description": "Starting date and time of selected time slot. You should answer as following format:'% Y-%m-%dT % H: % M: % SZ'",
                    },
                    "end_datetime": {
                        "type": "string",
                        "description": "Ending date and time of selected time slot.You should answer as following format:'% Y-%m-%dT % H: % M: % SZ'",
                    },
                },
                "required": ["start_datetime", "end_datetime"],
            },
        }
    }
]


async def chatbot(system, user, email):
    messages = []
    global chat_message

    # Add each new message to the list
    messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": user})
    try:

        # Request gpt-4 for chat completion
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=messages
        )

        # Print the response and add it to the messages list
        temp = response.choices[0].message.content
        while '[' in temp and ']' in temp:
            start = temp.find('[')
            end = temp.find(']', start)
            if start != -1 and end != -1:
                temp = temp[:start] + temp[end+1:]
            else:
                break
        chat_message[email] = temp
        return chat_message[email]
    except Exception as e:
        print(e)

async def init_message(email, other):
    global job_description, job_title
    with open("info.json", 'r') as file:
        data_des = json.load(file)
        job_title = data_des['job_title']
        job_description = await remove_html_tags(data_des['job_description'])
        candidate_name = data_des['candidate_name']
        
    system_content = f"As a professional AI recruitment assistant from Portal, generate a professional and polite recruitment outreach message for an job description and job title to a candidate, highlighting that candidate's profile is a strong match for the role at the location of the office, and inquiring about her interest in learning more about the opportunity. You should remeber that job description is {job_description}, job title is {job_title} and and candidate's name is {candidate_name}. You should make simply sentences inside 30 words. You don't need to attach subject, your name, or your position on message. If {other} equeal to 'True', you don't need to share greeting words and candidate's name."

    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

# analyze init_answer


async def init_answer(email, input):
    system_content = f"As an intelligence analyst, you must give a one-word answer. If {input} is positive for {chat_message[email]}, respond 'Yes', and if {input} is positive for {chat_message[email]}, respond 'No'. Also, for {chat_message[email]}, if {input} is neither positive nor negative, it responds with 'other'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

# step JD or connect with recruiter


async def JD_recruiter(email, other):
    system_content = f"As a professional AI recruitment assistant from Portal, generates messages asking whether candidates want to see a job description or be interviewed directly by a hiring manager. You must create a simple sentence of 30 words or less. Greetings should not be shared. You should not always attach a subject, your name, or your position."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

# analyze JD_recruiter

async def JD_recruiter_answer(email, input):
    system_content = f"As an information analyzer, you only need to answer one word. If the input content is rleated to a request for a job description of {job_description}, respond with 'Go'. And if the input content is related to a request for a direct interview with the hiring manager, respond with 'Interview'. If the information entered is not related to a job description or interview with a recruiter, respond with 'Other'. The information entered here is {input}."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

# show candidate the JD


async def show_JD(email):
    system_content = f"As a professional AI recruitment assistant from Portal, you should provide job description as following format:'Job description:\n {job_description}', and ask a question as following example: 'Please share how you believe your skill set aligns with the requirements and demands of our company. Job description is {job_description}. you should show the job description without adding or removing any contents. You should not always attach topics, your name, or your position."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res
# analyze show_JD answer


async def show_JD_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. If {input} is positive, respond with 'Yes' and is negative, respond with 'No'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res


# connect candidates with recruiter manager
async def connect_interview(email):
    system_content = f"As a professional AI recruitment assistant from Portal, you should ask if when available the time slot of the candidate to him inside today or tomorrow. You should make simply sentences inside 30 words. You should not always share topics, your name, or your position."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

# analyze connect_interview answer


async def connect_interview_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. If {input} is content meaning the time, respond with 'Time'. If {input} isn't content meaning the time, respond with 'Other'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

# suggest the question that confirm if the candidate fit for this role


async def confirm_screening(email):
    chat_message[email] = "Excellent! I would like to know some experience & Skills required for these Role."
    return chat_message[email]


async def confirm_screening_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. If {input} is related to {job_description}, respond with 'Yes' and is negative, respond with 'No'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

#ask open for this job
async def open_job(email):
    chat_message[email] = "good! And I would like to know if you have a vacancy for this job."
    return chat_message[email]

async def open_job_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. If {input} is positive about {chat_message[email]}, respond with 'Yes' and is negative, respond with 'No'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res
# ask commute for this job

async def commute_job(email):
    system_content = f"As a professional AI recruitment assistant from Portal, you should ask if the candidate can commute and how far does the candidate live from the location of the company. Consider the location of the company from {job_description}. You should make simply sentences inside 30 words. You should not always share topics, your name, or your position."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

async def commute_job_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. If {input} is related to {chat_message[email]} wether it's posive state or is negative one, respond with 'Yes' and is not related, respond with 'No'."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

# screening question

async def screening_question(email):
    system_content = f"As a professional AI recruitment assistant from Portal, You should make 3 screening question based on {job_description}. The questions of experiences and cirtification for {job_description} must be included in screening question. Each screening question should be inside 20 words."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res


async def screening_question_answer(email, input):
    system_content = f"As a information analyzer, you should answer only a word. Answer 'Yes' if {input} is related to {chat_message[email]} and answer 'No' if {input} is related to {chat_message[email]}."
    user_content = f"please analyze {input}"
    res = await chatbot(system_content, user_content, email)
    return res

# suggest motivate question


async def question_motivate(email):
    system_content = f"As a professional AI recruitment assistant from Portal, You've recently met with a candidate who has a notable record of achievements in their current role but has decided to apply for a new position at your company. As part of the interview process, you want to understand what is driving their desire to change jobs and what they are looking for in new opportunities. Generate a message that encourages the candidate to share their motivations and reasons behind this transition. Greetings should not be shared. You should make simply sentences inside 30 words."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

# suggest salary question


async def question_salary(email):
    system_content = f"As a professional AI recruitment assistant from Portal, During a job interview, after discussing the candidate's experience and skills, it is important to address compensation expectations. Compose a professional question that transitions from the prior topic of conversation and inquires about the candidate's salary expectations for the position they are interviewing for. You should make simply sentences inside 30 words."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res

# suggest more question


async def more_question(email):
    chat_message[email] = " Perfect, I appreciate your flexibility. Lastly, as part of our hiring process, there will be a leadership review call. Are you comfortable with that, and do you have any questions or concerns about the upcoming call?"
    return chat_message[email]

# reserve interview


async def reserve_message(email, input):
    system_content = f"As a professional AI recruitment assistant from Portal, you should schedule interview between candidate and recruitment manager based on the time of {input}. You should answer as positive sentence and include the period of timeslots. you should make simply sentences within 20 words. You don't need to share the subject and your name."
    user_content = "Please send the message to candidate"
    res = await chatbot(system_content, user_content, email)
    return res


async def reason_message():
    return ("Could you please list out the reason, why you're not looking out for a change.")
# end


async def end_message():
    return ("Thanks for letting us know, Will keep in touch for future. Have a Great Day.")


async def other_skill_end():
    return ("Sorry but, your skills aren't fit for our role. Thanks for your interest.")

async def calendar_show():
    global utc_now
    # Open the database connection
    conn = sqlite3.connect('mydb.sqlite')
    cursor = conn.cursor()

    # Get busy times from the database
    cursor.execute('SELECT start_time, end_time FROM resume')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    # Prepare the datetime format
    datetime_format = "%Y-%m-%dT%H:%M:%SZ"

    # Convert to datetime objects in UTC
    busy_events = [dict(start_time=datetime.strptime(row[0], datetime_format).replace(tzinfo=timezone.utc),
                        end_time=datetime.strptime(row[1], datetime_format).replace(tzinfo=timezone.utc)) if row[0] and row[1] else dict(start_time=None, end_time=None) for row in rows]

    # Get the next hour without minutes or seconds for today's date in UTC
    start_of_next_hour = (utc_now + timedelta(hours=1)
                          ).replace(minute=0, second=0, microsecond=0)

    # Calculate end of the day in UTC
    end_of_day_utc = (utc_now + timedelta(hours=23 - utc_now.hour,
                  minutes=59 - utc_now.minute, seconds=59 - utc_now.second))

    # Initialize available_slots list
    available_slots = []
    current_time = start_of_next_hour

    # Find available slots considering busy_events
    while len(available_slots) < 3 and current_time <= end_of_day_utc:
        slot_end_time = current_time + timedelta(minutes=30)
        slot_busy = False
        for event in busy_events:
            start, end = event['start_time'], event['end_time']
            # Check only if both start and end times are available
            if start is not None and end is not None:
                if start <= current_time and end >= slot_end_time:
                    slot_busy = True
                    break  # No need to check other events if this slot is busy

        if not slot_busy:
            available_slots.append((current_time, slot_end_time))

        current_time += timedelta(minutes=30)

    content = ""
    for slot in available_slots:
        content += f"{slot[0]} - {slot[1]}\n"

    messages = []
    messages.append(
        {"role": "system", "content": f"As a professional AI assistant, you should speak polite and kind. you should ask shortly inside 20 words include timeslot. You should display the list and timezone of timeslot. You must consider {utc_now}. You don't need to share the subject and your name."})
    messages.append(
        {"role": "user", "content": f"please make the message that ask to candidate available interview time based on {content}."})

    response = openai_client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=messages
    )

    # Build the response with available slots
    res = f"To proceed with your application, could you please let us know your availability for an interview from the following slots (all times are in UTC): \n{response.choices[0].message.content}"
    return res

async def calendar_book(bot_msg, candidate_msg, email):
    global utc_now
    messages = []
    messages.append(
        {"role": "system", "content": f"Please answer which time slot is selected by user with {utc_now}. You should only answer asutc_nownd time. And you should answer with period of timeslot exactly. {bot_msg} include the {utc_now}."})
    messages.append(
        {"role": "user", "content": f"{bot_msg}\nUser's response: {candidate_msg}"})

    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        messages=messages,
    )
    set_time = response.choices[0].message.content

    messages = []
    messages.append(
        {"role": "system", "content": "Please answer which time slot is selected by user. If user didn't select time slot, you have to answer as None"})
    messages.append({"role": "user", "content": set_time})

    response = openai_client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=messages,
        tools=calendar_tools,
    )

    try:
        function_time = response.choices[0].message.tool_calls[0].function.arguments
        start_time = function_time.split("\"")[3]
        end_time = function_time.split("\"")[7]
        # Connect to the database
        conn = sqlite3.connect('mydb.sqlite')
        cur = conn.cursor()

        cur.execute('SELECT * FROM resume WHERE email = ?', (email, ))
        row = cur.fetchone()
        
        if row != None:
            cur.execute(
                "UPDATE resume SET start_time = ?, end_time = ? WHERE email = ?", (start_time, end_time, email))
            conn.commit()
            cur.close()
            conn.close()
        else:
            print("Error")
        interviewTime = f"{start_time} + {end_time}"
        return interviewTime
    except:
        return "None"
