const Model = require('./Model');

class ProjectTags extends Model {

    static fields = [
        "tag_id",
        "project_id",
        "tag"
    ]

    static table = "project_tags";
}

module.exports = ProjectTags;