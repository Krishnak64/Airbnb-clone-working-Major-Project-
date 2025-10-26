mapboxgl.accessToken = mapToken;
console.log(mapToken);

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12',
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 9 // starting zoom
});

console.log(listing.geometry.coordinates);

// Create a Marker and add it to the map
const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking.</p>`);

const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);


popup.on('open', () => {
    const closeBtn = document.querySelector('.mapboxgl-popup-close-button');
    if (closeBtn) {
        closeBtn.removeAttribute('aria-hidden'); // remove the conflict
    }
});
