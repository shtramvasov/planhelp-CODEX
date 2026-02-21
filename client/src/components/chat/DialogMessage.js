import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import {Form, Card} from 'react-bootstrap';

function DialogMessage(props) {

    return (
        <>
        <div style={{paddingLeft: "8px"}} >
            <p class="small mb-0 mt-1"><b>Предеин Анатолий @predeinay:</b></p>
        </div>
        <div style={{paddingLeft: "10px"}} class="d-flex justify-content-start mb-2">
            <div class="p-3 bg-light rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                <p class="small mb-0">Hello! How are you today? I'm using Bootstrap to style this chat interface.</p>
                <p class="small text-muted mb-0 text-end mt-1">00:06 AM</p>
            </div>
        </div>

        {/* right */}
        <div style={{paddingRight: "10px"}} class="d-flex justify-content-end mb-2">
            <div style={{maxWidth: "75%"}}>
                <div style={{paddingLeft: "0px"}} >
                    <p class="small mb-0 mt-1"><b>Предеин Анатолий @predeinay:</b></p>
                </div>
                <div class="p-3 bg-primary text-white rounded-3 shadow-sm">
                    <p class="small mb-0">I'm great, thanks for asking! Bootstrap makes this pretty simple with flexbox utilities.</p>
                    <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
                </div>
                
            </div>
        </div>
        </>
    )
}
export default DialogMessage;