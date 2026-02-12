import commute_img from '../assets/commute_img.png'
import events_img from '../assets/events_img.png'
import analysis_img from '../assets/analysis_img.png'

import map_img from '../assets/map_img.png'
import choose_pin_img from '../assets/choose_pin_img.png'
import toggle_img from '../assets/toggle_img.png'
import join_img from '../assets/join_img.png'
import organize_img from '../assets/organize_img.png'
import dashboard_img from '../assets/dashboard_img.png'
import badge_img from '../assets/badge_img.png'

export const en = {
  userGuide: {
    pageTitle: 'Getting Started',
    pageDescription: 'Your guide to sustainable commuting and connecting.',
    miniNav: {
      commute: 'Commute',
      events: 'Events',
      impact: 'Impact',
    },
    commuting: {
      image: commute_img,
      title: 'Commute Together',
      subtitle: 'Coordinate Sustainable Trips',
      points: [
        {
          term: 'Navigate the Map',
          desc: 'Set your destination with ease. Use the search bar for a specific address or simply drag the map to drop a pin on your preferred location.',
          image: map_img,
        },
        {
          term: 'Select Your View',
          desc: "Toggle between 'Arriving' and 'Departing' views. Use 'Departing' to see trips leaving your area, or 'Arriving' to find routes and events converging at your destination.",
          image: toggle_img,
        },
      ],
    },
    events: {
      image: events_img,
      title: 'Events & Routes',
      subtitle: "Discover What's Happening",
      points: [
        {
          term: 'Explore Pins',
          desc: 'Tap any pin on the map to reveal a list of events and active commute routes converging at that location.',
          image: choose_pin_img,
        },
        {
          term: 'Choose Your Route',
          desc: 'Select an event to view all available transit options. Simply tap the route that best fits your schedule to join the group!',
          image: join_img,
        },
        {
          term: 'Lead the Pack',
          desc: "Don't see a route that suits you? Take the initiative and coordinate a new trip to help others reach the event sustainably.",
          image: organize_img,
        },
      ],
    },
    analysis: {
      image: analysis_img,
      title: 'Your Green Footprint',
      subtitle: 'Track Your Personal Impact',
      points: [
        {
          term: 'View Your Impact',
          desc: 'Visit your dashboard to see your personal CO2 savings and environmental contribution.',
          image: dashboard_img,
        },
        {
          term: 'Earn & Share',
          desc: 'Earn badges and share your impact with friends to inspire others on the journey!',
          image: badge_img,
        },
      ],
    },
  },
}
