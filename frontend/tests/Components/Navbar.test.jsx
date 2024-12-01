import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../src/Components/Navbar/Navbar";

test("renders Navbar with logo and links", () => {
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );

    const logo = screen.getByAltText("CashApp's logo in green");
    expect(logo).toBeInTheDocument();

    const loginLink = screen.getByText(/login/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/');

    const signUpLink = screen.getByText(/sign up/i);
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/signup');
});
