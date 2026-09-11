import {
  OR_PREDICATE_FLAG,
  ZERO_OR_MORE_REGEX,
} from 'src/common/specification/search-operation.enum';

export class FilterAttributeSearch {
  constructor(
    public readonly valueStr: string,
    public readonly prefix: string | null,
    public readonly suffix: string | null,
    public readonly isOrPredicate: boolean,
  ) {}

  static handleWildCardSearch(
    valueStr: string,
    orIndicator: string | null,
  ): FilterAttributeSearch {
    let prefix: string | null = null;
    let suffix: string | null = null;

    if (valueStr.startsWith(ZERO_OR_MORE_REGEX)) {
      prefix = ZERO_OR_MORE_REGEX;
      valueStr = valueStr.substring(1);
    }

    if (valueStr.endsWith(ZERO_OR_MORE_REGEX)) {
      suffix = ZERO_OR_MORE_REGEX;
      valueStr = valueStr.substring(0, valueStr.length - 1);
    }

    const isOrPredicate =
      orIndicator !== null &&
      orIndicator === OR_PREDICATE_FLAG;

    return new FilterAttributeSearch(
      valueStr,
      prefix,
      suffix,
      isOrPredicate,
    );
  }
}
