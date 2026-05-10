class BadgeEvaluator {
  /** @type {import('./BadgeQueries').BadgeQueries} */
  #badgeQueries

  // defined metrics constants from db
  static #METRICS = Object.freeze({
    co2SavedKg: 'co2_saved_kg',
    tripCount: 'trip_count',
    modeTrips: 'mode_trips',
    routesCreated: 'routes_created',
  })

  static #METRIC_RESOLVERS = {
    [BadgeEvaluator.#METRICS.co2SavedKg]: summary =>
      summary?.totalCo2SavedKg ?? 0,
    [BadgeEvaluator.#METRICS.tripCount]: summary => summary?.tripCount ?? 0,
    [BadgeEvaluator.#METRICS.modeTrips]: (summary, routeCount, metricArg) =>
      summary?.tripFrequenciesByMode?.[metricArg] ?? 0,
    [BadgeEvaluator.#METRICS.routesCreated]: (summary, routeCount) =>
      routeCount,
  }

  /**
   * @param {Object} params
   * @param {import('./BadgeQueries').BadgeQueries} params.badgeQueries
   */
  constructor({ badgeQueries }) {
    this.#badgeQueries = badgeQueries
  }

  getBadgeMetricValue(badge, analyticsSummary, routeCount) {
    const resolver = BadgeEvaluator.#METRIC_RESOLVERS[badge.metric]
    if (!resolver) return 0
    return resolver(analyticsSummary, routeCount, badge.metric_arg)
  }

  async evaluateBadges(userId, analyticsSummary) {
    const [unearnedBadges, routeCount] = await Promise.all([
      this.#badgeQueries.fetchUnearnedBadges(userId),
      this.#badgeQueries.fetchRouteCount(userId),
    ])

    const newlyAwarded = []

    for (const badge of unearnedBadges) {
      const current = this.getBadgeMetricValue(
        badge,
        analyticsSummary,
        routeCount
      )

      if (current >= badge.threshold) {
        await this.#badgeQueries.awardBadge(userId, badge.id)
        newlyAwarded.push(badge.key)
      } else {
        await this.#badgeQueries.upsertBadgeProgress(userId, badge.id, current)
      }
    }

    return newlyAwarded
  }

  async getBadgesForUser(userId) {
    return this.#badgeQueries.fetchUserBadgeDetails(userId)
  }
}

module.exports = { BadgeEvaluator }
