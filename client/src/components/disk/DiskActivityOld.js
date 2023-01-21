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
import { addEntity, addEntityActivity, addEntityActivityOld } from '../../reducers/Disk'
import { useNavigate , useSearchParams} from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity, getDiskEntityActivity, getDiskEntityActivityOld } from '../../network/DiskNetwork';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

function DiskActivityOld(props) {
    const { entity_id,activity_id } = useParams();
    // const [ searchParams ] = useSearchParams();
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

    const fetchActivityOld = () => {
        getDiskEntityActivityOld({entity_id : entity_id, activity_id : activity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityActivityOld(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchActivityOld();
        fetchEntity();
    },[entity_id]);

    const handleBack = () => {
        navigate(`/disk/${entity_id}/activity`);
    }
    console.log(Disk);
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
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary"onClick={handleBack} ><i className="bi bi-chevron-left"></i></Button>
            </Form.Group>
            </div>
            <div>
            <h2>Версия файла {Disk.entity.entity_name}</h2>
            </div>
        </Col>
        <Row>
            <Col>
                <div style={{paddingTop: "20px",whiteSpace: "pre-line"}}>
                    {convert(Disk.entityActivityOld.entity_note_old)}
                </div>
            </Col>
        </Row>

    </Row>
    </Container>
    );
}


export default DiskActivityOld;