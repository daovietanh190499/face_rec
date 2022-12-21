const socket = io();

$('#container_extra').hide()
var thead_1_classroom =   `
                <tr>
                    <th>STT</th>
                    <th>Tên lớp</th>
                    <th>Trạng thái</th>
                    <th>Sĩ số</th>
                    <th>% đi học đúng giờ</th>
                    <th>Hành động</th>
                </tr>
            `
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

var tbody_1_classroom = (index = 'Unknown',class_name = 'Unknown', class_id = '123456', student_number = 0, state = 'Học', state_color = 'success', access_key_for_class='This_is_access_key_for_class') =>  `
            <tr>
                <td>
                    <div>${index}</div>
                </td>
                <td>
                    <div>${class_name}</div>
                </td>
                <td>
                    <span class="active-circle bg-${state_color}"></span> ${state}
                </td>

                <td>
                    <div> ${student_number} </div>
                </td>
                <td>
                    <div> ${student_number}/${student_number} </div>
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
var tbody_1 = (timestamp, name, prefix, image_id, state, state_color) =>  `
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
                    <td>${timestamp}</td>
                    <td>${timestamp}</td>
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
                                <a class="dropdown-item" href="#"><i class="fa fa-pencil mr-1"></i> Edit</a>
                                <a class="dropdown-item text-danger" href="#"><i class="fa fa-trash mr-1"></i> Delete</a>
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
                    <th>Hành động</th>
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
                    <td>
                        <button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#editModal" onclick="register('${image_id}')">Đăng ký</button>
                    </td>
                </tr>
            `

var modal_type1 = (image_id, options_) =>  `
                    <div style="display:flex; width:100%">
                       <img style="width: 25%" src="images/${secret_key}/${image_id}">
                       <div style="width: 75%; padding-left: 2rem">
                            <div class="form-check">
                                <input class="form-check-input"  type="radio" name="flexRadioDefault" value="define" id="flexCheckChecked" checked>
                                <label class="form-check-label" for="flexCheckChecked">
                                    Thêm mới
                                    <div class="input-group mb-3">
                                        <input type="text" class="form-control" placeholder="Nhập tên" aria-label="Username" aria-describedby="basic-addon1" id="new_name">
                                    </div>
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input"  type="radio" name="flexRadioDefault" value="add" id="flexCheckDefault">
                                <label class="form-check-label" for="flexCheckDefault">
                                    Tăng cường
                                    <select class="form-select" aria-label="Default select example" id="access_key">
                                        ${options_}
                                    </select>
                                </label>
                            </div>
                       </div>
                    </div>
                `

var class_info_block = (image_id = '', options_ = '') =>  `
                <table> 
                <tr>
                    <td>Tên lớp: </td>
                    <td>
                        <input style="width:100%" type="text" class="form-control" placeholder="Nhập tên lớp" aria-label="Username" aria-describedby="basic-addon1" id="new_class_name">
                    </td>
                </tr>
                <tr>
                    <td>Sĩ số: </td>
                    <td>
                        <input style="width:100%" type="number" min="10" max="40" class="form-control" placeholder="Nhập sĩ số" aria-label="Username" aria-describedby="basic-addon1" id="new_student_number">
                    </td>

                </tr>
            </table>

        `
function check_non_empty(){
    let new_class_name = $('#new_class_name').val()
    if (new_class_name == ""){
        alert("Hãy nhập tên lớp");
        return false;
    }
    else {
        return true; 
    }
}
function register(image_id) {
    $("#editModal_body").html(modal_type1(image_id, window.localStorage.getItem("options")))
    $("#editModal_btn").unbind('click').click(() => add_new_image(image_id))
}

function add_new_image(image_id) {
	let body = ""
    let option = $('input[name="flexRadioDefault"]:checked').val();
	if (option == 'define'){
		let new_name = $('#new_name').val()
		body = JSON.stringify({'image_id': image_id, 'name': new_name})
	} else {
		let access_key = $('#access_key').val()
		body = JSON.stringify({'image_id': image_id, 'access_key': access_key})
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

function insert_classroom_info() {
    $("#createClassForm_body").html(class_info_block())
    $("#createClassForm_btn").unbind('click').click(() => request_new_classroom())
}

function request_new_classroom() {
    if (check_non_empty()){

        let new_class_name = $('#new_class_name').val()
        let new_student_number = $('#new_student_number').val()
        console.log("new_class_name:", new_class_name)
        console.log("new_student_number:", new_student_number)
        let body = ""
        
        body = JSON.stringify({'classname': new_class_name, 'student_number': new_student_number})
    
        fetch("createClass", {
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
            $("#createClassForm").modal("hide")
            getResult()
    
        })
    }
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

function getResult() {
    fetch("data", {
        method: "GET"
    })
    .then(res => res.json())
    .then(res => {
        menu = window.localStorage.getItem("menu")
        if (menu == "classroom"){
            showClassInfo(res)
        }else{
            showResult(res)
        }
    })
}

var options = ""

function formatTime(timestamp) {
    return moment(timestamp, "x").format("hh:mm:ss DD/MM/YYYY ")
}
function showClassInfo(res) {
    res = res['result']
    menu = window.localStorage.getItem("menu")

    if (menu == "classroom") {
        $("#info_bar").hide()
        $("#class_info_bar").show()

        $("#container1").attr('class', 'full-container')
        $("#container2").hide()
        $("#thead1").html(thead_1_classroom)
        body1 = ""

        for(i = 0; i < res['all_classrooms'].length; i ++) {
            body1 += tbody_1_classroom(index = i + 1, class_id = res['all_classrooms'][i].class_id,class_name = res['all_classrooms'][i].class_name, student_number = res['all_classrooms'][i].student_number)
        }

        $("#tbody1").html(body1)
        button = `
                <button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#createClassForm" onclick="insert_classroom_info()">Thêm lớp</button>

                `
        $("#class_info_bar").html(button)
    }
}
function showResult(res) {
    res = res['result']

    options = ""
    for(i = 0; i < res['current_checkin'].length; i++) {
        options += `<option value="${res['current_checkin'][i]['access_key']}">${res['current_checkin'][i]['name']}</option>`
    }
    window.localStorage.setItem("options", options)
    $("#class_info_bar").hide()
    
    $("#info_bar").html(`<b class="text-success"> ${res['number_of_current_checkin']} người điểm danh </b> (tổng ${res['number_of_people']})   <span style="padding-left: 2rem">GPU: ${res['gpu']['a']} b/ ${res['gpu']['r']} b (tổng ${res['gpu']['t']})</span>`)
    $("#info_bar").show()

    menu = window.localStorage.getItem("menu")
    if (menu == "realtime") {

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
    }
    if (menu == "list") {
        $("#container1").attr('class', 'full-container')
        $("#container2").hide()
        $("#thead1").html(thead_1)
        body1 = ""
        for(i = 0; i < res['current_checkin'].length; i ++) {
            body1 += tbody_1(formatTime(res['current_checkin'][i]['timestamp']), res['current_checkin'][i]['name'], res['current_checkin'][i]['access_key'].split('-')[0], res['current_checkin'][i]['image_id'], res['current_checkin'][i]['checkin'] ? 'Đã điểm danh': "Chưa điểm danh", res['current_checkin'][i]['checkin'] ? 'success': "danger")
        }
        $("#tbody1").html(body1)
    }
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
    getResult()

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
    getResult()
});

// data-toggle="modal" data-target="#editModal"