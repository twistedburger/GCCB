export const adminAnalyticsEn = {
  /*
  A lot of these user-facing strings are placeholders. This is to be used for 
  a centralized file to replace strings for related page(s). 
  */

  common: {
    back: 'Back',
    close: 'Close',
    viewingAs: 'Viewing as:', // to be removed
  },

  analyticsHub: {
    title: 'Analytics',
    currentRoleLabel: 'Current Role:',
    viewAsStudent: 'View as Student', // to be removed
    viewAsAdmin: 'View as Admin', // to be removed
    subtitle: 'Track engagement and sustainability impact.',
    adminSectionTitle: 'Admin Overview (All Users)',
    studentSectionTitle: 'My Impact (Personal)',
  },

  kpis: {
    totalTrips: 'Total trips',
    activeUsers: 'Active users',
    co2Saved: 'CO₂ saved (est.)',
    tripsByMode: 'Trips by mode',

    totalUserCommutes: 'Total User Commutes',
    tripFrequency: 'Trip Frequency',

    myCo2Saved: 'My CO₂ Saved (est.)',
    myCommutesDistance: 'My Commutes & Distance',
    myTripFrequency: 'My Trip Frequency',
  },

  actions: {
    viewDetails: 'View details',
    howCalculated: "How it's calculated",
    close: 'Close',
  },

  empty: {
    noData: 'No data available yet.',
  },

  co2: {
    pageTitle: 'CO₂ Savings',

    headline: {
      adminLabel: 'Total CO₂ Saved (All Users)',
      studentLabel: 'My CO₂ Saved',
    },

    actions: {
      howCalculated: "How it's calculated",
    },

    modal: {
      title: 'How CO₂ is calculated',
      intro: 'Methodology goes here!',

      baselineTitle: 'Baseline',
      baselineBody:
        'We estimate "savings" by comparing a trip against a standard solo-passenger vehicle baseline (~250g CO₂ per km). The difference is treated as CO₂ saved.',

      carpoolTitle: 'Carpooling',
      carpoolBody:
        'A possible calculation is to scale savings by (passengers - 1), since one carpool trip may replace multiple solo trips depending on number of passengers.',
    },

    filters: {
      blockTitle: 'Filters',
      blockDescription: 'Placeholder controls',
      dateRangeLabel: 'Date range:',
      dateRangeValue: 'Last 7 days / Last 30 days / All Time',
      modeLabel: 'Mode:',
      modeValue: 'Walk / Cycle / Carpool / Transit',
    },

    metrics: {
      blockTitle: 'Key impact metrics',
      blockDescription: 'Summary values (placeholder)',

      // KPI labels
      admin: {
        totalSaved30d: 'Total CO₂ saved (30d)',
        avgSavedPerRoute: 'Avg CO₂ saved / route',
        routesContributing30d: 'Routes contributing (30d)',
        topSavingMode: 'Top saving mode',
      },
      student: {
        mySaved30d: 'My CO₂ saved (30d)',
        avgSavedPerTrip: 'Avg CO₂ saved / trip',
        tripsContributing30d: 'Trips contributing (30d)',
        myTopSavingMode: 'My top saving mode',
      },

      // KPI values that are currently placeholder text
      values: {
        cycling: 'Cycling',
      },
    },

    charts: {
      blockTitle: 'Charts',
      blockDescription: 'Chart placeholders',

      overTime: {
        title: 'CO₂ saved over time',
        subtitle: 'Weekly/monthly trend (placeholder)',
        placeholderLabel: 'Line chart placeholder',
      },
      byMode: {
        title: 'CO₂ saved by mode',
        subtitle: 'Share by transportation mode (placeholder)',
        placeholderLabel: 'Pie/Stacked bar placeholder',
      },
      contributors: {
        adminTitle: 'Top contributors (admin)',
        studentTitle: 'My progress',
        subtitle: 'Optional breakdown (placeholder)',
        placeholderLabel: 'Table/Bar chart placeholder',
      },
    },
  },
  tripFrequency: {
    pageTitle: {
      admin: 'Trip Frequency (All Users)',
      student: 'My Trip Frequency',
    },

    filters: {
      blockTitle: 'Filters',
      blockDescription: 'Placeholder controls',
      dateRangeLabel: 'Date range:',
      dateRangeValue: 'Last 7 days / Last 30 days / All Time',
      modeLabel: 'Mode:',
      modeValue: 'Walk / Cycle / Carpool / Transit',
    },

    metrics: {
      blockTitle: 'Key metrics',
      blockDescription: 'Summary values (placeholder)',

      admin: {
        avgRoutesPerCreator30d: 'Avg routes / creator (30d)',
        medianRoutesPerCreator30d: 'Median routes / creator (30d)',
        activeCreators30d: 'Active creators (30d)',
        creatorsWith2PlusRoutes30d: 'Creators with 2+ routes (30d)',
      },

      student: {
        myRoutesPerWeek: 'My routes / week',
        myAvgRoutesPerDay7d: 'My avg routes / day (7d)',
        myWeeklyStreak: 'My weekly streak',
        myMostActiveDay: 'My most active day',
      },

      values: {
        tuesday: 'Tuesday',
      },
    },

    charts: {
      blockTitle: 'Charts',
      blockDescription: 'Chart placeholders',

      admin: {
        distribution: {
          title: 'Routes per creator distribution',
          subtitle: 'Histogram buckets (0, 1, 2-3, 4+)',
          placeholderLabel: 'Histogram / bar chart placeholder',
        },
        activeCreatorsOverTime: {
          title: 'Active creators over time',
          subtitle: 'Trend over time (placeholder)',
          placeholderLabel: 'Line chart placeholder',
        },
        routesPerDayWeek: {
          title: 'Routes per day/week',
          subtitle: 'Platform-level frequency (placeholder)',
          placeholderLabel: 'Line / bar chart placeholder',
        },
      },

      student: {
        routesPerWeek: {
          title: 'My routes per week',
          subtitle: 'Weekly volume (placeholder)',
          placeholderLabel: 'Bar chart placeholder',
        },
        streakOverTime: {
          title: 'My streak over time',
          subtitle: 'Consistency trend (placeholder)',
          placeholderLabel: 'Line chart placeholder',
        },
        busiestDayTime: {
          title: 'My busiest day/time',
          subtitle: 'Weekday/hour distribution (placeholder)',
          placeholderLabel: 'Bar chart placeholder',
        },
      },
    },
  },
  commutes: {
    pageTitle: {
      admin: 'Commutes (All Users)',
      student: 'My Commutes',
    },

    filters: {
      blockTitle: 'Filters',
      blockDescription: 'Placeholder controls',
      dateRangeLabel: 'Date range:',
      dateRangeValue: 'Last 7 days / Last 30 days / All Time',
      modeLabel: 'Mode:',
      modeValue: 'Walk / Cycle / Carpool / Transit',
      statusLabel: 'Status:',
      statusValue: 'Upcoming / Completed / Rejected',
    },

    metrics: {
      blockTitle: 'Key metrics',
      blockDescription: 'Summary values (placeholder)',

      admin: {
        routesScheduled30d: 'Routes scheduled (30d)',
        totalDistance30d: 'Total distance (30d)',
        avgDistancePerRoute: 'Avg distance / route',
        completionRate30d: 'Completion rate (30d)',
      },

      student: {
        myRoutes30d: 'My routes (30d)',
        myDistance30d: 'My distance (30d)',
        avgDistancePerRoute: 'Avg distance / route',
        myCompletionRate30d: 'My completion rate (30d)',
      },
    },

    charts: {
      blockTitle: 'Charts',
      blockDescription: 'Chart placeholders',

      routesOverTime: {
        title: 'Routes over time',
        subtitle: 'Daily/weekly volume (placeholder)',
        placeholderLabel: 'Bar/Line chart placeholder',
      },
      distanceOverTime: {
        title: 'Distance over time',
        subtitle: 'Total km per day/week (placeholder)',
        placeholderLabel: 'Line chart placeholder',
      },
      modeSplit: {
        title: 'Mode split',
        subtitle: 'Share of routes by transportation mode (placeholder)',
        placeholderLabel: 'Pie/Stacked bar placeholder',
      },
    },

    modeBreakdown: {
      blockTitle: 'Mode Breakdown by Type',
      blockDescription: 'Placeholder breakdown',
      rowLabelSuffix: ':',

      modes: {
        walk: 'Walk',
        cycle: 'Cycle',
        carpool: 'Carpool',
        transit: 'Transit',
      },
    },
  },
  activity: {
    guard: {
      pageTitle: 'Platform Activity',
      message: 'This should only be viewable by administrators.', // redundant when permissions set up
    },

    pageTitle: 'Activity (Platform)',

    filters: {
      blockTitle: 'Filters',
      blockDescription: 'Placeholder controls',
      dateRangeLabel: 'Date range:',
      dateRangeValue: 'Last 7 days / Last 30 days / All Time',
      statusLabel: 'Status:',
      statusValue: 'Upcoming / Completed / Rejected',
    },

    metrics: {
      blockTitle: 'Key metrics',
      blockDescription: 'Summary values (placeholder)',

      activeRouteCreators7d: 'Active route creators (7d)',
      upcomingRoutes: 'Upcoming routes',
      completionRate30d: 'Completion rate (30d)',
      rejectedRoutes30d: 'Rejected routes (30d)',
    },

    charts: {
      blockTitle: 'Charts',
      blockDescription: 'Chart placeholders',

      activeCreatorsOverTime: {
        title: 'Active creators over time',
        subtitle: 'DAU/WAU-style plot (placeholder)',
        placeholderLabel: 'Line chart placeholder',
      },

      upcomingVsCompleted: {
        title: 'Upcoming vs completed routes',
        subtitle: '(placeholder)',
        placeholderLabel: 'Stacked bar placeholder',
      },

      rejectionReasons: {
        title: 'Rejection reasons',
        subtitle: 'Top reasons (placeholder)',
        placeholderLabel: 'Bar chart placeholder',
      },
    },
  },
}
