import {
  getSimpleOperation,
  OR_PREDICATE_FLAG,
  SearchOperation,
  ZERO_OR_MORE_REGEX,
} from 'src/common/specification/search-operation.enum';

export class SpecSearchCriteria {
  readonly key: string;
  readonly operation: SearchOperation | null;
  readonly value: unknown;
  readonly orPredicate: boolean;

  constructor(
    orPredicate: string | null,
    key: string,
    operation: string,
    value: unknown,
    prefix?: string | null,
    suffix?: string | null,
  ) {
    if (operation === null || operation === undefined || operation === '') {
      throw new Error('Search operation cannot be empty or null');
    }

    let searchOperation = getSimpleOperation(operation);

    if (
      searchOperation === SearchOperation.EQUALITY ||
      searchOperation === SearchOperation.LIKE
    ) {
      const startWithAsterisks =
        (prefix != null && prefix.includes(ZERO_OR_MORE_REGEX)) ||
        (value != null &&
          String(value).startsWith(ZERO_OR_MORE_REGEX));

      const endWithAsterisks =
        (suffix != null && suffix.includes(ZERO_OR_MORE_REGEX)) ||
        (value != null &&
          String(value).endsWith(ZERO_OR_MORE_REGEX));

      if (startWithAsterisks && endWithAsterisks) {
        searchOperation = SearchOperation.CONTAINS;
      } else if (startWithAsterisks) {
        searchOperation = SearchOperation.ENDS_WITH;
      } else if (endWithAsterisks) {
        searchOperation = SearchOperation.STARTS_WITH;
      } else {
        searchOperation = SearchOperation.CONTAINS;
      }
    }

    this.key = key;
    this.operation = searchOperation;
    this.value = value;
    this.orPredicate =
      orPredicate != null &&
      orPredicate === OR_PREDICATE_FLAG;
  }
}
