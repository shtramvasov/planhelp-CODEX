const Model = require('./Model');

class ProjectStatus extends Model {

    static fields = [
        "status_id",
        "project_id",
        "status_name",
        "status_color",
        "is_deleted"
    ]

    static table = "project_status";
}


module.exports = ProjectStatus;