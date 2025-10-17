import dynamic from "next/dynamic";

import type { EventRecord, Vessel } from "@/lib/types";

export interface CarrierMapProps {
  events: EventRecord[];
  vessels: Vessel[];
  className?: string;
}

const DynamicCarrierMap = dynamic<CarrierMapProps>(() => import("./carrier-map.client"), {
  ssr: false,
  loading: (props) => {
    const className = (props as CarrierMapProps | undefined)?.className;
    return (
      <div
        className={`rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 ${className ?? ""}`}
      >
        Map initializing… The interactive view loads once the client is ready.
      </div>
    );
  },
});

export function CarrierMap(props: CarrierMapProps) {
  return <DynamicCarrierMap {...props} />;
}
