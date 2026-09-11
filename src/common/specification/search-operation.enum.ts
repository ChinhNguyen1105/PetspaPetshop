export enum SearchOperation {
  EQUALITY = 'EQUALITY',
  NEGATION = 'NEGATION',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  LIKE = 'LIKE',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS = 'CONTAINS',
  GREATER_THAN_EQUAL = 'GREATER_THAN_EQUAL',
  LESS_THAN_EQUAL = 'LESS_THAN_EQUAL',
}

export const SIMPLE_OPERATION_SET = new Set([
  ':',
  '!',
  '>',
  '<',
  '~',
  '>=',
  '<=',
]);

export const OR_PREDICATE_FLAG = "'";

export const ZERO_OR_MORE_REGEX = '*';

export const LEFT_PARENTHESIS = '(';

export const RIGHT_PARENTHESIS = ')';

export function getSimpleOperation(
  simpleOperation: string,
): SearchOperation | null {
  switch (simpleOperation) {
    case ':':
      return SearchOperation.EQUALITY;
    case '!':
      return SearchOperation.NEGATION;
    case '>':
      return SearchOperation.GREATER_THAN;
    case '<':
      return SearchOperation.LESS_THAN;
    case '>=':
      return SearchOperation.GREATER_THAN_EQUAL;
    case '<=':
      return SearchOperation.LESS_THAN_EQUAL;
    case '~':
      return SearchOperation.LIKE;
    default:
      return null;
  }
}
