import { useEffect, useState } from "react";
import RenderBook from "../functions/RenderBook";
import type { Book } from "../types/book";
import { getSavedBooks, getFinishedBooks } from "../functions/HandleFirebaseDb";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import axios from "axios";
import "../pages/Account.css";
import { SkeletonBook } from "../functions/SkeletonStates";

export default function SavedTab() {
  const userId = useSelector((state: RootState) => state.auth.uid);
  const [loading, setLoading] = useState(true);
  const [savedBooksData, setSavedBooksData] = useState<Book[]>([]);
  const [finishedBooksData, setFinishedBooksData] = useState<Book[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchBooksData = async (bookIds: string[]): Promise<Book[]> => {
      return await Promise.all(
        bookIds.map(async (bookId) => {
          const { data } = await axios.get(`https://us-central1-summaristt.cloudfunctions.net/getBook?id=${bookId}`);

          return data;
        }),
      );
    };

    Promise.all([getSavedBooks(userId).then(fetchBooksData), getFinishedBooks(userId).then(fetchBooksData)]).then(
      ([saved, finished]) => {
        setSavedBooksData(saved);
        setFinishedBooksData(finished);
        setLoading(false);
      },
    );
  }, [userId]);

  return (
    <>
      <div className="section--wrapper">
        <h3 className="section--title">Saved Books</h3>
        <span className="section--count section__sub-title">{savedBooksData.length} items</span>
        <div className="section__books">
          {!loading
            ? savedBooksData.map((book: Book) => (
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

      <div className="section--wrapper">
        <h3 className="section--title">Finished</h3>
        <span className="section--count section__sub-title">{finishedBooksData.length} items</span>
        <div className="section__books">
          {!loading
            ? finishedBooksData.map((book: Book) => (
                <RenderBook
                  key={book.id}
                  id={book.id}
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
