export type WidgetType = "price";

export interface Widget {
  id: string;
  type: WidgetType;
}

export interface Row {
  id: string;
  widgets: Widget[];
}

export interface PanelRowProps {
  row: Row;
  onRemoveWidget: (widgetId: string) => void;
}
