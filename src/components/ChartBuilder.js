import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

function ChartBuilder({ data, columns }) {
  const [chartType, setChartType] = useState("column");
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxes, setYAxes] = useState([columns[1]]);
  const [chartTitle, setChartTitle] = useState("");
  const [colors, setColors] = useState(["#2b908f"]);

  const addYAxis = () => {
    if (yAxes.length < 3) {
      setYAxes([...yAxes, columns[1]]);
      setColors([...colors, "#90ee7e"]);
    }
  };

  const removeYAxis = (index) => {
    if (yAxes.length > 1) {
      setYAxes(yAxes.filter((_, i) => i !== index));
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const chartOptions = {
    chart: {
      type: chartType,
      zoomType: "xy",
    },
    title: { text: chartTitle || `${chartType} Chart` },
    xAxis: {
      categories: data.map((item) => item[xAxis]),
      title: { text: xAxis },
      crosshair: true,
    },
    yAxis: {
      title: { text: "Values" },
      gridLineDashStyle: "Dash",
    },
    series: yAxes.map((yAxis, idx) => ({
      name: yAxis,
      data: data.map((item) => Number(item[yAxis])),
      color: colors[idx],
    })),
    plotOptions: {
      series: {
        animation: true,
        marker: { enabled: chartType === "scatter" },
      },
    },
    tooltip: {
      shared: true,
      valueDecimals: 2,
    },
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faChartBar} className="me-2" />
          Chart Builder
        </Card.Title>
        <Form>
          <Form.Group>
            <Form.Label>Chart Title</Form.Label>
            <Form.Control
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Chart Type</Form.Label>
            <Form.Select onChange={(e) => setChartType(e.target.value)}>
              <option value="column">Column</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
              <option value="scatter">Scatter</option>
              <option value="area">Area</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>X-Axis</Form.Label>
            <Form.Select onChange={(e) => setXAxis(e.target.value)}>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {yAxes.map((yAxis, idx) => (
            <Form.Group key={idx} className="mb-2">
              <Form.Label>Y-Axis {idx + 1}</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  value={yAxis}
                  onChange={(e) => {
                    const newYAxes = [...yAxes];
                    newYAxes[idx] = e.target.value;
                    setYAxes(newYAxes);
                  }}
                  className="flex-grow-1"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="color"
                  value={colors[idx]}
                  onChange={(e) => {
                    const newColors = [...colors];
                    newColors[idx] = e.target.value;
                    setColors(newColors);
                  }}
                  style={{ width: "60px" }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeYAxis(idx)}
                  disabled={yAxes.length <= 1}
                  title="Remove Y-Axis"
                  className="mb-2 pt-2 px-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </div>
            </Form.Group>
          ))}
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={addYAxis}
              disabled={yAxes.length >= 3}
              className="mt-2"
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Add Y-Axis
            </Button>
          </div>
        </Form>
        <div className="chart-container mt-3">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </Card.Body>
    </Card>
  );
}

export default ChartBuilder;
