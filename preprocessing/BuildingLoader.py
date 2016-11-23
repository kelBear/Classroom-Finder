__author__ = 'shrenilpatel'
import json
import psycopg2
import urlparse
import subprocess
import os
import re
import sys
import datetime


files = [f for f in os.listdir('.') if re.search(r'\w+_F\d+.json', f)]

try:
    urlparse.uses_netloc.append("postgres")
    proc = subprocess.Popen(["heroku pg:credentials " + sys.argv[1] + " -a classroom-finder"], stdout=subprocess.PIPE,
                            shell=True)
    (constring, err) = proc.communicate()
    print constring

    s = constring.split('"')[1]
    s = constring.split('"')[1]

    ls = s.split(" ")
    dbs = ls[0].split("=")[1]
    usr = ls[3].split("=")[1]
    pw = ls[4].split("=")[1]
    hst = ls[1].split("=")[1]
    prt = ls[2].split("=")[1]
    print dbs

    db = psycopg2.connect(
        database=dbs,
        user=usr,
        password=pw,
        host=hst,
        port=prt
    )
    print db


    #cursorDelete = db.cursor()
    #cursorDelete.execute('''DELETE FROM building_rooms''')
    #cursorDelete.execute('COMMIT')

    starttime = datetime.datetime.now()

    cursorInsert = db.cursor()

    for file in files:

        with open(file) as data_file:
            data = json.load(data_file)

            for datum in data["features"]:
                coords = datum["geometry"]["coordinates"][0]
                prop = datum["properties"]

                B = prop['building']
                R = prop['room']

                latTot = 0
                longTot = 0
                Tot = 0
                for i in coords:
                    longTot += i[0]
                    latTot += i[1]
                    Tot += 1

                lat = latTot/Tot
                long = longTot/Tot
                print B, R, lat, long
                try:

                    cursorInsert.execute('''INSERT INTO building_rooms VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                                         (B, R, lat, long, coords, int(str(R)[0]), datetime.datetime.now()))

                except:
                    print "error inserting"

    print datetime.datetime.time(datetime.datetime.now())
    cursorInsert.execute('COMMIT')
    print datetime.datetime.time(datetime.datetime.now())

    cursorDeleteDupes = db.cursor()
    cursorDeleteDupes.execute('''DELETE FROM courses WHERE create_date < \'''' + starttime.strftime('%Y-%m-%d %H:%M:%S') + '\'')
    cursorDeleteDupes.execute('''DELETE FROM building_rooms WHERE ctid NOT IN (SELECT min(ctid) FROM building_rooms GROUP BY room, building, lat, lng)''');
    cursorDeleteDupes.execute('COMMIT')
    print datetime.datetime.time(datetime.datetime.now())

    db.close()

except:
    print "error"

#db.close()