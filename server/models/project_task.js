const Model = require('./Model');

class ProjectTask extends Model {

    static CONSTANTS = {
        Y : "Y",
        N : "N"
    }
    
    static fields = [
        "task_id",
        "project_id",
        "task_title",
        "task_note",
        "created_on",
        "created_by",
        "is_deleted",
        "status_id",
        "executor_id",
        "responsible_id",
        "reviewer_id"
    ]

    static table = "project_task";
}


module.exports = ProjectTask;