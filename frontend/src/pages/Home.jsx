import LocationSearch from '../components/LocationSearch'
import GenericToggle from '../components/GenericToggle'
import GenericButton from '../components/GenericButton'
import { Add, PlaceOutlined, TuneOutlined } from '@mui/icons-material'
import { useState, useEffect, useRef, useCallback } from 'react'
import EventCard from '../components/EventCard'
import RouteCard from '../components/RouteCard'
import RouteDetail from '../pages/home/RouteDetail'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import CreateEvent from '../components/CreateEvent'
import { useAuth } from '../hooks/Authorization'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Drawer } from 'vaul'
import Report from '../components/Report'
import {
  buildSearchURL,
  handleFormResult,
  locationSetError,
  locationSetSuccess,
  reverseGeocode,
  hasMapPanned,
} from '../utils/HomeUtils'
import DisplayFilters from '../components/DisplayFilters'
import MainMap from '../components/MainMap'
import { createPortal } from 'react-dom'
import { CircularProgress } from '@mui/material'
import { homeStrings } from '../locales/en/HomeStrings'
import { reportStrings } from '../locales/en/ComponentStrings/ReportStrings'
import { postGISToLatLng } from '../utils/MainMapUtils'

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

const DEFAULT_FILTERS = {
  location: null,
  time: null,
  transportationModes: [],
  radius: 2000,
  verifiedEventsOnly: false,
  mainEventsOnly: true,
}

/**
 * Homepage
 *
 * @returns {JSX.Element}
 */
function Home() {
  const location = useLocation()
  const isEventDetail = location.pathname.includes('/event/')
  const [userLocation, setUserLocation] = useState(null)
  const [snapPoint, setSnapPoint] = useState(0.085)
  const [isArriving, setIsArriving] = useState(true)
  const [cardsToDisplay, setCardsToDisplay] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const navigate = useNavigate()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [alert, setAlert] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchAddress, setSearchAddress] = useState('')
  const locationSearchRef = useRef(null)
  const [createEventLocation, setCreateEventLocation] = useState(null)
  const [createEventLatLng, setCreateEventLatLng] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [hasPanned, setHasPanned] = useState(false)

  const { authorizeUser } = useAuth()
  authorizeUser()

  const handleSearch = (address, lat, lng) => {
    if (lat && lng) {
      setSearchAddress(address)
      setUserLocation({ lat, lng })
      setSnapPoint(1)
      setSelectedRoute(null)
    }
  }

  const fetchCards = useCallback(() => {
    if (!userLocation) return
    setLoading(true)
    const apiMainEvents = isArriving ? filters.mainEventsOnly : false
    const url = buildSearchURL(
      { ...filters, mainEventsOnly: apiMainEvents },
      userLocation,
      isArriving,
      import.meta.env.VITE_API_BASE_URL
    )
    fetch(url, { credentials: 'include' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        return response.json()
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

  const handleRouteClick = route => {
    setSnapPoint(0.085)
    setSelectedRoute(route)
  }

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      locationSetSuccess(setUserLocation),
      () => setUserLocation(DEFAULT_COORDINATES)
    )
  }, [])

  useEffect(() => {
    if (snapPoint !== 1) {
      setTimeout(() => {
        document.activeElement?.blur()
      }, 300)
    }
  }, [snapPoint])

  useEffect(() => {
    if (!userLocation) return
    setFilters(DEFAULT_FILTERS)
  }, [userLocation])

  return (
    <div
      id="app-container"
      data-vaul-drawer-wrapper
      className="relative w-full h-full"
    >
      {alert && (
        <Alert
          message={alert.text}
          type={alert.type}
          onTimeout={() => setAlert(null)}
        />
      )}

      <div>
        <MainMap
          key={
            userLocation
              ? `${userLocation.lat}-${userLocation.lng}`
              : 'loading-location'
          }
          defaultCenter={userLocation || DEFAULT_COORDINATES}
          route={selectedRoute}
          events={cardsToDisplay.map(event => ({
            ...event,
            ...postGISToLatLng(event.location_geog),
          }))}
          onMapClick={async ({ lat, lng }) => {
            const address = await reverseGeocode({ lat, lng })
            setCreateEventLocation(address)
            setCreateEventLatLng([lat, lng])
            setShowCreateEvent(true)
          }}
          onCenterChanged={({ lat, lng }) => {
            if (!userLocation) return
            if (hasMapPanned({ lat, lng }, userLocation)) {
              setMapCenter({ lat, lng })
              setHasPanned(true)
            }
          }}
          searchRadius={filters.radius}
        />

        {!selectedRoute && !isEventDetail && (
          <LocationSearch
            clearRef={locationSearchRef}
            displayValue={searchAddress}
            className="rounded-xl absolute inset-x-0 top-0 m-12 z-10 w-auto overflow-visible shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)]
            focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
            onSearch={handleSearch}
            disabled={loading}
          />
        )}
        {hasPanned && !selectedRoute && !isEventDetail && (
          <button
            className="absolute top-26 left-1/2 -translate-x-1/2 z-10 bg-background-off-white text-sm font-medium px-4 py-2 rounded-full shadow-md text-text-primary"
            onClick={async () => {
              const address = await reverseGeocode(mapCenter)
              setSearchAddress(address)
              setUserLocation(mapCenter)
              setHasPanned(false)
            }}
          >
            {homeStrings.location.searchThisArea}
          </button>
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
              onOpenAutoFocus={event => event.preventDefault()}
              onFocusOutside={event => event.preventDefault()}
              onFocus={event => {
                if (event.target === event.currentTarget) {
                  event.preventDefault()
                  event.stopPropagation()
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
              <Drawer.Title className="sr-only">
                {homeStrings.a11y.drawerTitle}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                {homeStrings.a11y.drawerDescription}
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
                      onChange={() => setIsArriving(!isArriving)}
                      labels={[
                        homeStrings.toggle.arriving,
                        homeStrings.toggle.departing,
                      ]}
                      className="shrink-0"
                    />
                    <GenericButton
                      unstyled={true}
                      customStyling={
                        'text-text-secondary text-sm shrink-0 capitalize flex items-center'
                      }
                      onClick={() => {
                        setLoading(true)
                        locationSearchRef.current?.clear()
                        setSearchAddress('')
                        navigator.geolocation.getCurrentPosition(
                          locationSetSuccess(setUserLocation),
                          locationSetError
                        )
                        setSelectedRoute(null)
                        setSnapPoint(1)
                      }}
                    >
                      <PlaceOutlined className="mr-1" />
                      {searchAddress ||
                        (userLocation?.lat === DEFAULT_COORDINATES.lat &&
                        userLocation?.lng === DEFAULT_COORDINATES.lng
                          ? 'Vancouver, BC' // still a hard coded string, but only used as a fallback during development
                          : homeStrings.location.current)}
                    </GenericButton>
                    <div
                      className="flex gap-2 overflow-x-auto pb-0.5 shrink-0"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <DisplayFilters
                        filters={filters}
                        setFilters={setFilters}
                        isArriving={isArriving}
                      />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <CircularProgress />
                    </div>
                  ) : cardsToDisplay.length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-4">
                      {homeStrings.emptyState}
                    </p>
                  ) : (
                    cardsToDisplay.map(item =>
                      isArriving && filters.mainEventsOnly ? (
                        <EventCard
                          key={item.id}
                          event={item}
                          hideReport={true}
                          onReport={data => {
                            setReportData(data)
                            setShowReport(true)
                          }}
                        />
                      ) : (
                        <RouteCard
                          key={item.id}
                          route={item}
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

      {showCreateEvent &&
        createPortal(
          <Modal
            isOpen={showCreateEvent}
            onClose={() => {
              setShowCreateEvent(false)
              setCreateEventLocation(null)
              setCreateEventLatLng(null)
            }}
          >
            <CreateEvent
              initLoc={createEventLocation}
              initLatLng={createEventLatLng}
              onSubmit={result =>
                handleFormResult(result, {
                  setShowCreateEvent,
                  setAlert,
                  onSuccess: fetchCards,
                })
              }
            />
          </Modal>,
          document.getElementById('app-container')
        )}

      {showReport &&
        createPortal(
          <Modal
            isOpen={showReport}
            onClose={() => setShowReport(false)}
            title={
              reportData
                ? homeStrings.report.modalTitleWithName(reportData.title)
                : homeStrings.report.modalTitle
            }
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
                        ? reportStrings.reportSuccess
                        : reportStrings.reportFailed,
                  })
                }}
              />
            )}
          </Modal>,
          document.getElementById('app-container')
        )}

      {snapPoint === 0.085 && (
        <GenericButton
          unstyled={true}
          customStyling="absolute bottom-24 right-6 z-50 bg-blue-primary text-white rounded-full p-3 shadow-lg 
                transition-transform duration-200 active:scale-100 hover:scale-110"
          onClick={() => setShowCreateEvent(true)}
        >
          <Add fontSize="large" />
        </GenericButton>
      )}
    </div>
  )
}

export default Home
