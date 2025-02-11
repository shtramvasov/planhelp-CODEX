const Model = require('./Model');

class ProjectSubject extends Model {
    
    static fields = [
        "subject_id",
        "project_id",
        "subject_name",
        "is_deleted",
        "orderby_time"
    ]

    static table = "project_subject";
}


module.exports = ProjectSubject;