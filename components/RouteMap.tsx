"use client";
import { useEffect, useRef } from "react";

// Decode Google encoded polyline
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

export default function RouteMap({ polyline }: { polyline: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const coords = decodePolyline(polyline);
    if (coords.length === 0) return;

    // Load Leaflet dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false });
      mapInstance.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(map);

      const polylineLayer = L.polyline(coords, {
        color: "#CAFF00",
        weight: 3,
        opacity: 0.9,
      }).addTo(map);

      // Start/end markers
      L.circleMarker(coords[0], { radius: 6, fillColor: "#4ade80", color: "#fff", weight: 2, fillOpacity: 1 }).addTo(map);
      L.circleMarker(coords[coords.length - 1], { radius: 6, fillColor: "#f43f5e", color: "#fff", weight: 2, fillOpacity: 1 }).addTo(map);

      map.fitBounds(polylineLayer.getBounds(), { padding: [12, 12] });
    };
    document.head.appendChild(script);

    return () => { /* cleanup handled by component unmount */ };
  }, [polyline]);

  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]"
    />
  );
}
