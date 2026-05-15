/**
 * Contains the logic for evaluating user badges based on analytics data.
 * Handles badge achievement checks, progress updates, and retrieval of badge details.
 */
class BadgeEvaluator {
  /** @type {import('../services/BadgeServices').BadgeQueries} */
  #badgeQueries

  // defined metrics constants from db
  static #METRICS = Object.freeze({
    co2SavedKg: 'co2_saved_kg',
    tripCount: 'trip_count',
    modeTrips: 'mode_trips',
    routesCreated: 'routes_created',
  })

  /**
   * Maps each badge metric type to a resolver function.
   *
   * @type {Object.<string, function(Object, number, string=): number>}
   */
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
   * @param {import('../services/BadgeServices').BadgeQueries} params.badgeQueries
   */
  constructor({ badgeQueries }) {
    this.#badgeQueries = badgeQueries
  }

  /**
   * Returns the user's current value for a given badge's metric.
   *
   * @param {Object} badge            Badge row from the DB.
   * @param {Object} analyticsSummary Analytics summary
   * @param {number} routeCount       Number of routes created by the user.
   * @returns {number}
   */
  getBadgeMetricValue(badge, analyticsSummary, routeCount) {
    const resolver = BadgeEvaluator.#METRIC_RESOLVERS[badge.metric]
    if (!resolver) return 0
    return resolver(analyticsSummary, routeCount, badge.metric_arg)
  }

  /**
   * Evaluates all unearned badges for a user and:
   * - Awards any badge where threshold progress has been met.
   * - Upserts badge_progress for badges still in progress.
   *
   * Called after route completion and route/event creation.
   *
   * @param {number} userId
   * @param {Object} analyticsSummary Analytics summary from buildAnalyticsSummary.
   * @returns {Promise<string[]>} Keys of any newly awarded badges.
   */
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

  /**
   * Returns all badges for a user with earned status and progress.
   *
   * @param {number} userId
   * @returns {Promise<Object[]>}
   */
  async getBadgesForUser(userId) {
    return this.#badgeQueries.fetchUserBadgeDetails(userId)
  }
}

module.exports = { BadgeEvaluator }
