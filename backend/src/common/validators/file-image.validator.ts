import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'fileImage', async: false })
export class FileImageValidator implements ValidatorConstraintInterface {
  validate(file: any, args: ValidationArguments) {
    // Cho phép null/undefined nếu trường không bắt buộc (dùng kèm @IsOptional)
    if (!file) return true;

    // Xử lý linh hoạt cho cả Upload 1 file hoặc mảng Files
    const files = Array.isArray(file) ? file : [file];
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (const f of files) {
      if (!f.mimetype || !allowedMimeTypes.includes(f.mimetype)) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Tệp tải lên phải là định dạng hình ảnh hợp lệ (JPG, PNG, GIF, WEBP)!';
  }
}
