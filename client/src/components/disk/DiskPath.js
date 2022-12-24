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
import { addEntity } from '../../reducers/Disk'
import { useNavigate , useSearchParams} from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity } from '../../network/DiskNetwork';
import { useParams } from 'react-router-dom';

function DiskPath(props) {

    const { entity_id, mode } = useParams();
    const [ searchParams ] = useSearchParams();
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

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
    },[entity_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(e.target.formEntityName.value);
        // console.log(e.target.formEntityNote.value);
        
        postDiskEntity(
            {   
                entity_id : entity_id,
                entity_name : e.target.formEntityName.value,
                entity_type : "PATH"
            }, 
            (err,resp) => {
                // if (!err) {
                //     fetchEntity();
                // }
                navigate(`/disk/${Disk.entity.entity_id}`);
            }
        );
    }

    const handleDeleteEntity = () => {
        deletetDiskEntity({entity_id}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        })
    }

    const handleCancelEntity = () => {
        navigate(`/disk/${Disk.entity.entity_id}`);
    }

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
            <h2>Изменить папку</h2>
        </Col>
    </Row>
    <form onSubmit={handleSubmit}>
    <Row>
        <Col>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="submit" variant="outline-success" >Сохранить</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary"onClick={handleCancelEntity} >Отмена</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={handleDeleteEntity}>Удалить</Button>
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <Form.Group className="mb-3" controlId="formEntityName">
            <Form.Control 
                controlid="formEntityName"
                defaultValue={Disk.entity.entity_name} 
                type="text" 
                placeholder="Название" />
            </Form.Group>
        </Col>
    </Row>
    </form>
    </Container>
    );
}


export default DiskPath;