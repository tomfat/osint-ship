import { FleetStatistics } from "../types";
import { vessels } from "./vessels";
import { events } from "./events";
import { calculateFleetStatistics } from "../utils";

export const fleetStats: FleetStatistics = calculateFleetStatistics(vessels, events);
