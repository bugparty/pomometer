'use client';

import React from "react";
import Link from "next/link";
import { FormattedMessage } from "react-intl";
import "../componments/common/Common.css";

export default function PrivacyPolicyPage() {
  return (
    <div className="App min-h-screen">
      <div className="AppWrapper min-h-full flex flex-col">
        <main className="flex-1 p-4">
          <section className="introduce">
            <article>
              <h2>
                <FormattedMessage id="privacy.title" defaultMessage="Privacy Policy" />
              </h2>
              <p>
                <FormattedMessage
                  id="privacy.lastUpdated"
                  defaultMessage="Last updated: {date}"
                  values={{ date: new Date().toISOString().slice(0, 10) }}
                />
              </p>

              <p>
                <FormattedMessage
                  id="privacy.intro"
                  defaultMessage="We value your privacy. This policy explains what data we collect and how we use it."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="privacy.dataWeCollect.title" defaultMessage="Data We Collect" />
              </h3>
              <ul className="list-disc pl-6">
                <li>
                  <FormattedMessage
                    id="privacy.dataWeCollect.todos"
                    defaultMessage="Todo items and related metadata stored to provide core functionality."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="privacy.dataWeCollect.google"
                    defaultMessage="Google account information and tokens when you opt in to Google login or Tasks sync."
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="privacy.dataWeCollect.analytics"
                    defaultMessage="Anonymous usage analytics to improve the product."
                  />
                </li>
              </ul>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="privacy.howWeUse.title" defaultMessage="How We Use Data" />
              </h3>
              <p>
                <FormattedMessage
                  id="privacy.howWeUse.desc"
                  defaultMessage="Your data is used to provide syncing, authentication, and app functionality. We do not sell your data."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="privacy.storage.title" defaultMessage="Storage and Security" />
              </h3>
              <p>
                <FormattedMessage
                  id="privacy.storage.desc"
                  defaultMessage="Data is stored using Cloudflare D1 and protected with industry best practices."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="privacy.rights.title" defaultMessage="Your Rights" />
              </h3>
              <p>
                <FormattedMessage
                  id="privacy.rights.desc"
                  defaultMessage="You can request deletion of your account and associated data at any time."
                />
              </p>

              <h3 className="mt-4 font-bold">
                <FormattedMessage id="privacy.contact.title" defaultMessage="Contact Us" />
              </h3>
              <p>
                <FormattedMessage
                  id="privacy.contact.desc"
                  defaultMessage="If you have any questions about this privacy policy or wish to exercise your rights, please contact us at: "
                />
                <a href="mailto:privacy@pomometer.com" className="text-blue-600 hover:text-blue-800 underline">
                  privacy@pomometer.com
                </a>
              </p>

              <p className="mt-4">
                <Link href="/">
                  <span className="text-blue-600">
                    <FormattedMessage id="privacy.backHome" defaultMessage="Back to Home" />
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


