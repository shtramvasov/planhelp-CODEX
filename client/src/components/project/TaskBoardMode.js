import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React from 'react';
import DropStatusLane from "./board/DropStatusLane";
import DragTaskCard from "./board/DragTaskCard";
import { getTask, postTask, getProject, postTaskCommonNote } from '../../network/TaskNetwork';

function TaskBoardMode(props) {
	const actionCallModaTaskEdit = props.actionCallModaTaskEdit;
	const Project = useSelector((state) => state.project);

	const onChangeStatus = ({project_id, task_id, status_id}) => {
		postTask({ project_id, task_id, status_id}, (err,resp) => {
			if (!err) {
				// fetchTask();
			} else {
				// alert("Ошибка: "+err);
			}
		})    
	}
	const projectStatus = {};
	const statusLaneList = Project.project.project_status_list.map((el) => {
		projectStatus[el.status_id] = [];
		return (
			<DropStatusLane 
				key={el.status_id}
        		status_id={el.status_id} 
        		status_name={el.status_name}
				variant={el.variant}
				taskList={projectStatus[el.status_id]}
				// onDropTask={onChangeStatus}
			/>
		)
	});
	Project.taskList.map((el) => {
		if (projectStatus[el.status_id]) {
			projectStatus[el.status_id].push(
				<DragTaskCard
					onClick={(e) => {actionCallModaTaskEdit(e, {project_id : el.project_id, task_id : el.task_id})}} 
					key={el.task_id} 
					task_title={el.task_title}
					task_id={el.task_id}
					project_id={el.project_id}
					created_on={el.created_on}
					ru_executor_id={el.ru_executor_id}
					ru_responsible_id={el.ru_responsible_id}
					ru_reviewer_id={el.ru_reviewer_id}
					ru_executor_login={el.ru_executor_login}
					ru_responsible_login={el.ru_responsible_login}
					ru_reviewer_login={el.ru_reviewer_login}
					onDropTask={onChangeStatus}
				/>
			);
		}
	});

    return (
        <div>
			<div style={{overflow: "auto", whiteSpace: "nowrap", minHeight: "600px"}}>
				{statusLaneList}
			</div>
			{/* {taskCardList} */}
        </div>
	) 
    
}


export default TaskBoardMode;