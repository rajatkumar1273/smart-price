"use client"; // Error components must be Client Components

import { useEffect } from "react";
import "@/stylesheets/error.css";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div id="colorlib-notfound">
      <div className="colorlib-notfound">
        <div className="colorlib-notfound-404">
          <h1 className="colorlib-heading">500</h1>
        </div>
        <h2
          id="colorlib_404_customizer_page_heading"
          className="colorlib-heading"
        >
          OOPS! There was an internal server error
        </h2>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => {
              router.push("/");
              router.refresh();
            }
          }
          className="btn btn-primary btn-lg"
        >
          Go Back To Home
        </button>
      </div>
    </div>
  );
}
