
import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Overlay } from 'ol';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Provider, MapComponentProps } from '@/types/map';
import 'ol/ol.css';

const MapComponent: React.FC<MapComponentProps> = ({ onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const defaultCenter: [number, number] = [-74.0060, 40.7128]; // Default to New York [lon, lat]
  const popupRef = useRef<HTMLDivElement>(null);

  const fetchNearbyProviders = async (latitude: number, longitude: number) => {
    // Mock data for demonstration - healthcare_providers table not yet created
    const mockProviders: Provider[] = [
      {
        id: '1',
        name: 'City Medical Center',
        provider_type: 'hospital',
        phone_number: '+1-555-0123',
        latitude: 40.7589,
        longitude: -73.9851,
        does_home_service: false,
        specialization: 'General Medicine',
        address: '123 Medical Plaza, New York, NY'
      },
      {
        id: '2',
        name: 'Dr. Sarah Johnson',
        provider_type: 'doctor',
        phone_number: '+1-555-0456',
        latitude: 40.7489,
        longitude: -73.9680,
        does_home_service: true,
        specialization: 'Family Medicine',
        address: '456 Health St, New York, NY'
      }
    ];

    setProviders(mockProviders);
    addProvidersToMap(mockProviders);
  };

  const addProvidersToMap = (providers: Provider[]) => {
    if (!map.current) return;

    const features = providers.map(provider => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([provider.longitude, provider.latitude])),
        provider: provider
      });

      feature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({
            color: provider.does_home_service ? '#4CAF50' : '#2196F3'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      }));

      return feature;
    });

    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map.current.addLayer(vectorLayer);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat(defaultCenter),
        zoom: 13
      })
    });

    // Create popup overlay
    if (popupRef.current) {
      const popup = new Overlay({
        element: popupRef.current,
        positioning: 'bottom-center',
        stopEvent: false
      });
      map.current.addOverlay(popup);
    }

    // Add click handler for features
    map.current.on('click', (evt) => {
      const feature = map.current?.forEachFeatureAtPixel(evt.pixel, feature => feature);
      if (feature && popupRef.current) {
        const provider = (feature as Feature).get('provider') as Provider;
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        
        popupRef.current.style.display = 'block';
        popupRef.current.innerHTML = `
          <div class="p-2">
            <h3 class="font-bold mb-1">${provider.name}</h3>
            <p class="text-sm">Type: ${provider.provider_type}</p>
            ${provider.specialization ? `<p class="text-sm">Specialization: ${provider.specialization}</p>` : ''}
            <p class="text-sm">Phone: ${provider.phone_number}</p>
            ${provider.does_home_service ? '<p class="text-sm text-green-600">✓ Offers home service</p>' : ''}
            ${provider.address ? `<p class="text-sm">Address: ${provider.address}</p>` : ''}
          </div>
        `;

        const overlay = map.current?.getOverlays().getArray()[0];
        overlay?.setPosition(coordinates);
      } else if (popupRef.current) {
        popupRef.current.style.display = 'none';
      }
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [longitude, latitude];
          setUserLocation([latitude, longitude]);
          
          if (map.current) {
            map.current.getView().animate({
              center: fromLonLat(location),
              duration: 1000
            });

            // Add user location marker
            const userFeature = new Feature({
              geometry: new Point(fromLonLat(location))
            });

            userFeature.setStyle(new Style({
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: '#FF0000' }),
                stroke: new Stroke({
                  color: '#fff',
                  width: 2
                })
              })
            }));

            const vectorSource = new VectorSource({
              features: [userFeature]
            });

            const vectorLayer = new VectorLayer({
              source: vectorSource
            });

            map.current.addLayer(vectorLayer);
          }
          
          await fetchNearbyProviders(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Showing all providers.');
          fetchNearbyProviders(defaultCenter[1], defaultCenter[0]);
        }
      );
    } else {
      fetchNearbyProviders(defaultCenter[1], defaultCenter[0]);
    }

    return () => {
      map.current?.setTarget(undefined);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg w-full max-w-4xl overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">Nearby Healthcare Providers</h2>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>
        <div className="relative h-[600px]">
          <div ref={mapContainer} className="h-full w-full" />
          <div ref={popupRef} className="absolute bg-white rounded-lg shadow-lg hidden" />
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
