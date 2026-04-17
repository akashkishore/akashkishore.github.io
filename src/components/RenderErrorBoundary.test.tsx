import { render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { RenderErrorBoundary } from "./RenderErrorBoundary";

function BrokenMdxPost(): JSX.Element {
  throw new Error("broken mdx");
}

test("malformed mdx render failures are caught by the error boundary", () => {
  render(
    <RenderErrorBoundary fallback={<p>Fallback rendered</p>} resetKey="broken">
      <BrokenMdxPost />
    </RenderErrorBoundary>,
  );

  expect(screen.getByText("Fallback rendered")).toBeInTheDocument();
});
