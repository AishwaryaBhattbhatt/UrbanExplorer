let map;
const hexSize = 30; // Adjust this value to change the size of hexagons

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map = new google.maps.Map(document.getElementById("map"), {
                    center: { lat: latitude, lng: longitude },
                    zoom: 15,
                    disableDefaultUI: true,
                    styles: [
                        {
                            featureType: "poi",
                            stylers: [{ visibility: "off" }]
                        },
                        {
                            featureType: "transit",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                });
                
                // Wait for the map to load before creating the hex grid
                google.maps.event.addListenerOnce(map, 'idle', createHexGrid);
            },
            () => {
                alert("Error: The Geolocation service failed.");
            }
        );
    } else {
        alert("Error: Your browser doesn't support geolocation.");
    }
}

function createHexGrid() {
    const hexGrid = document.getElementById("hexGrid");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    hexGrid.appendChild(svg);

    const mapBounds = map.getBounds();
    const ne = mapBounds.getNorthEast();
    const sw = mapBounds.getSouthWest();

    const hexHeight = hexSize * 2;
    const hexWidth = Math.sqrt(3) / 2 * hexHeight;

    const projection = map.getProjection();
    const topLeft = projection.fromLatLngToPoint(new google.maps.LatLng(ne.lat(), sw.lng()));
    const bottomRight = projection.fromLatLngToPoint(new google.maps.LatLng(sw.lat(), ne.lng()));

    for (let x = topLeft.x; x < bottomRight.x; x += hexWidth * 0.75) {
        for (let y = topLeft.y; y < bottomRight.y; y += hexHeight * 0.75) {
            const hexagon = createHexagon(x - topLeft.x, y - topLeft.y);
            svg.appendChild(hexagon);
        }
    }
}

function createHexagon(x, y) {
    const hexagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const points = calculateHexPoints(x, y);
    hexagon.setAttribute("points", points);
    hexagon.setAttribute("class", "hexagon");
    hexagon.addEventListener("click", revealHexagon);
    return hexagon;
}

function calculateHexPoints(x, y) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = 2 * Math.PI / 6 * i;
        const hx = x + hexSize * Math.cos(angle);
        const hy = y + hexSize * Math.sin(angle);
        points.push(`${hx},${hy}`);
    }
    return points.join(" ");
}

function revealHexagon(event) {
    event.target.classList.add("revealed");
}

window.onload = initMap;