import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import {Form, Card} from 'react-bootstrap';

function ChatDialog(props) {

    // const onChatDialogClick = (chat_id) => {
    //     // ...
    // }

    const items = <>
    
        <div class="d-flex justify-content-start mb-4">
            <div class="p-3 bg-light rounded-3 shadow-sm" style="max-width: 75%;">
                <p class="small mb-0">Hello! How are you today? I'm using Bootstrap to style this chat interface.</p>
                <p class="small text-muted mb-0 text-end mt-1">00:06 AM</p>
            </div>
        </div>

    
        <div class="d-flex justify-content-end mb-4">
            <div class="p-3 bg-primary text-white rounded-3 shadow-sm" style="max-width: 75%;">
                <p class="small mb-0">I'm great, thanks for asking! Bootstrap makes this pretty simple with flexbox utilities.</p>
                <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
            </div>
        </div>
        </>

    return (
        <Card>
                            {/* <Card.Header>Чатик с кем то <i class="bi bi-info-circle"></i> </Card.Header> */}
                            <Card.Body style={{padding: "0px"}}>
                            <div style={{overflow: "auto"}}>
                                <div style={{
                                    verticalAlign: "top",
                                    // minHeight : "400px",
                                    height :"66vh",
                                    overflow: "auto",
                                    scrollbarWidth: "thin"
                                }}>
        <div style={{paddingLeft: "8px"}} >
            <p class="small mb-0 mt-1"><b>Предеин Анатолий @predeinay:</b></p>
        </div>
        <div style={{paddingLeft: "10px"}} class="d-flex justify-content-start mb-2">
            <div class="p-3 bg-light rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                <p class="small mb-0">Hello! How are you today? I'm using Bootstrap to style this chat interface.</p>
                <p class="small text-muted mb-0 text-end mt-1">00:06 AM</p>
            </div>
        </div>

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
        <div style={{paddingRight: "10px"}} class="d-flex justify-content-end mb-2">
            <div style={{maxWidth: "75%"}}>
                <div style={{paddingLeft: "0px"}} >
                    <p class="small mb-0 mt-1"><b>Предеин Анатолий @predeinay:</b></p>
                </div>
                <div class="p-3 bg-primary text-white rounded-3 shadow-sm">
                    <p class="small mb-0">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                    </p>
                    <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
                </div>
                
            </div>
        </div>
        <div style={{paddingRight: "10px"}} class="d-flex justify-content-end mb-2">
            <div style={{maxWidth: "75%"}}>
                <div style={{paddingLeft: "0px"}} >
                    <p class="small mb-0 mt-1"><b>Василий @vasya:</b></p>
                </div>
                <div class="p-3 bg-primary text-white rounded-3 shadow-sm">
                    <p class="small mb-0">I'm great, thanks for asking! Bootstrap makes this pretty simple with flexbox utilities.</p>
                    <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
                </div>
                
            </div>
        </div>
        <div style={{paddingLeft: "10px"}} class="d-flex justify-content-start mb-2">
            <div class="p-3 bg-light rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                <p class="small mb-0">Hello! How are you today? I'm using Bootstrap to style this chat interface.</p>
                <p class="small text-muted mb-0 text-end mt-1">00:06 AM</p>
            </div>
        </div>
        <div style={{paddingRight: "10px"}} class="d-flex justify-content-end mb-2">
            <div class="p-3 bg-primary text-white rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                <p class="small mb-0">I'm great, thanks for asking! Bootstrap makes this pretty simple with flexbox utilities.</p>
                <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
            </div>
        </div>
        <div style={{paddingRight: "10px"}} class="d-flex justify-content-end mb-2">
            <div class="p-3 bg-primary text-white rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                <p class="small mb-0">I'm great, thanks for asking! Bootstrap makes this pretty simple with flexbox utilities.</p>
                <p class="small text-white-50 mb-0 text-end mt-1">00:07 AM</p>
            </div>
        </div>
                                </div>
                            </div>
                            
                            </Card.Body>
                            </Card>
    )
}
export default ChatDialog;