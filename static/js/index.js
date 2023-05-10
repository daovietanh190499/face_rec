var nav_bar = Vue.component('nav-bar', {
    data() {
        return {
            tab: "realtime"
        }
    },
    methods: {
        changeMenu(tab) {
            this.$emit('change-menu', tab)
            this.tab = tab
        }
    },
    template: `
          <nav class="mynav">
            <ul>
              <li v-bind:class="tab == 'realtime' ? 'active' : ''">
                <div id="realtime"  @click="changeMenu('realtime')" 
                                    v-bind:style="{opacity: (tab == 'realtime' ? 1 : 0.25)}">Thời gian thực</div>
              </li>
              <li v-bind:class="tab == 'list' ? 'active' : ''">
                <div id="list" @click="changeMenu('list')" 
                               v-bind:style="{opacity: (tab == 'list' ? 1 : 0.25)}">Danh sách</div>
              </li>
              <li v-bind:class="tab == 'classroom' ? 'active' : ''">
                <div id="classroom" @click="changeMenu('classroom')" 
                                    v-bind:style="{opacity: (tab == 'classroom' ? 1 : 0.25)}">Danh sách lớp</div>
              </li>
            </ul>
          </nav>
    `
})

var people_list = Vue.component('people-list', {
    props: ["page"],
    data() {
        return {
            people_list: [],
            secret_key: secret_key
        }
    },
    mounted() {
        this.getData()
    },
    methods: {
        formatTime(timestamp) {
            return moment(timestamp, "x").format("hh:mm:ss DD/MM/YYYY ")
        },
        getData() {
            fetch(`/people_list/${this.page}`, {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']
                this.$emit("metadata", {number_of_current_checkin: res['number_of_current_checkin'], number_of_people: res['number_of_people']}) 
                this.people_list = res['people_list']
            })
        },
        deletePerson(access_key) {
            body = JSON.stringify({
                'access_key': access_key
            })

            fetch('/delete_image', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => this.getData())
        },
        openModal(access_key) {
            this.$emit('open-modal', ['list', access_key])
        }
    },
    template: `
    <div class="full-container" style="display: flex; justify-content: space-between;">
     <div class="full-container" id="container1">
        <table class="table" id="table1">
          <thead id="thead1">
              <tr>
                    <th>Đối tượng</th>
                    <th>Trạng thái</th>
                    <th class="mobile-disable">Lần đầu</th>
                    <th class="mobile-disable">Lần cuối</th>
                    <th class="mobile-disable">Vai trò</th>
                    <th class="mobile-disable">Lớp</th>
                    <th>Hành động</th>
              </tr>
          </thead>
          <tbody id="tbody1">
              <tr v-bind:id="'person-' + person.access_key" v-for="person in people_list">
                    <td>
                        <div class="user-info">
                            <div class="user-info__img">
                                <img v-bind:src="'images/' + secret_key + '/' + person.image_ids" alt="User Img" 
                                     v-bind:class="'border-' + (person.checkin? 'success': 'danger')">
                            </div>
                            <div class="user-info__basic">
                                <h5 class="mb-0">{{ person.name }}</h5>
                                <p class="text-muted mb-0">@{{ person['type_role'] }}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span v-bind:class="'active-circle bg-' + (person.checkin? 'success': 'danger')"></span>
                        {{ person.checkin? 'Đã điểm danh': 'Chưa điểm danh' }}
                    </td>
                    <td class="mobile-disable">{{ formatTime(person['begin']) }}</td>
                    <td class="mobile-disable">{{ formatTime(person['end']) }}</td>
                    <td class="mobile-disable">{{ person['type_role'] }}</td>
                    <td class="mobile-disable">{{ person['class_name'] }}</td>
                    <td>
                        <div class="dropdown open">
                            <a href="#!" class="px-2" id="triggerId1" data-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                        <i class="fa fa-ellipsis-v"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-left" aria-labelledby="triggerId1">
                                <a class="dropdown-item" data-toggle="modal" data-target="#editModal" @click="openModal(person.access_key)">
                                    <i class="fa fa-pencil mr-1"></i> Edit
                                </a>
                                <a class="dropdown-item text-danger" @click="deletePerson(person.access_key)">
                                    <i class="fa fa-trash mr-1"></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
             </tr>
          </tbody>
        </table>
    </div>
  </div>
  `
})

var checkin_list = Vue.component('checkin-list', {
    data() {
        return {
            socket: io(),
            current_timeline: [],
            strangers: [],
            secret_key: secret_key
        }
    },
    mounted() {
        this.fetchData()
        this.socket.on(this.secret_key, (message) => {
           this.fetchData()
        });
    },
    methods: {
        formatTime(timestamp) {
            return moment(timestamp, "x").format("hh:mm:ss DD/MM/YYYY ")
        },
        fetchData() {
            fetch("data", {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']
                this.$emit("metadata", {
                    number_of_current_checkin: res['number_of_current_checkin'], 
                    number_of_people: res['number_of_people'],
                    gpu: res['gpu']
                }) 
                this.current_timeline = res['current_timeline']
                this.strangers = res['strangers']
            })
        }
     },
    template: `
        <div class="full-container" style="display: flex; justify-content: space-between;">
          <div class="half-container" id="container1">
              <table class="table" id="table1">
                  <thead id="thead1">
                     <tr>
                        <th>Đối tượng</th>
                        <th>Thời gian</th>
                     </tr>
                  </thead>
                  <tbody id="tbody1">
                      <tr v-for="person in current_timeline">
                        <td>
                            <div class="user-info">
                                <div class="user-info__img">
                                    <img v-bind:src="'/images/' + secret_key + '/' + person.image_id" alt="User Img" class="border-primary">
                                </div>
                                <div class="user-info__basic">
                                    <h5 class="mb-0">{{ person.name }}</h5>
                                    <p class="text-muted mb-0">@{{ person.name }}</p>
                                </div>
                            </div>
                        </td>
                        <td>{{ formatTime(person.timestamp) }}</td>
                     </tr>
                  </tbody>
                </table>
          </div>

          <div class="half-container" id="container2">
              <table class="table" id="table2">
                  <thead id="thead2">
                        <tr>
                            <th>Đối tượng</th>
                            <th>Thời gian</th>
                        </tr>
                  </thead>
                  <tbody id="tbody2">
                        <tr v-for="person in strangers">
                            <td>
                                <div class="user-info">
                                    <div class="user-info__img">
                                        <img v-bind:src="'/images/' + secret_key + '/' + person.image_id" alt="User Img" class="border-warning">
                                    </div>
                                    <div class="user-info__basic">
                                        <h5 class="mb-0">Người lạ</h5>
                                    </div>
                                </div>
                            </td>
                            <td>{{ formatTime(person.timestamp) }}</td>
                        </tr>
                  </tbody>
              </table>
          </div>
    </div>
  `
})

var class_list = Vue.component('class-list', {
    props: ["page"],
    data() {
        return {
            number_of_class: 0,
            class_list: [],
            secret_key: secret_key
        }
    },
    mounted() {
        this.getData()
    },
    methods: {
        getData() {
            fetch(`/class_list/${this.page}`, {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']
                this.number_of_class = res['number_of_class']
                this.class_list = res['class_list']
                this.$emit("metadata", {
                    number_of_class: res['number_of_class'],
                })
            })
        },
        deleteClass(class_access_key) {
            body = JSON.stringify({
                'class_access_key': class_access_key,
            })
            fetch('/delete_class', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => this.getData())
        },
        openModal(class_access_key) {
            this.$emit('open-modal', ['classroom', class_access_key])
        }
    },
    template: `
    <div class="full-container" style="display: flex; justify-content: space-between;">
     <div class="full-container" id="container1">
        <table class="table" id="table1">
          <thead id="thead1">
                <tr>
                    <th>Tên lớp</th>
                    <th>Sĩ số</th>
                    <th>Tên giáo viên phụ trách</th>
                    <th>Hành động</th>
                </tr>
          </thead>
          <tbody id="tbody1">
              <tr v-for="cl in class_list">
                   <td>
                        <div>{{ cl.classname }}</div>
                    </td>
                    <td>
                        <div> {{ cl.number_of_student }} </div>
                    </td>
                    <td>
                        <div class="user-info" v-if="cl.teachers">
                            <div class="user-info__img">
                                <img v-bind:src="'/images/' + secret_key + '/' + cl.teachers.image_id" 
                                     alt="User Img" class="border-primary">
                            </div>
                            <div class="user-info__basic">
                                <h5 class="mb-0">{{ cl.teachers.name }}</h5>
                                <p class="text-muted mb-0">@{{ cl.teachers.name }}</p>
                            </div>
                        </div>
                        <div v-else style="height:3rem">
                        </div>
                    </td>
                    <td>
                        <div class="dropdown open">
                            <a href="#!" class="px-2" id="triggerId1" data-toggle="dropdown" aria-haspopup="true"
                                    aria-expanded="false">
                                        <i class="fa fa-ellipsis-v"></i>
                            </a>
                            <div class="dropdown-menu" aria-labelledby="triggerId1">
                                <a class="dropdown-item" data-toggle="modal" data-target="#editModal" @click="openModal(cl.access_key)">
                                    <i class="fa fa-pencil mr-1"></i> Edit
                                </a>
                                <a class="dropdown-item text-danger" href="#" @click="deleteClass(cl.access_key)">
                                    <i class="fa fa-trash mr-1" ></i> Delete
                                </a>
                            </div>
                        </div>
                    </td>
             </tr>
          </tbody>
        </table>
    </div>
  </div>
  `
})

var info_bar = Vue.component('info-bar', {
    props: ["menu", "metadata"],
    data() {
        return {}
    },
    methods: {
        openModal(tab) {
            this.$emit('open-modal', [tab, ""])
        }
    },
    template: `
    <span id="info_bar" v-if="menu == 'realtime'">
        <b class="text-success"> 
            người điểm danh {{ metadata.number_of_current_checkin ?  metadata.number_of_current_checkin : "0" }}
        </b> (tổng {{ metadata.number_of_people ?  metadata.number_of_people : "0" }})   
        <span style="padding-left: 2rem">
            GPU: {{ metadata.gpu ? metadata.gpu.t:"0"  }} b/ {{ metadata.gpu? metadata.gpu.a:"0" }} b (tổng {{ metadata.gpu ? metadata.gpu.r:"0" }})
        </span>
    </span>
    <span id="info_bar" v-else-if="menu == 'list'">
        <b class="text-success"> 
             người điểm danh {{ metadata.number_of_current_checkin ?  metadata.number_of_current_checkin : "0" }}
        </b> (tổng {{ metadata.number_of_people ?  metadata.number_of_people : "0" }}) 
        <button class="btn btn-primary btn-sm main_button" data-toggle="modal" data-target="#editModal" @click="openModal('list')" style="float:right">
            <b class="mobile-disable">Thêm người </b><img class="icon-mobile" src="/static/img/user-plus-solid.svg">
        </button>
    </span>
    <span id="info_bar" v-else="menu == 'classroom'">
        <button class="btn btn-primary btn-sm main_button" data-toggle="modal" data-target="#editModal" @click="openModal('classroom')">
            <b class="mobile-disable">Thêm lớp </b><img class="icon-mobile" src="/static/img/users-solid.svg">
        </button>
    </span>
    `
})

var people_modal = Vue.component('people-modal', {
    props: ["access_key"],
    data() {
        return {
            number_of_class: 0,
            class_list: [],
            secret_key: secret_key,
            imagePreview: "",
            input: {
                images: null,
                name: "",
                age: "",
                gender: "",
                type_role: "student",
                class: "",
                classname: "",
                parent: "",
                phone: ""
            }
        }
    },
    mounted() {
        this.getClassList({data: ""})
        if (this.access_key != "") {
            fetch(`/people_list/1?access_key=` + this.access_key, {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']['people_list'][0]
                this.imagePreview = '/images/' + this.secret_key + '/' + res.image_ids
                this.input.name = res.name
                this.input.age = res.age
                this.input.gender = res.gender
                this.input.type_role = res.type_role
                this.input.class = res.class_access_key
                this.input.classname = res.class_name
                this.input.phone = res.phone
            })
        } else {
            this.imagePreview = ''
            this.input.name = ''
            this.input.age = ''
            this.input.gender = ''
            this.input.type_role = 'student'
            this.input.class = ''
            this.input.classname = ''
            this.input.phone = ''
        }
    },
    methods: {
        getClassList(searchClass={data:""}) {
            fetch(`/class_list/1?name=` + (searchClass.data != null ? searchClass.data : ""), {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']
                this.number_of_class = res['number_of_class']
                this.class_list = res['class_list']
            })
        },
        createPerson() {
            body = {
                'secret_key': this.secret_key,
                'name': this.input.name,
                'age': this.input.age,
                'gender': this.input.gender,
                'type_role': this.input.type_role,
                'class_access_key': this.input.class,
                'phone': this.input.phone
            }
            if (this.access_key != "") {
                body['access_key'] = this.access_key
            } else {
                body['img'] = [this.imagePreview]
            }
            body = JSON.stringify(body)
            fetch('/facereg', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(res => this.$emit('update', 'list'))
        },
        previewImage() {
            this.input.images = this.$refs.fileInput.files;
            let file = this.input.images[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
        },
        changeClass(cl) {
            this.input.class = cl.access_key
            this.input.classname = cl.classname
        }
    },
    template: `
        <div class="modal fade" tabindex="-1" role="dialog" id="editModal">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="editModal_label">Thông tin đối tượng</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body" id="editModal_body">
                  <div style="display:flex; width:100%">
                    <div style="width: 90%; padding-left: 2rem">
                    
						<div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    Chọn ảnh: 
                                </span>
                            </div>
                            <div class="custom-file">
                                <input type="file" class="custom-file-input" 
                                       accept="image/*" id="imageInput" @change="previewImage()" ref="fileInput">
                                <label class="custom-file-label" for="imageInput">Chọn ảnh</label>
                            </div>
                        </div>
                        
                        <img style="width: 25%; margin-bottom: 1rem" v-bind:src="imagePreview" class="img-thumbnail">
                        
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    Họ tên: 
                                </span>
                            </div>
                            <input type="text" 
                                   class="form-control" 
                                   placeholder="Nhập tên" 
                                   aria-label="Username" 
                                   aria-describedby="basic-addon1" 
                                   v-model="input.name">
                        </div>
                        
                        <div class="input-group mb-3">
							<div class="input-group-prepend">
                                <span class="input-group-text">
                                    Tuổi: 
                                </span>
                            </div>
                            <input type="text" 
                                   class="form-control" 
                                   placeholder="Nhập tuổi" 
                                   aria-label="Age" 
                                   aria-describedby="basic-addon1" 
                                   v-model="input.age">
                        </div>
                        
                        <div class="input-group mb-3">
							<div class="input-group-prepend">
                                <span class="input-group-text">
                                    Giới tính: 
                                </span>
                            </div>
                            <input type="text" 
                               class="form-control" 
                               placeholder="Nhập giới tính" 
                               aria-label="Gender" 
                               aria-describedby="basic-addon1" 
                               v-model="input.gender">
                        </div>
                        <div class="input-group mb-3">
							<div class="input-group-prepend">
                                <span class="input-group-text">
                                    Vai trò: 
                                </span>
                            </div>
                            <select class="form-select" 
                                    aria-label="Default select example" 
                                    placeholder="Chọn một phân loại" 
                                    v-model="input.type_role">
                                <option value="student">Học sinh</option>
                                <option value="teacher">Giáo viên</option>
                                <option value="parent">Người đưa đón</option>
                            </select>
                        </div>
                        
                        <div class="input-group mb-3" id="input-parent">
							<div class="input-group-prepend">
                                <span class="input-group-text">
                                    {{  input.type_role=='student'? 'Người đưa đón:' : 'Học sinh đưa đón:' }}
                                </span>
                            </div>
                            <div class="dropdown form-select" style="padding:0">
                                <button class="btn" type="button" 
                                        style="width:100%; height:100%; border:none"
                                        id="dropdown_attendant" 
                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    {{  input.type_role=='student'? 'Chọn người đưa đón' : 'Chọn học sinh đưa đón' }}
                                </button>
                                <div id="menu" class="dropdown-menu" aria-labelledby="dropdown_attendant">
                                    <form class="px-4 py-2">
                                        <input type="search" class="form-control" placeholder="Tìm kiếm">
                                    </form>
                                    <div id="menuItems">
                                        <input 
                                            type="button" class="dropdown-item"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                            value=""
                                            v-for=""
                                        />
                                    </div>
                                    <div class="dropdown-header">No data found</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="input-group mb-3" v-if="input.type_role != 'parent'">
							<div class="input-group-prepend">
                                <span class="input-group-text">
                                    Lớp học:
                                </span>
                            </div>
                            <div class="dropdown form-select" style="padding:0">
                                <button class="btn" type="button" 
                                        id="dropdownClass"
                                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                        style="width:100%; height:100%; border:none"
                                >
                                    Lớp {{ input.classname }}
                                </button>
                                <div aria-labelledby="dropdownClass" class="dropdown-menu dropdown-menu-right">
                                    <form class="px-4 py-2">
                                        <input class="form-control" type="text" placeholder="Tìm kiếm" @input="getClassList($event)" />
                                    </form>
                                    <div id="menuItems" v-if="class_list.length > 0">
                                        <a  class="dropdown-item"
                                            @click="changeClass(cl)"
                                            v-for="cl in class_list"
                                            href="#">
                                            Lớp {{ cl.classname }}
                                        </a>
                                    </div>
                                    <div class="dropdown-header" v-else="class_list.length <=0">No data found</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="input-group mb-3" id="input-phone" v-if="input.type_role != 'student'">
                            <div class="input-group mb-3" id="phone">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                        Số điện thoại: 
                                    </span>
                                </div>
                                <input type="text" 
                                       class="form-control" 
                                       placeholder="Nhập số điện thoại" 
                                       aria-label="Phone" 
                                       aria-describedby="basic-addon1" 
                                       v-model="input.phone">
                            </div>
                        </div>
                       </div>
                    </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                  <button type="button" class="btn btn-primary" id="editModal_btn" @click="createPerson()" data-dismiss="modal">
                      Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
        </div>
  `
})

var class_modal = Vue.component('class-modal', {
    props: ["class_access_key"],
    data() {
        return {
            number_of_class: 0,
            secret_key: secret_key,
            teacher_list: [],
            input: {
                classname: "",
                number_of_student: 0,
                teachers: {access_key:"", name:""},
            }
        }
    },
    mounted() {
        this.getTeacherList({data:""})
        if (this.class_access_key != "") {
            fetch(`/class_list/1?class_access_key=` + this.class_access_key, {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)
                res = res['result']
                this.number_of_class = res['number_of_class']
                this.input.classname = res['class_list'][0]['classname']
                this.input.number_of_student = res['class_list'][0]['number_of_student']
                this.input.teachers = res['class_list'][0]['teachers']
            })
        } else {
            this.number_of_class = ""
            this.input.classname = ""
            this.input.number_of_student = 0
            this.input.teachers = null
        }
    },
    methods: {
        getTeacherList(searchTeacher={data:""}) {
            fetch(`/people_list/1?type_role=teacher&name=` + (searchTeacher.data != null ? searchTeacher.data : ""), {
                method: "GET"
            })
            .then(res => res.json())
            .then(res => {
                res = res['result']
                this.teacher_list = res['people_list']
            })
        },
        changeTeacher(te) {
            this.input.teachers = te
        },
        createClass() {
            let new_class_name = this.input.classname
            if (new_class_name == "") {
                alert("Hãy nhập tên lớp");
                return
            } else {
                body = JSON.stringify({
                    'class_access_key': this.class_access_key,
                    'class_name': new_class_name,
                    'teacher_access_keys': [this.input.teachers.access_key]
                })
                fetch("/add_class", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: body
                }).then(res => this.$emit('update', 'classroom'))
            }
        },
    },
    template: `
        <div class="modal fade" tabindex="-1" role="dialog" id="editModal">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="editModal_label">Thông tin lớp học</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body" id="editModal_body">
                  <div style="display:flex; width:100%">
                       <div style="width: 90%; padding-left: 2rem">
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    Tên lớp: 
                                </span>
                            </div>
                            <input type="text" 
                                   class="form-control" 
                                   placeholder="Nhập tên" 
                                   aria-label="Username" 
                                   aria-describedby="basic-addon1" 
                                   v-model="input.classname">
                        </div>
                        <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text">
                                    Sĩ số: 
                                </span>
                            </div>
                            <input type="text" 
                                   class="form-control" 
                                   placeholder="Sĩ số" 
                                   aria-describedby="basic-addon1"
                                   disabled
                                   v-bind:value="input.number_of_student + ' học sinh'">
                        </div>
                        <div class="input-group mb-3">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">
                                        Giáo viên phụ trách:
                                    </span>
                                </div>
                                <div class="dropdown form-select" style="padding:0">
                                    <button class="btn" type="button" 
                                            id="dropdownTeacher"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                            style="width:100%; height:100%; border:none"
                                    >
                                         {{ input.teachers? input.teachers.name ? input.teachers.name : "" : "" }}
                                    </button>
                                    <div aria-labelledby="dropdownTeacher" class="dropdown-menu dropdown-menu-right">
                                        <form class="px-4 py-2">
                                            <input class="form-control" type="text" placeholder="Tìm kiếm" @input="getTeacherList($event)" />
                                        </form>
                                        <div id="menuItems" v-if="teacher_list.length > 0">
                                            <a  class="dropdown-item"
                                                @click="changeTeacher(te)"
                                                v-for="te in teacher_list"
                                                href="#">
                                                {{ te.name }}
                                            </a>
                                        </div>
                                        <div class="dropdown-header" v-else="teacher_list.length <=0">No data found</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                       </div>
                    </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                  <button type="button" class="btn btn-primary" id="editModal_btn" @click="createClass()" data-dismiss="modal">
                      Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
        </div>
  `
})

const appVue = new Vue({
    el: '#root',
    data: {
        menu: "realtime",
        page: 1,
        forceUpdatePeopleList: true,
        forceUpdateClassList: true,
        forceUpdatePeopleModal: true,
        forceUpdateClassModal: true,
        access_key: "",
        class_access_key: "",
        metadata: {}
    },
    methods: {
        triggerUpdate(tab) {
            if (tab == "list") {
                this.forceUpdatePeopleList = !this.forceUpdatePeopleList
            } else if (tab == "classroom") {
                this.forceUpdateClassList = !this.forceUpdateClassList
            }
        },
        triggerUpdateModal(data) {
            if (data[0] == "list") {
                this.access_key = data[1]
                this.forceUpdatePeopleModal = !this.forceUpdatePeopleModal
            } else if (data[0] == "classroom") {
                this.class_access_key = data[1]
                this.forceUpdateClassModal = !this.forceUpdateClassModal
            }
        },
        changeMenu(tab) {
            this.menu = tab
            this.page = 1
        },
        changeMetadata(metadata) {
            this.metadata = metadata
        }
    }
})

$("#realtime").trigger("click")