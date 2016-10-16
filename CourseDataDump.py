#!/usr/bin/python
from uwaterlooapi import UWaterlooAPI
import MySQLdb

# UW API setup
uw = UWaterlooAPI(api_key="013cadb105a7dc1943443cb5ebf7edde")

# Open database connection
db = MySQLdb.connect("localhost","SE464","SE464project","classroomfinder" )
try:
	cursorTruncate = db.cursor()
	cursorTruncate.execute("TRUNCATE TABLE classroomfinder.courses")
	cursor = db.cursor()
	cursor.execute("SELECT * FROM classroomfinder.building_rooms")
	result = cursor.fetchall()
	for row in result:
		print "processing room..."
		building = row[0]
		room = row[1]
		try:
			UWresult = uw.course_by_building_room(building, room)
			for c in UWresult:
				sub = c['subject']
				catalog_number = c['catalog_number']
				title = c['title']
				weekdays = c['weekdays']
				start_time = c['start_time']
				end_time = c['end_time']
				cursorInsert = db.cursor();
				cursorInsert.execute('''INSERT INTO classroomfinder.courses VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''', (sub, catalog_number, title, weekdays, start_time, end_time, building, room))
				cursorInsert.execute('COMMIT')
				print "inserted class..."
		except:
			"Error: unable to create data"
except:
	print "Error: unable to read data"

# disconnect from server
db.close()