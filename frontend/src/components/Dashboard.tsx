import { Fragment, useEffect, useState } from "react";
import RemoveButton from "./RemoveButton";
import { Group, Panel, Separator, useGroupRef } from "react-resizable-panels";
import PriceWidget from "./PriceWidget";
import { WidgetType, Row, PanelRowProps } from "../types/dashboard";

const WIDGET_LABELS: Record<WidgetType, string> = {
  price: "Price Chart",
};

function renderWidget(type: WidgetType) {
  switch (type) {
    case "price":
      return <PriceWidget />;
  }
}


function PanelRow({ row, onRemoveWidget }: PanelRowProps) {
  const groupRef = useGroupRef();

  useEffect(() => {
    if (row.widgets.length <= 1) return;
    const equalSize = 100 / row.widgets.length;
    const layout = Object.fromEntries(row.widgets.map(w => [w.id, equalSize]));
    const id = setTimeout(() => groupRef.current?.setLayout(layout), 0);
    return () => clearTimeout(id);
  }, [row.widgets.length]);

  return (
    <Group orientation="horizontal" groupRef={groupRef} style={{ height: "100%" }}>
      {row.widgets.flatMap((widget, index) => [
        index > 0 && (
          <Separator key={`sep-${widget.id}`} className="resize-handle resize-handle-col" />
        ),
        <Panel key={widget.id} id={widget.id} minSize="15">
          <div className="widget-container">
            <div className="widget-header">
              <span className="widget-title">{WIDGET_LABELS[widget.type]}</span>
              <div className="widget-controls">
                <RemoveButton onClick={() => onRemoveWidget(widget.id)} />
              </div>
            </div>
            <div className="widget-content">
              {renderWidget(widget.type)}
            </div>
          </div>
        </Panel>,
      ])}
    </Group>
  );
}

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([
    { id: "row-1", widgets: [{ id: "1", type: "price" }] },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const outerGroupRef = useGroupRef();

  // Redistribute rows equally when rows are added or removed.
  useEffect(() => {
    if (rows.length <= 1) return;
    const equalSize = 100 / rows.length;
    const layout = Object.fromEntries(rows.map(r => [r.id, equalSize]));
    const id = setTimeout(() => outerGroupRef.current?.setLayout(layout), 0);
    return () => clearTimeout(id);
  }, [rows.length]);

  const addWidget = (type: WidgetType, rowId?: string) => {
    if (rowId) {
      setRows(prev => prev.map(r =>
        r.id === rowId
          ? { ...r, widgets: [...r.widgets, { id: Date.now().toString(), type }] }
          : r
      ));
    } else {
      setRows(prev => [...prev, {
        id: `row-${Date.now()}`,
        widgets: [{ id: Date.now().toString(), type }],
      }]);
    }
    setShowAddMenu(false);
  };

  const removeWidget = (widgetId: string) => {
    setRows(prev =>
      prev
        .map(r => ({ ...r, widgets: r.widgets.filter(w => w.id !== widgetId) }))
        .filter(r => r.widgets.length > 0)
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-toolbar">
        <span className="dashboard-title">BLOOMBERG TERMINAL</span>
        <div className="toolbar-actions">
          <button className="add-widget-btn" onClick={() => setShowAddMenu(v => !v)}>
            + ADD WIDGET
          </button>
          {showAddMenu && (
            <div className="add-widget-menu">
              <div className="add-widget-menu-section">NEW ROW</div>
              {(Object.keys(WIDGET_LABELS) as WidgetType[]).map(type => (
                <button key={`new-${type}`} onClick={() => addWidget(type)}>
                  {WIDGET_LABELS[type]}
                </button>
              ))}
              {rows.map((row, i) => (
                <Fragment key={row.id}>
                  <div className="add-widget-menu-section">ROW {i + 1}</div>
                  {(Object.keys(WIDGET_LABELS) as WidgetType[]).map(type => (
                    <button key={`${row.id}-${type}`} onClick={() => addWidget(type, row.id)}>
                      {WIDGET_LABELS[type]}
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <Group orientation="vertical" groupRef={outerGroupRef} style={{ height: "100%" }}>
          {rows.flatMap((row, index) => [
            index > 0 && (
              <Separator key={`row-sep-${row.id}`} className="resize-handle resize-handle-row" />
            ),
            <Panel key={row.id} id={row.id} minSize="10">
              <PanelRow row={row} onRemoveWidget={removeWidget} />
            </Panel>,
          ])}
        </Group>
      </div>
    </div>
  );
}
