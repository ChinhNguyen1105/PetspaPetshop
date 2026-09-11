import {
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

import { SearchOperation } from 'src/common/specification/search-operation.enum';
import { SpecSearchCriteria } from 'src/common/specification/spec-search-criteria';

export class GenericSpecification<T extends ObjectLiteral> {
  constructor(
    private readonly specSearchCriteria: SpecSearchCriteria,
  ) {}

  apply(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    parameterIndex: number,
  ): {
    queryBuilder: SelectQueryBuilder<T>;
    parameterIndex: number;
  } {
    const criteria = this.specSearchCriteria;
    const parameterName = `filterValue${parameterIndex}`;

    const path = this.getPath(
      queryBuilder,
      alias,
      criteria.key,
    );

    const value = this.castToRequiredType(
      queryBuilder,
      alias,
      criteria.key,
      criteria.value,
    );

    switch (criteria.operation) {
      case SearchOperation.EQUALITY:
        queryBuilder.andWhere(
          `${path} = :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.NEGATION:
        queryBuilder.andWhere(
          `${path} != :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.GREATER_THAN:
        queryBuilder.andWhere(
          `${path} > :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.LESS_THAN:
        queryBuilder.andWhere(
          `${path} < :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.GREATER_THAN_EQUAL:
        queryBuilder.andWhere(
          `${path} >= :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.LESS_THAN_EQUAL:
        queryBuilder.andWhere(
          `${path} <= :${parameterName}`,
          {
            [parameterName]: value,
          },
        );
        break;

      case SearchOperation.CONTAINS:
        queryBuilder.andWhere(
          `LOWER(${path}) LIKE :${parameterName}`,
          {
            [parameterName]:
              `%${String(value).toLowerCase()}%`,
          },
        );
        break;

      case SearchOperation.LIKE:
        queryBuilder.andWhere(
          `${path} LIKE :${parameterName}`,
          {
            [parameterName]: String(value),
          },
        );
        break;

      case SearchOperation.STARTS_WITH:
        queryBuilder.andWhere(
          `LOWER(${path}) LIKE :${parameterName}`,
          {
            [parameterName]:
              `${String(value).toLowerCase()}%`,
          },
        );
        break;

      case SearchOperation.ENDS_WITH:
        queryBuilder.andWhere(
          `LOWER(${path}) LIKE :${parameterName}`,
          {
            [parameterName]:
              `%${String(value).toLowerCase()}`,
          },
        );
        break;

      default:
        break;
    }

    return {
      queryBuilder,
      parameterIndex: parameterIndex + 1,
    };
  }

  private getPath(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    key: string,
  ): string {
    if (!key.includes('.')) {
      return `${alias}.${key}`;
    }

    const parts = key.split('.');

    if (parts.length !== 2) {
      return `${alias}.${key}`;
    }

    const relation = parts[0];
    const property = parts[1];
    const relationAlias = `${alias}_${relation}`;

    const existingJoin =
      queryBuilder.expressionMap.joinAttributes.find(
        (join) =>
          join.alias?.name === relationAlias,
      );

    if (!existingJoin) {
      queryBuilder.leftJoin(
        `${alias}.${relation}`,
        relationAlias,
      );
    }

    return `${relationAlias}.${property}`;
  }

  private castToRequiredType(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string,
    key: string,
    value: unknown,
  ): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    const propertyName = key.includes('.')
      ? key.split('.')[1]
      : key;

    const mainAlias =
      queryBuilder.expressionMap.mainAlias;

    if (!mainAlias) {
      return value;
    }

    const metadata =
      queryBuilder.connection.getMetadata(
        mainAlias.target,
      );

    const column =
      metadata.findColumnWithPropertyName(
        propertyName,
      );

    if (!column) {
      return value;
    }

    const columnType = column.type;

    if (
      columnType === String ||
      columnType === 'varchar' ||
      columnType === 'nvarchar' ||
      columnType === 'text'
    ) {
      return String(value);
    }

    if (
      columnType === Number ||
      columnType === 'int' ||
      columnType === 'integer' ||
      columnType === 'bigint' ||
      columnType === 'decimal' ||
      columnType === 'float' ||
      columnType === 'double'
    ) {
      const numberValue = Number(value);

      return Number.isNaN(numberValue)
        ? value
        : numberValue;
    }

    if (
      columnType === Boolean ||
      columnType === 'boolean' ||
      columnType === 'bool'
    ) {
      if (typeof value === 'boolean') {
        return value;
      }

      const normalizedValue =
        String(value).toLowerCase();

      if (normalizedValue === 'true') {
        return true;
      }

      if (normalizedValue === 'false') {
        return false;
      }

      return value;
    }

    if (
      columnType === Date ||
      columnType === 'datetime' ||
      columnType === 'timestamp' ||
      columnType === 'timestamp without time zone' ||
      columnType === 'timestamp with time zone'
    ) {
      const dateValue = new Date(String(value));

      return Number.isNaN(dateValue.getTime())
        ? value
        : dateValue;
    }

    return value;
  }
}
