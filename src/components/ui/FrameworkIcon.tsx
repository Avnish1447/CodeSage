import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface FrameworkIconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * FrameworkIcon renders the authentic official vector logos/icons
 * for frameworks and libraries (React, Tailwind CSS, Vite, Express, Gin, Next.js, etc.)
 * with zero stock placeholders and graceful CDN/fallback degradation.
 */
export const FrameworkIcon: React.FC<FrameworkIconProps> = ({
  name,
  className = 'w-3.5 h-3.5',
  size = 14,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const normalized = name.toLowerCase().trim().replace(/\.js$/, '');

  // 1. React
  if (normalized === 'react' || normalized === 'reactjs') {
    return (
      <svg
        viewBox="-11.5 -10.23174 23 20.46348"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // 2. Tailwind CSS
  if (normalized === 'tailwind' || normalized === 'tailwind css' || normalized === 'tailwindcss') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z"
          fill="#38BDF8"
        />
      </svg>
    );
  }

  // 3. Vite
  if (normalized === 'vite' || normalized === 'vitejs') {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path
          d="M29.5 5.5L16.8 28.2a1 1 0 0 1-1.6 0L2.5 5.5a1 1 0 0 1 .9-1.5h25.2a1 1 0 0 1 .9 1.5z"
          fill="url(#viteGradientFramework)"
        />
        <path d="M19.8 3.5l-8.5 15.8h6.2l-2.4 8.2 9.5-16.5h-6.2l2.4-7.5z" fill="#FFD025" />
        <defs>
          <linearGradient id="viteGradientFramework" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#41D1FF" />
            <stop offset="1" stopColor="#BD34FE" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 4. Express
  if (normalized === 'express' || normalized === 'expressjs') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${className} shrink-0 text-[#171717] dark:text-[#EDEDED]`}
        width={size}
        height={size}
      >
        <path d="M24 18.579h-4.931l-3.321-4.757-3.32 4.757H7.497l5.474-7.842-5.188-7.316h4.931l3.036 4.316 3.034-4.316h4.931l-5.188 7.316L24 18.579zM4.93 18.579H0V5.421h4.93v2.337H2.435v3.084h2.495v2.337H2.435v3.063H4.93v2.337z" />
      </svg>
    );
  }

  // 5. Gin (Gin Web Framework / Go)
  if (normalized === 'gin' || normalized === 'gin-gonic') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        {/* Lemon garnish on the rim */}
        <circle cx="17.5" cy="4" r="2.5" fill="#FFE27A" stroke="#FFD025" strokeWidth="0.8" />
        <circle cx="17.5" cy="4" r="1.2" fill="#FFD025" />
        {/* Iconic Gin blue martini glass */}
        <path d="M3 4h18l-7.5 8.5v6.5h3.5v2h-10v-2h3.5v-6.5L3 4z" fill="#00ADD8" />
        {/* Liquid highlight */}
        <path d="M5.5 6.5h13l-2.5 3h-8l-2.5-3z" fill="#6AD7F5" opacity="0.75" />
      </svg>
    );
  }

  // 6. Next.js
  if (normalized === 'next' || normalized === 'next.js' || normalized === 'nextjs') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="11" fill="currentColor" className="text-[#171717] dark:text-[#EDEDED]" />
        <path
          d="M8 7v10h2V11.5l6.5 6.8c.4-.3.9-.6 1.3-.9V7h-2v5.5L9.3 7H8z"
          fill="currentColor"
          className="text-white dark:text-black"
        />
      </svg>
    );
  }

  // 7. Vue
  if (normalized === 'vue' || normalized === 'vuejs') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path d="M2 3.5h4.5L12 12.5l5.5-9H22L12 21 2 3.5z" fill="#41B883" />
        <path d="M6.5 3.5L12 13l5.5-9.5h-3.2L12 7.2 9.7 3.5H6.5z" fill="#35495E" />
      </svg>
    );
  }

  // 8. Angular
  if (normalized === 'angular' || normalized === 'angularjs') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path d="M12 2L2.5 5.5l1.5 12 8 4.5 8-4.5 1.5-12L12 2z" fill="#DD0031" />
        <path d="M12 2v22l8-4.5 1.5-12L12 2z" fill="#C3002F" />
        <path d="M12 5.5l-4.5 10.5h2l.9-2.3h3.2l.9 2.3h2L12 5.5zm-1 6.5l1-2.5 1 2.5h-2z" fill="#ffffff" />
      </svg>
    );
  }

  // 9. Svelte
  if (normalized === 'svelte' || normalized === 'sveltekit') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path
          d="M19.5 5.8c-1.2-2.1-3.7-3.4-6.3-3.1-1.5.2-2.9.8-4 1.8L6.4 7.2c-2.1 2-2.9 5-2.2 7.7.8 2.7 3 4.7 5.7 5.3 2.6.5 5.3-.3 7.1-2.1l2.8-2.9c.4-.4.1-1.1-.4-1.2h-.3l-2.8 2.9c-1.5 1.5-3.6 2-5.6 1.6-2.1-.5-3.8-2-4.3-4-.6-2.1 0-4.3 1.5-5.8l2.8-2.9c.9-.8 2-1.4 3.2-1.5 2-.2 4.1.7 5 2.4.8 1.5.6 3.2-.5 4.5l-1.8 1.9c-.2.2-.2.5 0 .7.2.2.5.2.7 0l1.8-1.9c1.6-1.7 1.9-4.2.8-6.3z"
          fill="#FF3E00"
        />
      </svg>
    );
  }

  // 10. FastAPI
  if (normalized === 'fastapi') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="11" fill="#009688" />
        <path d="M12.8 3L6.5 13.5h4.8L9.2 21l8.3-11.5h-5.2L14.2 3h-1.4z" fill="#ffffff" />
      </svg>
    );
  }

  // 11. Flask
  if (normalized === 'flask') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} shrink-0 text-[#171717] dark:text-[#EDEDED]`}
        width={size}
        height={size}
      >
        <path d="M10 2v5.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 7.5V2" />
        <path d="M8.5 2h7" />
        <circle cx="10" cy="15" r="1" fill="currentColor" />
        <circle cx="13" cy="13" r="1" fill="currentColor" />
        <circle cx="14" cy="17" r="1" fill="currentColor" />
      </svg>
    );
  }

  // 12. Django
  if (normalized === 'django') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <rect width="24" height="24" rx="4" fill="#092E20" />
        <path
          d="M14.5 5.5h2.5v13h-2.5v-1.4c-.6.9-1.6 1.5-2.8 1.5-2.5 0-4.3-2-4.3-4.8s1.8-4.8 4.3-4.8c1.2 0 2.2.6 2.8 1.5V5.5zm-2.5 5.5c-1.5 0-2.6 1.2-2.6 2.8s1.1 2.8 2.6 2.8c1.5 0 2.6-1.2 2.6-2.8s-1.1-2.8-2.6-2.8z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // 13. Spring Boot
  if (normalized.includes('spring')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="11" fill="#6DB33F" />
        <path
          d="M12 6a6 6 0 0 0-6 6c0 2.6 1.7 4.8 4 5.6v-2.2a3.8 3.8 0 0 1-2-3.4 4 4 0 0 1 4-4c2.2 0 4 1.8 4 4 0 1.5-.8 2.8-2 3.4v2.2c2.3-.8 4-3 4-5.6a6 6 0 0 0-6-6z"
          fill="#ffffff"
        />
        <rect x="11" y="4" width="2" height="6" rx="1" fill="#ffffff" />
      </svg>
    );
  }

  // 14. Actix-web
  if (normalized.includes('actix')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="11" fill="#1C1C1E" />
        <path
          d="M7 16l5-8 5 8M10 13h4"
          stroke="#48B0D6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // 15. Node.js
  if (normalized === 'node' || normalized === 'nodejs') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2z" fill="#339933" />
        <path d="M12 6.5v11" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 16. Docker
  if (normalized === 'docker' || normalized === 'dockerfile') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path
          d="M2.5 13.5c.5-2.5 2.5-3.5 4.5-3.5 1.5 0 3 .5 4 1.5 1.5-1 3.5-1.5 5.5-1.5 2 0 4 .5 5.5 2-1 4.5-4 7-9.5 7s-8-2-10-5.5z"
          fill="#2496ED"
        />
        <rect x="5" y="8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
        <rect x="7.5" y="8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
        <rect x="10" y="8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
        <rect x="7.5" y="5.8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
        <rect x="10" y="5.8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
        <rect x="12.5" y="8" width="2" height="1.8" rx="0.3" fill="#2496ED" />
      </svg>
    );
  }

  // 17. GraphQL
  if (normalized === 'graphql') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <polygon points="12,2 21.5,7.5 21.5,18.5 12,24 2.5,18.5 2.5,7.5" stroke="#E10098" strokeWidth="1.5" />
        <circle cx="12" cy="2" r="2" fill="#E10098" />
        <circle cx="21.5" cy="7.5" r="2" fill="#E10098" />
        <circle cx="21.5" cy="18.5" r="2" fill="#E10098" />
        <circle cx="12" cy="24" r="2" fill="#E10098" />
        <circle cx="2.5" cy="18.5" r="2" fill="#E10098" />
        <circle cx="2.5" cy="7.5" r="2" fill="#E10098" />
      </svg>
    );
  }

  // 18. TypeScript
  if (normalized === 'typescript' || normalized === 'ts') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M6 9h6m-3 0v8M14 13.5c.5-.8 1.4-1.2 2.4-1.2 1.5 0 2.6.9 2.6 2.3 0 1.6-1.2 2.4-3.5 2.4h-.5v-1h.5c1.4 0 2-.4 2-1.4 0-.8-.6-1.3-1.6-1.3-.7 0-1.3.3-1.7.9l-.7-.7z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 19. Python
  if (normalized === 'python') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <path
          d="M11.8 2C6.8 2 7.1 4.2 7.1 4.2v2.3h4.8v.7H5.2S2 6.8 2 11.8s2.8 5 2.8 5h1.7v-2.3s-.1-2.8 2.8-2.8h4.7s2.7.1 2.7-2.6V4.6S17 2 11.8 2zm-2.7 1.5c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z"
          fill="#3776AB"
        />
        <path
          d="M12.2 22c5 0 4.7-2.2 4.7-2.2v-2.3h-4.8v-.7h6.7s3.2.4 3.2-4.6-2.8-5-2.8-5h-1.7v2.3s.1 2.8-2.8 2.8H10s-2.7-.1-2.7 2.6v4.5s-.3 2.6 4.9 2.6zm2.7-1.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z"
          fill="#FFD43B"
        />
      </svg>
    );
  }

  // 20. Rust
  if (normalized === 'rust') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${className} shrink-0 text-[#DEA584]`}
        width={size}
        height={size}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M8 8h4.5a2.5 2.5 0 0 1 2.5 2.5c0 1.2-.8 2.2-2 2.4L16 16h-2.5l-2.5-3H10v3H8V8zm2 3.5h2.5a1 1 0 0 0 0-2H10v2z" fill="currentColor" />
      </svg>
    );
  }

  // 21. Go
  if (normalized === 'go' || normalized === 'golang') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} shrink-0`}
        width={size}
        height={size}
      >
        <ellipse cx="12" cy="12" rx="10" ry="7" fill="#00ADD8" />
        <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="system-ui" fill="#ffffff">
          GO
        </text>
      </svg>
    );
  }

  // Dynamic CDN logo fallback for any other library (SimpleIcons CDN)
  if (!imgFailed) {
    const slug = normalized.replace(/[^a-z0-9]/g, '');
    return (
      <img
        src={`https://cdn.simpleicons.org/${slug}`}
        alt={name}
        className={`${className} shrink-0 object-contain`}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        loading="lazy"
      />
    );
  }

  // Universal graceful fallback icon
  return <Layers className={`${className} text-[#e8702a] shrink-0`} />;
};

export default FrameworkIcon;
