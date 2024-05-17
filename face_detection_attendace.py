import cv2
import numpy as np
import os
from datetime import datetime
import face_recognition
import urllib.request
import base64
import requests
import http.client

# Paths and URLs
path = r'D:/ATTENDANCE/image_folder'
url = 'http://192.168.7.58/cam-hi.jpg'
arduino_url = "http://192.168.7.58/signal"  # Replace with your Arduino's IP address and endpoint
attendance_api_url = 'http://localhost:8080/upload'  # Your attendance API endpoint

# Load class names
classNames = os.listdir(path)

# Function to find face encodings
def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        face_encodings = face_recognition.face_encodings(img)
        if face_encodings:  # Check if the list is not empty
            encode = face_encodings[0]  # Get the first encoding
            encodeList.append(encode)
    return encodeList

# Function to mark attendance
def markAttendance(name, img, is_intruder=False):
    now = datetime.now()
    dtString = now.strftime('%Y-%m-%d_%H:%M:%S')
    
    _, img_encoded = cv2.imencode('.jpg', img)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    if is_intruder:
        attendance_data = {'name': 'intruder', 'time': dtString, 'image': img_base64, 'filename': 'intruder.jpg'}
        print("Intruder detected. Attendance marked as intruder.")
    else:
        attendance_data = {'name': name, 'time': dtString, 'image': img_base64, 'filename': f'{name}_{dtString}.jpg'}
        print(f"Attendance marked for {name}")

    response = requests.post(attendance_api_url, json=attendance_data)

    if response.status_code != 200:
        print("Failed to mark attendance.")

# Function to send signal to Arduino
def send_signal_to_arduino(signal, value):
    try:
        response = requests.post(arduino_url, data=str(value))  # Convert value to string
        if response.status_code == 200:
            print("Signal sent to Arduino successfully.")
        else:
            print("Failed to send signal to Arduino.")
    except requests.exceptions.RequestException as e:
        print("Error sending signal to Arduino:", e)


images = [cv2.imread(os.path.join(path, cl)) for cl in classNames]
encodeListKnown = findEncodings(images)
print('Encoding Complete')

# Main loop
while True:
    try:
        img_resp = urllib.request.urlopen(url)
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        img = cv2.imdecode(imgnp, -1)
        imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
        imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

        facesCurFrame = face_recognition.face_locations(imgS)
        encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

        for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
            if not encodesCurFrame:  
                continue  

            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)

            if True in matches:  
                # Process recognized person
                matchIndex = np.argmin(faceDis)
                if matchIndex < len(classNames):  
                    name = classNames[matchIndex].upper().replace(".JFIF", "")
                    y1, x2, y2, x1 = faceLoc
                    y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
                    cv2.putText(img, name, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)
                    markAttendance(name, img)
                    send_signal_to_arduino("Face Recognized: " + name, 0) 
            else:
                # Process intruder
                y1, x2, y2, x1 = faceLoc
                y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 0, 255), cv2.FILLED)
                cv2.putText(img, "Intruder!", (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)
                markAttendance(None, img, is_intruder=True)
                send_signal_to_arduino(arduino_url, 1) 

        # Display the frame
        cv2.imshow('Frame', img)

        key = cv2.waitKey(1)
        if key == ord('q'):
            break
    except (http.client.IncompleteRead, urllib.error.URLError):
        print("Error reading image data")
    except Exception as e:
        print("An error occurred:", e)

cv2.destroyAllWindows()
