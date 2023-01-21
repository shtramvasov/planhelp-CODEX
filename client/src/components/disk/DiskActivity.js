import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addEntity, addEntityActivity } from '../../reducers/Disk'
import { useNavigate , useSearchParams, NavLink} from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity, getDiskEntityActivity } from '../../network/DiskNetwork';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

function DiskActivity(props) {
    const { entity_id } = useParams();
    // const [ searchParams ] = useSearchParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

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

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
        fetchEntityActivity();
    },[entity_id]);

    const handleCancelEntity = () => {
        if (Disk.entity.entity_type === 'PATH') {
            navigate(`/disk/${Disk.entity.entity_id}`);
        } else {
            navigate(`/disk/${Disk.entity.entity_id}/file/read`);
        }
    }

    const handleActivityOld = (activity_id) => {
        
        navigate(`/disk/${entity_id}/activity/${activity_id}`);
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
            <td>{el.created_on}</td>
        </tr>
    );

    return (
        <Container>
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
            <h2>История изменений для {Disk.entity.entity_name}</h2>
            </div>
        </Col>
        <Row>
            <Col>
                Создал: {Disk.entity.login} {Disk.entity.created_on}
            </Col>
        </Row>
        <br/>
        <br/>
        <Row>
            <Col>
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