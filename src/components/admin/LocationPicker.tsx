"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  LeafletMouseEvent,
} from "leaflet";

type Coords = { lat: number; lng: number; neighborhood?: string };

type Props = {
  address: string;
  lat: number | null | undefined;
  lng: number | null | undefined;
  onAddressChange: (address: string) => void;
  onCoords: (c: Coords) => void;
};

const PIN_HTML =
  '<div style="width:18px;height:18px;border-radius:50%;background:#B83232;border:3px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>';

export function LocationPicker({
  address,
  lat,
  lng,
  onAddressChange,
  onCoords,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const onCoordsRef = useRef(onCoords);
  onCoordsRef.current = onCoords;

  const [searching, setSearching] = useState(false);
  const [msg, setMsg] = useState("");

  // Crea o mueve el pin; report=true cuando el cambio debe propagarse al formulario.
  function place(la: number, ln: number, report: boolean) {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (!markerRef.current) {
      const icon = L.divIcon({
        className: "",
        html: PIN_HTML,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker([la, ln], { draggable: true, icon }).addTo(map);
      m.on("dragend", () => {
        const p = m.getLatLng();
        onCoordsRef.current({ lat: p.lat, lng: p.lng });
      });
      markerRef.current = m;
    } else {
      markerRef.current.setLatLng([la, ln]);
    }
    if (report) onCoordsRef.current({ lat: la, lng: ln });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const hasCoords = typeof lat === "number" && typeof lng === "number";
      const center: [number, number] = hasCoords
        ? [lat as number, lng as number]
        : [41.3874, 2.1686];
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView(center, hasCoords ? 16 : 12);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 19 },
      ).addTo(map);
      map.on("click", (e: LeafletMouseEvent) =>
        place(e.latlng.lat, e.latlng.lng, true),
      );
      mapRef.current = map;
      if (hasCoords) place(lat as number, lng as number, false);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Solo se inicializa una vez; los cambios posteriores se aplican vía refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function geocode() {
    if (!address.trim()) {
      setMsg("Escribe una dirección primero.");
      return;
    }
    setSearching(true);
    setMsg("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(address)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setMsg("No se encontró. Ajusta la dirección o coloca el pin a mano en el mapa.");
        return;
      }
      const r = data[0];
      const la = parseFloat(r.lat);
      const ln = parseFloat(r.lon);
      const a = r.address ?? {};
      const neighborhood =
        a.neighbourhood || a.suburb || a.quarter || a.city_district || a.district || "";
      mapRef.current?.setView([la, ln], 16);
      place(la, ln, false);
      onCoordsRef.current({ lat: la, lng: ln, neighborhood });
      setMsg(`📍 ${r.display_name}`);
    } catch {
      setMsg("Error al buscar la dirección.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              geocode();
            }
          }}
          placeholder="C/ Balmes 120, Barcelona"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          onClick={geocode}
          disabled={searching}
          className="shrink-0 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)] disabled:opacity-60"
        >
          {searching ? "Buscando…" : "Localizar"}
        </button>
      </div>

      {msg && <p className="text-xs text-[var(--mute)]">{msg}</p>}

      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-lg border border-gray-200"
      />

      <p className="text-xs text-[var(--mute)]">
        {typeof lat === "number" && typeof lng === "number"
          ? `Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)} · arrastra el pin o haz clic en el mapa para ajustar`
          : "Sin ubicación. Busca la dirección o haz clic en el mapa para colocar el pin."}
      </p>
    </div>
  );
}
