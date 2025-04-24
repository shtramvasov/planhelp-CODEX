import { useRef } from "react";
import { useDrag, useDrop } from 'react-dnd'
import Card from 'react-bootstrap/Card';
import {Badge} from 'react-bootstrap';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function DragTaskCard(props) {
	const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(() => ({
      	type: 'CARD',
        item: { 
			status_id : props.status_id, 
			project_id : props.project_id, 
			task_id : props.task_id 
		},
		collect: (monitor) => ({
        	isDragging: monitor.isDragging()
    	}),
    	end: (item, monitor) => {
      		const dropResult = monitor.getDropResult()
			if (item && dropResult) {
				props.onDropTask({
					project_id : item.project_id,
					status_id : dropResult.status_id,
					task_id : item.task_id,
					prev_task_id : dropResult.task_id
				});
			}
    	},
    }))

	const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: "CARD",
        drop: (item, monitor) => { 
            return { 
                name: props.status_name, 
                status_id : props.status_id,
				task_id : props.task_id
            } 
        },
		hover: (item, monitor) => {
            monitor.isOver({ shallow: true })
        },
        collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
			isOverCurrent: monitor.isOver({ shallow: false }),
		}),
	}));

	
	drop(drag(ref));

	const commentsCount = props.comments_files_count.split(":")[0];

	return (
		<a ref={ref} href={`/project/${props.project_id}/task/${props.task_id}/`} style={{textDecoration: "none", color: "inherit"}}>
			<Card onClick={props.onClick}
				// ref={ref} перенес отсюда выше в <a> и так заработало в firefox
				key={props.task_id}
				style={{whiteSpace: "normal", textWrap: "balance", wordBreak: "break-word", margin: "4px", cursor: "pointer", overflow: "auto", scrollbarWidth: "thin"}}>
				<Card.Body>
					<div style={{color: "gray",fontSize : "0.7em"}}>
						#{props.task_id}
					</div>
					<div style={{fontSize: "0.9em", fontWeight: "500"}}>
						{props.task_title}
					</div>
					<div>
						<p className="mb-1" style={{fontSize: "0.8em"}}>
							{props.ru_executor_id?<><i className="bi bi-person"></i> {props.ru_executor_login} &nbsp;</> :""}
							{commentsCount != 0? 
								<>
									<i style={{color: "#555"}}className="bi bi-chat-text-fill"></i> {commentsCount}
								</>
								: ""}
							{/* <i style={{color: "#555"}}className="bi bi-file-earmark-text-fill"></i> {props.comments_files_count.split(":")[1]} */}

							{/* {props.ru_responsible_id?<><i className="bi bi-person-check"></i> {props.ru_responsible_login} &nbsp;</> :""}
							{props.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {props.ru_reviewer_login} &nbsp;</> :""} */}
							{/* {
							props.date_start ? 
								<i className="bi bi-circle-fill" style={{fontSize: "0.8em", color : 
									moment(props.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').diff(moment(),'days') < 0 ? "red" : 
									moment(props.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').diff(moment(),'days') < 2 ? "yellow" : "green"
								}}></i>
							: ""
							} */}
						</p>
					</div>
					<div>
						{props.tags_str?.split(',').map((el) =>
							<div key={el} style={{display: "inline", paddingRight: "6px"}}>
								<Badge bg="secondary"> 
									{el}
								</Badge>
							</div>
						)}
					</div>
					{/* <div>
						{<small>{moment(props.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>}
					</div> */}
				</Card.Body>
			</Card>
		</a>
      )
}

export default DragTaskCard;
