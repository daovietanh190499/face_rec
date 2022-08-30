# [Face Recognition VKIST](http://123.16.55.212:85/) 

 [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&logo=twitter)](https://twitter.com/daovietanh99)
 ![version](https://img.shields.io/badge/version-1.0.1-blue.svg) 
 
 ## Quick start

> UNZIP the sources or clone the private repository. After getting the code, open a terminal and navigate to the working directory, with product source code.

```bash
$ # Get the code
$ git clone https://github.com/daovietanh190499/face_rec.git
$ cd face-rec
$
$ # Virtualenv modules installation (Unix based systems)
$ virtualenv env
$ source env/bin/activate
$
$ # Virtualenv modules installation (Windows based systems)
$ virtualenv env
$ .\env\Scripts\activate
$
$ # Install modules
$ pip3 install -r requirements.txt
$
$ # Start the application (development mode)
$ python3 app.py
$
$ # Access the dashboard in browser: http://127.0.0.1:5051/
```

> Note: To use the app, please access the registration page and create a new user. After authentication, the app will unlock the private pages.


## File Structure
Within the download you'll find the following directories and files:

```bash
< PROJECT ROOT >
   |
   |-- apps/
   |    |
   |    |-- detect_RFB_640/                
   |    |    |-- version-RFB-640.pth                  # Weight of face detection model
   |    |    |-- voc-model-labels.txt                 # Labels of face detection model 
   |    |
   |    |-- ms1mv3_arcface_r50_fp16/       
   |    |    |-- backbone_ir50_ms1m_epoch120.pth      # Weight of arcface model
   |    |
   |    |-- vision/
   |    |    |-- <models code>                        # Models code of face detection
   |    |
   |    |-- backbone.py                               # Models code of arcface
   |    |
   |    __init__.py                                   # Initialize the app
   |
   |-- static/
   |    |-- <css, JS, images>                         # CSS files, Javascripts files
   |
   |-- templates/                   
   |    |-- index.html                                # main HTML chunks and components
   |
   |-- requirements.txt                               # Development modules
   |-- create_app.py                                  # Create Database, Configure the app
   |-- app.py                                         # Start the app - WSGI gateway - SocketIO gateway
   |
   |-- ************************************************************************
```
