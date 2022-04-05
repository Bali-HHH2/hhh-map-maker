import mapboxgl from 'mapbox-gl';

const getRoute = async (map: mapboxgl.Map, coords: any, token: string) => {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${115.2262488},${-8.67033};${coords[0]},${coords[1]}?steps=true&geometries=geojson&access_token=${token}`,
    { method: 'GET' }

  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };
  // if the route already exists on the map, we'll reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#d917a5',
        'line-width': 5.5,
        'line-opacity': 1,
        'line-dasharray': [2, 2.3],
      }
    });
    map.addLayer({
      id: 'point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coords
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#3887be'
      }
    });
    const el = document.createElement('div');
    el.className = 'hash-marker';
    new mapboxgl.Marker(el)
      .setLngLat(coords)
      .addTo(map);
  }
  // add turn instructions here at the end
}

export default getRoute
