import Form from 'react-bootstrap/Form';
import React, { useState , useEffect, useRef } from 'react';
import {Row,Col,Badge} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";
// Редактор markdown
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

// markdown
// Создаем объект <table> со стилями bootstrap, для использования его в markdown
const MarkdownTable = props => {
    return (<table className="table table-bordered"> {props.children} </table>)
}

const MarkdownObject = (props) => {
    // 1. components: прокидываем свои html объекты
    // 2. children: markdown -> стилевый текст
    // 3. remarkPlugins: плагины для поддержки таблиц, стилей текста
    return <ReactMarkdown 
        components={{ table: MarkdownTable }} 
        children={ props.value } 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]} 
        className="markdown-object"
    /> 
}

function LinkInput(props) {

    const noText = "Текст отсутствует";

    // props
    //  type "textField", "textArea", "selectList", "markDown"
    //  placeholder 
    //  defaultValue
    //  callBack - function
    //  isEdit true / false default value 
    //  isCancel true / false
    //  isSubmit true / false 
    //  submitLabel 
    //  cancelLabel
    //  isEditable true / false
    //  additional, любые опции, которые необходимо передать после submit (например {comment_id: 1})

    // for textArea custom
    //  rows

    // for selectList
    //  options = [{value:"",label:""},{}]

    // for markDown
    //  height in px, "300px"

    // for tagList
    // defaultValues - array of [{ tag : "asd", tag_id : 123 }]
    const [isEdit, setIsEdit] = useState(props.isEdit !== undefined ?props.isEdit:false);
    const [value, setValue] = useState("");

    const [isMouseSelecting, setMouseSelecting] = useState(false);
    
    const ref = useRef();

    const isCancel = props.isCancel !== undefined ? props.isCancel : true;
    const isSubmit = props.isSubmit !== undefined ? props.isSubmit : true;
    const submitLabel = props.submitLabel ? props.submitLabel : <i className="bi bi-check-lg"></i>;
    const cancelLabel = props.cancelLabel ? props.cancelLabel : <i className="bi bi-x-lg"></i>;
    const isEditable = props.isEditable !== undefined ? props.isEditable : true;

    // setIsEdit(this.props?.isEdit);
    useEffect(() => {
        // console.log(this.props?.isEdit)
        // if (props.defaultValue?.trim()) {
        //     console.log("NO DATA");
        //     setIsEdit(true);
        // } else {
        //     setIsEdit(false);
        // }
        if (isEdit) {
            ref.current?.focus()
        }
    },[isEdit]);

    const handleEdit = (e) => {
        e.preventDefault();
        if (props.onHandleEdit) {
            props.onHandleEdit();
        }
        setIsEdit(true);
        setValue(props.defaultValue);
    }

    const handleSumbit = (e) => {
        e.preventDefault();
        setIsEdit(props.isEdit !== undefined ?props.isEdit:false);
        props.callBack(value, props.additional);
        setValue("");
    }
    
    const onChange = (e) => {
        setValue(e.target.value);
    }

    const onChangeSelect = (option) => {
        setIsEdit(false);
        if (option) {
            props.callBack(option.value, option.label);
        } else {
            props.callBack(null, null);
        }
    }

    const onChangeTags = (options) => {
        setIsEdit(false);
        props.callBack(options);
    }

    const onChangeMarkdown = (({html, text}) => {
        setValue(text);
    });

    const tagList = isEdit && isEditable?
        <Select 
                closeMenuOnSelect={false} 
                // placeholder={props.placeholder}
                options={props.options}
                value={props.value}
                defaultValues={props.value}
                isMulti
                isClearable={false}
                // onChange={onChangeSelect}
                onChange={(option) => {onChangeTags(option)}}
            />
        :
        props.value?.length > 0 ?
            <div onClick={handleEdit} style={{cursor:"pointer"}}>
                {
                props.value?.map((el) =>
                        <div key={el.value} style={{display: "inline", paddingRight: "6px"}}>
                            <Badge bg="secondary"> 
                                {el.label}
                            </Badge>
                        </div>
                    )
                }
            </div>
            :
            <a href="#"
                onClick={handleEdit}
                className="phLink">
                Добавить
            </a>


    const markDown = isEdit && isEditable?
        <div>
            <Row>
                <Col>
                    <MdEditor 
                        view={{menu: true, md: true, html: false}}  
                        onChange={onChangeMarkdown} 
                        value={value}
                        style={{ height: props.height || "300px"}} 
                        renderHTML={ text => <MarkdownObject value = {text} /> } 
                    /> 
                </Col>
            </Row>
            <Row style={{marginTop: "8px"}}>
                <Col>
                    { isSubmit ? 
                        <Button variant="success" onClick={handleSumbit}>{submitLabel}</Button> : ""
                    }
                    &nbsp;
                    { isCancel ? 
                        <Button variant="outline-secondary" onClick={() => {setIsEdit(false);}}>{cancelLabel}</Button> : ""
                    }
                </Col>
            </Row>
        </div>
        : 
        <div style={{cursor:"pointer", minHeight:props.height}} onDoubleClick={handleEdit} >
            <MarkdownObject 
                value = {props.defaultValue?.trim()?props.defaultValue?.replace(/\n/gi, '  \n'):noText} 
            />
            {
                isEditable ? 
                <a className="phLink" style={{fontSize:"0.8em"}} href="#" onClick={handleEdit}>изменить</a> 
                : ""
            }
        </div>

    const selectList = 
        isEdit && isEditable?
        <Select 
            ref={ref} tabIndex={-1} onBlur={() => {setIsEdit(false);}}
                // onMenuClose={()=> {
                //     setIsEdit(false);
                // }}
                closeMenuOnSelect={false} 
                // noOptionsMessage={() => null}
                placeholder={props.placeholder}
                options={props.options}
                value={props.value}
                isClearable
                onChange={onChangeSelect}
            />
        :
        <a href="#"
            onClick={handleEdit}
            className="phLink">
                {props.defaultDisplay}
        </a>

    const textArea = isEdit && isEditable?
        <div>
            <Row>
                <Col>
                <Form.Control
                    type="text" as="textarea"
                    rows={props.rows}
                    placeholder={props.placeholder}
                    defaultValue={value}
                    onChange={onChange}
                    autoFocus/>    
                </Col>
            </Row>
            <Row style={{marginTop: "8px"}}>
                <Col>
                    <Button variant="success" onClick={handleSumbit}><i className="bi bi-check-lg"></i></Button>&nbsp;
                    <Button variant="outline-secondary" onClick={() => {setIsEdit(false);}}>
                        <i className="bi bi-x-lg"></i>
                    </Button>
                </Col>
            </Row>
        </div>
        :
        // Просмотр
        <Form.Text
            style={{cursor:"pointer"}}
            onClick={handleEdit}
            >
            {props.defaultValue?.trim()?props.defaultValue:noText}
        </Form.Text>;

    const textField = isEdit && isEditable?
    // Редактирование   
        <Row><Col>
            <Form.Control
                    type="text"
                    placeholder={props.placeholder}
                    defaultValue={value}
                    autoFocus
                    onChange={onChange}
                />
            </Col>
            <Col lg="auto" md="auto" sm="auto" xs="auto">
                <Button variant="success" onClick={handleSumbit}><i className="bi bi-check-lg"></i></Button>&nbsp;
                <Button variant="outline-secondary" onClick={() => {setIsEdit(false);}}>
                    <i className="bi bi-x-lg"></i>
                </Button>
        </Col></Row>
        :
        // Просмотр
        <Form.Text
            style={{cursor:"pointer"}}
            onClick={handleEdit}
            >
            {props.defaultValue?.trim()?props.defaultValue:noText}
        </Form.Text>;

    const headerField = isEdit && isEditable?
    // Редактирование   
        <Row><Col>
            <Form.Control
                    type="text"
                    placeholder={props.placeholder}
                    defaultValue={value}
                    autoFocus
                    onChange={onChange}
                />
            </Col>
            <Col lg="auto" md="auto" sm="auto" xs="auto">
                <Button variant="success" onClick={handleSumbit}><i className="bi bi-check-lg"></i></Button>&nbsp;
                <Button variant="outline-secondary" onClick={() => {setIsEdit(false);}}>
                    <i className="bi bi-x-lg"></i>
                </Button>
        </Col></Row>
        :
        // Просмотр
        <Form.Text
            style={{cursor:"pointer", color: "black"}}
            onClick={handleEdit}
            >
            <h3>{props.defaultValue?.trim()?props.defaultValue:noText}</h3>
        </Form.Text>;
        

    return (
        props.type === "textField" ? textField :
        props.type === "textArea" ? textArea : 
        props.type === "selectList" ? selectList : 
        props.type === "markDown" ? markDown :
        props.type === "headerField" ? headerField :
        props.type === "tagList" ? tagList :
        ""
    )
}

export default LinkInput;