import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function TaskListMode(props) {
    const Project = useSelector((state) => state.project);
    const actionCallModaTaskEdit = props.actionCallModaTaskEdit;
    // Список задачи
    const listItems = Project.taskList.map((el,index) => 
        <ListGroup.Item key={index} 
            action active={false} href={`/project/${el.project_id}/task/${el.task_id}/`} 
            onClick={(e) => {actionCallModaTaskEdit(e, {project_id : el.project_id, task_id : el.task_id})}} 
            variant={el.is_closed === "Y"? "secondary":""}>
                <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{el.task_title}</h6>
                    <small>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
                </div>
                <p className="mb-1" style={{fontSize: "0.8em"}}>
                    {el.executor_id?<><i className="bi bi-person"></i> {el.ru_executor_login} &nbsp;</> :""}
                    {el.ru_responsible_id?<><i className="bi bi-person-check"></i> {el.ru_responsible_login} &nbsp;</> :""}
                    {el.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {el.ru_reviewer_login} &nbsp;</> :""}
                    {
							el.date_start ? 
								<i class="bi bi-circle-fill" style={{fontSize: "0.8em", color : 
									moment(el.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').diff(moment(),'days') < 0 ? "red" : 
									moment(el.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').diff(moment(),'days') < 2 ? "yellow" : "green"
								}}></i>
							: ""
                    }
                </p>
                <div>
                    {el.tags_str?.split(',').map((el) =>
                        <div key={el} style={{display: "inline", paddingRight: "6px"}}>
                            <Badge bg="secondary"> 
                                {el}
                            </Badge>
                        </div>
                    )}
                </div>
                <small><Badge bg={el.status_id?el.variant:"secondary"}>{el.status_id?el.status_name:"Без статуса"}</Badge></small>
        </ListGroup.Item>
    );

    return (
    <Row>
        <Col>
            <ListGroup>
                {listItems}
            </ListGroup>
        </Col>
    </Row>
    );
}


export default TaskListMode;