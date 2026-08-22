import { ImageResponse } from "next/og";

export const size = {
  width: 128,
  height: 128,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f17",
          borderRadius: 32,
          boxShadow: "inset 0 0 0 2px rgba(139,92,246,0.35)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="92"
          height="92"
          viewBox="0 0 64 64"
        >
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <path
            d="M20 16 L20 48 M20 31 L33 16 M33 31 L47 48"
            stroke="url(#g)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
