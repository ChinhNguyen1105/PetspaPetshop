# Recommendations module

The FE calls `POST /products/recommendations` and `POST /services/recommendations`
with `{ itemIds: number[] }`. Its store expects
`data.recommendedItemIds: number[]`.

Treat this as a read-only suggestion API. Validate/limit input IDs, exclude
unavailable or unauthorized catalogue records, and return an empty list when no
model result exists. The recommendation algorithm, training data, explanation,
privacy basis and fallback policy are not defined; do not introduce a costly
Apriori job or persist behavioural profiling without approval.
