class MapWrapper {
    constructor(styling, dataProcessor) {
        this.styling = styling;
        this.dataProcessor = dataProcessor;

        mapboxgl.accessToken = 'pk.eyJ1IjoiYW5obmd1eWVuNjI4MSIsImEiOiJjazdka3VsankxMTZ4M2dyd2NrMmRxdzVwIn0.GX9EDHs7fkf2DqEOaYBMSw';
        this.map = new mapboxgl.Map({
            container: 'map',
            style: `mapbox://styles/mapbox/${styling.getTheme()}`,
            zoom: 2
        });
    }

    changeTheme(theme) {
        const source = this.map.getSource('route');

        // automatic diff failed => force diff to false to rerender the entire map
        this.map.setStyle(`mapbox://styles/mapbox/${theme}`, { diff: false });

        const done = new Promise((resolve, reject) => {
            this.map.on('styledata', function () {
                resolve("done");
            })
        })


        done.then(() => {
            const data = source._data;
            data.features.forEach(feature => {
                const { distance } = feature.properties
                feature.properties = { ...feature.properties, ...styling.getLineProperties(distance) };
            });
            this.addSourceAndLayers(source._data);
        })
    }

    replaceOrigin(newOrigin) {
        const hasChange = this.dataProcessor.setOriginCapital(newOrigin);
        if (!hasChange) {
            return;
        }

        const source = this.map.getSource('route');
        if (source) {
            const arcs = this.dataProcessor.getArcLinesFromOrigin();
            source.setData(arcs)
        }
    }

    addSourceAndLayers(routes) {
        this.map.addLayer({
            id: 'capitals',
            type: 'symbol',
            source: {
                type: 'geojson',
                data: this.dataProcessor.getCapitalPoints()
            },
            layout: {
                'icon-image': 'airport-11',
                'icon-allow-overlap': true
            },
            paint: {}
        });

        this.map.addSource('route', {
            'type': 'geojson',
            'data': routes
        });

        this.map.addLayer({
            'id': 'route',
            'source': 'route',
            'type': 'line',
            'paint': {
                'line-width': [
                    'case',
                    ['boolean',
                        ['feature-state', 'hover'],
                        false
                    ],
                    10,
                    ['get', 'lineWidth'],
                ],
                'line-opacity': [
                    'case',
                    ['boolean',
                        ['feature-state', 'hover'],
                        false
                    ],
                    0.8,
                    1
                ],
                'line-color': ['get', 'color'],
                //'line-color': '#007cbf'
            },
            'layout': {
                'line-cap': "round"
            }
        });
    }


    initMap() {
        this.map.on('load', () => {
            const routes = this.dataProcessor.getArcLinesFromOrigin();
            this.addSourceAndLayers(routes);

            var popup = new mapboxgl.Popup();

            this.map.on('mouseenter', 'capitals', ({ features }) => {
                if (!features.length) {
                    popup.remove();
                    return;
                }
                var feature = features[0];

                popup.setLngLat(feature.geometry.coordinates)
                    .setHTML(`<h3>${feature.properties.Name}</h3> <p> ${feature.properties.Description} </p>`)
                    .addTo(this.map);

                this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';

            });

            this.map.on('click', 'capitals', ({ features }) => {
                if (!features.length) {
                    return;
                }
                var feature = features[0];

                this.map.flyTo({
                    center: feature.geometry.coordinates, speed: 0.2, easing: function (t) {
                        return t;
                    },
                });
                this.replaceOrigin(feature.properties.Name)
            });


            this.map.on('mouseleave', 'capitals', () => {
                this.map.getCanvas().style.cursor = '';
                popup.remove();
            });

            let hoverId = null;


            this.map.on('mouseenter', 'route', ({ features, lngLat }) => {
                if (!features.length) {
                    popup.remove();
                    return;
                }
                var feature = features[0];

                popup.setLngLat(lngLat.toArray())
                    .setHTML(`<h3>Distance ${feature.properties.origin} - ${this.dataProcessor.getOriginCapital()}: </h3> <p> ${feature.properties.distance} km </p>`)
                    .addTo(this.map);

                hoverId = feature.id;
                this.map.setFeatureState(
                    { source: 'route', id: hoverId },
                    { hover: true }
                );
            });


            this.map.on('mouseleave', 'route', () => {
                const id = hoverId;

                this.map.getCanvas().style.cursor = '';
                popup.remove();

                if (id != null) {
                    this.map.setFeatureState(
                        { source: 'route', id },
                        { hover: false }
                    );
                    hoverId = null;
                }
            });
        });
    }

}