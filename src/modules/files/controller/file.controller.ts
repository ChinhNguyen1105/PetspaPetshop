import {
  Controller,
  Get,
  Header,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import type { FileService } from 'src/modules/files/service/file.service';

@RestApiV1()
@Controller()
export class FileController {
  constructor(
    private readonly fileService: FileService,
  ) {}

  @Get('/files/download')
  async downloadFile(
    @Query('fileName') fileName: string,
    @Query('folder') folder: string,
    @Res() response: Response,
  ) {
    const resource =
      await this.fileService.getResource(
        fileName,
        folder,
      );

    const contentType =
      this.getContentType(fileName);

    response.setHeader(
      'Content-Type',
      contentType,
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );

    response.send(resource);
  }

  private getContentType(
    fileName: string,
  ): string {
    const extension =
      fileName
        .split('.')
        .pop()
        ?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'application/pdf';

      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';

      case 'png':
        return 'image/png';

      case 'webp':
        return 'image/webp';

      case 'gif':
        return 'image/gif';

      case 'doc':
        return 'application/msword';

      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      default:
        return 'application/octet-stream';
    }
  }
}
