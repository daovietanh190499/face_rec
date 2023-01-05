import requests
import cv2
import base64

image = cv2.imread("test1.jpg")

retval, buffer = cv2.imencode('.jpg', image)
jpg_as_text = base64.b64encode(buffer)

res = requests.post("http://localhost:5052/facerec", \
                    json={"img": "data:image/jpeg;base64," + str(jpg_as_text)[2:-1], "secret_key": "7bdfba81-5736-4f00-b984-e15dfe75a01e"})
print(res.json())