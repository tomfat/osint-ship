import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { TimeRangeControls } from "../time-range-controls";

describe("TimeRangeControls", () => {
  it("applies min and max boundaries to the date inputs", () => {
    const markup = renderToStaticMarkup(
      createElement(TimeRangeControls, {
        minDate: "2024-04-01",
        maxDate: "2024-05-10",
        startDate: "2024-04-05",
        endDate: "2024-04-25",
        onRangeChange: () => {},
      }),
    );

    const dom = new JSDOM(markup);
    const startInput = dom.window.document.querySelector('input[name="start-date"]');
    const endInput = dom.window.document.querySelector('input[name="end-date"]');

    assert.ok(startInput, "start date input should render");
    assert.ok(endInput, "end date input should render");

    assert.equal(startInput?.getAttribute("min"), "2024-04-01");
    assert.equal(startInput?.getAttribute("max"), "2024-04-25");
    assert.equal(startInput?.getAttribute("value"), "2024-04-05");

    assert.equal(endInput?.getAttribute("min"), "2024-04-05");
    assert.equal(endInput?.getAttribute("max"), "2024-05-10");
    assert.equal(endInput?.getAttribute("value"), "2024-04-25");

    dom.window.close();
  });

  it("renders a helpful empty state when no bounds exist", () => {
    const markup = renderToStaticMarkup(createElement(TimeRangeControls, { onRangeChange: () => {} }));
    const dom = new JSDOM(markup);

    const message = dom.window.document.querySelector('[data-testid="time-range-empty"]');
    assert.ok(message, "empty state container should render");
    assert.match(message?.textContent ?? "", /No events available/i);

    dom.window.close();
  });
});
