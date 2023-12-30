import { useDrag } from 'react-dnd'
import Card from 'react-bootstrap/Card';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function DragTaskCard(props) {
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
					task_id : item.task_id
				});
			}
    	},
    }))

	return (
		<a href={`/project/${props.project_id}/task/${props.task_id}/`} style={{textDecoration: "none", color: "inherit"}}>
			<Card onClick={props.onClick}
				ref={drag} 
				style={{textWrap: "balance", margin: "4px", cursor: "pointer"}}>
				<Card.Body>
					<div style={{fontSize: "0.9em", fontWeight: "500"}}>
						{props.task_title}
					</div>
					<div>
						<p className="mb-1" style={{fontSize: "0.8em"}}>
							{props.ru_executor_id?<><i className="bi bi-person"></i> {props.ru_executor_login} &nbsp;</> :""}
							{/* {props.ru_responsible_id?<><i className="bi bi-person-check"></i> {props.ru_responsible_login} &nbsp;</> :""}
							{props.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {props.ru_reviewer_login} &nbsp;</> :""} */}
						</p>
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
