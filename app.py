import os
from sqlite3 import Time, Timestamp
import numpy as np
import cv2
from PIL import Image
from numpy import dot, sqrt
import re

from functools import wraps

from aiohttp import web
from aiohttp import client
import aiohttp
import asyncio

import threading
import argparse
import datetime

import torch
import torch.utils.data as data
import torchvision.datasets as datasets
import torch.nn.functional as F
import torchvision.transforms as transforms

import hnswlib

import jinja2
import aiohttp_jinja2
import traceback

from app.backbone import Backbone
from app.vision.ssd.config.fd_config import define_img_size
from app.vision.ssd.mb_tiny_RFB_fd import create_Mb_Tiny_RFB_fd, create_Mb_Tiny_RFB_fd_predictor

from sqlalchemy import func, delete
from sqlalchemy.sql import text
from sqlalchemy.orm import aliased
from create_app import db_session, engine, Base, DefineImages, People, Timeline, Users, ChildrenPicker, PeopleClasses, Classes, PickUp, verify_pass

from pubsub import pub

import base64
import requests
import uuid

app = web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader('templates'))

device = 'cuda' if torch.cuda.is_available() else 'cpu'

class_names = [name.strip() for name in open('app/detect_RFB_640/voc-model-labels.txt').readlines()]
candidate_size = 1000
threshold = 0.7
input_img_size = 640
define_img_size(input_img_size)
model_path = "app/detect_RFB_640/version-RFB-640.pth"
net = create_Mb_Tiny_RFB_fd(len(class_names), is_test=True, device=device)
predictor = create_Mb_Tiny_RFB_fd_predictor(net, candidate_size=candidate_size, device=device)
net.load(model_path)

input_size=[112, 112]
transform = transforms.Compose(
        [
            transforms.Resize(
                [int(128 * input_size[0] / 112), int(128 * input_size[0] / 112)],
            ),  # smaller side resized
            transforms.CenterCrop([input_size[0], input_size[1]]),
            # transforms.Resize([input_size[0], input_size[1]]),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ],
)

backbone = Backbone(input_size)
backbone.load_state_dict(torch.load('app/ms1mv3_arcface_r50_fp16/backbone_ir50_ms1m_epoch120.pth', map_location=torch.device("cpu")))
backbone.to(device)
backbone.eval()

def cosine_similarity(x, y):
    return dot(x, y) / (sqrt(dot(x, x)) * sqrt(dot(y, y)))

def no_accent_vietnamese(utf8_str):
    INTAB = "ạảãàáâậầấẩẫăắằặẳẵóòọõỏôộổỗồốơờớợởỡéèẻẹẽêếềệểễúùụủũưựữửừứíìịỉĩýỳỷỵỹđẠẢÃÀÁÂẬẦẤẨẪĂẮẰẶẲẴÓÒỌÕỎÔỘỔỖỒỐƠỜỚỢỞỠÉÈẺẸẼÊẾỀỆỂỄÚÙỤỦŨƯỰỮỬỪỨÍÌỊỈĨÝỲỶỴỸĐ"
    OUTTAB = "a" * 17 + "o" * 17 + "e" * 11 + "u" * 11 + "i" * 5 + "y" * 5 + "d" + \
            "A" * 17 + "O" * 17 + "E" * 11 + "U" * 11 + "I" * 5 + "Y" * 5 + "D"
    r = re.compile("|".join(INTAB))
    replaces_dict = dict(zip(INTAB, OUTTAB))
    return r.sub(lambda m: replaces_dict[m.group(0)], utf8_str)

def loadBase64Img(uri):
    encoded_data = uri.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def load_image(img):
	exact_image = False; base64_img = False; url_img = False

	if type(img).__module__ == np.__name__:
		exact_image = True

	elif len(img) > 11 and img[0:11] == "data:image/":
		base64_img = True

	elif len(img) > 11 and img.startswith("http"):
		url_img = True

	#---------------------------

	if base64_img == True:
		img = loadBase64Img(img)

	elif url_img:
		img = np.array(Image.open(requests.get(img, stream=True).raw))

	elif exact_image != True: #image path passed as input
		if os.path.isfile(img) != True:
			raise ValueError("Confirm that ",img," exists")

		img = cv2.imread(img)

	return img

class LoginApp():
    def __init__(self):
        pass

    def login_required(self, f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = None
            try:
                access_key = args[0].cookies['user_access_key']
            except:
                access_key = None
            if not access_key:
                user = None
            else:
                user = Users.query.filter_by(access_key=access_key).first()
                if user:
                    user = user.__dict__
            return f(*((user,) + args), **kwargs)
        return decorated
        
    def login_user(self, user, request):
        access_key = uuid.uuid4()
        user.access_key = str(access_key)
        db_session.commit()
        location = request.app.router['index'].url_for()
        response = web.HTTPSeeOther(location=location)
        response.cookies['user_access_key'] = user.access_key
        return response

    def logout_user(self, request):
        location = request.app.router['index'].url_for()
        response = web.HTTPSeeOther(location=location)
        response.cookies['user_access_key'] = ''
        return response

login_app = LoginApp()

def create_error_middleware(overrides):
    @web.middleware
    async def error_middleware(request, handler):
        try:
            Base.metadata.create_all(bind=engine)
            resp = await handler(request)
            db_session.remove()
            return resp
        except web.HTTPException as ex:
            override = overrides.get(ex.status)
            if override:
                resp = await override(request, ex)
                resp.set_status(ex.status)
                return resp

            raise
        except Exception as e:
            print(traceback.format_exc())
            resp = await overrides[500](request, web.HTTPError(text=traceback.format_exc()))
            resp.set_status(500)
            return resp

    return error_middleware

def handle_403(request, ex):
    location = request.app.router['index'].url_for()
    raise web.HTTPFound(location=location)

def handle_404(request, ex):
    location = request.app.router['index'].url_for()
    raise web.HTTPFound(location=location)


def handle_500(request, ex):
    location = request.app.router['index'].url_for()
    raise web.HTTPFound(location=location)

def setup_middlewares(app):
    error_middleware = create_error_middleware({
        403: handle_403,
        404: handle_404,
        500: handle_500,
    })
    app.middlewares.append(error_middleware)

setup_middlewares(app)

@aiohttp_jinja2.template('index.html') 
@login_app.login_required
async def index(current_user, request):

    data = await request.post()
    
    if 'login' in data and request.method == 'POST':
        # read form data
        username = data.get('username')
        password = data.get('password')
        # Locate user
        user = Users.query.filter_by(username=username).first()
        # Check the password
        if user and verify_pass(password, user.password):
            return login_app.login_user(user, request)
        
        location = request.app.router['index'].url_for()
        raise web.HTTPFound(location=location)

    
    if 'register' in data and request.method == 'POST':
        username = data.get('username')
        password = data.get('password')

        if username.strip() == "" or password.strip() == "":
            location = request.app.router['index'].url_for()
            raise web.HTTPFound(location=location)

        # Check usename exists
        user = Users.query.filter_by(username=username).first()
        if user:
            location = request.app.router['index'].url_for()
            raise web.HTTPFound(location=location)
        # else we can create the user
        user = Users(username=username, password=password, secret_key="")
        db_session.add(user)
        db_session.commit()

        p = hnswlib.Index(space = 'cosine', dim = 512)
        p.init_index(max_elements = 1000, ef_construction = 200, M = 16)
        p.set_ef(10)
        p.set_num_threads(4)
        p.save_index("indexes/index_" + str(user.secret_key) + ".bin")

        return login_app.login_user(user, request)
    
    if not current_user:
        return {'is_login': False, 'current_user': None}
    print("authorized")
    return {'is_login': True, 'current_user': current_user}

@aiohttp_jinja2.template('client.html') 
@login_app.login_required
async def client_a(current_user, request):
    return {'current_user':current_user}
    

async def logout(request):
    login_app.logout_user()
    location = request.app.router['index'].url_for()
    raise web.HTTPFound(location=location)

def get_embeddings(img_input, local_register = False):
    # img = []
    img = load_image(img_input)
    image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    if not local_register:
        boxes, labels, probs = predictor.predict(image, candidate_size / 2, threshold)
        boxes = boxes.detach().cpu().numpy()
    else:
        boxes = np.array([[0, 0, image.shape[1], image.shape[0]]])

    feats = []
    images = []
    bboxes = []
    for i in range(boxes.shape[0]):
        box = boxes[i, :]
        xmin, ymin, xmax, ymax = box
        xmin -= (xmax-xmin)/18
        xmax += (xmax-xmin)/18
        ymin -= (ymax-ymin)/18
        ymax += (ymax-ymin)/18
        xmin = 0 if xmin < 0 else xmin
        ymin = 0 if ymin < 0 else ymin
        xmax = image.shape[1] if xmax >= image.shape[1] else xmax
        ymax = image.shape[0] if ymax >= image.shape[0] else ymax
        boxes[i,:] = [xmin, ymin, xmax, ymax]
        infer_img = image[int(ymin): int(ymax), int(xmin): int(xmax), :]
        if infer_img is not None and infer_img.shape[0] != 0 and infer_img.shape[1] != 0:
            with torch.no_grad():
                feat = F.normalize(backbone(transform(Image.fromarray(infer_img)).unsqueeze(0).to(device))).cpu()
            feats.append(feat.detach().cpu().numpy())
            images.append(infer_img.copy())
            bboxes.append("{} {} {} {}".format(xmin, ymin, xmax, ymax))
    return feats, images, bboxes


async def facerec(request):
    req = await request.json()

    if 'secret_key' not in req:
        return  web.json_response({"result": {'message': 'Vui lòng truyền secret key'}}, status=400)

    user = Users.query.filter_by(secret_key=req['secret_key']).first()
    
    if not user:
        return  web.json_response({"result": {'message': 'Secret key không hợp lệ'}}, status=403)

    img_input = ""
    if "img" in list(req.keys()):
        img_input = req["img"]

    validate_img = False
    if len(img_input) > 11 and img_input[0:11] == "data:image/":
        validate_img = True

    if validate_img != True:
        return  web.json_response({"result": {'message': 'Vui lòng truyền ảnh dưới dạng Base64'}}, status=400)
    
    feats, images, bboxes = get_embeddings(img_input)
    
    generated_face_ids = []
    profile_face_ids = []


    p = hnswlib.Index(space = 'cosine', dim = 512)
    p.load_index("indexes/index_" + str(user.secret_key) + '.bin')
    person_access_keys = []
    identities = []
    timelines = []
    now = 0
    for feat, image in zip(feats, images):
        person_access_key = -1
        try:
            neighbors, distances = p.knn_query(feat, k=1)
            if distances[0][0] <= 0.45:
                person_access_key = db_session.query(DefineImages.person_access_key, func.count(DefineImages.person_access_key).label('total'))\
                            .filter(DefineImages.id.in_(neighbors.tolist()[0]))\
                            .filter(DefineImages.person_access_key==People.access_key)\
                            .filter(People.user_id==user.id)\
                            .group_by(DefineImages.person_access_key)\
                            .order_by(text('total DESC')).first().person_access_key
        except:
            person_access_key = -1
        
        person = People.query.filter_by(access_key=person_access_key).first()
        identities.append('Người lạ' if not person else person.name)
        person_access_keys.append(person_access_key)

        profile_image_id = DefineImages.query.filter_by(person_access_key=person_access_key).first()
        # profile_image = cv2.imread("images/" + req['secret_key'] + '/' + profile_image_id.image_id + ".jpg")
        profile_face_ids.append(profile_image_id.image_id if profile_image_id is not None else None)
        generated_face_ids.append(None)

        now = round(datetime.datetime.now().timestamp() * 1000)
        extra = str(uuid.uuid4())
        if not os.path.isdir("images/" + req['secret_key'] ):
            os.mkdir("images/" + req['secret_key'] )
        cv2.imwrite("images/" + req['secret_key'] + "/face_" + str(now) + '_' + extra + ".jpg", cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        image = Timeline(user_id=user.id, person_access_key=person_access_key, image_id="face_" + str(now) + '_' + extra, embedding=np.array2string(feat, separator=','), timestamp=now)
        db_session.add(image)
        db_session.commit()
        
        timelines.append(now)

        pub.sendMessage('face_vkist', uid=req['secret_key'], message='facerec ' + str(now))
    
    return  web.json_response({'result': {"bboxes": bboxes, "identities": identities, "id": person_access_keys, "timelines": timelines, "profilefaceIDs": profile_face_ids, "3DFace": generated_face_ids}}, status=200)


def validate_request(req, keys, values):
    for key in keys:
        if not key in req:
            req[key] = values[key]
    return req
            

async def facereg(request):
    req = request.get_json()
    if 'secret_key' not in req:
        return  web.json_response({"result": {'message': 'Vui lòng truyền secret key'}}, status=400)

    user = Users.query.filter_by(secret_key=req['secret_key']).first()
    
    if not user:
        return  web.json_response({"result": {'message': 'Secret key không hợp lệ'}}, status=400)
    
    feats, images, boxes = ([], [], [])

    if "img" in list(req.keys()):
        for img_input in req["img"]:
            if not (len(img_input) > 11 and img_input[0:11] == "data:image/"):
                return  web.json_response({"result": {'message': 'Vui lòng truyền ảnh dưới dạng Base64'}}, status=400)
            if 'local_register' in list(req.keys()):
                feats_, images_, boxes_ = get_embeddings(img_input, True)
            else:
                feats_, images_, boxes_ = get_embeddings(img_input)
            feats += feats_
            images += images_
            boxes += boxes_
    if len(boxes) < 1 and 'access_key' not in req:
        return  web.json_response({"result": {'message': 'Không xác định khuôn mặt'}}, status=400)

    if 'access_key' not in req or req['access_key']=="":
        if 'img' not in req or 'type_role' not in req or 'name' not in req:
            return  web.json_response({"result": {'message': 'Vui lòng tryền đầy đủ dữ liệu'}}, status=400)
        access_key = str(uuid.uuid4())
        # NVB 13-1-2023
        req = validate_request(req, ['name', 'age', 'type_role', 'class_access_key', 'gender', 'phone'], {'name': None, 'age': None, 'type_role': None, 'class_access_key': None, 'gender': None, 'phone': None})
        person = People(user_id=user.id, name=req['name'], age=req['age'], type_role=req['type_role'], gender=req['gender'], phone=req['phone'], access_key=access_key)
        db_session.add(person)
        db_session.commit()

        pc = PeopleClasses.query.filter_by(person_access_key=person.access_key).first()
        if not pc:
            if not req['class_access_key'] is None and req['type_role'] != 'parent':
                pc = PeopleClasses(class_access_key = req['class_access_key'], person_access_key = person.access_key)
                db_session.add(pc)
                db_session.commit()
            
    else:
        access_key = req['access_key']
        person = People.query.filter_by(access_key=access_key, user_id=user.id).first()  
        # req = validate_request(req, ['name', 'age', 'type_role', 'gender', 'phone'], person._asdict())
        req = validate_request(req, ['name', 'age', 'type_role', 'gender', 'phone'], person.__dict__)
        person.name=req['name']
        person.age=req['age']
        person.type_role=req['type_role']
        person.gender=req['gender']
        person.phone=req['phone']
        db_session.commit()

        
        pc = PeopleClasses.query.filter_by(person_access_key=person.access_key).first()
        if not pc:
            if not req['class_access_key'] is None and req['type_role'] != 'parent':
                pc = PeopleClasses(class_access_key = req['class_access_key'], person_access_key = person.access_key)
                db_session.add(pc)
                db_session.commit()
        else:
            pc.class_access_key = req['class_access_key']
            db_session.commit()
    
    person = People.query.filter_by(access_key=access_key).first()
    
    if 'applicant_access_keys' in req and not req['applicant_access_keys'] is None and  req['type_role'] !="teacher":
        for ak in req['applicant_access_keys']:
            if req['type_role'] == 'student':
                parent = People.query.filter_by(access_key=ak, type_role="parent", user_id=user.id).first() 
                if parent:
                    pc = ChildrenPicker.query.filter_by(child_access_key=person.access_key, picker_access_key=parent.id).first()
                    if not pc:
                        pc = ChildrenPicker(child_access_key=person.access_key, picker_access_key=parent.id)
                        db_session.add(pc)
                        db_session.commit()
            else:
                child = People.query.filter_by(access_key=ak, type_role="student", user_id=user.id).first()  
                pc = ChildrenPicker.query.filter_by(child_access_key=child.id, picker_access_key=person.access_key).first()
                if child:
                    if not pc:
                        pc = ChildrenPicker(child_access_key=child.id, picker_access_key=person.access_key)
                        db_session.add(pc)
                        db_session.commit()
    
    p = hnswlib.Index(space = 'cosine', dim = 512)
    p.load_index("indexes/index_" + str(user.secret_key) + '.bin', max_elements=1000)
    
    now = 0
    for feat, image in zip(feats, images):
        now = round(datetime.datetime.now().timestamp() * 1000)
            
        if not os.path.isdir("images/" + req['secret_key'] ):
            os.mkdir("images/" + req['secret_key'] )
        extra = str(uuid.uuid4())
        cv2.imwrite("images/" + req['secret_key'] + "/face_" + str(now) + '_' + extra + ".jpg", cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        image = Timeline(user_id=user.id, person_access_key=person.access_key, image_id="face_" + str(now)  + '_' + extra, embedding=np.array2string(feat, separator=','), timestamp=now)
        db_session.add(image)
        db_session.commit()

        define_image = DefineImages(person_access_key=person.access_key, image_id=image.image_id)
        db_session.add(define_image)
        db_session.commit()

        define_image = DefineImages.query.filter_by(image_id=image.image_id).first()
        p.add_items(feat, np.array([define_image.id]))
        p.save_index("indexes/index_" + str(user.secret_key) + '.bin')

    now = datetime.datetime.now().timestamp() * 1000
    pub.sendMessage('face_vkist', uid=user.secret_key, message='facereg ' + str(now))

    return  web.json_response({"result": {'message': 'success'}}, status=200)



@login_app.login_required
async def delete_image(current_user, request):
    req = request.get_json()
    if 'access_key' not in req:
        return  web.json_response({"result": {'message': 'Vui lòng truyền access key'}}, status=400)
    
    access_key = req['access_key']
    
    person = People.query.filter_by(access_key=access_key, user_id=current_user.id).first()
    if not person:
        return  web.json_response({"result": {'message': 'Bạn không có quyền xóa'}}, status=403)

    sql1 = delete(DefineImages).where(DefineImages.person_access_key == person.access_key)
    db_session.execute(sql1)
    db_session.commit()
    
    sql2 = delete(ChildrenPicker).where(ChildrenPicker.child_access_key == person.access_key)
    db_session.execute(sql2)
    db_session.commit()
    
    sql3 = delete(ChildrenPicker).where(ChildrenPicker.picker_access_key == person.access_key)
    db_session.execute(sql3)
    db_session.commit()
    
    sql4 = delete(PeopleClasses).where(PeopleClasses.person_access_key == person.access_key)
    db_session.execute(sql4)
    db_session.commit()
    
    sql5 = delete(PickUp).where(PickUp.child_access_key == person.access_key)
    db_session.execute(sql5)
    db_session.commit()
    
    sql6 = delete(PickUp).where(PickUp.picker_access_key == person.access_key)
    db_session.execute(sql6)
    db_session.commit()
    
    db_session.delete(person)
    db_session.commit()

    p = hnswlib.Index(space = 'cosine', dim = 512)
    p.init_index(max_elements = 1000, ef_construction = 200, M = 16)
    p.set_ef(10)
    p.set_num_threads(4)
    print('\n\n\nRebuild hnswlib\n\n\n')
    # Rebuild index
    remainImages = db_session.query(People.id, DefineImages.id, Timeline.embedding) \
                        .filter(People.user_id==current_user.id) \
                        .filter(DefineImages.person_access_key==People.access_key) \
                        .filter(Timeline.image_id==DefineImages.image_id) \
                        .all()
    
    for imageI in remainImages:
        embedding = imageI[2]
        embedding = embedding[2:-2]
        embedding = np.expand_dims(np.fromstring(embedding, dtype='float32', sep=','), axis=0)
        p.add_items(embedding, np.array([imageI[1]]))
    p.save_index("indexes/index_" + str(current_user.secret_key) + ".bin")
    
    return  web.json_response({"result" : {'mesage' : "Ok"}}, status=200)



@login_app.login_required
async def add_class(current_user, request):
    req = request.get_json()
    if 'class_access_key' not in req or req['class_access_key'] == "":
        access_key = str(uuid.uuid4())
        new_class = Classes(name=req['class_name'], user_id=current_user.id, access_key=access_key)
        db_session.add(new_class)
        db_session.commit()
    else:
        new_class = Classes.query.filter_by(access_key=req['class_access_key'], user_id=current_user.id).first()  
        if 'class_name' in req and req['class_name'] != "":
            new_class.name = req['class_name']
            db_session.commit()
    
    if 'teacher_access_keys' in req and not req['teacher_access_keys'] is None:
        for ak in req['teacher_access_keys']:
            person = People.query.filter_by(access_key=ak, user_id=current_user.id, type_role="teacher").first()  
            if person:
                pc = PeopleClasses.query.filter_by(person_access_key=person.access_key).first()
                if not pc:
                    pc = PeopleClasses(class_access_key = new_class.access_key, person_access_key = person.access_key)
                    db_session.add(pc)
                    db_session.commit()
    
    return  web.json_response({"result": {'message': 'success'}}, status=200)



@login_app.login_required
async def delete_class(current_user, request):
    req = request.get_json()
    class_access_key = req['class_access_key']
    target_class = Classes.query.filter_by(access_key=class_access_key, user_id=current_user.id).first()
    if not target_class:
        return  web.json_response({"result": {'message': 'Bạn không có quyền xóa lớp này'}}, status=403)

    db_session.delete(target_class)
    db_session.commit()

    sql1 = delete(PeopleClasses).where(PeopleClasses.class_access_key == class_access_key)
    db_session.execute(sql1)
    db_session.commit()
    return  web.json_response({"result": {'message': 'success'}}, status=200)



async def check_pickup(request):
    req = request.get_json()
    if 'secret_key' not in req:
        return  web.json_response({"result": {'message': 'Vui lòng truyền secret key'}}, status=400)

    user = Users.query.filter_by(secret_key=req['secret_key']).first()
    
    if not user:
        return  web.json_response({"result": {'message': 'Secret key không hợp lệ'}}, status=403)
    
    if 'id1' not in req or 'id2' not in req or 'timeline_id1' not in req or 'timeline_id2' not in req:
        return  web.json_response({"result": {'message': 'Vui lòng tryền đầy đủ dữ liệu'}}, status=400)
    
    person1 = None
    person2 = None
    if int(req['id1']) != -1:
        person1 = People.query.filter_by(access_key=req['id1'], user_id=user.id).first()
        if not person1:
            return  web.json_response({"result": {'message': 'Bạn không có quyền thay đổi'}}, status=403)
    if int(req['id2']) != -1:
        person2 = People.query.filter_by(access_key=req['id2'], user_id=user.id).first()
        if not person2:
            return  web.json_response({"result": {'message': 'Bạn không có quyền thay đổi'}}, status=403)
    
    if not person1 or person1.type_role == "parent" or  person1.type_role == "teacher":
        pk = PickUp(child_access_key=int(req['id2']), picker_access_key=int(req['id1']), child_timeline=int(req['timeline_id2']), parent_timeline=int(req['timeline_id1']))
        db_session.add(pk)
        db_session.commit()
    else:
        pk = PickUp(child_access_key=int(req['id1']), picker_access_key=int(req['id2']), child_timeline=int(req['timeline_id1']), parent_timeline=int(req['timeline_id2']))
        db_session.add(pk)
        db_session.commit()

    return  web.json_response({"result": {'message': 'success'}}, status=200)



@login_app.login_required
async def get_pickup(current_user, request): #them page
    args = request.args.to_dict()
    
    page = request.match_info.get('page','1')

    page = int(page)
    if page <= 0:
        page = 1
    page_size = 10
    
    args = validate_request(args, ['name'], {'name': ''})
    
    People_alias = aliased(People)
    Timeline_alias = aliased(Timeline)
    all_pickups_available = db_session.query(PickUp.id, Timeline.timestamp, People.name, People_alias.name, Timeline.image_id, Timeline_alias.image_id)\
              .filter(Timeline.user_id==current_user.id)\
              .filter(Timeline_alias.user_id==current_user.id)\
              .filter(PickUp.child_access_key==People.access_key)\
              .filter(PickUp.picker_access_key==People_alias.id)\
              .filter(PickUp.child_timeline==Timeline.id)\
              .filter(PickUp.picker_timeline==Timeline_alias.id)\
              .filter(func.lower(People.name).like('%' + args['name'].lower() + '%') | func.lower(People_alias.name).like('%' + args['name'].lower() +'%'))\
              .order_by(Timeline.timestamp.desc())\
              
    all_pickups = all_pickups_available.limit(page_size).offset((page - 1) * page_size).all()
    
    safe_pickups = all_pickups_available.filter(PickUp.child_access_key==ChildrenPicker.child_access_key & PickUp.picker_access_key==ChildrenPicker.picker_access_key).all()
    
    pickup_array = {}
    for u in all_pickups:
        pickup_array[str(u[0])] = {'timestamp': u[1], 'child_name': u[2],  'parent_name': u[3], 'child_image_id': u[4], 'parent_image_id': u[5], 'is_acceptable': False}
    for u in safe_pickups:
        if str(u[0]) in pickup_array:
            pickup_array[str(u[0])]['is_acceptable'] = True
    
    pickup_array_list = [pickup_array[u] for u in pickup_array.keys()]
    number_of_pickup = len(all_pickups_available.all())
    
    return  web.json_response({
        "result": {
            "number_of_pickup": number_of_pickup,
            "pickup_list": pickup_array_list,
        }
    }, status=200)



@login_app.login_required
async def get_class(current_user, request): #them page
    args = request.args.to_dict()

    page = request.match_info.get('page','1')
    
    page = int(page)
    if page <= 0:
        page = 1
    page_size = 10
    
    args = validate_request(args, ['name', 'class_access_key'], {'name': '', 'class_access_key': '%%'})
    
    all_classes_count = db_session.query(Classes.access_key, Classes.name)\
              .filter(Classes.user_id==current_user.id)\
              .filter(func.lower(Classes.name).like('%'+args['name'].lower()+'%') & Classes.access_key.like(args['class_access_key']))
    
    all_classes_available = all_classes_count.limit(page_size).offset((page - 1) * page_size).all()
    
    all_classes = db_session.query(Classes.access_key, Classes.name, func.count(Classes.access_key))\
              .filter(Classes.user_id==current_user.id)\
              .filter(Classes.access_key==PeopleClasses.class_access_key)\
              .filter(People.access_key==PeopleClasses.person_access_key)\
              .filter(People.type_role=='student')\
              .group_by(Classes.access_key)\
              .all()
    
    all_classes_teacher = db_session.query(Classes.access_key, Classes.name, People.name,  DefineImages.image_id)\
              .filter(Classes.user_id==current_user.id)\
              .filter(Classes.access_key==PeopleClasses.class_access_key)\
              .filter(People.access_key==PeopleClasses.person_access_key)\
              .filter(People.type_role=='teacher')\
              .filter(DefineImages.person_access_key==People.access_key)\
              .group_by(Classes.access_key)\
              .all()
    
    class_array = {}
    for u in all_classes_available:
        class_array[str(u[0])] = {'access_key': u[0], 'classname': u[1],  'number_of_student': 0}
    for u in all_classes:
        if str(u[0]) in class_array:
            class_array[str(u[0])] = {'access_key': u[0], 'classname': u[1],  'number_of_student': u[2]}
    for u in all_classes_teacher:
        if str(u[0]) in class_array:
            class_array[str(u[0])]['teachers'] = {'name': u[2], 'image_id': u[3]}
    
    class_array_list = [class_array[u] for u in class_array.keys()]
    number_of_class = len(all_classes_count.all())
    
    return  web.json_response({
        "result": {
            "number_of_class": number_of_class,
            "class_list": class_array_list,
        }
    }, status=200)



@login_app.login_required
async def people_list(current_user, request): #tham page
    args = request.args.to_dict()

    page = request.match_info.get('page','1')
    
    page = int(page)
    if page <= 0:
        page = 1
    page_size = 10
    
    today = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp() * 1000
    args = validate_request(args, ['name', 'type_role', 'class_name', 'access_key', 'begin', 'end'], {'name': "%{}%".format(''), 'type_role': "%{}%".format(''), 'access_key': "%{}%".format(''), 'class_name': "%{}%".format(''), 'begin': today, 'end': today + 86400000})

    sub = db_session.query(DefineImages.image_id, DefineImages.id.label('id')).subquery()

    all_classes = Classes.query.filter_by(user_id = current_user.id).all()
    number_class = len(all_classes)

    all_people_count = db_session.query(DefineImages.person_access_key, DefineImages.image_id, People.name, People.access_key, People.type_role, People.age, People.gender, People.phone)\
              .filter(People.user_id==current_user.id)\
              .filter(People.access_key==DefineImages.person_access_key)\
              .filter(func.lower(People.name).like("%" + args['name'].lower() + "%") & People.type_role.like(args['type_role']) &  People.access_key.like(args['access_key']))

    if number_class > 0:
        all_people_count = all_people_count.filter(Classes.name.like(args['class_name']))\
    
    all_people_count = all_people_count.group_by(DefineImages.person_access_key, People.name, People.access_key)\
              .filter(DefineImages.id==sub.c.id)\

            #   .filter(func.lower(People.name).like('%' + args['name'].lower() + '%') & People.type_role.like('%' + args['type_role'] + '%') & Classes.name.like('%' + args['class_name'] + '%'))\
    all_people_have_class = db_session.query(DefineImages.person_access_key, DefineImages.image_id, People.name, People.access_key, People.type_role, Classes.name, Classes.access_key)\
              .filter(People.user_id==current_user.id)\
              .filter(People.access_key==DefineImages.person_access_key)\
              .filter(People.access_key==PeopleClasses.person_access_key)\
              .filter(Classes.access_key==PeopleClasses.class_access_key)\
              .all()
            #   .filter(People.access_key==PeopleClasses.person_access_key)\
            #   .filter(func.lower(People.name).like(args['name'].lower()) & People.type_role.like(args['type_role']) & Classes.name.like(args['class_name']))\
            #   .group_by(DefineImages.person_access_key, People.name, People.access_key)\
            #   .filter(DefineImages.id==sub.c.id)\

    current_checkin = db_session.query(Timeline.person_access_key, func.min(Timeline.timestamp), func.max(Timeline.timestamp), Timeline.image_id, People.name)\
              .filter(Timeline.user_id==current_user.id)\
              .filter(People.access_key==Timeline.person_access_key)\
              .filter(Timeline.timestamp >= int(args['begin']))\
              .filter(Timeline.timestamp <= int(args['end']))\
              .group_by(Timeline.person_access_key, People.name)\
              .all()
    
    all_people = all_people_count.limit(page_size).offset((page - 1) * page_size).all()

    if not current_checkin:
        current_checkin = []
    people_array = {}
    for u in all_people:
        people_array[str(u[0])] = {
            'name': u[2], 
            'image_ids': u[1], 
            'begin': '--', 
            'end': '--', 
            'checkin': False, 
            'access_key': u[3], 
            'type_role': u[4], 
            'class_name': None, 
            'class_access_key': None, 
            'age': u[5], 
            'gender': u[6], 
            'phone': u[7]
        }
    for u in current_checkin:
        if str(u[0]) in people_array:
            people_array[str(u[0])] = {
                'name': u[4], 
                'image_ids': u[3], 
                'begin': str(u[1]), 
                'end': str(u[2]), 
                'checkin': True, 
                'access_key': people_array[str(u[0])]['access_key'], 
                'type_role': people_array[str(u[0])]['type_role'], 
                'class_name': people_array[str(u[0])]['class_name'],
                'class_access_key': people_array[str(u[0])]['class_access_key'],
                'age': people_array[str(u[0])]['age'],
                'gender': people_array[str(u[0])]['gender'],
                'phone': people_array[str(u[0])]['phone'],
             }
    
    for u in all_people_have_class:
        if str(u[0]) in people_array:
            people_array[str(u[0])]['class_name'] = u[5]
            people_array[str(u[0])]['class_access_key'] = u[6]


    number_of_current_checkin = len(current_checkin)
    number_of_people = len(all_people_count.all())
    current_checkin = [people_array[u] for u in people_array.keys()]
    
    return web.json_response({
        "result": {
            "people_list": current_checkin,
            'number_of_people': number_of_people,
            'number_of_current_checkin': number_of_current_checkin,
        }
    }, status = 200)



@login_app.login_required
async def data_a(current_user, request):
    today = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp() * 1000
    
    all_people = db_session.query(DefineImages.person_access_key, DefineImages.image_id, People.name, People.access_key)\
              .filter(People.user_id==current_user['id'])\
              .filter(People.access_key==DefineImages.person_access_key)\
              .group_by(DefineImages.person_access_key, People.name, People.access_key)\
              .all()

    current_checkin = db_session.query(Timeline.person_access_key, Timeline.timestamp, Timeline.image_id, People.name)\
              .filter(Timeline.user_id==current_user['id'])\
              .filter(People.access_key==Timeline.person_access_key)\
              .filter(Timeline.timestamp >= today)\
              .group_by(Timeline.person_access_key, People.name)\
              .all()

    current_timeline = db_session.query(Timeline.person_access_key, Timeline.timestamp, Timeline.image_id, People.name)\
              .filter(Timeline.user_id==current_user['id'])\
              .filter(People.access_key==Timeline.person_access_key)\
              .order_by(Timeline.timestamp.desc())\
              .limit(10)\
              .all()

    strangers = db_session.query(Timeline.person_access_key, Timeline.timestamp, Timeline.image_id)\
              .filter(Timeline.user_id==current_user['id'])\
              .filter(Timeline.person_access_key==-1)\
              .order_by(Timeline.timestamp.desc())\
              .limit(10)\
              .all()

    if not current_checkin:
        current_checkin = []
    
    number_of_current_checkin = len(current_checkin)
    number_of_people = len(all_people)
    current_timeline_ = [{'name': u[3], 'image_id': u[2], 'timestamp': str(u[1])} for u in current_timeline]
    strangers = [{'image_id': u[2], 'timestamp': str(u[1])} for u in strangers]

    t = 0
    r = 0
    a = 0
    if torch.cuda.is_available():
        t = torch.cuda.get_device_properties(0).total_memory
        r = torch.cuda.memory_reserved(0)
        a = torch.cuda.memory_allocated(0)

    return web.json_response({
        "result": {
            'secret_key': current_user['secret_key'],
            'number_of_people': number_of_people,
            'number_of_current_checkin': number_of_current_checkin,
            'current_timeline': current_timeline_,
            'strangers': strangers,
            'gpu': {
                't': t,
                'r': r,
                'a': a
            }
        }
    }, status = 200)



async def images(request): #them secretkey, image_id
    secret_key = request.match_info.get('secret_key','')
    image_id = request.match_info.get('image_id', '')
    return web.FileResponse('images/' + secret_key + "/" + image_id + '.jpg')


app.router.add_route('*','/', index, name="index")
app.router.add_route('*','/client', client_a)
app.router.add_route('*','/logout', logout)
app.router.add_route('*',"/facerec", facerec)
app.router.add_route('*','/facereg', facereg)
app.router.add_route('*','/delete_image', delete_image)
app.router.add_route('*',"/add_class", add_class)
app.router.add_route('*',"/delete_class", delete_class)
app.router.add_route('*',"/check_pickup", check_pickup)
app.router.add_route('*',"/pickup_list/{page}", get_pickup)
app.router.add_route('*',"/class_list/{page}", get_class)
app.router.add_route('*',"/people_list/{page}", people_list)
app.router.add_route('*',"/data", data_a)
app.router.add_route('*',"/images/{secret_key}/{image_id}", images)
app.add_routes([web.static('/static', 'static')])


if __name__ == "__main__":
    web.run_app(app, port=5000)