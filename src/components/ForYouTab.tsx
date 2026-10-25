import "../pages/Account.css";
import { useEffect, useState } from "react";
import RenderBook from "../functions/RenderBook";
import axios from "axios";
import { FaCirclePlay } from "react-icons/fa6";
import type { Book } from "../types/book";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { SkeletonBook, SkeletonSelected } from "../functions/SkeletonStates";

export default function ForYouTab() {
  const userId = useSelector((state: RootState) => state.auth.uid);
  const [selected, setSelected] = useState<Book[]>([]);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [suggested, setSuggested] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchSelected = async () => {
      const { data } = await axios.get<Book[]>(
        `https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected`,
      );
      return data;
    };

    const fetchRecommended = async () => {
      const { data } = await axios.get<Book[]>(
        `https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended`,
      );
      return data;
    };

    const fetchSuggested = async () => {
      const { data } = await axios.get<Book[]>(
        `https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested`,
      );
      return data;
    };

    Promise.all([fetchSelected(), fetchRecommended(), fetchSuggested()]).then(([selected, recommended, suggested]) => {
      if (cancelled) return;
      setSelected(selected);
      setRecommended(recommended);
      setSuggested(suggested);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <>
      <div className="section">
        <h3 className="section__title">Selected just for you</h3>
        {selected.length > 0 ? (
          <>
            <div className="selected--wrapper" onClick={() => navigate(`/book/${selected[0].id}`)}>
              <p className="selected--desc">{selected[0].subTitle}</p>
              <div className="selected--divider"></div>
              <figure className="selected__img--wrapper">
                <img src={selected[0].imageLink} alt="" className="book__img" />
              </figure>
              <div className="selected__content">
                <h4 className="selected__title">{selected[0].title}</h4>
                <span className="selected__author">{selected[0].author}</span>
                <div className="selected__duration--wrapper">
                  <figure className="selected__play--wrapper">
                    <FaCirclePlay className="selected__play--icon" />
                  </figure>
                  <span className="selected__duration">3 mins 23 secs</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <SkeletonSelected />
        )}
      </div>

      <div className="section">
        <h3 className="section__title">Recommended For You</h3>
        <span className="section__sub-title">We think you'll like these</span>
        <div className="books">
          {!loading
            ? recommended.map((book: Book) => (
                <RenderBook
                  id={book.id}
                  key={book.id}
                  imageLink={book.imageLink}
                  title={book.title}
                  author={book.author}
                  subTitle={book.subTitle}
                  averageRating={book.averageRating}
                  subscriptionRequired={book.subscriptionRequired}
                />
              ))
            : new Array(5).fill(0).map((_, index) => <SkeletonBook key={index} />)}
        </div>
      </div>

      <div className="section">
        <h3 className="section__title">Suggested Books</h3>
        <span className="section__sub-title">Browse these books</span>
        <div className="books">
          {!loading
            ? suggested.map((book: Book) => (
                <RenderBook
                  id={book.id}
                  key={book.id}
                  imageLink={book.imageLink}
                  title={book.title}
                  author={book.author}
                  subTitle={book.subTitle}
                  averageRating={book.averageRating}
                  subscriptionRequired={book.subscriptionRequired}
                />
              ))
            : new Array(5).fill(0).map((_, index) => <SkeletonBook key={index} />)}
        </div>
      </div>
    </>
  );
}
