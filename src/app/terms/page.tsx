'use client';

import React from "react";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import "../componments/common/Common.css";

export default function TermsPage() {
  return (
    <div className="App min-h-screen">
      <div className="AppWrapper min-h-full flex flex-col">
        <main className="flex-1 p-4">
          <section className="introduce">
            <article>
              <h2>
                <FormattedMessage id="terms.title" defaultMessage="Terms of Service" />
              </h2>
              <p>
                <FormattedMessage
                  id="terms.lastUpdated"
                  defaultMessage="Last updated: {date}"
                  values={{ date: new Date().toISOString().slice(0, 10) }}
                />
              </p>

              <p>
                <FormattedMessage
                  id="terms.intro"
                  defaultMessage="By using AA Pomodoro, you agree to the following terms and conditions."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="terms.acceptance.title" defaultMessage="Acceptance of Terms" />
              </h3>
              <p>
                <FormattedMessage
                  id="terms.acceptance.desc"
                  defaultMessage="Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="terms.userResponsibilities.title" defaultMessage="User Responsibilities" />
              </h3>
              <ul className="list-disc pl-6">
                <li>
                  <FormattedMessage id="terms.userResponsibilities.item1" defaultMessage="Use the Service in compliance with applicable laws." />
                </li>
                <li>
                  <FormattedMessage id="terms.userResponsibilities.item2" defaultMessage="Do not abuse, disrupt, or attempt to compromise the Service." />
                </li>
                <li>
                  <FormattedMessage id="terms.userResponsibilities.item3" defaultMessage="Safeguard your account credentials and tokens." />
                </li>
              </ul>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="terms.limitations.title" defaultMessage="Limitations of Liability" />
              </h3>
              <p>
                <FormattedMessage
                  id="terms.limitations.desc"
                  defaultMessage='The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect or consequential damages.'
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="terms.changes.title" defaultMessage="Changes to Terms" />
              </h3>
              <p>
                <FormattedMessage
                  id="terms.changes.desc"
                  defaultMessage="We may update these Terms from time to time. Continued use of the Service after changes become effective constitutes acceptance of the revised Terms."
                />
              </p>

              <p className="mt-4">
                <Link href="/">
                  <span className="text-blue-600">
                    <FormattedMessage id="terms.backHome" defaultMessage="Back to Home" />
                  </span>
                </Link>
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}


