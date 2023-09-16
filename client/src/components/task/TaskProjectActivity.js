import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Badge, Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Navbar }  from "../navbar/Navbar";
import Breadcrumb from "../helpers/Breadcrumb";
import { addUserToProject, delUserToProject, getProject } from '../../network/TaskNetwork';
import { addProject } from '../../reducers/Project';
import { getUsers } from "../../network/UserNetwork";
import { addUserList } from "../../reducers/User";
import ModalAutoComplete from "../helpers/ModalAutoComplete";
moment.locale('ru');

const noText = "Проект без названия";

function TaskProjectActivity(props) {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const User = useSelector((state) => state.user);
    const Project = useSelector((state) => state.project.project);
    const { project_id } = useParams();

    document.title = `Свойства ${Project?.project_name.trim()?Project.project_name:noText} | planhelp`;

    const userRoleList = [
        {display_val:"Полные права",return_val:"OWNER"},
        {display_val:"Запись",return_val:"WRITE"},
        {display_val:"Только чтение",return_val:"READ"}
    ];

    const [userRoleListOptions, setUserRoleList] = useState(userRoleList);
    const [selectedUserId, setSelectedUserId] = useState(false);
    
    // Модалка для добавлвения пользователя в проект
    const [showModalEntityUser, setShowModalEntityUser] = useState(false);
    // Модалка для выбора роли для юзера при указании прав
    const [showModalEntityUserRole, setShowModalEntityUserRole] = useState(false);

    // Первичная загрузка данных
    useEffect(() => { fetchProject()},[]);

    /// Детали проекта
    const fetchProject = () => {
        getProject({project_id}, (err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    /// Удалить доступ пользователю
    const fetchRevokeUser = (user) => {
        delUserToProject({ project_id: project_id, selectedUserId: user.user_id, user_role: user.user_role }, (err, resp) => {
            if (!err) {
                fetchProject()
            } else {
                alert("Ошибка: "+ err);
            }
        })
    };

    // Получаем список юзеров для контекстного поиска при указании прав
    const fetchUsers = (search, cb) => {
        if (search) {
            getUsers({search}, (err,resp) => {
                resp.map((el) => {
                    el.display_val = el.login;
                    el.return_val = el.user_id;
                })
                dispatch(addUserList(resp));
            })
        } else {
            dispatch(addUserList([]));
        }
    };

    // Получаем список ролей для контекстного поиска
    const fetchUserRole = (search, cb) => {
        if (!search) {
            setUserRoleList(userRoleList);
            return;
        }
        const filtered = userRoleList.filter(
            el => el.display_val.toUpperCase().indexOf(search.toUpperCase()) >= 0 
        );
        setUserRoleList(filtered);
    };

    // Вызов модалки для добавления пользователя
    const actionCallModalAddUserProject = (e) => {
        e.preventDefault();
        dispatch(addUserList([]));
        setShowModalEntityUser(true);
    }

    // Callback из модалки добавления пользователя
    const actionCallBackModalAddUserProject = (user_id) => {
        setShowModalEntityUser(false);
        if (!user_id) return;
        setSelectedUserId(user_id);
        setShowModalEntityUserRole(true);
    }

    // Callback из модалки добавления роли
    const acctionCallBackModalAddRoleUser = (user_role) => {
        setShowModalEntityUserRole(false);
        if (!user_role) return;
        if (!selectedUserId) return;

        addUserToProject({ project_id, selectedUserId, user_role }, (err, resp) => {
            if (!err) {
                fetchProject()
            } else {
                alert("Ошибка: " + err);
            }
        })
    }

    const handleCancelEntity = () => {
        navigate(`/task/project/${project_id}`);
    }

    const listUsers = Project.project_user_list.map((el) =>
        <tr key = {el.user_id}>
            <td>{el.login}</td>
            <td>
                <Badge bg="primary">{el.user_role}</Badge>
            </td>
            <td>
                <Button type="button" variant="outline-danger" onClick={() => fetchRevokeUser(el)}>
                    <i className="bi bi-trash3"></i>
                </Button>
            </td>
        </tr>
    )

    const Header = () => {
        return(
            <>
            <div style={{float:"left",paddingRight:"4px"}}>
                <Form.Group className="mb-3">
                    <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleCancelEntity}>
                        <i className="bi bi-chevron-left" />
                    </Button>
                </Form.Group>
            </div>
            
            <div>
                <h2> Свойства для {Project?.project_name.trim()?Project.project_name:noText} </h2>
            </div>
            </>
        )
    }

    const CreatedDate = () => {
        return(
            <>
                Создал {Project.created_by_model.login} { moment(Project.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow() }
                <hr/>
            </>
        )
    }

    const AccessTable = () => {
        return (
            <>
            <div style={{float:"left",paddingRight:"4px"}}>
                <h3>Доступ</h3>
            </div>
            <div>
                <Form.Group className="mb-3">
                    <Button type="button" variant="" onClick={ actionCallModalAddUserProject } >
                        <i className="bi bi-person-add" />
                    </Button>
                </Form.Group>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Пользователь</th>
                        <th>Роль</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {listUsers}
                </tbody>
            </Table>
            </>
        )
    }

    return(
        <Container>
            <ModalAutoComplete 
                title={"Предоставить доступ пользователю"} 
                placeholder="Начните вводить для поиска"
                show={showModalEntityUser} 
                callBack={actionCallBackModalAddUserProject} 
                fetcher={fetchUsers}
                data={User.userList}/>

            <ModalAutoComplete 
                title={"Укажите права пользователю"} 
                placeholder="Начните вводить для поиска"
                show={showModalEntityUserRole} 
                callBack={acctionCallBackModalAddRoleUser} 
                fetcher={fetchUserRole}
                data={userRoleListOptions}/>

            <Row>
                <Col>
                    <Navbar />
                    <hr/>
                </Col>
            </Row>
            <Row>
                <Col>
                <Breadcrumb 
                    items={[
                        {url:`/task`, name: "Мои проекты"}, 
                        {url:``, name: Project.project?.project_name.trim()?Project.project.project_name:noText} 
                    ]}
                />
                </Col>
            </Row>
            <Row>
                <Col>
                    { Header() }
                </Col>
            </Row>
            <Row>
                <Col>
                    { CreatedDate() }
                </Col>
            </Row>
            <Row>
                <Col>
                    { AccessTable() }
                </Col>
            </Row>
        </Container>
    )    
}

export default TaskProjectActivity;