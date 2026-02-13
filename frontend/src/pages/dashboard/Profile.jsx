import GenericButton from '../../components/GenericButton'

{
  /* Placeholder values */
}
// const placeholderUser = {
//   name: "John Doe",
//   nickname: "J-Dough",
//   role: "Student",
//   bio: "Placeholder: Short bio/description goes here.",
//   profileImageUrl: "placeholder.jpg",
// };

// const placeholderStats = [
//   { label: "Total Trips", value: "32" },
//   { label: "CO₂ Saved", value: "21 kg" },
//   { label: "Distance Traveled", value: "123 km" },
//   { label: "Badges", value: "3 Badges" },
// ];

// const placeholderActiveTrips = [
//   { id: 1, title: "Active Trip Placeholder", details: "Mode - Route - Time" },
// ];

// const placeholderUpcomingTrips = [
//   { id: 1, title: "Upcoming Trip Placeholder", details: "Date - Mode - Location" },
//   { id: 2, title: "Upcoming Trip Placeholder", details: "Date - Mode - Location" },
// ];

// const placeholderBadges = [
//   { id: 1, title: "Badge Placeholder" },
//   { id: 2, title: "Badge Placeholder" },
//   { id: 3, title: "Badge Placeholder" },
// ];

function Profile() {
  return (
    <>
      <h1>This is a profile page.</h1>
      <p>Stuff goes here.</p>
      <p>This button logs you out even though it says submit</p>
      <GenericButton
        onClick={() => {
          window.location.href = 'http://localhost:3000/logoutRoute'
        }}
        className="m-0"
      >
        Logout
      </GenericButton>
    </>
  )
}

export default Profile
