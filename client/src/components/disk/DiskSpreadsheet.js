import { Navbar }  from "../navbar/Navbar";
import { Container, Button, Row, Col, Form, Table } from "react-bootstrap";
import ModalNote from "../helpers/ModalNote";
import ModalInputFile from "../helpers/ModalInputFile";
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addEntity, addEntityNotes, addEntityNote, addLastUploadFile } from '../../reducers/Disk';
import { useNavigate, useParams } from "react-router-dom";
import { getDiskEntity, postDiskEntity, deleteDiskEntity } from '../../network/DiskNetwork';
import { getEntityNoteList, postEntityNote } from '../../network/NoteNetwork';

import ToastMessage from "../helpers/ToastMessage";
import Card from 'react-bootstrap/Card';
import Breadcrumb from "../helpers/Breadcrumb";
import moment from 'moment-timezone';
import 'moment/locale/ru';

import { DataGrid, GridColumnMenu } from '@mui/x-data-grid';
import { Menu, MenuItem, ListItemText } from '@mui/material';
import { legacy_createStore } from "@reduxjs/toolkit";
moment.locale('ru');

// формируем столбцы
const alphabetArr = "abcdefghijklmnopqrstuvwxyz".split("");
// maybe later add more columns
// const alphabetArrAdd = alphabet.split("").map((el) => el+el);

const _cols = [];
// default cols end at "n"
for (let i=0;i<=13;i++) {
    _cols.push({field: alphabetArr[i].toUpperCase(),editable: true});
}

function DiskSpreadsheet(props) {

    const { entity_id } = useParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();
    
    document.title = Disk.entity.entity_name+" | planhelp";

    // формируем строки
    let _rows = []
    for (let i=1;i<=50;i++) {
        _rows.push({id:i});
    }

    const [rows, setRows] = useState(_rows);
    const [cols, setCols] = useState(_cols);
    const [selectedRow, setSelectedRow] = useState();
    const [contextMenu, setContextMenu] = useState(null);
    const [showModalNote, setShowModalNote] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);
    const [showToastSuccessUploadFile, setToastSuccessUploadFile] = useState(false);
    const didCloseToast = () => setToastSuccessUploadFile(false);

    // Первичная загрузка данных
    useEffect(() => {
        fetchEntity();
        fetchEntityNoteList();
    },[entity_id]);

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));
                if (resp.entity_note) {
                    setRows((JSON.parse(resp.entity_note)).rows);
                    setCols((JSON.parse(resp.entity_note)).cols);
                }
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const fetchEntityNoteList = () => {
        getEntityNoteList({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityNotes(resp));    
            } else {    
                alert("Ошибка: "+err);
            }
        });
    }

    const deleteEntity = () => {
        const selectedEntityIdList = [];
        selectedEntityIdList.push(entity_id);
        deleteDiskEntity({selectedEntityIdList}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        });
    }

    // украденная функция обновления строк
    const handleProcessRowUpdate = (updatedRow, originalRow) => {
        const newRows = [...rows];
        const idx = newRows.findIndex((x) => x.id === originalRow.id);
        
        // фича чтобы обмануть высоту  кщц
        Object.entries(updatedRow).map((el)=>{
            if (!el[1]) {
               delete updatedRow[el[0]];
            }
        });

        newRows[idx] = updatedRow;
        Object.entries(updatedRow);
        setRows(newRows);
        
        return updatedRow;
    };

    // ресайз колонок
    const handleColumnResize = (c) => {
        const newCols = [...cols];
        const idx = newCols.findIndex((x) => x.field === c.colDef.field);
        newCols[idx].width = c.colDef.width;
        setCols(newCols);
    } 
        
    const handleContextMenu = (event) => {
        event.preventDefault();
        setSelectedRow(Number(event.currentTarget.getAttribute('data-id')));
        setContextMenu(
          contextMenu === null
            ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
            : null,
        );
    };
    
    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleBackClick = () => {
        navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
    }

    const handleInfoEntity = () => {
        navigate(`/disk/${entity_id}/activity`);
    }

    const handleSave = (e) => {
        e.preventDefault();

        const spreadsheet = {
            rows : rows,
            cols : cols
        }
        postDiskEntity(
            {   
                entity_id : entity_id,
                // entity_name : e.target.formEntityName.value,
                entity_note : JSON.stringify(spreadsheet),
                // parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    //handleCancelClick();
                    fetchEntity();
                }
            }
        );
    }

    // Вызов модалки создания файла
    const actionCallModalNote = (e) => {
        e.preventDefault();
        dispatch(addEntityNote({}));
        setShowModalNote(true);
    }
    // Вызов модалки загрузки файла
    const actionCallModalUploadFile = (e) => {
        e.preventDefault();
        setShowModalUploadFile(true);
    }

    // Колбэк с модалки после создания файла
    const actionModalNoteCallback = (commonNote) => {
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        setShowModalNote(false);
        dispatch(addEntityNote({}));
        if (!commonNote) {
            return;
        }
        
        const {note, remind_on, variant, note_id, note_type, note_2, is_deleted} = commonNote;
        if (!is_deleted)
            if (!commonNote.note) {
                return;
            }
        
        postEntityNote({
                entity_id : entity_id,
                note : note,
                remind_on : remind_on?
                    moment(remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
                    :
                    null,
                variant : variant,
                note_id : note_id,
                note_type : note_type,
                note_2 : note_2,
                is_deleted : is_deleted
            },
            (err,resp) => {
                if (!err) {
                    fetchEntityNoteList();
                } else {
                    alert("Ошибка: "+err);
                }
            });
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
        if (!file) {
            return;
        }

        /// Записываем информацию о загруженном файле
        /// Показываем сообщение
        /// Скрываем сообщение через 5 сек.
        dispatch(addLastUploadFile(file));
        setToastSuccessUploadFile(true);
        setTimeout(didCloseToast, 5000);
       
        postEntityNote({
            entity_id : entity_id,
            note : file.name,
            note_2 : file.url,
            note_type : "FILE",
            variant : "",
            is_deleted : 0
        },
        (err,resp) => {
            if (!err) {
                fetchEntityNoteList();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    // Колбек с инфо.сообщение о том что файл загрузили
    const actionSuccessUploadFileCallBack = () => {
        didCloseToast()
    }

    const onEditNote = (e,el) => {
        e.preventDefault();
        dispatch(addEntityNote(el));
        setShowModalNote(true);
    }

    // Добавление строк
    const addRows = (e,count,direction) => {
        // count = 1 | 10
        // direction = up | down
        let newRows = [...rows];
        for (let i=1;i<=count;i++) {
            newRows.splice(selectedRow+(direction==="up"?-1:0),0,{id:-1*i});
        }
        newRows = newRows.map((el,i)=> {
            el.id = i+1;
            return el;
        });
        setRows([...newRows]);
        handleCloseContextMenu();
    }

    // Удаление строки
    const deleteRow = (e) => {
        let newRows = [...rows];
        newRows.splice(selectedRow-1,1);
        newRows = newRows.map((el,i)=> {
            el.id = i+1;
            return el;
        });
        setRows([...newRows]);
        handleCloseContextMenu();
    }

    // Добавление столбца
    const addNewCol = (e,field,direction) => {
        // direction = "left" | "right"
        let newCols = [...cols];
        let maxIdx = 0;
        for (const col of newCols) {
            const existsIdx = col.field.replace(/[^0-9.]/g, '') ? parseInt(col.field.replace(/[^0-9.]/g, '')) : 0;
            console.log(col.field, existsIdx);
            if (existsIdx > maxIdx) {
                maxIdx = existsIdx;
            }
        }
        maxIdx++;
        const newFieldName = field.replace(/[0-9]/g,'') + maxIdx;

        const idx = newCols.findIndex((x) => x.field === field); // тек позиция столбца в массиве
        // добавляем новый столбец либо справа либо слева в зависимости от направления
        newCols.splice(
            idx + ( direction==="left" ? 0 : 1 ), 0,
            {field: newFieldName.toUpperCase(),editable: true}
        );
        setCols([...newCols]);
    }

    // Удаление столбца
    const deleteCol = (e,field) => {
        // field = "A" | "B" | "C" | etc...
        let newCols = [...cols];
        const idx = newCols.findIndex((x) => x.field === field);
        newCols.splice(idx,1);
        let newRows = [...rows];
        newRows = newRows.map((row,i) => {
            // удаляем значения в каждой строке для этого столбца
            delete row[field];
            return row;
        });
        setCols([...newCols]);
        setRows([...newRows]);
    }

    const entityNoteItems = Disk.entityNotes.map((el) => 
        <Card key={el.note_id} onClick={(e) => onEditNote(e,el)}
              style={{fontSize:"0.8em", marginBottom:"8px", cursor:"pointer"}}
              bg={el.variant} 
              text={el.variant?(el.variant==="light"?"":"light"):""}
              >
            <Card.Body style={{padding:"8px 8px 4px 8px"}}>
                    <Card.Text>
                    {el.note_type === "COMMENT" ? 
                        el.note : <a href={el.note_2} className="phLink">{el.note}</a>}
                    </Card.Text>
            </Card.Body>
            <div style={{textAlign:"right", padding:"0px 8px 8px 0px"}}>
                <small> 
                    {moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()} 
                    ({el.login})<br/>
                    {el.remind_on?"напомнить "+moment(el.remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('Do MMMM YYYY, в HH:mm:ss'):""}
                </small>
            </div>
        </Card>
    );

    // Показываем сообщение с информацией о загруженным файле
    const TastInfoSuccessFile = () => {
        return (
            <Table striped bordered hover>
                <tbody>
                    <tr style={{ verticalAlign: 'middle' }} >
                        <td> {Disk.lastUploadFile.name} </td>
                        <td> {Disk.lastUploadFile.size} Кб </td>
                    </tr>
                </tbody>
            </Table>
        )
    }

    function CustomUserItem(props) {
        return (<>
          <MenuItem onClick={(e)=>{addNewCol(e,props.colDef.field,"right")}}>
            <ListItemText>Добавить столбец справа</ListItemText>
          </MenuItem>
          <MenuItem onClick={(e)=>{addNewCol(e,props.colDef.field,"left")}}>
            <ListItemText>Добавить столбец слева</ListItemText>
          </MenuItem>
          <MenuItem onClick={(e)=>{deleteCol(e,props.colDef.field)}}>
            <ListItemText>Удалить столбец</ListItemText>
          </MenuItem>
          </>
        );
    }

    const CustomColumnMenu = (props) => {
        return (
          <GridColumnMenu
            {...props}
            slots={{
              // Add new item
              columnMenuUserItem: 
                CustomUserItem,
            columnMenuColumnsItem: null,
            }}
            slotProps={{
              columnMenuUserItem: {
                // set `displayOrder` for new item
                // displayOrder: 1
              },
            }}
          />
        );
    }

    return (
    <Container fluid>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Disk.entityNote} />
        <ModalInputFile 
            title={"Загрузить файл"} 
            show={showModalUploadFile} 
            callBack={actionUploadFileCallBack}  />
    <Row>
        <Col>
            <Navbar />
            <hr/>            
        </Col>
    </Row>
    <Row>
        <Col>
        <Breadcrumb 
            items={Disk.entity.breadcrumb?.map(
                (item, i) => {return {url:`/disk/${item.entity_id}`, name: item.entity_name}})}
        />
        </Col>
    </Row>
    
    <div>    
    <Row>
        <Col>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="button" onClick={handleBackClick} variant="outline-secondary" ><i className="bi bi-chevron-left"></i></Button>   
                {/* Скрываем действия с файлами если права пользователя только чтение  */}
                { Disk.entity.user_role != "READ" ? 
                <>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-success" onClick={handleSave} >Сохранить изменения</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleInfoEntity}><i className="bi bi-info-circle"></i></Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-primary" onClick={actionCallModalNote}><i className="bi bi-calendar2-plus"></i></Button>
                <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalUploadFile}><i className="bi bi-cloud-arrow-up"></i> </Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={deleteEntity}><i className="bi bi-trash"></i></Button>
                </> : "" }
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <h2>{Disk.entity.entity_name}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <DataGrid
            rows={rows}
            columns={cols}
            // высота ячеек = auto если заполенных ячеек нет
            getRowHeight={(cell) => {return Object.entries(cell.model).length < 2 ? 21: 'auto'}}
            columnHeaderHeight = {21}
            autoHeight
            disableRowSelectionOnClick={false}
            showCellVerticalBorder={true}
            cellSelection
            processRowUpdate={handleProcessRowUpdate}
            onColumnResize={handleColumnResize}
            slots={{ columnMenu: CustomColumnMenu }}
            slotProps={{
                row: {
                    onContextMenu: handleContextMenu,
                },
            }}
            />
            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
                slotProps={{
                    root: {
                        onContextMenu: (event) => {
                            event.preventDefault();
                            handleCloseContextMenu();
                        },
                    },
                }}
            >
                <MenuItem onClick={(e)=>{addRows(e,1,"up")}}>Вставить строку выше</MenuItem>
                <MenuItem onClick={(e)=>{addRows(e,1,"down")}}>Вставить строку ниже</MenuItem>
                <MenuItem onClick={(e)=>{addRows(e,10,"up")}}>Вставить 10 строк выше</MenuItem>
                <MenuItem onClick={(e)=>{addRows(e,10,"down")}}>Вставить 10 строк ниже</MenuItem>
                <MenuItem onClick={deleteRow}>Удалить строку</MenuItem>
            </Menu>
        </Col>
    </Row>
    <Row className="mt-2">
        <Col lg={6}>
            {entityNoteItems}
        </Col>
    </Row>

    </div>
    {
        // Инфо сообщение, о том что файл загрузили
        showToastSuccessUploadFile ?  <ToastMessage title = "Файл загрузили" body = {TastInfoSuccessFile}  callBack = { actionSuccessUploadFileCallBack } /> : ""
    }
    </Container>
    );
}


export default DiskSpreadsheet;