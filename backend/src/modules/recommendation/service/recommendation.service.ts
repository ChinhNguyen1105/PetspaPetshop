export interface RecommendationService {
  recommendProducts(productIds: number[]): Promise<number[]>;

  recommendServices(serviceIds: number[]): Promise<number[]>;
}
