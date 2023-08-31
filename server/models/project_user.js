const Model = require('./Model');

class ProjectUser extends Model {

    static fields = [
        "project_id",
        "user_id",
        "user_role"
    ]

    static table = "project_user";
}


module.exports = ProjectUser;