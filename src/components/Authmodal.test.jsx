import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import AuthModal from "./AuthModal";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../redux/store";
import { login } from "../redux/modalSlice";
import { signInWithEmailAndPassword } from "firebase/auth";

vi.mock("firebase/auth", async (importOriginal) => ({
  ...(await importOriginal()),
  signInWithEmailAndPassword: vi.fn(),
}));

describe("Authmodal component", () => {
  test("renders Authmodal component", () => {
    store.dispatch(login());
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AuthModal />
        </MemoryRouter>
      </Provider>,
    );
    const element = screen.getByLabelText(/auth-modal/i);
    expect(element).toBeInTheDocument();
  });

  test("closes Authmodal component on close icon and overlay click", async () => {
    store.dispatch(login());
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AuthModal />
        </MemoryRouter>
      </Provider>,
    );

    await userEvent.click(screen.getByLabelText(/close/i));
    expect(screen.queryByLabelText(/auth-modal/i)).not.toBeInTheDocument();

    act(() => {
      store.dispatch(login());
    });
    await userEvent.click(screen.getByLabelText(/auth-modal/i));
    expect(screen.queryByLabelText(/auth-modal/i)).not.toBeInTheDocument();
  });

  test("shows an error message when sign-in is rejected", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("auth/invalid-credential"));
    store.dispatch(login());
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AuthModal />
        </MemoryRouter>
      </Provider>,
    );

    await userEvent.type(screen.getByPlaceholderText(/email address/i), "user@email.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText("Invalid email/password.")).toBeInTheDocument();
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "user@email.com", "wrongpassword");
  });

  test("guest login button calls sign-in with the guest credentials", async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: "guest-uid", email: "guest@email.com" } });
    store.dispatch(login());
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AuthModal />
        </MemoryRouter>
      </Provider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /login as a guest/i }));

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "guest@email.com", "Guest123!");
  });
});
