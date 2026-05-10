class BadgeQueries {
  /** @type {import('pg').Pool} */
  #db

  constructor({ db }) {
    this.#db = db
  }

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

  async fetchRouteCount(userId) {
    const { rows } = await this.#db.query(
      `SELECT COUNT(*)::int AS count
       FROM route
       WHERE creator_id = $1`,
      [userId]
    )
    return rows[0].count
  }

  async awardBadge(userId, badgeId) {
    await this.#db.query(
      `INSERT INTO user_badge (user_id, badge_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, badge_id) DO NOTHING`,
      [userId, badgeId]
    )
  }

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

module.exports = { BadgeQueries }
