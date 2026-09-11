import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidPhone', async: false })
export class PhoneValidator implements ValidatorConstraintInterface {
  private static readonly VIETNAM_PHONE_PATTERN =
    /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    if (value.trim().length === 0) {
      return true;
    }

    return PhoneValidator.VIETNAM_PHONE_PATTERN.test(value);
  }

  defaultMessage(): string {
    return 'Invalid phone number';
  }
}
