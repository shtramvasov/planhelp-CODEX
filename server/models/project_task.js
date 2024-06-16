const Model = require('./Model');
const NotifyTlgrm = require('./notify_tlgrm');
const Notify = require('./notify');
const ProjectStatus = require('./project_status');
const RefUsers = require('./ref_users');

class ProjectTask extends Model {

    static CONSTANTS = {
        Y : "Y",
        N : "N"
    }
    
    static fields = [
        "task_id",
        "project_id",
        "task_title",
        "task_note",
        "created_on",
        "created_by",
        "is_deleted",
        "status_id",
        "executor_id",
        "responsible_id",
        "reviewer_id",
        "updated_by",
        "updated_on",
        "tags_str",
        "sprint_id",
        "orderby_time"
    ]

    static table = "project_task";

    // Список задач по параметрам
    static async getList(con,
        {   project_id, 
            task_id, 
            limit, 
            offset, 
            executor_id, 
            responsible_id, 
            reviewer_id, 
            status_id, 
            status_ids,
            tag_id,
            sprint_id,
            sort
        } ) {
            console.log("limit, offset",limit, offset);
        limit = (limit === undefined || limit === null || limit === "") ? undefined : +limit;
        offset = (offset === undefined || offset === null || offset === "") ? undefined : +offset;
        
        const _custom = []
        if (status_ids) {
            status_ids = status_ids.replace(/:/g,",");
            _custom.push( { 
                sql : ` and (project_task.status_id in (${status_ids}) )`, 
                no_value : true 
            } );
        }
        if (tag_id) {
            _custom.push({
                sql : ` and project_task.task_id in 
                            (select ptt.task_id from project_task_tags ptt where ptt.tag_id = ${tag_id}) `,
                no_value : true
                // value: tag_id
            });
        }
        const taskList = await ProjectTask.find(con, {
            select : `project_task.*,
                        ru_created.login as "ru_created_login",
                        ru_executor.login  as "ru_executor_login",
                        ru_executor.user_id  as "ru_executor_id",
                        ru_responsible.login  as "ru_responsible_login",
                        ru_responsible.user_id  as "ru_responsible_id",
                        ru_reviewer.login  as "ru_reviewer_login",
                        ru_reviewer.user_id  as "ru_reviewer_id",
                        project_status.status_name,
                        project_status.variant,
                        ps.date_end,
                        ps.date_start,
                        ps.sprint_name`,
            joins : [
                { table : "ref_users ru_created", 
                        on : "project_task.created_by = ru_created.user_id" },
                { table : "project_status", 
                    type : "left join",
                        on : "project_task.status_id = project_status.status_id" },
                { table : "ref_users ru_executor", 
                    type : "left join",
                        on : "project_task.executor_id = ru_executor.user_id" },
                { table : "ref_users ru_responsible", 
                    type : "left join",
                        on : "project_task.responsible_id = ru_responsible.user_id" },
                { table : "ref_users ru_reviewer", 
                    type : "left join",
                        on : "project_task.reviewer_id = ru_reviewer.user_id" },
                { table : "project_sprints ps", 
                    type : "left join",
                        on : "project_task.sprint_id = ps.sprint_id" },
            ],
            where : {
                "project_task.is_deleted" : ProjectTask.CONSTANTS.N, 
                "project_task.project_id" : project_id, 
                task_id, executor_id, responsible_id, reviewer_id, "project_task.status_id" : status_id,
                "project_task.sprint_id" : sprint_id,
                _custom : _custom
            },
            order : (sort ? sort : "task_id") + " desc",
            limit : limit,
            offset : offset
        });

        return taskList;
    }

    static async updateWithTrigger(pginstance, {values,where,returning = null}) {
        if (!where.task_id) {
            throw "no pk_id in where, did you update 1 row ?"
        }
        // get old model before update
        const oldModel = (await super.find(pginstance, {where:{ 
            task_id : where.task_id
        }}))[0];
        
        const result = super.update(pginstance, {values,where,returning});

        const taskUrl = `<a href="https://planhelp.ru/project/${oldModel.project_id}/task/${oldModel.task_id}/">№${oldModel.task_id} ${oldModel.task_title}</a>`;
        let notifyText = "";
        const notifyUserSet = new Set();
        if (oldModel.executor_id) notifyUserSet.add(oldModel.executor_id);
        if (oldModel.responsible_id) notifyUserSet.add(oldModel.responsible_id);
        if (oldModel.reviewer_id) notifyUserSet.add(oldModel.reviewer_id);
        // get user model
        const userModel = (await RefUsers.find(pginstance,{where:{
            user_id : values.updated_by
        }}))[0];
        // Изменение статуса
        if (values.status_id !== undefined && oldModel.status_id != values.status_id) {
            // get New status
            const statusModel = (await ProjectStatus.find(pginstance,{where:{ 
                status_id : values.status_id 
            }}))[0];
            notifyText += `${userModel.login} изменил статус задачи -> ${statusModel.status_name} \n${taskUrl} \n`;
        }
        // Изменение исполнителя
        if (values.executor_id !== undefined && oldModel.executor_id != values.executor_id) {
            const executorModel = (await RefUsers.find(pginstance, {where:{
                user_id : values.executor_id
            }}))[0];
            const login = executorModel ? executorModel.login : "не указан";
            if (executorModel) notifyUserSet.add(values.executor_id);
            notifyText += `${userModel.login} изменил исполнителя -> ${login} \n${taskUrl} \n`;
        }
        // Изменение ответственного
        if (values.responsible_id !== undefined && oldModel.responsible_id != values.responsible_id) {
            const responsibleModel = (await RefUsers.find(pginstance, {where:{
                user_id : values.responsible_id
            }}))[0];
            const login = responsibleModel ? responsibleModel.login : "не указан";
            if (responsibleModel) notifyUserSet.add(values.responsible_id);
            notifyText += `${userModel.login} изменил ответственного -> ${login} \n${taskUrl} \n`;
        }
        // Изменение ревьювера
        if (values.reviewer_id !== undefined && oldModel.reviewer_id != values.reviewer_id) {
            const reviewerModel = (await RefUsers.find(pginstance, {where:{
                user_id : values.reviewer_id
            }}))[0];
            const login = reviewerModel ? reviewerModel.login : "не указан";
            if (reviewerModel) notifyUserSet.add(values.reviewer_id);
            notifyText += `${userModel.login} изменил ревьювера -> ${login} \n${taskUrl} \n `;
        }
        // Изменение заголовка
        if (values.task_title !== undefined && oldModel.task_title != values.task_title) {
            notifyText += `${userModel.login} изменил заголовок задачи -> ${values.task_title} \n${taskUrl} \n`;
        }
        // Изменение описания
        if (values.task_note !== undefined && oldModel.task_note != values.task_note) {
            notifyText += `${userModel.login} изменил описание задачи "${oldModel.task_title}" \n${taskUrl} \n`;
        }
        // удаление
        if (values.is_deleted !== undefined && oldModel.is_deleted != values.is_deleted) {
            notifyText += `${userModel.login} удалил задачу "${oldModel.title}" \n${taskUrl} \n`;
        }
        
        // не надо оповещать если текст пустой
        if (!notifyText) {
            return result;
        }
        
        // уюираем юзера, который соверщил действие
        notifyUserSet.delete(values.updated_by);

        // перебираем оставшихся и формируем нотификации
        notifyUserSet.forEach(async (user_id) => {
            const notify_id = await Notify.create(pginstance,{values:{
                user_id : user_id,
                object_id : where.task_id,
                object_type : "project_task",
                notify_note : notifyText,
                is_read : 0,
                created_on : {expression : "now()"}
            }});
            const userModel = (await RefUsers.find(pginstance,{where:{user_id}}))[0];
            if (userModel.telegram_chat_id && userModel.is_notify) {
                await NotifyTlgrm.create(pginstance, {values:{
                    notify_id : notify_id,
                    status : NotifyTlgrm.CONSTANTS.IN_QUEUE,
                    telegram_chat_id : userModel.telegram_chat_id
                }});
            }
        });

        return result;
    }

}


module.exports = ProjectTask;