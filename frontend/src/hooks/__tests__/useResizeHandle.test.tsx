/* Copyright 2024 Marimo. All rights reserved. */
import { act, render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useResizeHandle } from "../useResizeHandle";

describe("useResizeHandle", () => {
  it("should initialize with correct refs and style", () => {
    const { result } = renderHook(() =>
      useResizeHandle({
        startingWidth: 500,
        onResize: vi.fn(),
      }),
    );

    expect(result.current.resizableDivRef.current).toBeNull();
    expect(result.current.handleRefs.left.current).toBeNull();
    expect(result.current.handleRefs.right.current).toBeNull();
    expect(result.current.style).toEqual({ width: "500px" });
  });

  it("should handle contentWidth starting width", () => {
    const { result } = renderHook(() =>
      useResizeHandle({
        startingWidth: "contentWidth",
        onResize: vi.fn(),
      }),
    );

    // Defaults to medium width
    expect(result.current.style).toEqual({
      width: "var(--content-width-medium)",
    });
  });

  it("should call onResize when resizing", () => {
    const onResize = vi.fn();

    // Create a test component that uses the hook
    const TestComponent = () => {
      const { resizableDivRef, handleRefs } = useResizeHandle({
        startingWidth: 500,
        onResize,
      });

      return (
        <div>
          <div
            ref={resizableDivRef}
            style={{ width: "500px" }}
            data-testid="resizable-div"
          />
          <div ref={handleRefs.left} data-testid="left-handle" />
          <div ref={handleRefs.right} data-testid="right-handle" />
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const resizableDiv = getByTestId("resizable-div") as HTMLDivElement;
    const rightHandle = getByTestId("right-handle") as HTMLDivElement;

    // Simulate resize
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      rightHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: 100 });
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("600px"); // 500px + 100px movement
    expect(onResize).toHaveBeenCalledWith(600);

    // Resize left handle
    const leftHandle = getByTestId("left-handle") as HTMLDivElement;

    // Simulate resize
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      leftHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: -100 });
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("700px"); // 600px - (-100px) movement
    expect(onResize).toHaveBeenCalledWith(700);
  });

  it("should handle resizing with only left handle", () => {
    const onResize = vi.fn();

    // Create a test component that uses the hook
    const TestComponent = () => {
      const { resizableDivRef, handleRefs } = useResizeHandle({
        startingWidth: 500,
        onResize,
      });

      return (
        <div>
          <div
            ref={resizableDivRef}
            style={{ width: "500px" }}
            data-testid="resizable-div"
          />
          <div ref={handleRefs.left} data-testid="left-handle" />
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);

    const resizableDiv = getByTestId("resizable-div") as HTMLDivElement;
    const leftHandle = getByTestId("left-handle") as HTMLDivElement;

    // Simulate resize
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      leftHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: -100 });
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("600px"); // 500px - (-100px) movement
    expect(onResize).toHaveBeenCalledWith(600);
  });

  it("should handle resizing with only right handle", () => {
    const onResize = vi.fn();

    // Create a test component that uses the hook
    const TestComponent = () => {
      const { resizableDivRef, handleRefs } = useResizeHandle({
        startingWidth: 500,
        onResize,
      });

      return (
        <div>
          <div
            ref={resizableDivRef}
            style={{ width: "500px" }}
            data-testid="resizable-div"
          />
          <div ref={handleRefs.right} data-testid="right-handle" />
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);

    const resizableDiv = getByTestId("resizable-div") as HTMLDivElement;
    const rightHandle = getByTestId("right-handle") as HTMLDivElement;

    // Simulate resize
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      rightHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: 100 });
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("600px"); // 500px + 100px movement
    expect(onResize).toHaveBeenCalledWith(600);
  });

  it("should handle min and max width", () => {
    const onResize = vi.fn();

    // Create a test component that uses the hook
    const TestComponent = () => {
      const { resizableDivRef, handleRefs } = useResizeHandle({
        startingWidth: 500,
        minWidth: 400,
        maxWidth: 600,
        onResize,
      });

      return (
        <div>
          <div
            ref={resizableDivRef}
            style={{ width: "500px" }}
            data-testid="resizable-div"
          />
          <div ref={handleRefs.right} data-testid="right-handle" />
        </div>
      );
    };

    const { getByTestId } = render(<TestComponent />);
    const resizableDiv = getByTestId("resizable-div") as HTMLDivElement;
    const rightHandle = getByTestId("right-handle") as HTMLDivElement;

    // Test min width
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      rightHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: -200 }); // Try to resize below min
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("400px"); // Should be clamped to min width
    expect(onResize).toHaveBeenCalledWith(400);

    // Test max width
    act(() => {
      const mousedownEvent = new MouseEvent("mousedown", { clientX: 0 });
      rightHandle.dispatchEvent(mousedownEvent);

      const mousemoveEvent = new MouseEvent("mousemove", { clientX: 200 }); // Try to resize above max
      document.dispatchEvent(mousemoveEvent);

      const mouseupEvent = new MouseEvent("mouseup");
      document.dispatchEvent(mouseupEvent);
    });

    expect(resizableDiv.style.width).toBe("600px"); // Should be clamped to max width
    expect(onResize).toHaveBeenCalledWith(600);
  });
});
