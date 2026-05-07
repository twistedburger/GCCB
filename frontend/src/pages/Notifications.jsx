import GenericButton from '../components/GenericButton'

export default function Notifications() {
  return (
    <div>
      <p>Notifications</p>
      <GenericButton
        onClick={async () => {
          console.log('hello')
        }}
      >
        ClickMe
      </GenericButton>
    </div>
  )
}
