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
import { useNavigate } from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity } from '../../network/DiskNetwork';
import { useParams } from 'react-router-dom';

function DiskFile(props) {
    const { entity_id , mode} = useParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

    const  convert = (text) => {
        if (!text) return;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex)
           .map(part => {
              if(part.match(urlRegex)) {
                 return <a href={part}>{part}</a>;
              }
              return part;
           });
    }

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const deleteEntity = () => {
        deletetDiskEntity({entity_id}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        })
    }

    const handleEditClick = () => {
        navigate(`/disk/${entity_id}/file/edit`);
    }

    const handleCancelClick = () => {
        navigate(`/disk/${entity_id}/file/read`);
    }

    const handleDeleteClick = () => {
        deleteEntity();
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(e.target.formEntityName.value);
        // console.log(e.target.formEntityNote.value);
        
        postDiskEntity(
            {   
                entity_id : entity_id,
                entity_name : e.target.formEntityName.value,
                entity_note : e.target.formEntityNote.value,
                // parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    handleCancelClick();
                    fetchEntity();
                }
            }
        );
    }

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
    },[entity_id]);

    return (
    <Container>
    <Row>
        <Col>
            <Navbar />
            <hr/>            
        </Col>
    </Row>
    {mode==="read"?
    <div>
    <Row>
        <Col xs={10}>
            <h2>{Disk.entity.entity_name}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <div style={{paddingTop: "20px",whiteSpace: "pre-line"}}>
                {convert(Disk.entity.entity_note)}
            </div>
        </Col>
        <Col xs={2}>
            <div>
                <a href="#" onClick={handleEditClick}>Редактировать</a>
            </div>
        </Col>
    </Row>
    </div>
    :
    <form onSubmit={handleSubmit}>
    <Row>
        <Col xs={10}>
            <Form.Group className="mb-3" controlId="formEntityName">
            <Form.Control 
                controlid="formEntityName"
                defaultValue={Disk.entity.entity_name} 
                type="text" 
                placeholder="Название" />
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <div>
            <Form.Group className="mb-3" controlId="formEntityNote">
            <Form.Control
                as="textarea"
                defaultValue={Disk.entity.entity_note?Disk.entity.entity_note:""} 
                rows="40"
                style={{marginTop: "10px",width: "100%", border : "1px solid silver", padding : "15px"}}
            />
            </Form.Group>
            </div>
        </Col>
        <Col xs={2}>
            <div style={{marginTop : "2px"}}>
                <Button type="button" onClick={handleCancelClick}>Отменить</Button>
            </div>
            <div style={{marginTop : "2px"}}>
                <Button type="submit">Сохранить</Button>
            </div>
            <div style={{marginTop : "2px"}}>
                <Button type="button" variant="warning" onClick={handleDeleteClick}>Удалить</Button>
            </div>
        </Col>
    </Row>
    </form>
    }
    </Container>
    );
}


export default DiskFile;