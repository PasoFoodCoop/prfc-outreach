import { render, screen } from "@testing-library/react";
import Page from "@/app/team/rutledge/page";

describe("Rutledge Team Page", () => {
  it("renders name and role", () => {
    render(<Page />);
    expect(screen.getByText("Kevin Rutledge")).toBeInTheDocument();
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
  });

  it("renders fun fact section", () => {
    render(<Page />);
    expect(screen.getByText("Fun Fact")).toBeInTheDocument();
  });
});
