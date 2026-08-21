import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addEntity, addEntityActivity, addEntityUsers } from '../../reducers/Disk'
import { addUserList } from '../../reducers/User'
import { useNavigate , useSearchParams, NavLink} from "react-router-dom";
import { getDiskEntity, deleteDiskEntityUser, getDiskEntityActivity, getDiskEntityUsers, addDiskEntityUser } from '../../network/DiskNetwork';
import { getUsers } from '../../network/UserNetwork';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import moment from 'moment-timezone';
import Breadcrumb from "../helpers/Breadcrumb";
import 'moment/locale/ru';
import { getColorChatGradient, getShortChatName } from '../helpers/Chat';
moment.locale('ru');


function DiskActivity(props) {
    const { entity_id } = useParams();
    // const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const User = useSelector((state) => state.user);
    const Chat = useSelector((state) => state.chat);
    const userRoleList = [
        {display_val:"Полные права",return_val:"OWNER"},
        {display_val:"Запись",return_val:"WRITE"},
        {display_val:"Только чтение",return_val:"READ"}
    ];
    const [userRoleListOptions, setUserRoleList] = useState(userRoleList);
    const [selectedUserId, setSelectedUserId] = useState(false);

    // Модалка для выбора юзера при указании прав
    const [showModalEntityUser, setShowModalEntityUser] = useState(false);
    // Модалка для выбора роли для юзера при указании прав
    const [showModalEntityUserRole, setShowModalEntityUserRole] = useState(false);

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const fetchEntityActivity = () => {
        getDiskEntityActivity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityActivity(resp));    
                // console.log(resp);
            } else {
                alert("Ошибка: "+err);
            }
        });
    }; 

    const fetchEntityUsers = () => {
        getDiskEntityUsers({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityUsers(resp));    
                // console.log(resp);
            } else {
                alert("Ошибка: "+err);
            }
        });
    }; 

    // Фетчер для контекстного поиска юзера при указании прав
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
    }

    // Фетчер для контекстного поиска роли при указании прав для юзера
    const fetchUserRole = (search, cb) => {
        if (!search) {
            setUserRoleList(userRoleList);
            return;
        }
        const filtered = userRoleList.filter(
            el => el.display_val.toUpperCase().indexOf(search.toUpperCase()) >= 0 
        );
        setUserRoleList(filtered);
    }

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
        fetchEntityActivity();
        fetchEntityUsers();
    },[entity_id]);

    const handleCancelEntity = () => {
        if (Disk.entity.entity_type === 'PATH') {
            navigate(`/disk/${Disk.entity.entity_id}`);
        } else if (Disk.entity.entity_type === 'FILE') {
            navigate(`/disk/${Disk.entity.entity_id}/file/read`);
        } else {
            navigate(`/disk/${Disk.entity.entity_id}/spreadsheet`);
        }
    }

    const handleRevokeUser = (user_id) => {
        deleteDiskEntityUser({entity_id : entity_id, user_id : user_id}, (err,resp) => {
            if (!err) {
                fetchEntityUsers();
            } else {
                alert("Ошибка: "+err);
            }
        })
    }

    const actionCallModalNewEntityUser = (e) => {
        e.preventDefault();
        dispatch(addUserList([]));
        setShowModalEntityUser(true);
    }

    const actionCallModalNewEntityUserCallback = (user_id) => {
        setShowModalEntityUser(false);
        if (!user_id) return;
        setSelectedUserId(user_id);
        setShowModalEntityUserRole(true);
    }

    const actionCallModalNewEntityUserRoleCallback = (user_role) => {
        setShowModalEntityUserRole(false);
        if (!user_role) return;
        if (!selectedUserId) return;
        addDiskEntityUser({entity_id : entity_id, user_id : selectedUserId, user_role : user_role}, (err,resp) => {
            if (!err) {
                fetchEntityUsers();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    const listItems = Disk.entityActivity.map((el) =>
        <tr key={el.activity_id}>
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
            <td>{el.entity_name_old}</td>
            {Disk.entity.entity_type === 'FILE' ?
            <td>
            <NavLink to={`/disk/${entity_id}/activity/${el.activity_id}`}>
                Контент
            </NavLink>
            </td>:""}
            <td>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</td>
        </tr>
    );

    const listUsers = Disk.entityUsers.map((el) =>
    <tr key={el.user_id + "_" + el.entity_id}>
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
        <td>{el.entity_id == entity_id ? "Этот документ" :
            <NavLink to={`/disk/${el.entity_id}`}>
                {el.entity_name}
            </NavLink>}</td>
        <td><Badge bg="primary">{el.user_role}</Badge></td>
        <td>{el.is_editable?
            <Button type="button" variant="outline-danger" onClick={() => handleRevokeUser(el.user_id)}>
                <i className="bi bi-trash3"></i>
            </Button>
            :""}</td>

    </tr>
    );

    return (
    <Container fluid>
    <ModalAutoComplete 
        title={"Предоставить доступ пользователю"} 
        placeholder="Начните вводить для поиска"
        show={showModalEntityUser} 
        callBack={actionCallModalNewEntityUserCallback} 
        fetcher={fetchUsers}
        data={User.userList}/>
    <ModalAutoComplete 
        title={"Укажите права пользователю"} 
        placeholder="Начните вводить для поиска"
        show={showModalEntityUserRole} 
        callBack={actionCallModalNewEntityUserRoleCallback} 
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
            items={Disk.entity.breadcrumb?.map(
                (item, i) => {return {url:`/disk/${item.entity_id}`, name: item.entity_name}})}
        />
        </Col>
    </Row>
    <Row>
        <Col>
            <div style={{float:"left",paddingRight:"4px"}}>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary"onClick={handleCancelEntity} ><i className="bi bi-chevron-left"></i></Button>
            </Form.Group>
            </div>
            <div>
            <h2>Свойства для {Disk.entity.entity_name}</h2>
            </div>
        </Col>
        <Row>
            <Col>
                Создал {Disk.entity.login} {
                moment(Disk.entity.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()
                }
                <hr/>
            </Col>
        </Row>
        <Row>
            <Col>
            <div style={{float:"left",paddingRight:"4px"}}>
            <h3>Доступ</h3>
            </div>
            <div>
            <Form.Group className="mb-3">
                <Button type="button" variant="" onClick={actionCallModalNewEntityUser} >
                    <i className="bi bi-person-add"></i>
                </Button>
            </Form.Group>
            </div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Пользователь</th>
                            <th>Документ</th>
                            <th>Роль</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {listUsers}
                    </tbody>
                </Table>
            </Col>
        </Row>
        <br/>
        <br/>
        <Row>
            <Col>
                <h3>История</h3>
                <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Пользователь</th>
                        <th>Прошлое название</th>
                        {Disk.entity.entity_type === 'FILE'?<th>Прошлый контент</th>:""}
                        <th>Дата изменения</th>
                    </tr>
                </thead>
                <tbody>
                    {listItems}
                </tbody>
                </Table>
            </Col>
        </Row>
    </Row>
    </Container>
    );
}


export default DiskActivity;