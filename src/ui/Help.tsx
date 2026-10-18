import { useState } from 'react';
import { dismiss, isDismissed, isInstalled } from './devicePrefs';

const REPO = 'https://github.com/jintae412/eq-helper';

const ShareIcon = () => (
  <svg className="inline-icon" viewBox="0 0 24 24" aria-label="Share button" role="img">
    <path d="M12 3v12M7 8l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11v9h14v-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const AddIcon = () => (
  <svg className="inline-icon" viewBox="0 0 24 24" aria-label="Add to Home Screen" role="img">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function InstallSteps() {
  return (
    <>
      <p><strong>iPhone (Safari):</strong></p>
      <ol>
        <li>Tap the Share button <ShareIcon /> at the bottom of the screen.</li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong> <AddIcon />.</li>
        <li>Tap <strong>Add</strong>, then open <strong>EQ Helper</strong> from your home screen.</li>
      </ol>
      <p><strong>Mac:</strong> in Safari, choose File → Add to Dock. In Chrome, click the install icon at the right of the address bar.</p>
      <p className="muted">Once installed it works with no internet. Open it once on Wi-Fi after each update.</p>
    </>
  );
}

/** Shown when the app is opened in a browser tab instead of from the home screen. */
export function InstallCard() {
  const [hidden, setHidden] = useState(() => isInstalled() || isDismissed('install-card'));
  if (hidden) return null;
  return (
    <div className="card">
      <h2>Install EQ Helper</h2>
      <p>Put it on your home screen so it opens like an app and works without internet.</p>
      <InstallSteps />
      <button className="quiet" onClick={() => { dismiss('install-card'); setHidden(true); }}>Got it</button>
    </div>
  );
}

/** First-launch orientation. */
export function StartHere({ onGoToSetup }: { onGoToSetup: () => void }) {
  const [hidden, setHidden] = useState(() => isDismissed('start-here'));
  if (hidden) return null;
  return (
    <div className="card">
      <h2>Start here</h2>
      <ol>
        <li>
          <strong>Set up your mixer</strong> (2 minutes): tell the app which knobs your board has, so advice matches it.{' '}
          <button className="link" onClick={onGoToSetup}>Go to Setup</button>
        </li>
        <li>
          <strong>Add your band</strong> (optional): names and instruments, so advice can say "Sarah" instead of "a vocal."{' '}
          <button className="link" onClick={onGoToSetup}>Go to Setup</button>
        </li>
        <li>
          <strong>Before the service:</strong> Listen → Guided check, one person at a time. <strong>During:</strong> Listen →
          Full mix. <strong>Anytime:</strong> the Ask tab.
        </li>
      </ol>
      <button className="quiet" onClick={() => { dismiss('start-here'); setHidden(true); }}>Got it, hide this</button>
    </div>
  );
}

const ISSUE_TEMPLATE = `**What I was doing:**


**What the app showed:**


**What I expected, or what it actually sounded like:**


---
App version: v${__APP_VERSION__}
Device: (iPhone / Mac)`;

const issueUrl = () =>
  `${REPO}/issues/new?title=${encodeURIComponent('Feedback: ')}&body=${encodeURIComponent(ISSUE_TEMPLATE)}`;

/** Setup → Help: install, how to use, and how to report problems. */
export function HelpSection() {
  return (
    <>
      <h2>Help</h2>
      <details>
        <summary>How to install</summary>
        <InstallSteps />
      </details>
      <details>
        <summary>How to use it</summary>
        <ol>
          <li><strong>Once:</strong> Setup → set up your mixer and speakers; add your band and the room if you like.</li>
          <li><strong>Soundcheck:</strong> Listen → Guided check. One person at a time, every other fader down. Optional ring-out at the end if you use wedges.</li>
          <li><strong>During the service:</strong> Listen → Full mix. Switch to Speech for the sermon. Red banner = feedback; follow its first step right away.</li>
          <li><strong>Anytime:</strong> Ask tab. Pick who sounds off and how.</li>
        </ol>
        <p className="muted">Keep the phone at the board. Your audio never leaves the phone.</p>
      </details>
      <details>
        <summary>Report a problem or idea</summary>
        <p><strong>Easiest:</strong> text or tell the person who shared this app with you. Say what you were doing, what the app showed, and what it actually sounded like.</p>
        <p><strong>Or post it on GitHub</strong> (free account needed):</p>
        <ol>
          <li>First time only: create a free account at <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer">github.com/signup</a>.</li>
          <li>Tap <strong>Open a new issue</strong> below. It opens a form with questions already filled in.</li>
          <li>Finish the title (e.g. "Feedback: banner didn't show for whistling mic").</li>
          <li>Answer the questions in the description. The app version is already included.</li>
          <li>Tap <strong>Submit new issue</strong>.</li>
        </ol>
        <p className="note">GitHub issues are public. Don't include phone numbers, emails, or other personal info.</p>
        <a className="button-link" href={issueUrl()} target="_blank" rel="noopener noreferrer">Open a new issue on GitHub</a>
      </details>
      <p className="muted">EQ Helper v{__APP_VERSION__}</p>
    </>
  );
}
