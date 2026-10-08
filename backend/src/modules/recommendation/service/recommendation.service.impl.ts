import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RecommendationService } from 'src/modules/recommendation/service/recommendation.service';

interface Rule {
  antecedent: number[];
  consequent: number[];
  confidence: number;
  support: number;
  lift: number;
}

@Injectable()
export class RecommendationServiceImpl
  implements RecommendationService
{
  private static readonly PRODUCT_RULES_PATH =
    'recommendation/product/association_rules.json';

  private static readonly SERVICE_RULES_PATH =
    'recommendation/service/association_rules.json';

  private readonly logger = new Logger(
    RecommendationServiceImpl.name,
  );

  private readonly productRules: Rule[];
  private readonly serviceRules: Rule[];

  constructor() {
    this.productRules = this.loadRules(
      RecommendationServiceImpl.PRODUCT_RULES_PATH,
    );

    this.serviceRules = this.loadRules(
      RecommendationServiceImpl.SERVICE_RULES_PATH,
    );
  }

  recommendProducts(productIds: number[]): Promise<number[]> {
    return Promise.resolve(
      this.recommend(productIds, this.productRules),
    );
  }

  recommendServices(serviceIds: number[]): Promise<number[]> {
    return Promise.resolve(
      this.recommend(serviceIds, this.serviceRules),
    );
  }

  private recommend(
    itemIds: number[],
    rules: Rule[],
  ): number[] {
    if (
      !itemIds ||
      itemIds.length === 0 ||
      !rules ||
      rules.length === 0
    ) {
      return [];
    }

    const requested = new Set(itemIds);
    const recommended = new Set<number>();

    for (const rule of rules) {
      if (!rule.antecedent.every((id) => requested.has(id))) {
        continue;
      }

      for (const recommendedId of rule.consequent) {
        if (!requested.has(recommendedId)) {
          recommended.add(recommendedId);
        }
      }
    }

    return [...recommended];
  }

  private loadRules(classpathLocation: string): Rule[] {
    try {
      const filePath = join(
        process.cwd(),
        'dist',
        classpathLocation,
      );

      const content = readFileSync(filePath, 'utf-8');

      return JSON.parse(content) as Rule[];
    } catch (error) {
      this.logger.error(
        `Failed to load recommendation rules from ${classpathLocation}`,
        error instanceof Error ? error.stack : String(error),
      );

      return [];
    }
  }
}
