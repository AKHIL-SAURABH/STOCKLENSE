import { RSIChart } from "./RSIChart";
import { MACDChart } from "./MACDChart";
import { DrawdownChart } from "./DrawdownChart";
import { DistributionChart } from "./DistributionChart";

export function IndicatorsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <RSIChart />
        <MACDChart />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <DrawdownChart />
        <DistributionChart />
      </div>
    </div>
  );
}
