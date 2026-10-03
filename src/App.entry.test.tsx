// @vitest-environment jsdom
import { StrictMode, act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import App from './App';
import { JourneyProvider } from './journey/JourneyContext';

it('loads the real journey after language choice and safely revisits the lightweight entry', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  window.localStorage.clear();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => {
      root.render(
        <StrictMode>
          <JourneyProvider>
            <App />
          </JourneyProvider>
        </StrictMode>,
      );
    });
    expect(
      container.querySelector('.app-shell')?.getAttribute('data-step'),
    ).toBe('LanguageSelect');
    const english = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'English',
    )!;
    await act(async () => {
      english.click();
      await import('./JourneyExperience');
    });
    expect(
      container.querySelector('.app-shell')?.getAttribute('data-step'),
    ).toBe('Intro');
    const back = [...container.querySelectorAll('button')].find(
      (button) => button.textContent === 'Back',
    )!;
    await act(async () => {
      back.click();
    });
    expect(
      container.querySelector('.app-shell')?.getAttribute('data-step'),
    ).toBe('LanguageSelect');
    expect(window.localStorage.getItem('learning.language')).toBe('en');
    expect(container.querySelector('h1')?.textContent).toBe(
      'Learn with virtual money',
    );
  } finally {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  }
});
