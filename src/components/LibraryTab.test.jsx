import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import axios from "axios";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../redux/store";
import { setUser } from "../redux/authSlice";
import { getSavedBooks, getFinishedBooks } from "../functions/HandleFirebaseDb";
import LibraryTab from "./LibraryTab";

vi.mock("axios");
vi.mock("../functions/HandleFirebaseDb", () => ({
  getSavedBooks: vi.fn(),
  getFinishedBooks: vi.fn(),
}));

const makeBook = (id) => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  subTitle: `Subtitle ${id}`,
  imageLink: `${id}.png`,
  averageRating: 4,
  subscriptionRequired: false,
});

describe("LibraryTab component", () => {
  test("shows the right item counts for saved and finished books", async () => {
    getSavedBooks.mockResolvedValue(["1", "2", "3"]);
    getFinishedBooks.mockResolvedValue(["4"]);
    axios.get.mockImplementation((url) => Promise.resolve({ data: makeBook(url.split("id=")[1]) }));
    store.dispatch(setUser({ uid: "user-1", email: "user@email.com", subscription: "basic" }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <LibraryTab />
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText("3 items")).toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
    expect(getSavedBooks).toHaveBeenCalledWith("user-1");
    expect(getFinishedBooks).toHaveBeenCalledWith("user-1");
  });
});
