import {
  Controller,
  Get,
  Header,
  Inject,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';
import { RestApiV1 } from 'src/common/decorators/rest-api-v1.decorator';
import type { FileService } from 'src/modules/files/service/file.service';

@RestApiV1()
@Controller()
export class FileController {
  constructor(
    @Inject(PROVIDER_TOKEN.FILE_SERVICE)
    private readonly fileService: FileService,
  ) {}

  @Get('/files/download')
  async downloadFile(
    @Query('fileName') fileName: string,
    @Query('folder') folder: string,
    @Query('inline') inline: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!fileName || !folder) {
      response.status(400).json({
        statusCode: 400,
        message: 'fileName và folder là bắt buộc',
      });
      return;
    }

    try {
      const resource = await this.fileService.getResource(fileName, folder);
      const contentType = this.getContentType(fileName);
      const shouldDisplayInline =
        inline === 'true' && contentType.startsWith('image/');

      response.setHeader('Content-Type', contentType);
      response.setHeader(
        'X-Content-Type-Options',
        'nosniff',
      );
      response.setHeader(
        'Content-Disposition',
        `${shouldDisplayInline ? 'inline' : 'attachment'}; filename="${this.getSafeHeaderFileName(fileName)}"`,
      );

      response.send(resource);
    } catch {
      response.status(404).json({
        statusCode: 404,
        message: 'Không tìm thấy file',
      });
    }
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';

      case 'png':
        return 'image/png';

      case 'webp':
        return 'image/webp';

      case 'gif':
        return 'image/gif';

      case 'pdf':
        return 'application/pdf';

      case 'doc':
        return 'application/msword';

      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      default:
        return 'application/octet-stream';
    }
  }

  private getSafeHeaderFileName(fileName: string): string {
    return fileName.replace(/["\\\r\n]/g, '_');
  }
}
