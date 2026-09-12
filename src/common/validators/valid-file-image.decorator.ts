import { registerDecorator, ValidationOptions } from 'class-validator';
import { FileImageValidator } from './file-image.validator';

export function ValidFileImage(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: FileImageValidator,
    });
  };
}
