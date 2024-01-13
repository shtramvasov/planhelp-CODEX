import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject, getProjectTaskList, postTask } from "../../../network/TaskNetwork";
import { addProject, addTaskList } from '../../../reducers/Project';
import TabBar from "../TabBar";
import moment from 'moment-timezone';
import 'moment/locale/ru';


const noText = "Проект без названия";

function Sprint(props) {

   const Project = useSelector((state) => state.project);

   return (
      <Container fluid>
      <Row>
          <Col>
              <Navbar />
              <hr/>
          </Col>
      </Row>
      <Row>
          <Col>
          <Breadcrumb 
              items={[
                  {url:`/project`, name: "Мои проекты"},
                  {url:``, name: Project.project?.project_name.trim()?Project.project.project_name:noText}
              ]}
          />
          </Col>
      </Row>
      <Row>
          <Col>
              <TabBar />
              {/* <div>
              <Form.Group className="mb-3">
                  <Button type="button" variant="" onClick={actionCallModaTaskCreate} >
                      <i className="bi bi-plus-circle"></i>
                  </Button>
              </Form.Group>
              </div> */}
          </Col>
      </Row>
      <Row style={{marginTop : "14px"}}>
         <Col>
              Данный раздел находится в разработке
         </Col>
      </Row>
      {/* <Row style={{marginTop : "14px"}}>
          <Col> */}
      </Container>
   )
}


export default Sprint;
