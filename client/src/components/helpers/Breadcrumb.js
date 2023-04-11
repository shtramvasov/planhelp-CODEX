import { Breadcrumb as BootstrapBreadcrumb } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Breadcrumb(props) {
    const navigate = useNavigate();
    // url - ссылка
    // name - имя
    // items массив из {url : "ссылка", name : "имя"}

    const handleClick = (e,item) => {
        e.preventDefault();
        navigate(item.url);
    }
    
    return (
        <BootstrapBreadcrumb>
            {props.items.map( (item, i) => 
                i === props.items.length-1?
                <BootstrapBreadcrumb.Item active key={i}>{item.name}</BootstrapBreadcrumb.Item> :
                <BootstrapBreadcrumb.Item key={i}
                    href={item.url} 
                    onClick={(e)=>handleClick(e,item)}   
                    linkProps={{className:"phLink"}}
                >
                {item.name}
                </BootstrapBreadcrumb.Item> 
            )}
        </BootstrapBreadcrumb>
    )
}

export default Breadcrumb;