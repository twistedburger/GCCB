class BadgeEvaluator {
  /** @type {import('./BadgeQueries').BadgeQueries} */
  #badgeQueries

  // defined metrics constants from db
  static #METRICS = Object.freeze({
    co2SavedKg: 'co2_saved_kg',
    tripCount: 'trip_count',
    modeTrips: 'mode_trips',
    routesCreated: 'routes_created',
    eventsAttended: 'events_attended',
  })

  static #METRIC_RESOLVERS = {
    [BadgeEvaluator.#METRICS.co2SavedKg]: summary =>
      summary?.totalCo2SavedKg ?? 0,
    [BadgeEvaluator.#METRICS.tripCount]: summary => summary?.tripCount ?? 0,
    [BadgeEvaluator.#METRICS.modeTrips]: (
      summary,
      routeCount,
      eventCount,
      metricArg
    ) => summary?.tripFrequenciesByMode?.[metricArg] ?? 0,
    [BadgeEvaluator.#METRICS.routesCreated]: (summary, routeCount) =>
      routeCount,
    [BadgeEvaluator.#METRICS.eventsAttended]: (
      summary,
      routeCount,
      eventCount
    ) => eventCount,
  }

  /**
   * @param {Object} params
   * @param {import('./BadgeQueries').BadgeQueries} params.badgeQueries
   */
  constructor({ badgeQueries }) {
    this.#badgeQueries = badgeQueries
  }

  getBadgeMetricValue(badge, analyticsSummary, routeCount, eventCount) {
    const resolver = BadgeEvaluator.#METRIC_RESOLVERS[badge.metric]
    if (!resolver) return 0
    return resolver(analyticsSummary, routeCount, eventCount, badge.metric_arg)
  }

  async evaluateBadges(userId, analyticsSummary) {
    const [unearnedBadges, routeCount, eventCount] = await Promise.all([
      this.#badgeQueries.fetchUnearnedBadges(userId),
      this.#badgeQueries.fetchRouteCount(userId),
      this.#badgeQueries.fetchEventCount(userId),
    ])

    const newlyAwarded = []

    for (const badge of unearnedBadges) {
      const current = this.getBadgeMetricValue(
        badge,
        analyticsSummary,
        routeCount,
        eventCount
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
