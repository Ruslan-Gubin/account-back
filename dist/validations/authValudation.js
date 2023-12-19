import { body } from 'express-validator';
const loginValedation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 3 }),
];
const registerValedation = [
    body('name', 'Укажите имя').isLength({ min: 3 }),
    body('gender', 'Укажите пол').isLength({ min: 3 }),
    body('date_of_birth', 'Укажите дату рождения').isLength({ min: 3 }),
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 8 символов').isLength({ min: 8 }),
    body('image', 'Неверная ссылка на аватарку').optional(),
];
export { registerValedation, loginValedation, };
