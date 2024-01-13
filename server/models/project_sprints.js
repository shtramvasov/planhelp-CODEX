const Model = require('./Model');

class ProjectSprints extends Model {

    static CONSTANTS = {
        STATUS : {
            OPEN : 0,
            CLOSED : 1
        },
        IS_DELETED : {
            YES : "Y",
            NO : "N"
        }
    }

    static fields = [
        "sprint_id",
        "project_id",
        "sprint_name",
        "date_start",
        "date_end",
        "created_on",
        "created_by",
        "updated_on",
        "updated_by",
        "is_deleted",
        "status"
    ]

    static table = "project_sprints";

    static async getList(con, {
        sprint_id,
        project_id,
        is_deleted,
        status,
        limit,
        offset}) 
    {
        const data = await ProjectSprints.find(con, { 
            where : {
                project_id, is_deleted, status, sprint_id
            },
            order : "date_start desc",
            limit : +limit || 50,
            offset : +offset || 0
        });
        return data;
    }

    static async getOne(con, {
        project_id,
        sprint_id
    })
    {
        const data = await this.getList(con, {project_id, sprint_id, is_deleted : this.CONSTANTS.IS_DELETED.NO});
        return data[0];
    }
}


module.exports = ProjectSprints;