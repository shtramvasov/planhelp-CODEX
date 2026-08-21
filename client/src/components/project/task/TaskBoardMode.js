import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import DropStatusLane from "./board/DropStatusLane";
import DragTaskCard from "./board/DragTaskCard";
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { addTask, dndTask, addTaskList, appendTaskList } from '../../../reducers/Project';
import { getTask, postTask, getProjectTaskList, getProject, postTaskCommonNote } from '../../../network/TaskNetwork';
import { Card } from 'react-bootstrap';
import { PaginationDefault } from '../../constants/Pagination';

function TaskBoardMode(props) {

	const [ searchParams ] = useSearchParams();
	const dispatch = useDispatch();
    const { project_id } = useParams();

	const [{limit , offset}, setPagination] = useState({limit : PaginationDefault.limit, offset : PaginationDefault.offset});

	const actionCallModaTaskEdit = props.actionCallModaTaskEdit;
	const Project = useSelector((state) => state.project);
	
	// const limit = searchParams.get("limit");
    // const offset = searchParams.get("offset")?searchParams.get("offset"):undefined;
    const executor_id = searchParams.get("executor_id");
    const responsible_id = searchParams.get("responsible_id");
    const reviewer_id = searchParams.get("reviewer_id");
    const status_id = searchParams.get("status_id");
    const tag_id = searchParams.get("tag_id");
    
	const date_start = searchParams.get("date_start");
	const date_end = searchParams.get("date_end");
	const search = searchParams.get("search"); 

    useEffect(() => {
		setPagination({limit : PaginationDefault.limit, offset : PaginationDefault.offset});
		if (Project.project.project_id) {
			fetchProjectTaskList();
		}
    },[executor_id, status_id, responsible_id, reviewer_id, tag_id, Project.project.project_id, date_start, date_end, search]);

	useEffect(() => {
		if (offset) {
			const closed_status_ids = Project.project.project_status_list.filter((status) => {
				return status.is_closed === 'Y'
			});
			// console.log(Project.taskList);
			getProjectTaskList({
				limit,offset, // закрытые задачи c пагинацией
				project_id,
				status_ids : closed_status_ids[0].status_id, 
				executor_id, responsible_id, reviewer_id, tag_id,
				date_start, date_end,
				sort : "orderby_time"
			},(err,resp_closed) => {
				if (!err) {
					dispatch(addTaskList(Project.taskList.concat(resp_closed))); /// ?????
				} else {
					alert("Ошибка: "+err);
				}
			});
			// alert(limit +","+ offset);
		}
	},[offset])

	// достаем задачи с апи
	const fetchProjectTaskList = () => {
		const open_status_ids = Project.project.project_status_list.filter((status) => {
			return status.is_closed !== 'Y'
		});
		const closed_status_ids = Project.project.project_status_list.filter((status) => {
			return status.is_closed === 'Y'
		});
		getProjectTaskList({
			limit:"", offset:"", // не закрытые задачи без пагинации
			project_id,
			status_ids : open_status_ids.map((status) => status.status_id).join(','),
			executor_id, responsible_id, reviewer_id, tag_id,
			date_start, date_end, search,
			sort : "orderby_time"
		},(err,resp_open) => {
			if (!err) {
				getProjectTaskList({
					limit : PaginationDefault.limit,offset : PaginationDefault.offset, // закрытые задачи c пагинацией
					project_id,
					status_ids : closed_status_ids[0].status_id, 
					executor_id, responsible_id, reviewer_id, tag_id,
					date_start, date_end, search,
					sort : "orderby_time"
				},(err,resp_closed) => {
					if (!err) {
						dispatch(addTaskList(resp_open.concat(resp_closed)));
					} else {
						alert("Ошибка: "+err);
					}
				});
			} else {
				alert("Ошибка: "+err);
			}
		});
	};

	const onDropTask = ({project_id, task_id, status_id, prev_task_id}) => {
		postTask({ project_id, task_id, status_id, prev_task_id}, (err,resp) => {
			if (!err) {
				getTask({project_id, task_id},(err,resp) => {
					if (!err) {
						dispatch(addTask(resp));
						// Если сместили таску на позицию другой таски
						if (prev_task_id) {
							dispatch(dndTask({from : task_id, to: prev_task_id}));
						}
					} else {
						alert("Ошибка: "+err);
					}
				});
			} else {
				alert("Ошибка: "+err);
			}
		})    
	}
	
	// компонент для "Загрузить еще", передается пропсом в столбец закрытых заявок
	const loadMoreComponent = () => {
		return (<Card.Footer>
			<a href="#" onClick={(e) => {
				e.preventDefault();
				const newOffset = offset + PaginationDefault.limit;
				setPagination({limit, offset: newOffset});
			}}
			style={{fontSize: "0.9em"}} className="phLink">Загрузить еще</a>
		</Card.Footer>)
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
				// "Загрузить еще" только для закрывающего статуса
				loadMoreComponent={ el.is_closed === 'Y' ? loadMoreComponent: "" }
				
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
					comments_files_count={el.comments_files_count}
					tags_str={el.tags_str}
					date_start={el.date_start}
					date_end={el.date_end}
					status_id={el.status_id}
					onDropTask={onDropTask}
				/>
			);
		}
	});

    return (
        <div>
			<div style={{overflow: "auto", whiteSpace: "nowrap"}}>
				{statusLaneList}
			</div>
        </div>
	) 
    
}


export default TaskBoardMode;