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
          background: "#06060f",
          borderRadius: 24,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 32 32"
        >
          <defs>
            <linearGradient id="kGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M9 6 L9 26"
            stroke="url(#kGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M9 16 L21 6"
            stroke="url(#kGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M9 16 L22 26"
            stroke="url(#kGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="23" y="5" width="3" height="3" rx="0.5" fill="#06b6d4" opacity="0.9" />
          <rect x="25" y="9" width="2" height="2" rx="0.5" fill="#8b5cf6" opacity="0.7" />
          <rect x="24" y="3" width="2" height="2" rx="0.5" fill="#2563eb" opacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
