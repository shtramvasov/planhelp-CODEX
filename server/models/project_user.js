const Model = require('./Model');

class ProjectUser extends Model {

    static CONSTANTS = {
        // роль только читать
        READ : "READ",
        // роль писать но не управлять
        WRITE : "WRITE",
        // роль владелец, может все
        OWNER : "OWNER",
    }

    static fields = [
        "project_id",
        "user_id",
        "user_role"
    ]

    static table = "project_user";
}


module.exports = ProjectUser;