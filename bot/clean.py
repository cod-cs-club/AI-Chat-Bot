import sqlite3
conn = sqlite3.connect('documents.db')
cursor = conn.cursor()

# Execute a SELECT query to retrieve all rows from the table
cursor.execute('SELECT * FROM documents')
rows = cursor.fetchall()

# List of strings to check against
string_list = [
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    "00665600",
    "cod.edu/field",
    "/pdf/financial-reports/",
    "https://catalog.cod.edu/pdf/College-of-DuPage-2023-2024-Academic-Catalog-(pre-Spring-2024-Addendum).pdf",
    "planning_and_reporting_documents/pdf/financial-reports/",
    "/campus-departments/facilities-department/facilities-master-plan/",
    "/conference-event-services/",
    "/campus-services/",
    "stories/faculty",
    "academics/learning_commons/mathematics-assistance",
    "stories/students",
    "javascript:",
    "archive",
    "tel:",
    "mailto:",
    "/#",
    "cod.edu/calendar",
    "/faculty/index",
    "/about/police_department/pdf/incident_reports/",
    "/about/administration/planning_and_reporting_documents/pdf/disbursements",
    "/student_life/resources/counseling/pdf/student_planning/student-planning",
    "/faculty/websites/pearson/documents/student-portfolios/",
    "/about/purchasing"
  ]
# Iterate through the results
for row in rows:
    # Check if the first element of the row contains any string from the list
    if any(substring in row[0] for substring in string_list):
        # Delete the entire row
        cursor.execute('DELETE FROM documents WHERE url = ?', (row[0],))
        print("Match found and deleted:", row[0])

conn.commit()
conn.close()
