import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard topbar brand", () => {
  render(<App />);
  // The VotingDashboard Topbar uses brand="App Voter Dashboard"
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByText(/App Voter Dashboard/i)).toBeInTheDocument();
});
