import { useParams } from "react-router-dom";
import { Navbar }  from "../navbar/Navbar";

function Test(props) {
    console.log("Test render");
    let params = useParams();
    console.log(params);
    return (
    <div>
        <Navbar />
        <h1>/Test {params.id}</h1>
    </div>
    
    );
}

export default Test;