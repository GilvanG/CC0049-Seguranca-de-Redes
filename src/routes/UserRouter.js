import { Router } from 'express'
import UserController from '../controllers/UserController.js'

const userController = new UserController()

const router = Router()

router.get('/user', userController.index.bind(userController))
router.get('/api/user/list', userController.list.bind(userController))
router.post('/api/user/create', userController.create.bind(userController))
router.post('/api/user/login', userController.login.bind(userController))
router.post('/api/user/insert/role', userController.insertRole.bind(userController))
// router.delete('/user/:id', userController.remove.bind(userController))

export default router