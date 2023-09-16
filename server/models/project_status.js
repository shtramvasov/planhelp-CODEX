const Model = require('./Model');

class ProjectStatus extends Model {

    static CONSTANTS = {
        Y : "Y",
        N : "N"
    }

    static fields = [
        "status_id",
        "project_id",
        "status_name",
        "variant",
        "is_deleted",
        "orderby",
        "is_closed"
    ]

    static table = "project_status";
}


module.exports = ProjectStatus;