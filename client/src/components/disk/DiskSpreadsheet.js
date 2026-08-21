import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { redirect, useNavigate, useParams } from "react-router-dom";
import { Container, Button, Row, Col, Form, Card, ButtonGroup } from "react-bootstrap";
import { DataGrid, GridColumnMenu, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Menu, MenuItem, ListItemText } from '@mui/material';
import { Navbar }  from "../navbar/Navbar";
import { addEntity, modifyEntity, addEntityNotes, addEntityNote, addLastUploadFile } from '../../reducers/Disk';
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { getDiskEntity, postDiskEntity, deleteDiskEntity } from '../../network/DiskNetwork';
import { getEntityNoteList, postEntityNote } from '../../network/NoteNetwork';
import { messages } from "../constants/Msg";
import LinkInput from '../helpers/LinkInput';
import ModalNote from "../helpers/ModalNote";
import ModalInputFile from "../helpers/ModalInputFile";
import Breadcrumb from "../helpers/Breadcrumb";
import moment from 'moment-timezone';
import 'moment/locale/ru';

moment.locale('ru');

function DiskSpreadsheet(props) {

    const { entity_id } = useParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [cols, setCols] = useState([]);
    const [styles, setStyles] = useState({});
    const [selectedRow, setSelectedRow] = useState();
    const [selectedCol, setSelectedCol] = useState();
    const [contextMenu, setContextMenu] = useState(null);
    const [showModalNote, setShowModalNote] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);

    useEffect(() => {
        // console.log(selectedCol,selectedRow)
    },[selectedCol,selectedRow])

    // Первичная загрузка данных
    useEffect(() => {
        fetchEntity();
        fetchEntityNoteList();
    },[entity_id]);

    useEffect(() => {
        const newCols = cols;
        for (const col of cols) {
            col.renderCell = renderCell;
        }
        setCols([...newCols]);
    },[styles,rows]); //[styles,cols,rows] if cols - infinity rerender

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));
                if (resp.entity_note) {
                    setStyles({...(JSON.parse(resp.entity_note)).styles});
                    const fetchedCols = (JSON.parse(resp.entity_note)).cols;
                    // support old ver without _id
                    const _idCol = fetchedCols.find((col) => col.field === '_id');
                    if (!_idCol) {
                        fetchedCols.push({field : "_id", editable : false})
                    }
                    ////
                    setCols(fetchedCols);
                    
                    const fetchedRows = (JSON.parse(resp.entity_note)).rows;

                    // support old ver without _id
                    for (const row of fetchedRows) {
                        if (row._id) {
                            break;
                        } else {
                            row._id = row.id;
                        }
                    }
                    ////
                    setRows(fetchedRows);
                } else {
                    // если в бд документ пустой
                    // сформируем дефолтный
                    initDefaultEntityNote();
                }
            } else {
                dispatch(addNegativeMessage(messages.FETCH_FAIL + " " + err));
            }
        });
    };

    const initDefaultEntityNote = () => {

        // //
        // формируем столбцы
        const alphabetArr = "abcdefghijklmnopqrstuvwxyz".split("");
        const _cols = [];
        // default cols end at "n"
        for (let i=0;i<=14;i++) {
            _cols.push({
                field: alphabetArr[i].toUpperCase(),
                editable: true,
                renderCell : renderCell
            });
        }
        _cols.push({field : "_id", editable : false})
        setCols(_cols);

        // //
        // формируем строки
        let _rows = []
        for (let i=1;i<=50;i++) {
            _rows.push({id:i, _id:i});
        }
        setRows(_rows);
    }

    const fetchEntityNoteList = () => {
        getEntityNoteList({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityNotes(resp));    
            } else {    
                dispatch(addNegativeMessage(messages.FETCH_FAIL + " " + err));
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

    const renderCell = (params) => {
        // console.log(params.row._id);
        const style = styles[params.field + '||' +params.row._id];
        return (
            <>
                <div style={style}>
                {params.value}
                </div>
        </>)
    }
    

    // украденная функция обновления строк
    const handleProcessRowUpdate = (updatedRow, originalRow) => {
        const newRows = [...rows];
        const idx = newRows.findIndex((x) => x.id === originalRow.id);
        
        // фича чтобы обмануть высоту row
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
            cols : cols,
            styles : styles
        }

        postDiskEntity(
            {   
                entity_id : entity_id,
                entity_name : Disk.entity.entity_name,
                entity_note : JSON.stringify(spreadsheet),
                // parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    fetchEntity();
                    dispatch(addPositiveMessage(messages.SUCCESS));
                } else {
                    dispatch(addNegativeMessage(messages.SAVE_FAIL + " " + err));
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
        
        const {note, remind_on, variant, note_id, note_type, note_2, is_deleted, is_remind} = commonNote;
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
                is_deleted : is_deleted,
                is_remind : is_remind
            },
            (err,resp) => {
                if (!err) {
                    fetchEntityNoteList();
                    dispatch(addPositiveMessage(messages.SUCCESS));
                } else {
                    dispatch(addNegativeMessage(messages.SAVE_FAIL + " " + err));
                }
            });
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
        if (!file) {
            return;
        } 
        dispatch(addLastUploadFile(file));
        //                     <td> {Disk.lastUploadFile.name} </td>
        //                     <td> {Disk.lastUploadFile.size} Кб </td>
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
                dispatch(addPositiveMessage(messages.SUCCESS));
            } else {
                dispatch(addNegativeMessage(messages.UPLOAD_FAIL));
            }
        });
    }

    const onEditNote = (e,el) => {
        e.preventDefault();
        dispatch(addEntityNote(el));
        setShowModalNote(true);
    }

    // Добавление строк
    const addRows = (e,count,direction) => {
        // find max _id
        let max_id = null;
        for (const row of rows) {
            if (max_id < row._id) {
                max_id = row._id;
            }
        }

        // count = 1 | 10
        // direction = up | down
        let newRows = [...rows];
        for (let i=1;i<=count;i++) {
            newRows.splice(selectedRow+(direction==="up"?-1:0),0,{id:-1*i, _id : max_id+i});
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
            // console.log(col.field, existsIdx);
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
    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarExport />
          </GridToolbarContainer>
        );
    }

    const changeStyle = (styleKey) => {
        const newStyles = styles;

        let styleId = selectedCol+'||';
        for (const row of rows) {
            if (row.id === selectedRow) {
                styleId += row._id;
                break;
            }
        }

        if (newStyles[styleId]) {
            if (newStyles[styleId][styleKey]) {
                    const {[styleKey] : _ , ...style} = newStyles[styleId];
                    newStyles[styleId]= style;
            } else {
                newStyles[styleId]= {...newStyles[styleId]};
                if (styleKey === "fontWeight") {
                    newStyles[styleId][styleKey] = "bold";
                }
                if (styleKey === "fontStyle") {
                    newStyles[styleId][styleKey] = "italic";
                }
                if (styleKey === "color") {
                    newStyles[styleId][styleKey] = "red";
                }
                if (styleKey === "background") {
                    newStyles[styleId][styleKey] = "#ace1af";
                }
                if (styleKey === "textDecoration") {
                    newStyles[styleId][styleKey] = "line-through";
                }
            }
        } else {
            newStyles[styleId] = {};
            if (styleKey === "fontWeight") {
                newStyles[styleId][styleKey] = "bold";
            }
            if (styleKey === "fontStyle") {
                newStyles[styleId][styleKey] = "italic";
            }
            if (styleKey === "color") {
                newStyles[styleId][styleKey] = "red";
            }
            if (styleKey === "background") {
                newStyles[styleId][styleKey] = "#ace1af";
            }
            if (styleKey === "textDecoration") {
                newStyles[styleId][styleKey] = "line-through";
            }
        }
        // console.log(newStyles)
        setStyles({...newStyles})
    }

    return (
    <Container fluid onClick={(e) => {
            // if (e.target.className.indexOf("MuiDataGrid")) {
            //     setSelectedRow(null);
            //     setSelectedCol(null);
            // }
    }}>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Disk.entityNote} 
            conditionalRemindDateTime={true} />
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
                {selectedCol && selectedRow ? <>
                    <ButtonGroup style={{marginLeft : "16px"}}>
                    <Button type="button" variant="outline-secondary" onClick={()=>{changeStyle("fontWeight")}}><i className="bi bi-type-bold"></i></Button>
                    <Button type="button" variant="outline-secondary" onClick={()=>{changeStyle("fontStyle")}}><i className="bi bi-type-italic"></i></Button>
                    <Button type="button" variant="outline-secondary" onClick={()=>{changeStyle("textDecoration")}}><i className="bi bi-type-strikethrough"></i></Button>
                    <Button type="button" variant="outline-secondary" style={{color: "red"}} onClick={()=>{changeStyle("color")}}><i className="bi bi-file-font"></i></Button>
                    <Button type="button" variant="outline-secondary" style={{color: "green"}} onClick={()=>{changeStyle("background")}}><i className="bi bi-square-fill"></i></Button>
                    </ButtonGroup>
                    </>
                    : ""
                }
                </> : "" }
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <LinkInput
                type="headerField"
                placeholder="Имя документа"
                defaultValue={Disk.entity.entity_name}
                callBack={(value) => {
                    // console.log(Disk.entity);
                    postDiskEntity(
                        {   
                            entity_id : entity_id,
                            entity_name : value,
                        }, 
                        (err,resp) => {
                            if (!err) {
                                dispatch(modifyEntity({entity_name :  value}));
                                dispatch(addPositiveMessage(messages.SUCCESS));
                            } else {
                                dispatch(addNegativeMessage(messages.SAVE_FAIL + " " + err));
                            }
                        }
                    );
                }}
            />
        </Col>
    </Row>
    <Row style={{marginTop: "12px"}}>
        <Col>
            <DataGrid
            rows={rows}
            columns={cols}
            // высота ячеек = auto если заполенных ячеек нет
            getRowHeight={(cell) => {return Object.entries(cell.model).length < 3 ? 21: 'auto'}}
            columnHeaderHeight = {21}
            autoHeight
            disableColumnSorting
            disableRowSelectionOnClick={false}
            showCellVerticalBorder={true}
            cellSelection
            columnVisibilityModel={{
                // прячем столбец на будущее, для хранения стилей внутри row / col
                _id: false,
            }}
            processRowUpdate={handleProcessRowUpdate}
            onColumnResize={handleColumnResize}
            slots={{ columnMenu: CustomColumnMenu, toolbar: CustomToolbar }}
            slotProps={{
                row: {
                    onContextMenu: handleContextMenu,
                    onFocus: (event) => {
                        setSelectedRow(Number(event.currentTarget.getAttribute('data-id')));
                    }
                },
                cell: {
                    onFocus: (event) => {
                        setSelectedCol(event.currentTarget.getAttribute('data-field'));
                    },
                }
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
                {/* <MenuItem onClick={async (e)=>{
                        // console.log(selectedCol, selectedRow);
                        // const pastetext = await navigator.clipboard.read()
                        
                        // for (const item of pastetext) {
                        //     console.log(item.types);
                        //     const result = await item.getType('text/html');
                        //     const text = await result.text();
                        //     console.log(text);      
                        // }


                }}>Вставить из буфера</MenuItem> */}
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
    </Container>
    );
}


export default DiskSpreadsheet;