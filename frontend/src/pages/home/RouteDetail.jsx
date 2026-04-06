import PropTypes from 'prop-types'
import GenericButton from '../../components/GenericButton'
import OrganizerCard from '../../components/OrganizerCard'
import RouteCard from '../../components/RouteCard'
import { Cancel } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import TransitLegCard from '../../components/TransitLegCard'
import { useAuth } from '../../hooks/Authorization'
import { Drawer } from 'vaul'
import Report from '../../components/Report'
import { calculateTransitLegs } from '../../utils/routes'

/**
 * Drawer for displaying a route once selected.
 *
 * @param {Object} selectedRoute Currently selected route to be displayed
 * @param {func} onClose Callback function for closing the route detail
 * @param {func} setAlert Callback function for setting an alert
 * @returns {JSX.Element}
 */
export default function RouteDetail({ selectedRoute, onClose, setAlert }) {
  const [snapPoint, setSnapPoint] = useState(0.25)
  const navigate = useNavigate()
  const { authorization } = useAuth()
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState(null)

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
          style={{
            zIndex: 50,
            marginLeft: '55px',
            width: 'calc(100% - 55px)',
            borderRadius: '24px 24px 0 0',
            height: '96%',
            position: 'fixed',
            bottom: 0,
            background: '#F9F9F9',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          <Drawer.Title className="sr-only">Route Detail</Drawer.Title>
          <Drawer.Description className="sr-only">
            Route and event details
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
                <div className="flex flex-col pb-4">
                  <h3 className="font-semibold text-xl text-text-primary pb-2">
                    {selectedRoute.title}
                  </h3>
                  <span className="text-xs text-text-secondary">
                    {selectedRoute.description}
                  </span>
                  <RouteCard
                    route={selectedRoute}
                    view={authorization}
                    routeDetailView={true}
                    onReport={data => {
                      setReportData(data)
                      setShowReport(true)
                    }}
                  />
                </div>
                <p className="font-semibold pt-4 pb-2 text-text-primary">
                  {transitLegs.length > 0 ? 'Transit Details' : ''}
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
                <p className="font-semibold pt-4 pb-2 text-text-primary">
                  Organizer
                </p>
                <OrganizerCard
                  user={{
                    id: selectedRoute.creator_id,
                    name: selectedRoute.creator_name,
                    nickname: selectedRoute.nickname,
                    profile_pic: selectedRoute.profile_pic,
                    role: '',
                    description: '',
                    active: true,
                  }}
                />
              </div>
            </div>
          )}
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
                onOpenAutoFocus={e => {
                  const focusable =
                    e.currentTarget.querySelector('button, input')
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
                        Report {reportData.title}
                      </Drawer.Title>
                      <Drawer.Description className="sr-only">
                        Report Page
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
    title: PropTypes.string,
    description: PropTypes.string,
    creator_id: PropTypes.number,
    creator_name: PropTypes.string,
    nickname: PropTypes.string,
    profile_pic: PropTypes.string,
  }),
  onClose: PropTypes.func,
  setAlert: PropTypes.func,
}
