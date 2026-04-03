import LocationSearch from '../components/LocationSearch'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps'
import GenericToggle from '../components/GenericToggle'
import GenericButton from '../components/GenericButton'
import { Add, PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import RouteDetail from '../pages/home/RouteDetail'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import CreateEvent from '../components/CreateEvent'
import { useAuth } from '../utils/Authorization'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Drawer } from 'vaul'
import Report from '../components/Report'
import { useLocationSearch } from '../utils/HomeHooks'
import {
  buildSearchURL,
  handleFormResult,
  locationSetError,
  locationSetSuccess,
} from '../utils/HomeUtils'
import DisplayFilters from '../components/DisplayFilters'
import MapController from '../components/MapController'
import { CircularProgress } from '@mui/material'

const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Google Maps JavaScript API warning: NoApiKeys')
  )
    return // Suppress no API warning, since key exists
  originalWarn(...args)
}
// Vancouver default if the user does not allow to use their location, change as per localization :)
const DEFAULT_COORDINATES = { lat: 49.26, lng: -123.11 }

function Home() {
  const location = useLocation()
  const isEventDetail = location.pathname.includes('/event/')
  const [userLocation, setUserLocation] = useState(DEFAULT_COORDINATES)
  const [snapPoint, setSnapPoint] = useState(0.085)
  const [isArriving, setIsArriving] = useState(true)
  const [cardsToDisplay, setCardsToDisplay] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [filters, setFilters] = useState({
    location: userLocation,
    time: null,
    transportationModes: [],
    radius: 2000,
    verifiedEventsOnly: false,
    mainEventsOnly: true,
  })
  const navigate = useNavigate()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [alert, setAlert] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [loading, setLoading] = useState(false)

  const { authorizeUser, authorization } = useAuth()
  authorizeUser()

  const { searchedLocationResult, searchAddress, handleSearch, clearSearch } =
    useLocationSearch()

  useEffect(() => {
    if (searchedLocationResult) {
      setUserLocation(searchedLocationResult)
      setSnapPoint(1)
      setSelectedRoute(null)
    }
  }, [searchedLocationResult])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      locationSetSuccess(setUserLocation),
      locationSetError
    )
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = buildSearchURL(filters, userLocation, isArriving)
    fetch(url, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setCardsToDisplay(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch:', err)
        setLoading(false)
      })
  }, [filters, userLocation, isArriving])

  useEffect(() => {
    if (snapPoint !== 1) {
      setTimeout(() => {
        document.activeElement?.blur()
      }, 300)
    }
  }, [snapPoint])

  const handleRouteClick = route => {
    setSnapPoint(0.085)
    setSelectedRoute(route)
  }

  return (
    <div data-vaul-drawer-wrapper className="relative w-full h-full">
      {alert && (
        <Alert
          message={alert.text}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}

      <div>
        <APIProvider
          apiKey=""
          scriptUrl="http://localhost:3000/maps/api/js"
          libraries={['geometry']}
        >
          <Map
            mapId="6621f78cbdb1902f92a3d543"
            className="absolute w-full h-full"
            defaultCenter={userLocation}
            defaultZoom={17}
            gestureHandling="greedy"
            disableDefaultUI={true}
          >
            <AdvancedMarker position={userLocation}>
              <Pin scale={0.75} />
            </AdvancedMarker>
            <MapController center={userLocation} route={selectedRoute} />
          </Map>
        </APIProvider>

        {!selectedRoute && !isEventDetail && (
          <LocationSearch
            className="rounded-xl absolute inset-x-0 top-0 m-12 z-10 w-auto overflow-visible shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
            onSearch={handleSearch}
            defaultLocation={locationInput}
          />
        )}
        <Drawer.Root
          open={true}
          modal={false}
          snapPoints={[0.085, 1]}
          activeSnapPoint={snapPoint}
          setActiveSnapPoint={setSnapPoint}
          noBodyStyles={true}
          setBackgroundColorOnScale={false}
          preventScrollRestoration={false}
          trap={false}
        >
          <Drawer.Portal>
            <Drawer.Content
              onOpenAutoFocus={e => e.preventDefault()}
              onFocusOutside={e => e.preventDefault()}
              onFocus={e => {
                if (e.target === e.currentTarget) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
              style={{
                zIndex: 20,
                marginLeft: '55px',
                width: 'calc(100% - 55px)',
                borderRadius: '24px 24px 0 0',
                height: '96%',
                position: 'fixed',
                bottom: 0,
                background: '#F9F9F9',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
              }}
            >
              <Drawer.Title className="sr-only">Search Results</Drawer.Title>
              <Drawer.Description className="sr-only">
                Search results near your location
              </Drawer.Description>
              <div
                className="flex justify-center p-6"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="bg-text-primary rounded-full h-1.5 w-20" />
              </div>
              <div
                {...(snapPoint === 0.085 ? { inert: true } : {})}
                className="overflow-y-auto px-6 pb-36 flex flex-col gap-4"
              >
                <>
                  <div className="flex items-center gap-2 overflow-x-auto shrink-0 min-h-10">
                    <TuneOutlined
                      className="text-text-primary shrink-0"
                      onClick={() => navigate('/filter')}
                    />
                    <GenericToggle
                      value={isArriving}
                      onChange={() => {
                        const newIsArriving = !isArriving
                        setIsArriving(newIsArriving)
                        if (!newIsArriving) {
                          setFilters(prev => ({
                            ...prev,
                            mainEventsOnly: false,
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            mainEventsOnly: true,
                          }))
                        }
                      }}
                      labels={['Arriving Near', 'Departing Near']}
                      className="shrink-0"
                    />
                    <GenericButton
                      unstyled={true}
                      customStyling={
                        'text-text-secondary text-sm shrink-0 capitalize flex items-center'
                      }
                      onClick={() => {
                        setLoading(true)
                        navigator.geolocation.getCurrentPosition(
                          locationSetSuccess(setUserLocation),
                          locationSetError
                        )
                        clearSearch()
                        setLocationInput(prev => (prev === null ? '' : null))
                        setSelectedRoute(null)
                        setSnapPoint(1)
                      }}
                    >
                      <PlaceOutlined className="mr-1" />
                      {searchAddress ||
                        (userLocation.lat === DEFAULT_COORDINATES.lat &&
                        userLocation.lng === DEFAULT_COORDINATES.lng
                          ? 'Vancouver, BC'
                          : 'Current Location')}
                    </GenericButton>
                    <div
                      className="flex gap-2 overflow-x-auto pb-0.5 shrink-0"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <DisplayFilters
                        filters={filters}
                        setFilters={setFilters}
                      />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <CircularProgress />
                    </div>
                  ) : cardsToDisplay.length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-4">
                      No results found. Try adjusting your filters.
                    </p>
                  ) : (
                    cardsToDisplay.map(item =>
                      filters.mainEventsOnly ? (
                        <EventCard
                          key={item.id}
                          event={item}
                          view={authorization}
                          onReport={data => {
                            setReportData(data)
                            setShowReport(true)
                          }}
                        />
                      ) : (
                        <RouteCard
                          key={item.id}
                          route={item}
                          view={authorization}
                          individualView={true}
                          onSelect={handleRouteClick}
                        />
                      )
                    )
                  )}
                </>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
        <RouteDetail
          selectedRoute={isEventDetail ? null : selectedRoute}
          onClose={() => {
            setSelectedRoute(null)
            setSnapPoint(1)
          }}
          setAlert={setAlert}
        />
        <Outlet
          context={{ filters, setFilters, setSelectedRoute, setSnapPoint }}
        />
      </div>

      {/* Create Event modal */}
      <Modal isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)}>
        <CreateEvent
          onSubmit={result =>
            handleFormResult(result, { setShowCreateEvent, setAlert })
          }
        />
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        title={reportData ? `Report ${reportData.title}` : 'Report'}
      >
        {reportData && (
          <Report
            type={reportData.type}
            targetId={reportData.id}
            onClose={() => setShowReport(false)}
            setAlert={reportAlert => {
              if (!reportAlert?.type) return
              setAlert({
                type: reportAlert.type,
                text:
                  reportAlert.type === 'success'
                    ? 'Report submitted successfully.'
                    : 'Failed to submit report.',
              })
            }}
          />
        )}
      </Modal>

      <GenericButton
        unstyled={true}
        customStyling="absolute bottom-24 right-6 z-50 bg-blue-primary text-white rounded-full p-3 shadow-lg 
                transition-transform duration-200 active:scale-100 hover:scale-110"
        onClick={() => setShowCreateEvent(true)}
      >
        <Add fontSize="large" />
      </GenericButton>
    </div>
  )
}

export default Home
