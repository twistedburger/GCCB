import PropTypes from 'prop-types'
import GenericButton from '../../components/GenericButton'
import UserCard from '../../components/UserCard'
import RouteCard from '../../components/RouteCard'
import { Cancel } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import TransitLegCard from '../../components/TransitLegCard'
import { Drawer } from 'vaul'
import Report from '../../components/Report'
import { calculateTransitLegs } from '../../utils/RouteUtils'
import { transitLegCardStrings } from '../../locales/en/ComponentStrings/TransitLegCardStrings'
import { reportStrings } from '../../locales/en/ComponentStrings/ReportStrings'
import { routeDetailStrings } from '../../locales/en/RouteDetailStrings'

/**
 * Drawer for displaying a route once selected.
 *
 * @param {Object} selectedRoute Currently selected route to be displayed
 * @param {func} onClose Callback function for closing the route detail
 * @param {func} setAlert Callback function for setting an alert
 * @returns {JSX.Element}
 */
export default function RouteDetail({
  selectedRoute,
  onClose,
  setAlert,
  onToggleJoin,
}) {
  const [snapPoint, setSnapPoint] = useState(0.25)
  const navigate = useNavigate()
  const [showReport, setShowReport] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [participants, setParticipants] = useState([])
  const [reportData, setReportData] = useState(null)

  const creator = participants.find(person => person.is_creator)

  const handleClose = () => {
    if (onClose) onClose()
    else setTimeout(() => navigate(-1), 300)
  }

  const { transitLegs } = useMemo(
    () => calculateTransitLegs(selectedRoute),
    [selectedRoute]
  )

  return (
    <Drawer.Root
      open={!!selectedRoute}
      onOpenChange={open => !open && onClose()}
      modal={true}
      snapPoints={[0.095, 0.25, 0.4, 0.8]}
      activeSnapPoint={snapPoint}
      setActiveSnapPoint={setSnapPoint}
      noBodyStyles={true}
      setBackgroundColorOnScale={false}
      dismissible={false}
      preventScrollRestoration={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          onOpenAutoFocus={e => e.preventDefault()}
          onFocus={e => {
            if (e.target === e.currentTarget) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          className="z-50 ml-13.75 w-[calc(100%-55px)] rounded-t-3xl h-[96%] fixed bottom-0 bg-drawer-background flex flex-col overflow-hidden pointer-events-auto"
        >
          <Drawer.Title className="sr-only">
            {transitLegCardStrings.a11y.drawerTitle}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {transitLegCardStrings.a11y.drawerDescription}
          </Drawer.Description>
          {selectedRoute && (
            <div className="flex flex-col max-h-full rounded-t-3xl">
              <div className="flex justify-between items-start px-4 pt-2">
                <div className="w-8" />
                <div className="bg-text-primary rounded-full h-1.5 w-20 mt-2" />
                <GenericButton
                  onClick={handleClose}
                  unstyled
                  customStyling="text-text-primary scale-110"
                >
                  <Cancel />
                </GenericButton>
              </div>
              <div className="flex flex-col overflow-y-auto pb-[25dvh] px-6">
                {/* drawer snap point is 80% max, so padding in Route Detail is 25% from bottom */}
                <div className="flex flex-col gap-1 items-start">
                  <h3 className="font-semibold text-xl text-text-primary">
                    {selectedRoute.title}
                  </h3>
                  <GenericButton
                    unstyled
                    customStyling={'text-sm text-text-secondary font-medium'}
                    onClick={async () => {
                      const res = await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}/api/getParticipants/${selectedRoute.id}`,
                        {
                          credentials: 'include',
                        }
                      )
                      const data = await res.json()
                      setParticipants(data)
                      setShowParticipants(true)
                    }}
                  >
                    {routeDetailStrings.seeParticipants}
                  </GenericButton>
                  <span className="text-xs text-text-secondary">
                    {selectedRoute.description}
                  </span>
                  <RouteCard
                    route={selectedRoute}
                    routeDetailView={true}
                    onToggleJoin={() => onToggleJoin(selectedRoute)}
                    onReport={data => {
                      setReportData(data)
                      setShowReport(true)
                    }}
                  />
                </div>
                <p className="font-semibold pt-4 pb-2 text-text-primary">
                  {transitLegs.length > 0
                    ? transitLegCardStrings.transitDetails
                    : ''}
                </p>
                <div className="flex flex-col gap-2">
                  {transitLegs.map((leg, index) => (
                    <TransitLegCard
                      key={index}
                      name={leg.name}
                      type={leg.type}
                      distance={leg.distance}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nested Drawer for participants */}
          <Drawer.NestedRoot
            open={showParticipants}
            onOpenChange={setShowParticipants}
            shouldScaleBackground={false}
            dismissible={false}
            modal={true}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-60 bg-black/40" />
              <Drawer.Content
                onOpenAutoFocus={e => {
                  const focusable =
                    e.currentTarget.querySelector('button, input')
                  if (focusable) focusable.focus()
                }}
                onPointerDownOutside={() => setShowParticipants(false)}
                className="fixed bottom-0 left-13.75 right-0 z-60 flex flex-col rounded-t-3xl bg-white"
                style={{ height: '80%' }}
              >
                <Drawer.Title className="sr-only">
                  {routeDetailStrings.participants}
                </Drawer.Title>
                <Drawer.Description className="sr-only">
                  {routeDetailStrings.participantsDescription}
                </Drawer.Description>
                <div className="flex justify-between items-start px-4 pt-2 shrink-0">
                  <div className="w-8" />
                  <GenericButton
                    onClick={() => setShowParticipants(false)}
                    unstyled={true}
                    customStyling="text-text-primary scale-110"
                  >
                    <Cancel />
                  </GenericButton>
                </div>
                <div className="flex flex-col overflow-y-auto pb-8 px-6 gap-2">
                  <p className="font-semibold pb-2 text-text-primary shrink-0">
                    {routeDetailStrings.organizer}
                  </p>
                  {creator ? (
                    <UserCard user={creator} />
                  ) : (
                    <p className="text-text-secondary text-sm">
                      {routeDetailStrings.creatorNotJoined}
                    </p>
                  )}
                  <p className="font-semibold pt-4 pb-2 text-text-primary shrink-0">
                    {routeDetailStrings.participants}
                  </p>
                  {participants.length === 0 ? (
                    <p className="text-text-secondary text-sm">
                      {routeDetailStrings.noParticipants}
                    </p>
                  ) : (
                    participants.map(participant => (
                      <UserCard key={participant.id} user={participant} />
                    ))
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.NestedRoot>

          {/* Nested Drawer for reports */}
          <Drawer.NestedRoot
            open={showReport}
            onOpenChange={setShowReport}
            shouldScaleBackground={false}
            dismissible={false}
            modal={true}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-60 bg-black/40" />
              <Drawer.Content
                onOpenAutoFocus={event => {
                  const focusable =
                    event.currentTarget.querySelector('button, input')
                  if (focusable) focusable.focus()
                }}
                onPointerDownOutside={() => setShowReport(false)}
                className="fixed bottom-0 left-13.75 right-0 z-60 flex flex-col rounded-t-3xl bg-white"
              >
                <div className="flex-1 p-4">
                  <div className="absolute top-4 right-4 z-10">
                    <GenericButton
                      onClick={() => setShowReport(false)}
                      unstyled={true}
                      customStyling="text-text-primary scale-110"
                    >
                      <Cancel />
                    </GenericButton>
                  </div>
                  {reportData && (
                    <>
                      <Drawer.Title className="text-lg font-bold mb-4">
                        {reportStrings.reportTitle(reportData.title)}
                      </Drawer.Title>
                      <Drawer.Description className="sr-only">
                        {reportStrings.a11y.reportPage}
                      </Drawer.Description>
                      <Report
                        type={reportData.type}
                        targetId={reportData.targetId}
                        onClose={() => setShowReport(false)}
                        setAlert={setAlert}
                      />
                    </>
                  )}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.NestedRoot>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

RouteDetail.propTypes = {
  selectedRoute: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    creator_id: PropTypes.number,
    creator_name: PropTypes.string,
    nickname: PropTypes.string,
    profile_pic: PropTypes.string,
    role: PropTypes.string,
    creator_description: PropTypes.string,
    isJoined: PropTypes.bool,
  }),
  onClose: PropTypes.func,
  setAlert: PropTypes.func,
  onToggleJoin: PropTypes.func,
}
