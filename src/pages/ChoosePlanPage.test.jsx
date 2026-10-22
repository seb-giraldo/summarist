import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../redux/store";
import { getCheckoutUrl } from "../stripe/stripePayments";
import ChoosePlanPage from "./ChoosePlanPage";

vi.mock("../stripe/stripePayments", () => ({
  getCheckoutUrl: vi.fn(),
}));

const renderPage = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ChoosePlanPage />
      </MemoryRouter>
    </Provider>,
  );

describe("ChoosePlanPage", () => {
  const assign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("location", { ...window.location, assign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders the Premium plan cards", () => {
    renderPage();

    expect(screen.getByText("Premium Plus Yearly")).toBeInTheDocument();
    expect(screen.getByText("$99.99/year")).toBeInTheDocument();
    expect(screen.getByText("7-day free trial included")).toBeInTheDocument();
    expect(screen.getByText("Premium Monthly")).toBeInTheDocument();
    expect(screen.getByText("$9.99/month")).toBeInTheDocument();
    expect(screen.getByText("No trial included")).toBeInTheDocument();
  });

  test("asks the user to choose a plan when none is selected", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: /start your free 7-day trial/i }));

    expect(screen.getByText("Please choose a plan to proceed.")).toBeInTheDocument();
    expect(getCheckoutUrl).not.toHaveBeenCalled();
  });

  test("button calls the checkout function with the chosen plan and redirects", async () => {
    getCheckoutUrl.mockResolvedValueOnce("https://checkout.stripe.com/session");
    renderPage();

    await userEvent.click(screen.getByText("Premium Monthly"));
    await userEvent.click(screen.getByRole("button", { name: /start your free 7-day trial/i }));

    expect(getCheckoutUrl).toHaveBeenCalledWith(expect.anything(), "price_1UEhGh4YAkniBq7693lhUdfp");
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/session"));
  });
});
