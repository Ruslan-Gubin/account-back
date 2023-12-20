export type CreateImageInput = {
  w?: number;
  h?: number;
  file: FileImage;
  dir: string;
};

export type ChangeImageInput = {
  path: string;
  file: FileImage;
  dir: string;
  w?: string;
  h?: string;
};

export type CreateImageRespose = {
  data: {
    path: string;
    url: string;
  };
  result: string;
  message: string;
};

export type FileImage = {
  originalname: string;
  buffer: {
    type: string;
    data: number[];
  };
};
