from googleapiclient.discovery import build
from google.oauth2 import service_account
import sqlite3

conn = sqlite3.connect('mydb.sqlite')

cur = conn.cursor()

cur.execute("CREATE TABLE resume (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT, mobile TEXT, status TEXT, filename TEXT, mail TEXT DEFAULT passive , sms TEXT DEFAULT passive, wp TEXT DEFAULT passive)")

conn.commit()

cur.close()
conn.close()