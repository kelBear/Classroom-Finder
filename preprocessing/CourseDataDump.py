#!/usr/bin/python
from uwaterlooapi import UWaterlooAPI
import urlparse
import psycopg2
import subprocess
import datetime
import sys

# import MySQLdb

# UW API setup
uw = UWaterlooAPI(api_key="013cadb105a7dc1943443cb5ebf7edde")

# Open database connection
# db = MySQLdb.connect("localhost","SE464","SE464project","classroomfinder" )
try:
    urlparse.uses_netloc.append("postgres")

    try:
        proc = subprocess.Popen(["heroku pg:credentials " + sys.argv[1] + " -a classroom-finder"], stdout=subprocess.PIPE,
                            shell=True)
        (constring, err) = proc.communicate()
    except:
        proc = subprocess.Popen(["heroku", "pg:credentials", sys.argv[1], "-a", "classroom-finder"], stdout=subprocess.PIPE,
                            shell=True)
        (constring, err) = proc.communicate()

    print constring
    print "   "

    s = constring.split('"')[1]
    print s
    ls = s.split(" ")
    dbs = ls[0].split("=")[1]
    usr = ls[3].split("=")[1]
    pw = ls[4].split("=")[1]
    hst = ls[1].split("=")[1]
    prt = ls[2].split("=")[1]

    db = psycopg2.connect(
        database=dbs,
        user=usr,
        password=pw,
        host=hst,
        port=prt
    )
    # urlparse.uses_netloc.append("postgres")
    # url = urlparse.urlparse(os.environ["DATABASE_URL"])
    # db = psycopg2.connect(
    #     database=url.path[1:],
    #     user=url.username,
    #     password=url.password,
    #     host=url.hostname,
    #     port=url.port
    # )

    starttime = datetime.datetime.now()

    cursor = db.cursor()
    cursor.execute("SELECT building, room FROM building_rooms")

    cursorInsert = db.cursor()

    result = cursor.fetchall()
    for row in result:
        print "processing room..." + row[0] + " " + row[1]
        building = row[0]
        room = row[1]
        try:
            UWresult = uw.course_by_building_room(building, room)
            for c in UWresult:
                sub = c['subject']
                catalog_number = c['catalog_number']
                title = c['title']
                weekdays = c['weekdays']
                i=0
                m = "false"
                t = "false"
                w = "false"
                th = "false"
                f = "false"
                s = "false"
                sun = "false"

                while i<len(weekdays):
                    if weekdays[i]=='M':
                        m="true"
                    elif weekdays[i]=='T':
                        if i+1<len(weekdays):
                            if weekdays[i+1]=='h':
                                th="true"
                                i=i+1
                            else:
                                t="true"
                        else:
                            t="true"
                    elif weekdays[i] == 'W':
                        w = "true"
                    elif weekdays[i]=='F':
                        f = "true"
                    i=i+1
                start_time = c['start_time']
                end_time = c['end_time']

                cursorInsert.execute('''INSERT INTO courses VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                                     (sub, catalog_number, title, m, t, w, th, f, s, sun, start_time, end_time, building, room, datetime.datetime.now()))

                print "inserted class..."
        except:
            "Error: unable to create data"


    print datetime.datetime.time(datetime.datetime.now())
    cursorInsert.execute('COMMIT')

    print datetime.datetime.time(datetime.datetime.now())

    cursorDeleteDupes = db.cursor()
    cursorDeleteDupes.execute('''DELETE FROM courses WHERE create_date < \'''' + starttime.strftime('%Y-%m-%d %H:%M:%S') + '\'')
    cursorDeleteDupes.execute('''DELETE FROM courses WHERE ctid NOT IN (SELECT min(ctid) FROM courses GROUP BY subject, title, catalog_number, start_time, end_time, room, building)''');
    cursorDeleteDupes.execute('COMMIT')
    print datetime.datetime.time(datetime.datetime.now())

    db.close()
except:
    print "Unexpected error:", sys.exc_info()[0]
    print "Error: unable to read data"

# disconnect from server

