import { ObjectLiteral } from 'typeorm';

import {
  SIMPLE_OPERATION_SET,
  OR_PREDICATE_FLAG,
} from 'src/common/specification/search-operation.enum';
import { FilterAttributeSearch } from 'src/common/specification/filter-attribute-search';
import { SpecificationBuilder } from 'src/common/specification/specification-builder';

export class FilterProcessor<T extends ObjectLiteral> {
  constructor(
    public readonly specificationBuilder: SpecificationBuilder<T>,
    public readonly filter: string[] | null,
  ) {}

  static process<T extends ObjectLiteral>(
    specificationBuilder: SpecificationBuilder<T>,
    filter: string[] | null,
  ): FilterProcessor<T> {
    const processor = new FilterProcessor(
      specificationBuilder,
      filter,
    );

    processor.parse();

    return processor;
  }

  private parse(): void {
    if (!this.filter || this.filter.length === 0) {
      return;
    }

    const filters = this.filter
      .flatMap((filter) => filter.split(','))
      .map((filter) => filter.trim())
      .filter((filter) => filter.length > 0);

    for (const filter of filters) {
      this.parseFilter(filter);
    }
  }

  private parseFilter(filter: string): void {
    let value = filter;
    let orPredicate: string | null = null;

    if (value.startsWith(OR_PREDICATE_FLAG)) {
      orPredicate = OR_PREDICATE_FLAG;
      value = value.substring(1);
    }

    const operationMatch = this.findOperation(value);

    if (!operationMatch) {
      return;
    }

    const {
      index,
      operation,
    } = operationMatch;

    const key = value.substring(0, index).trim();
    const rawValue = value.substring(
      index + operation.length,
    );

    if (!key || !rawValue) {
      return;
    }

    const filterAttribute =
      FilterAttributeSearch.handleWildCardSearch(
        rawValue,
        orPredicate,
      );

    this.specificationBuilder.with(
      orPredicate,
      key,
      operation,
      filterAttribute.valueStr,
      filterAttribute.prefix,
      filterAttribute.suffix,
    );
  }

  private findOperation(
    filter: string,
  ): { index: number; operation: string } | null {
    const operations = [...SIMPLE_OPERATION_SET].sort(
      (a, b) => b.length - a.length,
    );

    for (const operation of operations) {
      const index = filter.indexOf(operation);

      if (index > 0) {
        return {
          index,
          operation,
        };
      }
    }

    return null;
  }
}
