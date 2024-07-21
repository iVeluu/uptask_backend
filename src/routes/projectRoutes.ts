import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { TaskController } from "../controllers/TaskController";
import { validateProjectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate)


router.post('/', 
    body('projectName')
    .notEmpty().withMessage('El nombre del proyecto es Obligatorio'),
    body('clientName')
    .notEmpty().withMessage('El nombre del cliente es Obligatorio'),
    body('description')
    .notEmpty().withMessage('La descripción es Obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

router.get('/:id', 
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProjectController.getProductById
)


//Aplicar el middleware antes de todo, siempre y cuando se encuentre el param 'projectId' en la url
router.param('projectId', validateProjectExists)

router.put('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no válido'),
    body('projectName')
    .notEmpty().withMessage('El nombre del proyecto es Obligatorio'),
    body('clientName')
    .notEmpty().withMessage('El nombre del cliente es Obligatorio'),
    body('description')
    .notEmpty().withMessage('La descripción es Obligatoria'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/:projectId', 
    param('projectId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)



/* Routes for tasks */

router.post('/:projectId/tasks',
    hasAuthorization,
    body('name')
    .notEmpty().withMessage('El nombre de la tarea es Obligatorio'),
    body('description')
    .notEmpty().withMessage('La descripción de la tarea es Obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks
)

//Aplicar el middleware antes de todo, siempre y cuando se encuentre el param 'projectId' en la url
router.param('taskId', taskExist)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    body('name')
    .notEmpty().withMessage('El nombre de la tarea es Obligatorio'),
    body('description')
    .notEmpty().withMessage('La descripción de la tarea es Obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TaskController.eliminateTask
)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no válido'),
        body('status')
    .notEmpty().withMessage('El estado es Obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

/** Routes for teams */

router.post('/:projectId/team/find', 
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team', 
    TeamMemberController.getProjectMembers
)
router.post('/:projectId/team', 
    body('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId', 
    param('userId')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

/** Routes for Notes */

router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El Contenido de la Nota es Obligatorio'),
    handleInputErrors,
    NoteController.createNote
)
router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('ID no Válido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router