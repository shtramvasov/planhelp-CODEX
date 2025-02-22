const ProjectUser = require('../../../models/project_user');
const ProjectSubject = require('../../../models/project_subject');

const validateProjectOwner = async (req,res) => {
    const con = res.locals.dbinstance;
    const { project_id } = req.params;
    const profile_user_id = req.userModel.user_id;

    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.OWNER].includes(projectRole.user_role)) {
        throw 'Permission denied';
    }
}

const validateProjectWrite = async (req,res) => {
    const con = res.locals.dbinstance;
    const { project_id } = req.params;
    const profile_user_id = req.userModel.user_id;

    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER].includes(projectRole.user_role)) {
        throw 'Permission denied';
    }
}

const validateProjectRead = async (req,res) => {
    const con = res.locals.dbinstance;
    const { project_id } = req.params;
    const profile_user_id = req.userModel.user_id;

    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (!projectRole) {
        throw 'Permission denied';
    }
}

const validateProjectSubject = async (req,res) => {
    const con = res.locals.dbinstance;
    const { project_id, subject_id } = req.params;

    const projectSubject = await ProjectSubject.find(con, {
        where : { project_id, subject_id, is_deleted : "N" }
    });
    if (projectSubject.length === 0) throw 'Permission denied';
}

module.exports = {
    validateProjectOwner,
    validateProjectWrite,
    validateProjectRead,
    validateProjectSubject
}