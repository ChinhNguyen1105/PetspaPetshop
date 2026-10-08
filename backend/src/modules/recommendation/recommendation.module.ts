
import { Module } from '@nestjs/common';

import { PROVIDER_TOKEN } from 'src/common/constants/provider-token.constant';

import { RecommendationServiceImpl } from 'src/modules/recommendation/service/recommendation.service.impl';

@Module({
  providers: [
    RecommendationServiceImpl,
    {
      provide: PROVIDER_TOKEN.RECOMMENDATION_SERVICE,
      useExisting: RecommendationServiceImpl,
    },
  ],
  exports: [
    RecommendationServiceImpl,
    {
      provide: PROVIDER_TOKEN.RECOMMENDATION_SERVICE,
      useExisting: RecommendationServiceImpl,
    },
  ],
})
export class RecommendationModule {}

