const PROXY_URL = 'http://localhost:3000/maps/api/js'

export function loadGoogleMapsViaProxy(libraries = []) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve(window.google.maps)

    const script = document.createElement('script')
    const params = new URLSearchParams({
      libraries: libraries.join(','),
      callback: '__googleMapsCallback',
    })

    window.__googleMapsCallback = () => resolve(window.google.maps)

    script.src = `${PROXY_URL}?${params}`
    script.onerror = reject
    document.head.appendChild(script)
  })
}
