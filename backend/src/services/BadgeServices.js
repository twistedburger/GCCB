/**
 * Provides methods for querying and updating badge-related data in the database.
 * Handles fetching badges, awarding badges, updating progress, and retrieving user badge details.
 */
class BadgeServices {
  /** @type {import('pg').Pool} */
  #db

  /**
   * @param {Object} params
   * @param {import('pg').Pool} params.db
   */
  constructor({ db }) {
    this.#db = db
  }

  /**
   * Fetches all badges the user have not been earned.
   *
   * @param {number} userId
   * @returns {Promise<Object[]>} Array of badge rows.
   */
  async fetchUnearnedBadges(userId) {
    const { rows } = await this.#db.query(
      `SELECT b.*
       FROM badge b
       WHERE NOT EXISTS (
         SELECT 1 FROM user_badge ub
         WHERE ub.badge_id = b.id
           AND ub.user_id  = $1
       )`,
      [userId]
    )
    return rows
  }

  /**
   * Fetches the number of routes created by the user.
   * Used to evaluate Social badge progress (routes_created metric).
   *
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async fetchRouteCount(userId) {
    const { rows } = await this.#db.query(
      `SELECT COUNT(*)::int AS count
       FROM route
       WHERE creator_id = $1`,
      [userId]
    )
    return rows[0].count
  }

  /**
   * Awards a badge to a user by inserting into user_badge.
   * Ignores duplicate awards if somehow earned again.
   *
   * @param {number} userId
   * @param {number} badgeId
   * @returns {Promise<void>}
   */
  async awardBadge(userId, badgeId) {
    await this.#db.query(
      `INSERT INTO user_badge (user_id, badge_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, badge_id) DO NOTHING`,
      [userId, badgeId]
    )
  }

  /**
   * Upserts the user's current progress toward a badge.
   * Creates the row if it doesn't exist; otherwise updates.
   *
   * @param {number} userId
   * @param {number} badgeId
   * @param {number} currentValue
   * @returns {Promise<void>}
   */
  async upsertBadgeProgress(userId, badgeId, currentValue) {
    await this.#db.query(
      `INSERT INTO badge_progress (user_id, badge_id, current_value, last_updated)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, badge_id)
       DO UPDATE SET
         current_value = EXCLUDED.current_value,
         last_updated  = EXCLUDED.last_updated`,
      [userId, badgeId, currentValue]
    )
  }

  /**
   * Fetches all badges for a user with earned status, date earned, and
   * current progress.
   *
   * Ordered by tier descending (Gold first), then category, then threshold
   * ascending.
   *
   * @param {number} userId
   * @returns {Promise<Object[]>}
   */
  async fetchUserBadgeDetails(userId) {
    const { rows } = await this.#db.query(
      `SELECT
         b.id,
         b.key,
         b.title,
         b.description,
         b.category,
         b.icon_key    AS "iconKey",
         b.metric,
         b.metric_arg  AS "metricArg",
         b.threshold,
         b.tier,
         CASE WHEN ub.badge_id IS NOT NULL
              THEN true ELSE false
         END                                          AS earned,
         ub.date_earned                               AS "dateEarned",
         COALESCE(bp.current_value, 0)                AS "currentValue",
         LEAST(
           COALESCE(bp.current_value, 0) / NULLIF(b.threshold, 0),
           1.0
         )                                            AS progress
       FROM badge b
       LEFT JOIN user_badge    ub ON ub.badge_id = b.id AND ub.user_id = $1
       LEFT JOIN badge_progress bp ON bp.badge_id = b.id AND bp.user_id = $1
       ORDER BY b.tier DESC, b.category, b.threshold ASC`,
      [userId]
    )
    return rows
  }
}

module.exports = { BadgeServices }
