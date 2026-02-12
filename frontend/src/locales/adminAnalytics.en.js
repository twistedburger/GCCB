export const adminAnalyticsEn = {
  common: {
    back: 'Back',
    close: 'Close',
    viewingAs: 'Viewing as:', // to be removed
  },

  analyticsHub: {
    title: 'Analytics',
    subtitle: 'Track engagement and sustainability impact.',
  },

  kpis: {
    totalTrips: 'Total trips',
    activeUsers: 'Active users',
    co2Saved: 'CO₂ saved (est.)',
    tripsByMode: 'Trips by mode',
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
}
