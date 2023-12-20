export interface CreatedUserDTO {
  name: string;
  email: string;
  password: string;
  date_of_birth: string;
  gender: string;
}
export interface AuthorizationUserDTO {
  email: string;
  password: string;
}
export interface RemoveUserDTO {
  usersArrId: string[];
  userId: string;
  removeId: string;
}
export interface UpdateUserDTO {
  name?: string;
  prevImg?: string;
  password?: string;
  id: string;
}
export interface UserIdParamsDTO {
  id: string;
}
export interface UserUpdateAndImgDTO {
  prevImg: string;
  idAuth: string;
  name: string;
  newAvatar: string;
}
