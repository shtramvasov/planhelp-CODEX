import React, { useRef, useState } from 'react';
import '../../resources/style/dragAndDrop.css'
import { uploadFile } from '../../network/DiskNetwork';
import { useSelector } from 'react-redux';

function DragDropFile(props) {
    const [ dragActive, setDragActive ] = useState(false);
    const [isLoadFile, setLoadFile] = useState(0);
    const Disk = useSelector((state) => state.disk);
    
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
        } else if (e.type === "dragleave") {
          setDragActive(false);
        }
    }
    const handleDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = e.dataTransfer.files
            for (var key in files) {
                if (key !== 'length' && key !== 'item') {
                    const file = files[key]
                    fetchUploadFile(file)
                }
            }
        }
    };
    // Загружаем файл
    const fetchUploadFile = (file) => {
        uploadFile({ file }, (err, response) => {
            setLoadFile(0);
            if (!err) {
                props.callBack(response);
            } else {
                alert("Ошибка: " + err);
            }
        })
    };
    return (
        <>
            <form id="form-file-upload" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onSubmit={(e) => e.preventDefault() }>
                <input type="file" id="input-file-upload" multiple={false} />
                <div id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
                    { props.files }
                </div>
                { dragActive && <div id="drag-file-element" ></div> }
            </form>
        </>
        // <>
        //     <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault() }>
        //         <input type="file" id="input-file-upload" multiple={false} />
        //         <div id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
        //             { props.files }
        //         </div>
        //         { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
        //     </form>
        // </>
    );
  };
  export default DragDropFile;