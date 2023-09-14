import Form from 'react-bootstrap/Form';
import React, { useState , useEffect} from 'react';
import {Row,Col} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';

function LinkInput(props) {

    // props
    //  type "textField", "textArea", "selectList"
    //  placeholder 
    //  defaultValue
    //  callBack - function

    // for textArea custom
    //  rows

    const [isEdit, setIsEdit] = useState(false);
    const [value, setValue] = useState(false);

    const handleEdit = (e) => {
        e.preventDefault();
        setIsEdit(true);
    }

    const handleSumbit = (e) => {
        e.preventDefault();
        setIsEdit(false);
        props.callBack(value);
    }
    
    const onChange = (e) => {
        setValue(e.target.value);
    }

    const onChangeSelect = ({value, label}) => {
        setIsEdit(false);
        props.callBack(value, label);
    }

    const selectList = isEdit?
        <Select 
                closeMenuOnSelect={false} 
                placeholder={props.placeholder}
                options={[{value:1,label:"timofey"},{value:2,label:"predeinay"}]}
                onChange={onChangeSelect}
                // options={Project.project.project_status_list.map(status => {
                //         return {value : status.status_id, label : status.status_name}
                // })}
            />
        :
        <a href="#"
            onClick={handleEdit}
            className="phLink">
                {props.defaultDisplay}
        </a>

    const textArea = isEdit?
        <div>
            <Row>
                <Col>
                <Form.Control
                    type="text" as="textarea"
                    rows={props.rows}
                    placeholder={props.placeholder}
                    defaultValue={props.defaultValue}
                    onChange={onChange}
                    autoFocus/>    
                </Col>
            </Row>
            <Row style={{marginTop: "8px"}}>
                <Col>
                <Button onClick={handleSumbit}>Сохранить</Button>
                </Col>
            </Row>
        </div>
        :
        // Просмотр
        <Form.Text
            style={{cursor:"pointer"}}
            onClick={handleEdit}
            >
            <h6>{props.defaultValue}</h6>
        </Form.Text>;

    const textField = isEdit?
    // Редактирование   
        <Row><Col>
            <Form.Control
                    type="text"
                    placeholder={props.placeholder}
                    defaultValue={props.defaultValue}
                    autoFocus
                    onChange={onChange}
                />
            </Col>
            <Col lg="auto" md="auto" sm="auto" xs="auto">
                <Button onClick={handleSumbit}>Сохранить</Button>
        </Col></Row>
        :
        // Просмотр
        <Form.Text
            style={{cursor:"pointer"}}
            onClick={handleEdit}
            >
            <h6>{props.defaultValue}</h6>
        </Form.Text>;

    return (
        props.type === "textField" ? textField :
        props.type === "textArea" ? textArea : 
        props.type === "selectList" ? selectList : 
        ""
    )
}

export default LinkInput;