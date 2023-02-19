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
import moment from 'moment';
import 'moment/locale/ru';
moment.locale('ru');

function DiskActivity(props) {
    const { entity_id } = useParams();
    // const [ searchParams ] = useSearchParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [showModalEntityUser, setShowModalEntityUser] = useState(false);

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
        } else {
            navigate(`/disk/${Disk.entity.entity_id}/file/read`);
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
        addDiskEntityUser({entity_id : entity_id, user_id : user_id, user_role : "WRITE"}, (err,resp) => {
            if (!err) {
                fetchEntityUsers();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    const listItems = Disk.entityActivity.map((el) =>
        <tr key={el.activity_id}>
            <td>{el.login}</td>
            <td>{el.entity_name_old}</td>
            {Disk.entity.entity_type === 'FILE'?
            <td>
            <NavLink to={`/disk/${entity_id}/activity/${el.activity_id}`}>
                Контент
            </NavLink>
            </td>:""}
            <td>{moment(el.created_on).fromNow()}</td>
        </tr>
    );

    const listUsers = Disk.entityUsers.map((el) =>
    <tr key={el.user_id}>
        <td>{el.login}</td>
        <td><Badge bg="primary">{el.user_role}</Badge></td>
        <td>{el.is_editable?
            <Button type="button" variant="outline-danger" onClick={() => handleRevokeUser(el.user_id)}>
                <i className="bi bi-trash3"></i>
            </Button>
            :""}</td>

    </tr>
    );

    return (
    <Container>
    <ModalAutoComplete 
        title={"Предоставить доступ пользователю"} 
        placeholder="Начните вводить для поиска"
        show={showModalEntityUser} 
        callBack={actionCallModalNewEntityUserCallback} 
        fetcher={fetchUsers}
        data={User.userList}/>
    <Row>
        <Col>
            <Navbar />
            <hr/>
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
                Создал {Disk.entity.login} {moment(Disk.entity.created_on).fromNow()}
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