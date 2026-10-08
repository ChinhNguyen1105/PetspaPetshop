import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function EnumValue(
  enumObject: object,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    registerDecorator({
      name: 'EnumValue',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      constraints: [enumObject],
      options: validationOptions,
      validator: {
        validate(
          value: unknown,
          args: ValidationArguments,
        ): boolean {
          if (value === null || value === undefined) {
            return true;
          }

          const enumValues = Object.values(
            args.constraints[0] as object,
          ).map((item) => String(item));

          return enumValues.includes(
            String(value).toUpperCase().trim(),
          );
        },

        defaultMessage(
          args: ValidationArguments,
        ): string {
          const enumValues = Object.values(
            args.constraints[0] as object,
          ).map((item) => String(item));

          return `must be any of enum [${enumValues.join(', ')}]`;
        },
      },
    });
  };
}
