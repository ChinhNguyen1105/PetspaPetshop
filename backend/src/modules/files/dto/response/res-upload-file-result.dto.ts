export class ResUploadFileResultDto {
  resUploadFileDtoList: ResUploadFileDto[];
  resUploadFileFailedList: string[];
}

export class ResUploadFileDto {
  fileName: string;
  uploadedAt: Date;
}
