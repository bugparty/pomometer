import React from "react";
import { FormattedMessage } from "react-intl";

export const Introduce: React.FC = () => {
  return (
    <section className="section introduce">
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
