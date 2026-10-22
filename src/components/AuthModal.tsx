import "./AuthModal.css";
import { IoClose } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import google from "../../assets/google.png";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, forgotPassword, closed } from "../redux/modalSlice";
import type { RootState } from "../redux/store";
import { FaSpinner } from "react-icons/fa";
import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setUser } from "../redux/authSlice";
import { doc, setDoc } from "firebase/firestore";

export default function AuthModal() {
  const dispatch = useDispatch();
  const authModal = useSelector((state: RootState) => state.modal.value);

  useEffect(() => {
    const preload = new Image();
    preload.src = google;
  }, []);

  return (
    <div>
      {authModal !== "closed" && (
        <div className="auth__container" aria-label="auth-modal" onClick={() => dispatch(closed())}>
          <div className="auth__wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="auth__content">
              <IoClose aria-label="close" className="close-auth__icon" onClick={() => dispatch(closed())} />
              {(authModal === "login" && <LoginModal />) ||
                (authModal === "signup" && <SignupModal />) ||
                (authModal === "forgotPassword" && <ForgotPasswordModal />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginModal() {
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setError("");

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const { user } = userCredential;
        dispatch(setUser({ uid: user.uid, email: user.email }));
        dispatch(closed());
        navigate("/for-you");
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const handleGuestLogin = () => {
    setLoadingGuest(true);
    signInWithEmailAndPassword(auth, "guest@email.com", "Guest123!")
      .then(() => {
        dispatch(setUser({ email: "guest@email.com", uid: "OEgGLry3ODZHRSgETQIcxLGtVkD2", subscription: "premium" }));
        dispatch(closed());
        navigate("/for-you");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingGuest(false));
  };

  return (
    <>
      <h3 className="auth__title">Log in to Summarist</h3>
      <button className="auth__login auth__login--guest" onClick={() => handleGuestLogin()}>
        {loadingGuest ? (
          <FaSpinner className="auth__spinner" />
        ) : (
          <>
            <figure className="auth__login--icon">
              <IoPerson />
            </figure>
            <span>Login as a guest</span>
          </>
        )}
      </button>
      <div className="auth__separator">
        <span className="auth__separator--text">or</span>
      </div>
      <button className="auth__login auth__login--google" onClick={() => setLoadingGoogle(true)}>
        {loadingGoogle ? (
          <FaSpinner className="auth__spinner" />
        ) : (
          <>
            <figure className="auth__login--icon auth__login--icon--google">
              <img src={google} width="24" height="24"></img>
            </figure>
            <span>Login with Google</span>
          </>
        )}
      </button>
      <div className="auth__separator">
        <span className="auth__separator--text">or</span>
      </div>
      <form className="auth__input--form" onSubmit={handleSubmit}>
        <input
          className="auth__input auth__input--email"
          type="email"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth__input auth__input--password"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <span className="auth__error">Invalid email/password.</span>}
        <button className="auth__btn--login btn">Login</button>
      </form>
      <div className="auth__links">
        <a className="auth__link auth__link--forgot-password" onClick={() => dispatch(forgotPassword())}>
          Forgot Your Password?
        </a>
        <a className="auth__link  auth__link--no-account" onClick={() => dispatch(signup())}>
          Don't have an account?
        </a>
      </div>
    </>
  );
}

function SignupModal() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const createAccount = (email: string, uid: string) => {
    const userData = {
      uid: uid,
      email: email,
      savedBooks: [],
      finishedBooks: [],
    };
    setDoc(doc(db, "users", uid), userData);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setError("");

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const { user } = userCredential;
        createAccount(email, user.uid);

        dispatch(setUser({ uid: user.uid, email: email }));
        dispatch(closed());
        navigate("/for-you");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingGoogle(false));
  };

  return (
    <>
      <h3 className="auth__title">Sign up to Summarist</h3>
      <button className="auth__login auth__login--google" onClick={() => setLoadingGoogle(true)}>
        {loadingGoogle ? (
          <FaSpinner className="auth__spinner" />
        ) : (
          <>
            <figure className="auth__login--icon auth__login--icon--google">
              <img src={google} width="24" height="24"></img>
            </figure>
            <span>Sign up with Google</span>
          </>
        )}
      </button>
      <div className="auth__separator">
        <span className="auth__separator--text">or</span>
      </div>
      <form className="auth__input--form" onSubmit={handleSubmit}>
        <input
          className="auth__input auth__input--email"
          id="email"
          type="email"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth__input auth__input--password"
          id="password"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <span className="auth__error">
            Invalid email/password. Password must have at least 8 characters,
            <br /> 1 uppercase letter, and 1 special character.
          </span>
        )}
        <button className="auth__btn--login btn">Sign up</button>
      </form>
      <div className="auth__links">
        <a className="auth__link" onClick={() => dispatch(login())}>
          Already have an account?
        </a>
      </div>
    </>
  );
}

function ForgotPasswordModal() {
  const dispatch = useDispatch();

  return (
    <>
      <h3 className="auth__title">Reset Your Password</h3>
      <form className="auth__input--form">
        <input className="auth__input auth__input--email" type="email" placeholder="Email Address" />
        <button className="auth__btn--login btn">Send reset password link</button>
      </form>
      <div className="auth__links">
        <button className="auth__link" onClick={() => dispatch(login())}>
          Go to login
        </button>
      </div>
    </>
  );
}
