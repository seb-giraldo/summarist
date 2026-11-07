import "../index.css";
import logo from "../../assets/logo.png";
import logo200 from "../../assets/logo-200.webp";
import logo400 from "../../assets/logo-400.webp";
import { useDispatch } from "react-redux";
import { login } from "../redux/modalSlice";

export default function Navbar() {
  const dispatch = useDispatch();

  return (
    <>
      <nav className="nav">
        <div className="nav__wrapper">
          <figure className="nav__img--mask">
            <picture>
              <source type="image/webp" srcSet={`${logo200} 1x, ${logo400} 2x`} />
              <img className="nav__img" src={logo} alt="logo" />
            </picture>
          </figure>
          <ul className="nav__list--wrapper">
            <li
              className="nav__list nav__list--login"
              onClick={() => {
                dispatch(login());
              }}
            >
              Login
            </li>
            <li className="nav__list nav__list--mobile">About</li>
            <li className="nav__list nav__list--mobile">Contact</li>
            <li className="nav__list nav__list--mobile">Help</li>
          </ul>
        </div>
      </nav>
    </>
  );
}
