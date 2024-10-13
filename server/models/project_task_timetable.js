const Model = require('./Model');

class ProjectTaskTimetable extends Model {

    static fields = [
        "ptt_id",
        "task_id",
        "user_id",
        "date_start",
        "date_end"
    ]

    static table = "project_task_timetable";
}

module.exports = ProjectTaskTimetable;