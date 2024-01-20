import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { postSprint, getSprintDetail } from "../../../network/SprintNetwork";
import { getProject } from "../../../network/TaskNetwork";
import { addProject, addSprint } from '../../../reducers/Project';
import TabBar from "../TabBar";
import moment from 'moment-timezone';
import 'moment/locale/ru';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

const noText = "Проект без названия";
const statusMap = { 0 : "Открыт", 1 : "Закрыт"}

function SprintUpdate(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const Project = useSelector((state) => state.project);

    const [dateStart, setDateStart] = useState(null);
    const [dateEnd, setDateEnd] = useState(null);
    const [status, setStatus] = useState(null);
    // Date.parse(Project.sprint.date_start?Project.sprint.date_start:
    const { project_id, sprint_id } = useParams();

    useEffect(() => {
        // Загрузка спринта
        getSprintDetail({project_id, sprint_id}, (err,resp) => {
            if (!err) {
                dispatch(addSprint(resp));
                setDateStart(new Date(resp.date_start))
                setDateEnd(new Date(resp.date_end))
                setStatus({value : resp.status, label : statusMap[resp.status]})
            } else {
                alert("Ошибка: "+err);
            }
        })
    }, [])


    useEffect(() => {
        // загрузка данных о проекте
        if (!Project.project.project_id) {
            getProject({project_id},(err,resp) => {
                if (!err) {
                    dispatch(addProject(resp));
                } else {
                    alert("Ошибка: "+err);
                }
            });
        }
    },[])

    const handleSubmit = (e) => {
       e.preventDefault();
       postSprint(
           {   
                project_id : project_id,
                sprint_id : sprint_id,
                sprint_name :  e.target.formSprintName.value,
                date_start : dateStart.toISOString(),
                date_end : dateEnd.toISOString(),
                status : status.value
           }, 
           (err,resp) => {
               if (!err) {
                   navigate(`/project/${project_id}/sprint`)
               }
           }
       );
   }

   const handleDelete = (e) => {
    e.preventDefault();
       postSprint(
           {   
                project_id : project_id,
                sprint_id : sprint_id,
                is_deleted : "Y"
           }, 
           (err,resp) => {
               if (!err) {
                   navigate(`/project/${project_id}/sprint`)
               }
           }
       );
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
        <Breadcrumb 
            items={[
                {url:`/project`, name: "Мои проекты"},
                {url:`/project/${project_id}/sprint`, name: Project.project?.project_name.trim()?Project.project.project_name:noText},
                {url:`/project/add`, name: `Спринт ${moment(Project.sprint.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')} - ${moment(Project.sprint.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')}`}
            ]}
        />
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col lg={6}>
        <form onSubmit={handleSubmit}>
        <Row>
            <Col>
                <Form.Group className="mb-3" controlId="formSprintName">
                <Form.Control 
                    controlid="formSprintName"
                    type="text" 
                    defaultValue={Project.sprint.sprint_name}
                    placeholder="Название спринта" />
                </Form.Group>
            </Col>
        </Row>
        <Row>
            <Col>
            <Form.Group className="mb-3">
                <div><small>Дата начала</small></div>
                <DatePicker 
                    wrapperClassName="datePicker" 
                    selected={dateStart} 
                    onChange={(date) => setDateStart(date)} dateFormat="d.MM.yyyy"
                />
            </Form.Group>
            </Col>
            <Col>
            <Form.Group className="mb-3">
                <div><small>Дата окончания</small></div>
                <DatePicker 
                    wrapperClassName="datePicker" 
                    selected={dateEnd}
                    onChange={(date) => setDateEnd(date)}
                    dateFormat="d.MM.yyyy"/>
            </Form.Group>
            </Col>
        <Row>
            <Col lg={6}>
                <Form.Group className="mb-3">
                <Select 
                    // isMulti 
                    closeMenuOnSelect={true} 
                    onChange={(option) => {
                        setStatus(option)
                    }}
                    value={status}
                    placeholder="Статус" 
                    options={[{value : 0, label : "Открыт"},{value : 1, label : "Закрыт"}]}
                />
                </Form.Group>
            </Col>
        </Row>
            
        </Row>
        
        <Row>
            <Col>
                <Form.Group className="mb-3">
                    <Button type="submit" variant="outline-success" >Сохранить изменения</Button>
                    <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={handleDelete}><i className="bi bi-trash"></i></Button>
                </Form.Group>
            </Col>
        </Row>  
        </form>
            
        </Col>
    </Row>
    </Container>
    );
}


export default SprintUpdate;
