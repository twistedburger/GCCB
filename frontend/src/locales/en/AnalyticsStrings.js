export const analyticsStrings = {
  common: {
    back: 'Back',
    close: 'Close',
    loading: 'Loading...',
    noData: 'No data available yet.',
    loadingCharts: 'Loading charts...',
    error: {
      generic: 'Something went wrong. Please try again.',
    },
  },

  dashboard: {
    title: 'My Account',
    welcome: 'Welcome to your dashboard!',
    metricCardsHint: 'Click a card below to see more details.',
    logout: 'Logout',
    loadingProfile: 'Loading profile...',
  },

  co2: {
    pageTitle: {
      admin: 'Community CO₂e Savings',
      user: 'My CO₂e Savings',
    },
    pageDescription: {
      admin:
        'Track estimated emissions avoided across all completed community trips. Use this to see which modes are contributing the most impact and where the community is making the biggest difference.',
      user: "Track the estimated emissions you've avoided across your completed trips. Every route you take by foot, bike, or transit instead of driving alone contributes to this total.",
    },
    disclaimer:
      'All values are estimates for awareness and analytics purposes, not exact real-world measurements.',
    howCalculated: 'How is this calculated?',

    kpis: {
      communitySaved: 'Community CO₂e Saved',
      personalSaved: 'Personal CO₂e Saved',
      avgPerTrip: 'Avg CO₂e Saved / Trip',
      tripsIncluded: 'Trips Included',
      distanceIncluded: 'Distance Included',
    },

    blocks: {
      keyMetrics: {
        title: 'Key metrics',
        descriptionAdmin:
          'Aggregate CO₂e totals across all completed community routes.',
        descriptionUser:
          'Your CO₂e totals based on routes you participated in.',
      },
      overview: {
        title: 'CO₂e savings overview',
        description:
          'Estimated savings across all completed trips, broken down by mode.',
      },
    },

    charts: {
      byMode: {
        title: 'CO₂e saved by mode',
        subtitle: 'Total kg CO₂e saved per transportation mode',
      },
      efficiency: {
        title: 'Savings efficiency by mode',
        subtitle: 'kg CO₂e saved per km travelled; higher is better',
      },
    },

    modal: {
      title: 'How CO₂e savings are calculated',

      baseline: {
        heading: 'Baseline',
        body: 'The baseline is a solo petrol car emitting 170 g CO₂e per vehicle-km. Every saving is calculated as the difference between what a trip would have emitted under this baseline and what it actually emitted.',
      },

      emissionFactors: {
        heading: 'Emission factors',
        columns: { mode: 'Mode', factor: 'Factor', basis: 'Basis' },
        rows: [
          {
            mode: 'Petrol car (baseline)',
            factor: '170 g / vehicle-km',
            basis: 'Solo occupant',
          },
          {
            mode: 'Electric car',
            factor: '47 g / vehicle-km',
            basis: 'Solo occupant',
          },
          {
            mode: 'Bus / Transit',
            factor: '97 g / passenger-km',
            basis: 'Per passenger',
          },
          {
            mode: 'Rail',
            factor: '35 g / passenger-km',
            basis: 'Per passenger',
          },
          {
            mode: 'Walk / Bicycle',
            factor: '0 g / km',
            basis: 'Zero direct emissions',
          },
        ],
      },

      formulas: {
        heading: 'Savings formula by mode',
        walk: {
          label: 'Walk / Bicycle',
          formula: 'Savings = distance * 170 ÷ 1000',
          note: 'Full baseline avoided; zero emissions produced.',
        },
        transit: {
          label: 'Bus / Rail',
          formula: 'Savings = distance * (170 - transit_factor) ÷ 1000',
          note: 'Partial saving; transit still emits, but far less than the solo-car baseline per passenger.',
        },
        carpool: {
          label: 'Carpool',
          formulaSystem:
            'System Savings = distance * (passengers * 170 - vehicle_factor) ÷ 1000',
          formulaUser: 'Your Individual Share = system savings ÷ passengers',
          note: 'Savings scale with group size. An electric carpool saves significantly more than a petrol one.',
        },
      },

      footnote:
        'Emission factors sourced from Our World in Data / International Council on Clean Transportation. Routes are calculated segment-by-segment.',
    },
  },

  tripFrequency: {
    pageTitle: {
      admin: 'Community Trip Frequency',
      user: 'My Trip Frequency',
    },
    pageDescription: {
      admin:
        'See how students across the community are travelling. Which modes they use most, how far they go, and where the biggest opportunities to shift away from solo car trips still exist.',
      user: "See how you're travelling; which modes you use most and how your choices compare across your completed trips.",
    },

    kpis: {
      mostUsedMode: 'Most Used Mode',
      communityTrips: 'Community Trips',
      communityDistance: 'Community Distance',
      totalTrips: 'Total Trips',
      totalDistance: 'Total Distance',
    },

    blocks: {
      atAGlance: {
        title: 'At a glance',
        descriptionAdmin:
          'Aggregate trip totals across all completed community routes.',
        descriptionUser:
          'Your completed trip totals based on routes you participated in.',
      },
      byMode: {
        title: 'Breakdown by mode',
        description:
          'Each completed trip is counted once and assigned to its dominant transportation mode. Multi-mode routes (for example a walk to the bus stop followed by a bus ride) are attributed to whichever mode covered the most distance.',
      },
      whyItMatters: {
        title: 'Why this matters',
        description:
          'Understanding how people travel is the first step to reducing emissions!',
        bodyAdmin:
          "Every trip that shifts away from driving alone reduces the community's collective carbon footprint. High walk, bicycle, and transit numbers here indicate the platform is achieving its core goal.",
        bodyUser:
          'Every trip you take by foot, bike, or transit instead of driving alone makes a real difference. As your most-used mode trends away from car, the greater your personal impact!',
        footnote: 'Trips are counted for completed routes only.',
      },
    },

    charts: {
      byMode: {
        title: 'Trips by mode',
        subtitle: 'Number of completed trips per transportation mode',
      },
      avgDistance: {
        title: 'Avg distance per trip by mode',
        subtitle:
          'km per trip on average; longer trips suggest further commutes',
      },
    },
  },

  commutes: {
    pageTitle: 'My Commutes',
    pageDescription:
      'Review the completed trips included in your commute metrics.',

    kpis: {
      trips: 'Trips',
      totalDistance: 'Total Distance',
      avgDistance: 'Avg Distance / Trip',
      co2Saved: 'Personal CO₂e Saved',
    },

    blocks: {
      filters: {
        title: 'Filters',
        dateRangeLabel: 'Date range',
        modeLabel: 'Transportation mode',
      },
      keyMetrics: { title: 'Key metrics' },
      history: {
        title: 'Commute history',
        empty: 'No completed trips match the selected filters.',
        loading: 'Loading commute history...',
        untitled: 'Untitled commute',
        unknownOrigin: 'Unknown origin',
        unknownDestination: 'Unknown destination',
      },
    },

    route: {
      mode: 'Mode',
      distance: 'Distance',
      co2Saved: 'CO₂e Saved',
    },
  },

  activity: {
    pageTitle: 'Platform Activity',
    pageDescription:
      'Monitor platform-wide engagement; track how routes are being created, completed, and rejected across the community.',

    kpis: {
      activeCreators7d: 'Active Route Creators (7d)',
      activeCreators7dSub:
        'Distinct users who created a route in the last 7 days',
      completionRate30d: 'Completion Rate (30d)',
      completionRate30dSub: 'Of routes created in the last 30 days',
      rejectedRoutes30d: 'Rejected Routes (30d)',
      rejectedRoutes30dSub:
        'Routes with a rejection reason in the last 30 days',
      avgGroupSize: 'Avg Group Size',
      avgGroupSizeSub: 'Average participants per completed route',
    },

    blocks: {
      atAGlance: {
        title: 'At a glance',
        description:
          'Key platform activity metrics. Creator and rejection counts use a rolling 7 or 30 day window.',
      },
      statusBreakdown: {
        title: 'Route status breakdown',
        description: 'All-time count of routes by current status.',
        loading: 'Loading charts...',
      },
      co2OverTime: {
        title: 'CO₂e over time',
        description:
          'Estimated baseline emissions vs actual emissions across completed routes. The gap between the two lines represents CO₂e saved by the community.',
      },
    },

    charts: {
      statusBreakdown: {
        title: 'Upcoming vs completed vs rejected',
        subtitle: 'Total route counts by status',
      },
      rejectionReasons: {
        title: 'Rejection reasons',
        subtitle: 'Route counts grouped by rejection reason',
        empty: 'No rejected routes on record.',
      },
      timeseries: {
        title: 'Baseline vs actual CO₂e emissions',
        subtitle:
          'kg CO₂e per period; baseline assumes every participant drove solo',
        loading: 'Loading chart...',
        empty: 'No completed route data available for this view.',
      },
    },
  },
}
