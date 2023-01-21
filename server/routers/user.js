const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');

// Возвращает профиль пользователя
router.get('/', async (req, res, next) => {
    delete req.userModel['secret'];
    res.send(req.userModel);
});

// Изменение профиля
router.post('/', async (req, res, next) => {
    const { secret } = req.body;
    let con;
    try {
        if (!secret) {
            throw "no secret";
        }
        con = await mysql.getConnection();
        await mysql.begin(con);
        await mysql.query(con, 
            `update ref_users set secret = upper(md5(?)) where user_id = ?`,
            [ secret, req.userModel.user_id ]);
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
    res.send({ok:true});
});

// project list
// router.get('/', async (req, res, next) => {
//     let con;
//     req.query.limit = parseInt(req.query.limit) || 50;
//     req.query.offset = parseInt(req.query.offset) || 0;
//     try {
//         con = await mysql.getConnection();
//         const result = await mysql.query(con, 
//             `select p.*,
//                     up.rights
//                from projects p inner join users_projects up on p.project_id = up.project_id
//               where up.user_id = ?
//                 and up.is_deleted = 'N'
//                 and p.is_deleted = 'N'
//               order by p.project_id desc
//               LIMIT ${req.query.limit} OFFSET ${req.query.offset}`,
//               [req.userModel.user_id]
//         );
//         res.send(result);
//     } catch(error) {
//         next(error);
//     } finally {
//         con && await mysql.releaseConnection(con);
//     }
// });

// // project detail
// router.get('/:project_id', async (req, res, next) => {
//     let con;
//     try {
//         con = await mysql.getConnection();
//         const result = await mysql.query(con, 
//             `select p.*,
//                     up.rights,
//                     pp.parent_project_id
//                from projects p inner join users_projects up on p.project_id = up.project_id
//                                left join projects_parent pp on pp.project_id = p.project_id
//               where up.user_id = ?
//                 and up.is_deleted = 'N'
//                 and p.is_deleted = 'N'
//                 and p.project_id = ? `,
//               [req.userModel.user_id, req.params.project_id]
//         );
//         if (result[0]) {
//             const childProjects = await mysql.query(con, 
//                 `select p.*,
//                         up.rights
//                    from projects p inner join users_projects up on p.project_id = up.project_id
//                   where p.project_id in 
//                         (select pp.project_id from projects_parent pp where pp.parent_project_id = ?)
//                     and p.is_deleted = 'N'
//                     and up.is_deleted = 'N'
//                     and up.user_id = ?`,
//                 [ req.params.project_id , req.userModel.user_id]);
//             result[0].childs = childProjects;
//             res.send(result[0]);
//         } else {
//             res.status(404).send({error: "Not found"});
//         }
//     } catch(error) {
//         next(error);
//     } finally {
//         con && await mysql.releaseConnection(con);
//     }
// });

// // project create
// router.post('/', async (req, res, next) => {
//     let con;
//     try {
//         con = await mysql.getConnection();
//         await mysql.begin(con);
//         const insertProjectResult = await mysql.query(con, 
//             `insert into projects(project_code, project_name, project_note, created_on, is_deleted)
//               values(?,?,?,now(),'N')`,
//             [
//                 req.body.project_code?req.body.project_code:null,
//                 req.body.project_name,
//                 req.body.project_note
//             ]
//         );
//         const insertUserProjectResult = await mysql.query(con, 
//             `insert into users_projects(user_id, project_id, created_on, is_deleted, rights)
//               values(?,?,now(),'N','OWNER')`,
//             [ req.userModel.user_id, insertProjectResult.insertId ]
//         );
//         const result = await mysql.query(con, 
//             `select * from projects where project_id = ?`,
//             [ insertProjectResult.insertId ]
//         );
//         res.send(result[0]);
//     } catch(error) {
//         con && await mysql.rollback(con);
//         next(error);
//     } finally {
//         con && await mysql.commit(con) && await mysql.releaseConnection(con);
//     }
// });

// // project update
// router.post('/:project_id', async (req, res, next) => {
//     let con;
//     try {
//         con = await mysql.getConnection();
//         await mysql.begin(con);
//         await mysql.query(con, 
//             `update projects
//                 set project_code = ?,
//                     project_name = ?,
//                     project_note = ?,
//                     is_deleted = ?
//               where project_id = ? `,
//               [
//                   req.body.project_code,
//                   req.body.project_name,
//                   req.body.project_note,
//                   req.body.is_deleted,
//                   req.params.project_id
//               ]
//         );
//         // delete parent
//         await mysql.query(con, 
//             `delete from projects_parent where project_id = ?`,
//             [ req.params.project_id ]
//         );
//         // create parent if need
//         if (req.body.parent_project_id) {
//             await mysql.query(con, 
//                 `insert into projects_parent(project_id, parent_project_id)
//                  values(?,?)`,
//                 [ req.params.project_id, req.body.parent_project_id ]
//             );
//         }
//         res.send({ok:true});
//     } catch(error) {
//         con && await mysql.rollback(con);
//         next(error);
//     } finally {
//         con && await mysql.commit(con) && await mysql.releaseConnection(con);
//     }
// });

module.exports = router;