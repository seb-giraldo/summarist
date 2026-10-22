import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../redux/store";
import Searchbar from "./Searchbar";

vi.mock("axios");

describe("Searchbar component", () => {
  test("calls getBooksByAuthorOrTitle with the typed term and renders mocked results", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: "1", title: "The Lean Startup", author: "Eric Ries", imageLink: "lean.png", averageRating: 4.5 },
        { id: "2", title: "Lean In", author: "Sheryl Sandberg", imageLink: "lean-in.png", averageRating: 4.1 },
      ],
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Searchbar />
        </MemoryRouter>
      </Provider>,
    );

    await userEvent.type(screen.getByPlaceholderText(/search for books/i), "lean{Enter}");

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("getBooksByAuthorOrTitle?search=lean"));
    expect(await screen.findByText("The Lean Startup")).toBeInTheDocument();
    expect(screen.getByText("Eric Ries")).toBeInTheDocument();
    expect(screen.getByText("Lean In")).toBeInTheDocument();
    expect(screen.getByText("Sheryl Sandberg")).toBeInTheDocument();
  });

  
});
