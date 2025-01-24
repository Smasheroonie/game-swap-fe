import { useEffect, useState, useRef } from "react";
import { Game } from "@/rawgApi";
import { Link, useNavigate } from "react-router-dom";
import { GameListItem } from "@/types/GameListItem";
import { updateWishlist } from "@/services/wishlistServices";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SmallCarousel(props: {
  games: Game[];
  carouselTitle?: string;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [visibleGames, setVisibleGames] = useState(2);
  const navigate = useNavigate();
  const [scrollAmount, setScrollAmount] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleGames(2);
        setScrollAmount(1);
      } else if (width < 768) {
        setVisibleGames(3);
        setScrollAmount(2);
      } else if (width < 1024) {
        setVisibleGames(4);
        setScrollAmount(3);
      } else {
        setVisibleGames(5 + Math.floor((width - 1024) / 250));
        setScrollAmount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scrolling
  const scrollLeft = () => {
    if (carouselRef.current) {
      const elementWidth = carouselRef.current.offsetWidth / visibleGames;
      carouselRef.current.scrollBy({
        left: -elementWidth * scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      const elementWidth = carouselRef.current.offsetWidth / visibleGames;
      carouselRef.current.scrollBy({
        left: elementWidth * scrollAmount,
        behavior: "smooth",
      });
    }
  };
  async function handleAddToWishlist(game: GameListItem) {
    if (user) {
      const newWishlistItem = {
        gameName: game.name,
        slug: game.slug,
        backgroundImg: game.background_image,
        releaseDate: game.released,
      };
      await updateWishlist(user.uid, newWishlistItem);
    }
  }
  return (
    <section className="flex flex-col my-6 items-center">
      <h2 className="text-center text-xl mb-2">{props.carouselTitle}</h2>

      {/* Compact Carousel Component */}
      <div className="relative items-center overflow-hidden px-4 bg-white dark:bg-zinc-950 dark:outline dark:outline-1 dark:outline-zinc-700 py-4 rounded-lg w-11/12 place-self-center">
        {/* Left Scroll Button */}
        <button
          onClick={scrollLeft}
          className="bg-white absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10 transition-all duration-300 transform hover:scale-110"
          title="Scroll Left"
        >
          <ArrowLeft className="size-4 opacity-0 hover:opacity-100 transition-all" />
        </button>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex overflow-x-scroll no-scrollbar gap-3 scroll-smooth relative p-2 "
        >
          {props.games.map((game, index) => (
            <div
              key={game.id}
              className={`flex-shrink-0 rounded-lg bg-white shadow-lg relative overflow-hidden transition-transform transform hover:scale-105 duration-500 ease-in-out dark:bg-zinc-950 dark:outline dark:outline-1 dark:outline-zinc-700 ${
                index % 2 === 0
                  ? "animate-fade-in-left"
                  : "animate-fade-in-right"
              }`}
              style={{
                width: `${90 / visibleGames}%`,
                flex: "0 0 auto",
              }}
            >
              <Link to={`/game/${game.slug}`} className="block relative">
                {/* Image with Overlay */}
                <div className="relative w-full h-40 overflow-hidden">
                  {/* Reduced height */}
                  <img
                    src={game.background_image}
                    alt={game.name}
                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
                </div>
              </Link>

              {/* Game Info */}
              <div className="p-2 text-center">
                <p className="text-l font-medium text-gray-800 truncate dark:text-white">
                  {game.name}
                </p>

                {/* Wishlist Button */}
                <button
                  className="black-btn mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-white shadow-md transition-all duration-300 transform text-[13px]"
                  onClick={() => handleAddToWishlist(game)}
                >
                  <span>Wishlist</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10 transition-all duration-300 transform hover:scale-110"
          title="Scroll Right"
        >
          <ArrowRight className="size-4 opacity-0 hover:opacity-100 transition-all" />
        </button>
      </div>
    </section>
  );
}
