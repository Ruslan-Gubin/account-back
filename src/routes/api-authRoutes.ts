import * as express from 'express';
import { AuthController } from '../controllers/api-auth-controlers.js';
import { AuthService } from '../service/auth-service.js';
import { checkAuth, handleValidationErrors } from '../utils/index.js';
import { registerValedation, loginValedation } from "../validations/authValudation.js";

const router: express.Router =  express.Router();

const authService = new AuthService()
const authController = new AuthController(authService)

router.post("/api/register", registerValedation, handleValidationErrors, authController.createUser); 
router.post("/api/login", loginValedation, handleValidationErrors, authController.authorizeUser);
router.get("/api/auth/:id", checkAuth, authController.getUserInfo);
router.delete('/api/auth-remove/:id', checkAuth, authController.removeUser);
router.patch('/api/auth-update', checkAuth, handleValidationErrors, authController.updateUser);
router.get('/api/get-all',  handleValidationErrors, authController.getAll);


export const authRouter = router;
 
 