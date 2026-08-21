import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Badge, Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { addUserToProject, delUserToProject, getProject } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { getUsers } from "../../../network/UserNetwork";
import { addUserList } from "../../../reducers/User";
import ModalAutoComplete from "../../helpers/ModalAutoComplete";
import TabBar from './TabBar';
import { Navbar } from '../../navbar/Navbar';
import Breadcrumb from "../../helpers/Breadcrumb";
import { getColorChatGradient, getShortChatName } from '../../helpers/Chat';
moment.locale('ru');

const noText = "Проект без названия";


function ProjectAccess(props) {

    const dispatch = useDispatch();

    const User = useSelector((state) => state.user);
    const Project = useSelector((state) => state.project.project);
    const Chat = useSelector((state) => state.chat);
    const { project_id } = useParams();

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

    const listUsers = Project.project_user_list.map((el) =>
        <tr key = {el.user_id}>
            <td>
                <div>
                    <div style={{paddingLeft: "10px", float : "left"}} className="d-flex justify-content-start mb-2">
                        {el.avatar_url ? 
                            <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px"}}>
                                <img className='chat-dialog-icon' src={el.avatar_url} />
                                {/* <b>{getShortChatName(chatDialog.chat_name)}</b> */}
                            </div>
                        :
                            <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px", background : getColorChatGradient(el.user_id)}}>
                                <b>{getShortChatName(el.username ? el.username : el.login)}</b>
                            </div>
                        }
                        {Chat.onLineClients[el.user_id] ? <div style={{position: "absolute", marginLeft : "26px", marginTop: "14px"}}><i className="bi bi-dot fs-1" style={{color: "green"}}></i></div>: ""}
                    </div>
                    <div>
                        &nbsp;{el.login + (el.username ? " ("+el.username+")" : "")}
                    </div>
                </div>
            </td>
            <td>
                <Badge bg="primary">{el.user_role}</Badge>
            </td>
            <td>
                { el.user_role !== 'OWNER' ?  
                <Button type="button" variant="outline-danger" onClick={() => fetchRevokeUser(el)}>
                    <i className="bi bi-trash3"></i>
                </Button> : ""
                }
            </td>
        </tr>
    )

    const AccessTable = () => {
        return (
            <>
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
    };

    return(
        <>
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
            <Container fluid>
            <Row>
                <Col>
                    <Navbar />
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Breadcrumb 
                        items={[
                            {url:`/`, name: "Мои проекты"}, 
                            {url:`/project/${project_id}/list`, name: Project.project_name},
                            {url:``, name: 'Настройка проекта'}
                        ]}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <TabBar />
                    <br/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div style={{float:"left", paddingRight:"4px"}}>
                        <h3> Настройки доступа </h3>
                    </div>
                    <div>
                        <Form.Group className="mb-3">
                            <Button type="button" variant="" onClick={ actionCallModalAddUserProject } >
                                <i className="bi bi-person-add" />
                            </Button>
                        </Form.Group>
                    </div>
                    { AccessTable() }
                </Col>
            </Row>
            </Container>
        </>
    )    
}

export default ProjectAccess;
