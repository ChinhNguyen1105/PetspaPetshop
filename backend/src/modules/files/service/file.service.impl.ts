import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';

import { UploadFileException } from 'src/common/exceptions/upload-file.exception';

import {
  ResUploadFileDto,
  ResUploadFileResultDto,
} from 'src/modules/files/dto/response/res-upload-file-result.dto';

import { FileService } from 'src/modules/files/service/file.service';

@Injectable()
export class FileServiceImpl implements FileService {
  private static readonly MAX_FILE_SIZE = 4 * 1024 * 1024;

  private static readonly ALLOWED_EXTENSIONS = [
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'doc',
    'docx',
  ];

  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private static readonly ALLOWED_EXTENSIONS_IMAGE = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
  ];

  private static readonly ALLOWED_MIME_TYPES_IMAGE = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly baseUri: string;

  constructor(private readonly configService: ConfigService) {
    const baseUri = this.configService.get<string>('UPLOAD_PATH');

    if (!baseUri) {
      throw new Error('Missing configuration: UPLOAD_PATH');
    }

    this.baseUri = baseUri;
  }

  async createDirectory(folder: string): Promise<void> {
    const targetPath = path.resolve(this.baseUri, folder);

    try {
      await fs.mkdir(targetPath, { recursive: true });
    } catch (error) {
      throw new Error(
        `Lỗi khởi tạo thư mục lưu trữ: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async uploadListFile(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<ResUploadFileResultDto> {
    if (!Array.isArray(files)) {
      throw new UploadFileException(
        'Danh sách file không hợp lệ. Kiểm tra dữ liệu từ controller.',
      );
    }

    if (files.length === 0) {
      throw new UploadFileException('Vui lòng tải lên ít nhất một file.');
    }

    await this.createDirectory(folder);

    const resUploadFileDtoList: ResUploadFileDto[] = [];
    const resUploadFileFailedList: string[] = [];

    for (const file of files) {
      const originalFileName = this.cleanFileName(file.originalname);

      console.log('[UPLOAD FILE]', {
        folder,
        originalname: file.originalname,
        cleanedName: originalFileName,
        size: file.size,
        mimetype: file.mimetype,
      });

      const validationError =
        folder === 'products'
          ? this.validFileImage(file, originalFileName)
          : this.validateAllFile(file, originalFileName);

      if (validationError !== null) {
        resUploadFileFailedList.push(
          `${originalFileName} -> ${validationError}`,
        );

        console.warn('[UPLOAD FILE REJECTED]', {
          fileName: originalFileName,
          reason: validationError,
        });

        continue;
      }

      try {
        const finalName = this.generateUniqueFileName(originalFileName);

        await this.saveFileToStorage(file, folder, finalName);

        const dto = new ResUploadFileDto();
        dto.fileName = finalName;
        dto.uploadedAt = new Date();

        resUploadFileDtoList.push(dto);
      } catch (error) {
        throw new Error(
          `Không thể lưu file ${originalFileName}. Vui lòng thử lại!`,
          { cause: error },
        );
      }
    }

    const result = new ResUploadFileResultDto();
    result.resUploadFileDtoList = resUploadFileDtoList;
    result.resUploadFileFailedList = resUploadFileFailedList;

    console.log('[UPLOAD FILE RESULT]', {
      successCount: resUploadFileDtoList.length,
      failedFiles: resUploadFileFailedList,
    });

    return result;
  }

  async getFileLength(fileName: string, folder: string): Promise<number> {
    const filePath = this.resolveFilePath(fileName, folder);

    try {
      const stat = await fs.stat(filePath);
      return stat.isFile() ? stat.size : 0;
    } catch {
      return 0;
    }
  }

  async getResource(fileName: string, folder: string): Promise<unknown> {
    const filePath = this.resolveFilePath(fileName, folder);

    try {
      const stat = await fs.stat(filePath);

      if (!stat.isFile()) {
        throw new Error(`Không tìm thấy file: ${fileName}`);
      }

      await fs.access(filePath);
      return await fs.readFile(filePath);
    } catch {
      throw new Error(`Không tìm thấy file: ${fileName}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<ResUploadFileDto> {
    if (!file) {
      throw new UploadFileException('Không có file được tải lên');
    }

    await this.createDirectory(folder);

    const originalFileName = this.cleanFileName(file.originalname);
    const validationError = this.validFileImage(file, originalFileName);

    if (validationError !== null) {
      throw new UploadFileException(validationError);
    }

    const finalName = this.generateUniqueFileName(originalFileName);

    await this.saveFileToStorage(file, folder, finalName);

    const dto = new ResUploadFileDto();
    dto.fileName = finalName;
    dto.uploadedAt = new Date();

    return dto;
  }

  private validateAllFile(
    file: Express.Multer.File,
    originalFileName: string,
  ): string | null {
    if (!file || file.size === 0) {
      return 'File trống';
    }

    const lowerFileName = originalFileName.toLowerCase();

    const isValidExtension = FileServiceImpl.ALLOWED_EXTENSIONS.some(
      (extension) => lowerFileName.endsWith(`.${extension}`),
    );

    if (!isValidExtension) {
      return 'Định dạng file không được hỗ trợ';
    }

    if (file.size > FileServiceImpl.MAX_FILE_SIZE) {
      return 'Dung lượng file vượt quá giới hạn cho phép (4MB)';
    }

    const contentType = file.mimetype?.toLowerCase();

    if (
      !contentType ||
      !FileServiceImpl.ALLOWED_MIME_TYPES.includes(contentType)
    ) {
      return 'Loại nội dung (MimeType) không hợp lệ';
    }

    return null;
  }

  private validFileImage(
    file: Express.Multer.File,
    originalFileName: string,
  ): string | null {
    if (!file || file.size === 0) {
      return 'File trống';
    }

    const lowerFileName = originalFileName.toLowerCase();

    const isValidExtension = FileServiceImpl.ALLOWED_EXTENSIONS_IMAGE.some(
      (extension) => lowerFileName.endsWith(`.${extension}`),
    );

    if (!isValidExtension) {
      return 'Định dạng file không được hỗ trợ';
    }

    if (file.size > FileServiceImpl.MAX_FILE_SIZE) {
      return 'Dung lượng file vượt quá giới hạn cho phép (4MB)';
    }

    const contentType = file.mimetype?.toLowerCase();

    if (
      !contentType ||
      !FileServiceImpl.ALLOWED_MIME_TYPES_IMAGE.includes(contentType)
    ) {
      return 'Loại nội dung (MimeType) không hợp lệ';
    }

    return null;
  }

  private generateUniqueFileName(originalFileName: string): string {
    return `${Date.now()}-${originalFileName}`;
  }

  private async saveFileToStorage(
    file: Express.Multer.File,
    folder: string,
    finalName: string,
  ): Promise<void> {
    const targetLocation = this.resolveFilePath(finalName, folder);

    if (file.path) {
      await fs.copyFile(file.path, targetLocation);
      return;
    }

    if (file.buffer && file.buffer.length > 0) {
      await fs.writeFile(targetLocation, file.buffer);
      return;
    }

    throw new Error('Không tìm thấy dữ liệu file để lưu');
  }

  private resolveFilePath(fileName: string, folder: string): string {
    return path.resolve(this.baseUri, folder, fileName);
  }

  private cleanFileName(fileName: string): string {
    return path.basename(fileName);
  }
}
