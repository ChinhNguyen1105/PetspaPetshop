import { ObjectLiteral } from 'typeorm';

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
    return new FilterProcessor(
      specificationBuilder,
      filter,
    );
  }
}
