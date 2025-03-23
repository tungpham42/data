import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Form, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../LanguageContext";

function ChartBuilder({ data, columns }) {
  const [chartType, setChartType] = useState("column");
  const [xAxis, setXAxis] = useState(columns[0]);
  const [yAxes, setYAxes] = useState([columns[1]]);
  const [chartTitle, setChartTitle] = useState("");
  const [colors, setColors] = useState(["#2b908f", "#90ee7e", "#f45b5b"]); // Start with more colors
  const { t } = useLanguage();

  const addYAxis = () => {
    if (yAxes.length < 3) {
      setYAxes([...yAxes, columns[1]]);
      setColors([...colors, "#90ee7e"]); // Add a default color for new Y-axis
    }
  };

  const removeYAxis = (index) => {
    if (yAxes.length > 1) {
      setYAxes(yAxes.filter((_, i) => i !== index));
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Aggregate data by xAxis, summing yAxes values for duplicate xAxis entries
  const aggregatedData = data.reduce((acc, item) => {
    const xValue = item[xAxis];
    const existing = acc.find((d) => d[xAxis] === xValue);
    if (existing) {
      yAxes.forEach((yAxis) => {
        existing[yAxis] =
          (Number(existing[yAxis]) || 0) + (Number(item[yAxis]) || 0);
      });
    } else {
      acc.push({
        [xAxis]: xValue,
        ...Object.fromEntries(
          yAxes.map((yAxis) => [yAxis, Number(item[yAxis]) || 0])
        ),
      });
    }
    return acc;
  }, []);

  const chartOptions = {
    chart: {
      type: chartType,
      zoomType: "xy",
    },
    title: { text: chartTitle || `${t(`${chartType}_chart`)}` },
    xAxis:
      chartType !== "pie"
        ? {
            categories: aggregatedData.map((item) => item[xAxis]),
            title: { text: xAxis },
            crosshair: true,
          }
        : undefined, // Pie charts don’t use xAxis
    yAxis:
      chartType !== "pie"
        ? {
            title: { text: "Values" },
            gridLineDashStyle: "Dash",
          }
        : undefined, // Pie charts don’t use yAxis
    series:
      chartType === "pie"
        ? [
            {
              name: yAxes[0], // Use the first yAxis as the series name
              data: aggregatedData.map((item, idx) => ({
                name: item[xAxis], // Use xAxis value as the slice label
                y: Number(item[yAxes[0]]), // Use the first yAxis value
                color: colors[idx % colors.length], // Cycle through colors array
              })),
            },
          ]
        : yAxes.map((yAxis, idx) => ({
            name: yAxis,
            data: aggregatedData.map((item) => Number(item[yAxis])),
            color: colors[idx],
          })),
    plotOptions: {
      series: {
        animation: true,
        marker: { enabled: chartType === "scatter" },
      },
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}", // Display name and value
        },
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
          {t("chart_builder_title")}
        </Card.Title>
        <Form>
          <Form.Group>
            <Form.Label>{t("chart_title_label")}</Form.Label>
            <Form.Control
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("chart_type_label")}</Form.Label>
            <Form.Select onChange={(e) => setChartType(e.target.value)}>
              <option value="column">{t("column_chart")}</option>
              <option value="line">{t("line_chart")}</option>
              <option value="pie">{t("pie_chart")}</option>
              <option value="scatter">{t("scatter_chart")}</option>
              <option value="area">{t("area_chart")}</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("x_axis_label")}</Form.Label>
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
              <Form.Label>
                {t("y_axis_label")} {idx + 1}
              </Form.Label>
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
                  className="py-1 px-2"
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
              {t("add_y_axis")}
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
