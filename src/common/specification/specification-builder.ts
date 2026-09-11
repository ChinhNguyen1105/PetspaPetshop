import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { GenericSpecification } from 'src/common/specification/generic-specification';
import { SpecSearchCriteria } from 'src/common/specification/spec-search-criteria';

export class SpecificationBuilder<T extends ObjectLiteral> {
  private readonly params: SpecSearchCriteria[] = [];

  with(
    key: string,
    operation: string,
    value: unknown,
    prefix: string | null,
    suffix: string | null,
  ): SpecificationBuilder<T>;

  with(
    orPredicate: string | null,
    key: string,
    operation: string,
    value: unknown,
    prefix: string | null,
    suffix: string | null,
  ): SpecificationBuilder<T>;

  with(
    first: string | null,
    second: string,
    third: string,
    fourth: unknown,
    fifth: string | null,
    sixth?: string | null,
  ): SpecificationBuilder<T> {
    if (sixth === undefined) {
      this.params.push(
        new SpecSearchCriteria(
          null,
          first as string,
          second,
          third,
          fourth as string | null,
          fifth,
        ),
      );
    } else {
      this.params.push(
        new SpecSearchCriteria(
          first,
          second,
          third,
          fourth,
          fifth,
          sixth,
        ),
      );
    }

    return this;
  }

  build(): SpecSearchCriteria[] | null {
    if (this.params.length === 0) {
      return null;
    }

    return [...this.params];
  }

  apply(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
  ): SelectQueryBuilder<T> {
    let parameterIndex = 0;

    for (const criteria of this.params) {
      const specification =
        new GenericSpecification<T>(criteria);

      const beforeWhereCount =
        queryBuilder.expressionMap.wheres.length;

      const result = specification.apply(
        queryBuilder,
        alias,
        parameterIndex,
      );

      queryBuilder = result.queryBuilder;
      parameterIndex = result.parameterIndex;

      const addedWhereCount =
        queryBuilder.expressionMap.wheres.length -
        beforeWhereCount;

      if (addedWhereCount === 0) {
        continue;
      }

      const lastWhere =
        queryBuilder.expressionMap.wheres[
          queryBuilder.expressionMap.wheres.length - 1
        ];

      if (!lastWhere) {
        continue;
      }

      lastWhere.type = criteria.orPredicate
        ? 'or'
        : 'and';
    }

    return queryBuilder;
  }
}
