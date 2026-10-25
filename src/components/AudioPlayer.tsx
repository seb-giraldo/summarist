import { MdForward10, MdOutlinePauseCircle, MdOutlinePlayCircle, MdReplay10 } from "react-icons/md";
import type { Book } from "../types/book";
import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SkeletonWrapper } from "react-skeletonify";
import { addFinishedBook } from "../functions/HandleFirebaseDb";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export default function AudioPlayer() {
  const { bookId } = useParams();
  const [book, setBook] = useState({} as Book);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.uid);

  //Add green indicator of tiume elapsed within slider
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";
    const seconds = `${Math.floor(time % 60)}`.padStart(2, "0");
    const minutes = `${Math.floor(time / 60)}`.padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleAudioEnded = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    if (!bookId) return;
    if (event.type === "ended") addFinishedBook(userId, bookId);
  };

  // Update currentTime as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateCurrentTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [book.audioLink]);

  // Seek when user drags/clicks the progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<Book>(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${bookId}`,
        );
        setBook(data);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  return (
    <>
      <div className="audio__wrapper">
        <audio src={book.audioLink} ref={audioRef} onEnded={handleAudioEnded}></audio>

        <SkeletonWrapper loading={loading}>
          <div className="audio__track--wrapper">
            <figure className="audio__track--image-mask">
              <figure className="book__image--wrapper">
                <img className="book__image" src={book.imageLink} alt="book"></img>
              </figure>
            </figure>

            <div className="audio__track--details-wrapper">
              <div className="audio__track--title">{book.title}</div>
              <div className="audio__track--author">{book.author}</div>
            </div>
          </div>
        </SkeletonWrapper>

        <div className="audio__controls--wrapper">
          <div className="audio__controls">
            <button className="audio__controls--btn" onClick={handleRewind}>
              <MdReplay10 />
            </button>
            <button className="audio__controls--btn audio__controls--btn-play" onClick={togglePlay}>
              {isPlaying ? <MdOutlinePauseCircle /> : <MdOutlinePlayCircle />}
            </button>
            <button className="audio__controls--btn" onClick={handleForward}>
              <MdForward10 />
            </button>
          </div>
        </div>

        <div className="audio__progress--wrapper">
          <div className="audio__time">{handleTime(currentTime)}</div>
          <input
            type="range"
            className="audio__progress--bar"
            value={currentTime}
            min={0}
            max={duration || 0}
            step="0.01"
            onChange={handleSeek}
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${progressPercent}%, #d1d5db ${progressPercent}%, #d1d5db 100%)`,
            }}
          />
          <div className="audio__time">{handleTime(duration)}</div>
        </div>
      </div>
    </>
  );
}
