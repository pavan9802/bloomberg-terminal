import { Group, Panel, Separator } from "react-resizable-panels";
import { PriceWidgetProvider } from "../context/PriceWidgetContext";
import PriceChart from "./PriceChart";
import WatchList from "./WatchList";

export default function PriceWidget() {
  return (
    <PriceWidgetProvider>
      <Group orientation="horizontal" style={{ height: "100%" }}>
        <Panel id="watchlist" minSize="10" defaultSize="20">
          <WatchList />
        </Panel>
        <Separator className="resize-handle resize-handle-col" />
        <Panel id="chart" minSize="30">
          <div className="chart-panel">
            <PriceChart />
          </div>
        </Panel>
      </Group>
    </PriceWidgetProvider>
  );
}
