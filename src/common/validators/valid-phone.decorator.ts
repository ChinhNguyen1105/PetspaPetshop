import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

import { PhoneValidator } from 'src/common/validators/phone.validator';

export function ValidPhone(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    registerDecorator({
      name: 'ValidPhone',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      validator: PhoneValidator,
    });
  };
}
