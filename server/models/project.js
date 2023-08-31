const Model = require('./Model');

class Project extends Model {

    static fields = [
        "project_id",
        "project_name",
        "project_note",
        "created_on",
        "created_by",
        "is_deleted",
        "total_task_count",
        "total_user_count"
    ]

    static table = "project";
}


module.exports = Project;