import requests
import cv2
import base64

image = cv2.imread("C:\\Users\\X270\\Downloads\\images\\002.jpg")

retval, buffer = cv2.imencode('.jpg', image)
jpg_as_text = base64.b64encode(buffer)

res = requests.post("http://192.168.0.110:5000/facerec", json={"img": "data:image/jpeg;base64," + str(jpg_as_text)[2:-1], "secret_key": "3878c00b-3780-4c44-bc42-b09f0586ee75"})
print(res.json())