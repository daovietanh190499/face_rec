const socket = io();

$('#container_extra').hide()

var thead_1 =   `
                <tr>
                    <th>Đối tượng</th>
                    <th>Trạng thái</th>
                    <th>Lần đầu</th>
                    <th>Lần cuối</th>
                    <th>Số ngày <br> (trễ / ot / điểm danh)</th>
                    <th>Hành động</th>
                </tr>
            `

var tbody_1 = (begin, end, access_key, name, prefix, image_id, state, state_color) =>  `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-info__img">
                                <img src="images/${secret_key}/${image_id}" alt="User Img" class="border-${state_color}">
                            </div>
                            <div class="user-info__basic">
                                <h5 class="mb-0">${name}</h5>
                                <p class="text-muted mb-0">@${prefix}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="active-circle bg-${state_color}"></span> ${state}
                    </td>
                    <td>${begin}</td>
                    <td>${end}</td>
                    <td>
                        1/1/1
                    </td>
                    <td>
                        <div class="dropdown open">
                            <a href="#!" class="px-2" id="triggerId1" data-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                        <i class="fa fa-ellipsis-v"></i>
                            </a>
                            <div class="dropdown-menu" aria-labelledby="triggerId1">
                                <a class="dropdown-item" data-toggle="modal" data-target="#editModal" onclick="register('update', '${access_key}')"><i class="fa fa-pencil mr-1"></i> Edit</a>
                                <a class="dropdown-item text-danger" onclick="delete_image('${access_key}')"><i class="fa fa-trash mr-1"></i> Delete</a>
                            </div>
                        </div>
                    </td>
                </tr>
            `

var thead_2 =   `
                <tr>
                    <th>Đối tượng</th>
                    <th>Thời gian</th>
                </tr>
            `

var tbody_2 = (timestamp, name, prefix, image_id) =>  `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-info__img">
                                <img src="images/${secret_key}/${image_id}" alt="User Img" class="border-primary">
                            </div>
                            <div class="user-info__basic">
                                <h5 class="mb-0">${name}</h5>
                                <p class="text-muted mb-0">@${prefix}</p>
                            </div>
                        </div>
                    </td>
                    <td>${timestamp}</td>
                </tr>
            `

var thead_3 =   `
                <tr>
                    <th>Đối tượng</th>
                    <th>Thời gian</th>
                </tr>
            `

var tbody_3 = (timestamp, image_id) =>  `
                <tr>
                    <td>
                        <div class="user-info">
                            <div class="user-info__img">
                                <img src="images/${secret_key}/${image_id}" alt="User Img" class="border-warning">
                            </div>
                            <div class="user-info__basic">
                                <h5 class="mb-0">Người lạ</h5>
                            </div>
                        </div>
                    </td>
                    <td>${timestamp}</td>
                </tr>
            `

var thead_4_classroom =   `
                <tr>
                    <th>Tên lớp</th>
                    <th>Sĩ số</th>
                    <th>Hành động</th>
                </tr>
            `

var tbody_4_classroom = (class_id = '0', class_name = 'Unknown', student_number = 0) =>  `
            <tr>
                <td>
                    <div>${class_name}</div>
                </td>
                <td>
                    <div> ${student_number} </div>
                </td>
                <td>
                    <div class="dropdown open">
                        <a href="#!" class="px-2" id="triggerId1" data-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false">
                                    <i class="fa fa-ellipsis-v"></i>
                        </a>
                        <div class="dropdown-menu" aria-labelledby="triggerId1">
                            <a class="dropdown-item" href="#"><i class="fa fa-pencil mr-1"></i> Edit</a>
                            <a class="dropdown-item text-danger" href="#" onclick="delete_class('${class_id}');"><i class="fa fa-trash mr-1" ></i> Delete</a>
                        </div>
                    </div>
                </td>
            </tr>
        `

// SỬA CÁI MODAL NÀY THÊM ẢNH, THÊM TÊN, THÊM TUỔI, THÊM GIỚI TÍNH, THÊM PHÂN LOẠI ROLE, NẾU ROLE LÀ PARENT HOẶC TEACHER THÌ HIỆN THÊM 1 Ô THÔNG TIN NHẬP PHONE
// CÁI NÀY CÓ 2 TRƯỜNG HỢP DEFINE LÀ TẠO MỚI, UPDATE LÀ UPDATE THÔNG TIN THEO ACCESSKEY
var modal_type1 = () =>  `
                    <div style="display:flex; width:100%">
                       <input accept="image/*" type='file' id="uploadImage" style="display:none"/>
                       <label class="form-check-label" for="uploadImage">
                           <img style="width: 25%" id="preview">
                       </label>
                       <div style="width: 75%; padding-left: 2rem">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Nhập tên" aria-label="Username" aria-describedby="basic-addon1" id="new_name">
                        </div>
                        
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Nhập tuổi" aria-label="Age" aria-describedby="basic-addon1" id="new_age">
                        </div>
                        
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Nhập giới tính" aria-label="Gender" aria-describedby="basic-addon1" id="new_gender">
                        </div>
                        
                        <select class="form-select" aria-label="Default select example" id="type_role" placeholder="Chọn một phân loại">
                            <option value="student">Học sinh</option>
                            <option value="parent">Người đưa đón</option>
                            <option value="teacher"Giaso viên</option>
                        </select>
                        
                        /* Đoạn này lấy danh sách lớp học từ API ròi fill vào */
                        <select class="form-select" aria-label="Default select example" id="class" placeholder="Chọn lớp học">
                            <option value="class_id_1">classname1</option>
                            <option value="class_id_2">classname2</option>
                            <option value="class_id_3">classname3</option>
                        </select>
                        
                        /* Giaso viên hoặc phụ huynh mới cần hiển thị input này */
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Nhập số điện thoại" aria-label="Phone" aria-describedby="basic-addon1" id="new_phone">
                        </div>
                       </div>
                    </div>
                `
//CÁI CHO LỚP HỌC NÀY CŨNG SỬA CŨNG CÓ 2 TRƯỜNG HỢP GIỐNG TRÊN
var modal_type2 = () =>  `
                    <div style="display:flex; width:100%">
                       <div style="width: 75%; padding-left: 2rem">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Nhập tên" aria-label="Username" aria-describedby="basic-addon1" id="new_class_name">
                        </div>
                       </div>
                    </div>
                `

function register(option, access_key="") {
    $("#editModal_body").html(modal_type1())
    $("#editModal_btn").unbind('click').click(() => add_new_image(option, access_key))
    $("#uploadImage").change(function() {
        let file = $("#uploadImage")[0].files[0]
        if (file) {
            $("#preview").src = URL.createObjectURL(file)
        }
    })
}

function add_new_image(option, access_key) {
	let body = ""
    // THÊM TRƯỜNG THÔNG TIN VÀO ĐÂY ĐỂ HOÀN TẤT
	if (option == 'define'){
		let new_name = $('#new_name').val();
		body = JSON.stringify({'img': $("#preview").src, 'name': new_name})
	} else {
		body = JSON.stringify({'img': $("#preview").src, 'access_key': access_key})
	}
    fetch('/facereg', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body
    })
    .then(res => res.json())
    .then(res => {
        $("#editModal").modal("hide")
        $("#list").trigger("click")
    })
}

function delete_image(access_key) {
    console.log("Deleting image:", access_key)
    body = JSON.stringify({'access_key': access_key, 'secret_key':secret_key})

    console.log(body)

    fetch('/deleteImage', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body
    })
    .then(res => res.json())
    .then(res => {
        // $("#realtime").trigger("click")
        $("#list").trigger("click")
    })
}

function createClass(option, class_id) {
    $("#editModal_body").html(modal_type2())
    $("#editModal_btn").unbind('click').click(() => add_new_class(option, class_id))
}

function add_new_class(option, class_id) {
    let new_class_name = $('#new_class_name').val();
    if (new_class_name == ""){
        alert("Hãy nhập tên lớp");
        return
    }
    body = JSON.stringify({'classname': new_class_name})
    
    fetch("add_class", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(res => res.json())
    .then(res => {
        // console.log(res)
        $("#editModal").modal("hide")
        $("#classroom").trigger("click")

    })
}

function delete_class(class_id) {
    console.log("(index.js) Deleting class:", class_id)
    body = JSON.stringify({'class_id': class_id, 'secret_key':secret_key})
    fetch('/deleteClass', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body
    })
    .then(res => res.json())
    .then(res => {
        $("#classroom").trigger("click")
    })
}

var options = ""

function formatTime(timestamp) {
    return moment(timestamp, "x").format("hh:mm:ss DD/MM/YYYY ")
}

function showRealtime() {
    fetch("data", {
        method: "GET"
    })
    .then(res => res.json())
    .then(res => {
        res = res['result']

        $("#info_bar").html(`<b class="text-success"> ${res['number_of_current_checkin']} người điểm danh </b> (tổng ${res['number_of_people']})   <span style="padding-left: 2rem">GPU: ${res['gpu']['a']} b/ ${res['gpu']['r']} b (tổng ${res['gpu']['t']})</span>`)

        $("#container1").attr('class', 'half-container')
        $("#container2").attr('class', 'half-container')
        $("#container2").show()

        $("#thead1").html(thead_2)
        body1 = ""
        for(i = 0; i < res['current_timeline'].length; i ++) {
            body1 += tbody_2(formatTime(res['current_timeline'][i]['timestamp']), res['current_timeline'][i]['name'], res['current_timeline'][i]['name'], res['current_timeline'][i]['image_id'])
        }
        $("#tbody1").html(body1)

        $("#thead2").html(thead_3)
        body2 = ""
        for(i = 0; i < res['strangers'].length; i ++) {
            body2 += tbody_3(formatTime(res['strangers'][i]['timestamp']), res['strangers'][i]['image_id'])
        }
        $("#tbody2").html(body2)
    })
}

function showList(page) {
    fetch(`/people_list/${page}`, {
        method: "GET"
    })
    .then(res => res.json())
    .then(res => {
        res = res['result']
        
        $("#info_bar").html(`<b class="text-success"> ${res['number_of_current_checkin']} người điểm danh </b> (tổng ${res['number_of_people']}) <button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#editModal" onclick="register('define')">Thêm người +</button>`)
        
        $("#container1").attr('class', 'full-container')
        $("#container2").hide()
        $("#thead1").html(thead_1)
        body1 = ""
        for(i = 0; i < res['people_list'].length; i ++) {
            body1 += tbody_1(formatTime(res['people_list'][i]['begin']), formatTime(res['people_list'][i]['end']), res['people_list'][i]['access_key'], res['people_list'][i]['name'], res['people_list'][i]['access_key'].split('-')[0], res['people_list'][i]['image_id'], res['people_list'][i]['checkin'] ? 'Đã điểm danh': "Chưa điểm danh", res['people_list'][i]['checkin'] ? 'success': "danger")
        }
        $("#tbody1").html(body1)
    })
}

function showClassInfo() {
    let page = 1
    fetch(`/class_list/${page}`, {
        method: "GET"
    })
    .then(res => res.json())
    .then(res => {
        res = res['result']
        
        $("#info_bar").html(`<button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#editModal" onclick="createClass()">Thêm lớp +</button>`)

        $("#thead1").html(thead_4_classroom)
        body1 = ""

        for(i = 0; i < res['class_list'].length; i ++) {
            body1 += tbody_4_classroom(class_id = res['class_list'][i].class_id, class_name = res['class_list'][i].classname, student_number = res['class_list'][i].number_of_student)
        }

        $("#tbody1").html(body1)
    })
}

const target = document.querySelector(".target");
const links = document.querySelectorAll(".mynav div");
const colors = ["deepskyblue", "orange", "firebrick", "gold", "magenta", "black", "darkblue"];

for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", mouseenterFunc);
}

$("#realtime").trigger("click")

function mouseenterFunc(e) {
    window.localStorage.setItem("menu", e.target.id)
    
    if (e.target.id == "realtime") {
        showRealtime()
    }
    
    if (e.target.id == "list") {
        showList(1)
    }
    
    if (e.target.id == "classroom") {
        showClassInfo()
    }

    for (let i = 0; i < links.length; i++) {
      if (links[i].parentNode.classList.contains("active")) {
        links[i].parentNode.classList.remove("active");
      }
      links[i].style.opacity = "0.25";
    }
     
    this.parentNode.classList.add("active");
    this.style.opacity = "1";
     
    // const width = this.getBoundingClientRect().width;
    // const height = this.getBoundingClientRect().height;
    // const left = this.getBoundingClientRect().left;
    // const top = this.getBoundingClientRect().top;
    
    // target.style.width = `${width}px`;
    // target.style.height = `${height}px`;
    // target.style.left = `${left}px`;
    // target.style.top = `${top}px`;
    // target.style.borderColor = "firebrick";
    // target.style.transform = "none";
}

socket.on(secret_key, (message) => {
    // console.log(message)
    menu = window.localStorage.getItem("menu")
    if (menu == "realtime") {
        showRealtime()
    }
});

// data-toggle="modal" data-target="#editModal"