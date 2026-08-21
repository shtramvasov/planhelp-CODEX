import { useDrop } from 'react-dnd'
import { Card, Badge } from 'react-bootstrap';

function DropStatusLane(props) {
	
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: "CARD",
        drop: () => ({ name: props.status_name, status_id : props.status_id }),
        collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	}));

    return (
        <>
        {props.taskList.length === 0 ?
        <Card 
        	key={props.status_id}
			style={{
                display: "inline-block",
                width: "300px",
                marginRight: "2px",
                marginLeft: "2px",
				verticalAlign: "top",
                // minHeight : "400px",
                // height :"100vh",
                overflow: "auto",
                scrollbarWidth: "thin"
            }}
			ref={drop} >
			<Card.Header><Badge style={{fontWeight:"400"}} bg={props.variant}>{props.status_name}</Badge></Card.Header>
			<div style={{
                height :"93vh",
                overflow: "auto",
                scrollbarWidth: "thin"
            }}>
				{props.taskList}
                {props.loadMoreComponent ? <props.loadMoreComponent/> : ""}
			</div>
            
        </Card>
        : 
        <Card 
        	key={props.status_id}
			style={{
                display: "inline-block",
                width: "300px",
                marginRight: "2px",
                marginLeft: "2px",
				verticalAlign: "top",
                // minHeight : "400px",
                
            }}
			// ref={drop} 
            // no drop if exists tasks in lane
            >
			<Card.Header>
                <Badge style={{fontWeight:"400"}} bg={props.variant}>{props.status_name}</Badge>&nbsp;
                <Badge bg="white" text="secondary">{props.taskList.length}</Badge>
            </Card.Header>
			<div style={{
                height :"93vh",
                overflow: "auto",
                scrollbarWidth: "thin"
            }}>
				{props.taskList}
                {props.loadMoreComponent ? <props.loadMoreComponent/> : ""}
			</div>
            
        </Card>
        }
        </>
    )
}

export default DropStatusLane;
