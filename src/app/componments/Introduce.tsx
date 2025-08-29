import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import "./common/Common.css";

export const Introduce: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const intl = useIntl();

  if (!isVisible) {
    return null;
  }

  return (
    <section className="section introduce m-4 relative">
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md bg-gray-100 p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        aria-label={intl.formatMessage({
          id: 'introduction.closeButton',
          defaultMessage: 'Close introduction'
        })}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      
      <article>
        <h2 className="h2">
          <FormattedMessage
            id="introduction.title"
            defaultMessage="Introduction of Pomodoro"
          />
        </h2>
        <br />
        <p>
          <FormattedMessage
            id="introduction.p1"
            defaultMessage="The Pomodoro Technique is a time management method that was founded in the 1980s by Francesco Cirillo."
          />
        </p>
        <p>
          <FormattedMessage
            id="introduction.p2"
            defaultMessage="The method uses a timer to segment a typical 25-minute working time and a short 5-minute break, while those periods are called pomodoros, with 4 pomodoros per break, for a long break of 15-30 minutes."
          />
        </p>
      </article>
    </section>
  );
};
