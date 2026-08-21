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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Breadcrumb from "../helpers/Breadcrumb";

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

    // Создаем объект <table> со стилями bootstrap, для использования его в markdown
    const MarkdownTable = props => {
        return (<table className="table table-bordered"> {props.children} </table>)
    }

    const MardownObject = (props) => {
        // 1. components: прокидываем свои html объекты
        // 2. children: markdown -> стилевый текст
        // 3. remarkPlugins: плагины для поддержки таблиц, стилей текста
        return <ReactMarkdown components={{ table: MarkdownTable }} children={ props.value } remarkPlugins={[remarkGfm]} /> 
    }

    return (
        <Container fluid>
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
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary"onClick={handleBack} ><i className="bi bi-chevron-left"></i></Button>
            </Form.Group>
            </div>
            <div>
            <h2>Версия файла {Disk.entity.entity_name}</h2>
            </div>
        </Col>
        <Row className="pt-0 p-4">
            <Col lg={12} className="shadow p-3 bg-white rounded">
            {/* hack for \n for reactMarkdown replace(/\n/gi, '  \n') */}
            {/* replace all \n for space + space + \n */}
            <MardownObject value = {(Disk.entityActivityOld.entity_note_old)?.replace(/\n/gi, '  \n')} />
            </Col>
        </Row>

    </Row>
    </Container>
    );
}


export default DiskActivityOld;