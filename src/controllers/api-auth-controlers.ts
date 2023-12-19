import { Response } from 'express-serve-static-core';
import { IRequestBody, IRequestParams, IRequestQuery } from '../types/IRequestRespons/index.js';
import { AuthService } from '../service/index.js';
import * as DTO from '../dtos/index.js';
import { logger } from '../utils/index.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  /** Создание пользователя */
  createUser = async (req: IRequestBody<DTO.CreatedUserDTO>, res: Response) => {
    try {
      const body = req.body;
      const user = await this.authService.create(body);
      res.status(201).json({ data: user, result: 'success' });
    } catch (error) {
      logger.error('Failed to create user:', error);
      res.status(500).json({ error: 'Failed to create a user', errorMessage: error });
    }
  };
 
  /** Авторизация пользователя */
  authorizeUser = async (req: IRequestBody<DTO.AuthorizationUserDTO>, res: Response) => {
    try {
      const body = req.body;
      const autorization = await this.authService.login(body);
      res.status(200).json({ data: autorization, result: 'success' });
    } catch (error) {
      logger.error('Failed to autorization user:', error);
      res.status(500).json({ error: 'Failed to log in', errorMessage: error });
    }
  };

  /** Получение информации о пользователе */
  getUserInfo = async (req: IRequestParams<{ id: string }>, res: Response) => {
    try {
      const userId: string = req.params.id;
      const userInfo = await this.authService.getUser(userId);
      if (userInfo) {
        res.status(200).json(userInfo);
      } else {
        logger.info('Failed to user is not fined:');
        res.status(404).json({ error: 'The user was not found' });
      }
    } catch (error) {
      logger.error('Failed to get one user:', error);
      res.status(500).json({ error: 'Internal server error', errorMessage: error });
    }
  };

  /** Получение всех пользователей кроме текущего */
  getAll = async (req: IRequestQuery<{ id: string }>, res: Response) => {
    try {
      const  id : string = req.query.id;
      const users = await this.authService.getAll(id);
      res.status(200).json({ data: {users:  users}, result: 'success'});
    } catch (error) {
      logger.error('Failed to get one user:', error);
      res.status(500).json({ error: 'Internal server error', errorMessage: error });
    }
  };

  /** Редактирование пользователя */
  updateUser = async (req: IRequestBody<DTO.UpdateUserDTO>, res: Response) => {
    try {
      const body = req.body;
      const updateUser = await this.authService.updateUser(body);
      res.status(200).json({ data: updateUser, result: 'success' });
    } catch (error) {
      logger.error('Failed to update user:', error);
      res.status(500).json({ error: 'The user could not be changed', errorMessage: error });
    }
  };

  /** Удаление пользователя */
  removeUser = async (req: IRequestParams<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;
      const removeUser = await this.authService.removeUser(id);
      if (removeUser) {
        res.status(200).json(removeUser);
      } else {
        logger.errrorDB('Failed to user is not undefined:');
        res.status(404).json({ error: 'The user was not found' });
      }
    } catch (error) {
      logger.error('Failed to remove user:', error);
      res.status(500).json({ error: 'The user could not be deleted', errorMessage: error });
    }
  };

}
