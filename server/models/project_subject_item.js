const Model = require('./Model');

class ProjectSubjectItem extends Model {
    
    static CONSTANTS = {
        STATUS : {
            DELETED : 0,
            OPEN : 1,
            CLOSED : 2
        }
    }

    static fields = [
        "psi_id",
        "subject_id",
        "psi_name",
        "date_start",
        "date_end",
        "orderby_time",
        "status",
        "psi_note"
    ]

    static table = "project_subject_item";
}


module.exports = ProjectSubjectItem;