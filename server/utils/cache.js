// Cache stubs — all operations are no-ops when Redis is disabled.
// The controllers use these helpers; they gracefully skip caching.

export const cacheGet = async (_key) => null;
export const cacheSet = async (_key, _value, _ttl) => {};
export const cacheDel = async (_keys) => {};
export const cacheDelPattern = async (_pattern) => {};

export const KEYS = {
  rooms:            () => "travesia:rooms:all",
  roomsByHotel:     (id) => `travesia:rooms:hotel:${id}`,
  cities:           () => "travesia:hotels:cities",
  recentReviews:    (limit) => `travesia:reviews:recent:${limit}`,
  roomReviews:      (roomId) => `travesia:reviews:room:${roomId}`,
  hotelReviewStats: (id) => `travesia:reviews:stats:hotel:${id}`,
};

export const TTL = {
  rooms:            300,
  cities:           600,
  recentReviews:    60,
  roomReviews:      120,
  hotelReviewStats: 120,
};
