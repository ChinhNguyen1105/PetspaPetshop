import { ResUploadFileResultDto } from 'src/modules/files/dto/response/res-upload-file-result.dto';

export interface FileService {
  createDirectory(folder: string): Promise<void>;

  uploadListFile(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<ResUploadFileResultDto>;

  getFileLength(
    fileName: string,
    folder: string,
  ): Promise<number>;

  getResource(
    fileName: string,
    folder: string,
  ): Promise<unknown>;

  uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<import('src/modules/files/dto/response/res-upload-file-result.dto').ResUploadFileDto>;
}
