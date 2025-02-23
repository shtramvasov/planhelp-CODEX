const Model = require('./Model');

class ProjectTaskPsi extends Model {

    static fields = [
        "psi_id",
        "subject_id",
        "task_id",
        "subject_text"
    ]

    static table = "project_task_psi";
}

module.exports = ProjectTaskPsi;