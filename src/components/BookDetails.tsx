import axios from "axios";
import "./BookDetails.css";
import { useNavigate, useParams } from "react-router";
import type { Book } from "../types/book";
import { useEffect, useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { IoMicOutline } from "react-icons/io5";
import { AiOutlineClockCircle, AiOutlineStar } from "react-icons/ai";
import { HiOutlineLightBulb } from "react-icons/hi";
import { LuBookOpenText } from "react-icons/lu";
import { getSavedBooks, addSavedBook, removeSavedBook } from "../functions/HandleFirebaseDb";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { SkeletonIgnore, SkeletonWrapper } from "react-skeletonify";

export default function BookDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { bookId } = useParams();
  const [book, setBook] = useState({} as Book);
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const addedToLibrary = !!bookId && savedBooks.includes(bookId);
  const userId = useSelector((state: RootState) => state.auth.uid);
  const isUserPremium = useSelector((state: RootState) => state.auth.subscription) === "premium";
  const isUserLoading = useSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    const fetchBook = async () => {
      const { data } = await axios.get(`https://us-central1-summaristt.cloudfunctions.net/getBook?id=${bookId}`);
      setBook(data);
    };

    fetchBook().then(() => setLoading(false));
  }, [bookId]);

  useEffect(() => {
    getSavedBooks(userId).then(setSavedBooks);
  }, [userId]);

  return (
    <SkeletonWrapper loading={loading}>
      <div className="inner__wrapper">
        <div className="inner__book">
          <div className="inner-book__title">{book.title}</div>
          <div className="inner-book__author">{book.author}</div>
          <div className="inner-book__sub--title">{book.subTitle}</div>
          <SkeletonIgnore>
            <div className="inner-book__wrapper">
              <div className="inner-book__description--wrapper">
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <AiOutlineStar />
                  </div>
                  <div className="inner-book__overall--rating">{book.averageRating}&nbsp;</div>
                  <div className="inner-book__total--rating">({book.totalRating}&nbsp;ratings)</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <AiOutlineClockCircle />
                  </div>
                  <div className="inner-book__duration">03:24</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <IoMicOutline />
                  </div>
                  <div className="inner-book__type">Audio &amp; Text</div>
                </div>
                <div className="inner-book__description">
                  <div className="inner-book__icon">
                    <HiOutlineLightBulb />
                  </div>
                  <div className="inner-book__key--ideas">{book.keyIdeas} Key ideas</div>
                </div>
              </div>
            </div>

            {!isUserLoading && (
              <>
                <div className="inner-book__read--btn-wrapper">
                  <button
                    className="inner-book__read--btn"
                    onClick={
                      book.subscriptionRequired && !isUserPremium
                        ? () => navigate("/choose-plan")
                        : () => navigate(`/player/${bookId}`)
                    }
                  >
                    <div className="inner-book__read--icon">
                      <LuBookOpenText />
                    </div>
                    <div className="inner-book__read--text">Read</div>
                  </button>
                  <button
                    className="inner-book__read--btn"
                    onClick={
                      book.subscriptionRequired && !isUserPremium
                        ? () => navigate("/choose-plan")
                        : () => navigate(`/player/${bookId}`)
                    }
                  >
                    <div className="inner-book__read--icon">
                      <IoMicOutline />
                    </div>
                    <div className="inner-book__read--text">Listen</div>
                  </button>
                </div>
              </>
            )}
            <div className="inner-book__bookmark">
              {addedToLibrary ? (
                <div
                  className="save-book__btn"
                  onClick={
                    book.subscriptionRequired && !isUserPremium
                      ? () => navigate("/choose-plan")
                      : () => {
                          removeSavedBook(userId, bookId);
                          setSavedBooks((prev) => prev.filter((id) => id !== bookId));
                        }
                  }
                >
                  <div className="inner-book__bookmark--icon">
                    <FaBookmark />
                  </div>
                  <div className="inner-book__bookmark--text">Saved in My Library</div>
                </div>
              ) : (
                <div
                  className="save-book__btn"
                  onClick={
                    book.subscriptionRequired && !isUserPremium
                      ? () => navigate("/choose-plan")
                      : () => {
                          addSavedBook(userId, bookId);
                          if (bookId) setSavedBooks((prev) => [...prev, bookId]);
                        }
                  }
                >
                  <div className="inner-book__bookmark--icon">
                    <FaRegBookmark />
                  </div>
                  <div className="inner-book__bookmark--text">Add Title to My Library</div>
                </div>
              )}
            </div>
          </SkeletonIgnore>
          <div className="inner-book__secondary--title">What's it about?</div>
          <div className="inner-book__tags--wrapper">
            {book.tags &&
              book.tags.map((_, index) => (
                <div className="inner-book__tag" key={index}>
                  {book.tags[index]}
                </div>
              ))}
          </div>
          <div className="inner-book__book--description">{book.bookDescription}</div>
          <h2 className="inner-book__secondary--title">About the author</h2>
          <div className="inner-book__author--description">{book.authorDescription}</div>
        </div>

        {loading ? (
          <div style={{ height: "380px", width: "380px" }}>
            <SkeletonWrapper loading={loading}>
              <div style={{ width: "100%", height: "100%", minHeight: "300px" }}>asdfasd</div>
            </SkeletonWrapper>
          </div>
        ) : (
          <div className="inner-book--img-wrapper">
            <figure className="book__image--wrapper">
              <img src={book.imageLink} alt="book" className="book__image" />
            </figure>
          </div>
        )}
      </div>
    </SkeletonWrapper>
  );
}
