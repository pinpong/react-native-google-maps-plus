// The examples in the order of the docs website. The website takes title,
// description and props from the comment at the top of each file, the example
// app renders the components, and the screenshots are taken from there.
import type { ComponentType } from 'react';

import AdvancedMarkers from './advanced-markers';
import FitToMarkers from './camera';
import EvCharging from './charging';
import Clustering from './clustering';
import DroneSurvey from './drone';
import FlightRoutes from './flights';
import FriendsNearby from './friends';
import Analytics from './heatmap';
import OutdoorTracking from './hiking';
import IndoorMaps from './indoor';
import KmlLayers from './kml';
import MapsInAList from './lite-mode';
import MyLocation from './location';
import Navigation from './navigation';
import Rentals from './rentals';
import RideTracking from './ride';
import ScooterSharing from './scooters';
import Snapshot from './snapshot';
import StoreLocator from './stores';
import StreetView from './street-view';
import DataTiles from './tiles';
import CityTour from './tour';
import TrafficAtNight from './traffic';
import TransitNetwork from './transit';
import DeliveryZones from './zones';

type Example = { id: string; title: string; component: ComponentType };

// Complete use cases, shown on the landing page.
export const useCases: Example[] = [
  { id: 'ride', title: 'Ride tracking', component: RideTracking },
  { id: 'navigation', title: 'Navigation', component: Navigation },
  { id: 'scooters', title: 'Scooter sharing', component: ScooterSharing },
  { id: 'stores', title: 'Store locator', component: StoreLocator },
  { id: 'rentals', title: 'Rentals', component: Rentals },
  { id: 'transit', title: 'Transit network', component: TransitNetwork },
  { id: 'zones', title: 'Delivery zones', component: DeliveryZones },
  { id: 'charging', title: 'EV charging', component: EvCharging },
  { id: 'tour', title: 'City tour', component: CityTour },
  { id: 'friends', title: 'Friends nearby', component: FriendsNearby },
  { id: 'heatmap', title: 'Analytics', component: Analytics },
  { id: 'hiking', title: 'Outdoor tracking', component: OutdoorTracking },
  { id: 'drone', title: 'Drone survey', component: DroneSurvey },
  { id: 'flights', title: 'Flight routes', component: FlightRoutes },
  { id: 'street-view', title: 'Street View', component: StreetView },
];

// One feature each that the use cases do not show.
export const features: Example[] = [
  {
    id: 'advanced-markers',
    title: 'Advanced markers',
    component: AdvancedMarkers,
  },
  { id: 'clustering', title: 'Clustering', component: Clustering },
  { id: 'kml', title: 'KML layers', component: KmlLayers },
  { id: 'tiles', title: 'Data tiles', component: DataTiles },
  { id: 'location', title: 'My location', component: MyLocation },
  { id: 'indoor', title: 'Indoor maps', component: IndoorMaps },
  { id: 'camera', title: 'Fit to markers', component: FitToMarkers },
  { id: 'snapshot', title: 'Snapshot', component: Snapshot },
  { id: 'lite-mode', title: 'Maps in a list', component: MapsInAList },
  { id: 'traffic', title: 'Traffic at night', component: TrafficAtNight },
];

export const examples = [...useCases, ...features];
