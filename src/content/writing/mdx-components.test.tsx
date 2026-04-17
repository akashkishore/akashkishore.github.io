import { render, screen, within } from "@testing-library/react";
import type { JSX } from "react";
import StainlessSteelBestPost from "./posts/stainless-steel-best.mdx";
import { writingMdxComponents } from "./mdx-components";

function RenderPost(): JSX.Element {
  return <StainlessSteelBestPost components={writingMdxComponents} />;
}

test("nested markdown lists remain nested in rendered mdx", () => {
  render(<RenderPost />);

  const parentItem = screen.getByText("Which brand?").closest("li");

  expect(parentItem).not.toBeNull();

  const nestedList = within(parentItem as HTMLLIElement).getByRole("list");
  expect(nestedList).toBeInTheDocument();
  expect(within(nestedList).getByText("test")).toBeInTheDocument();
  expect(within(nestedList).getByText("hi")).toBeInTheDocument();
});
