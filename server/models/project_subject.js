const Model = require('./Model');

class ProjectSubject extends Model {
    
    static CONSTANTS = {
        SUBJECT_TYPE : {
            LOV : "LOV",
            TEXT : "TEXT"
        },
        DISPLAY_VARIANT : {
            ONLY_OWNER : 1,
            TO_ALL : 0
        }
    }

    static fields = [
        "subject_id",
        "project_id",
        "subject_name",
        "is_deleted",
        "subject_type",
        "orderby_time",
        "display_variant"
    ]

    static table = "project_subject";
}


module.exports = ProjectSubject;