import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../../contexts/AppContext';
import { useTranslation } from '../useTranslation';

const TestComponent = ({ language }: { language: 'en' | 'bn' }) => {
  const { setLanguage } = useApp();
  const t = useTranslation();

  React.useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return (
    <div>
      <div data-testid="home-title">{t.home.title}</div>
      <div data-testid="common-loading">{t.common.loading}</div>
      <div data-testid="common-currency">{t.common.currency}</div>
    </div>
  );
};

describe('useTranslation', () => {
  it('should return English translations by default', () => {
    render(
      <AppProvider>
        <TestComponent language="en" />
      </AppProvider>
    );

    expect(screen.getByTestId('home-title')).toHaveTextContent('Order for Pickup');
    expect(screen.getByTestId('common-loading')).toHaveTextContent('Loading...');
    expect(screen.getByTestId('common-currency')).toHaveTextContent('৳');
  });

  it('should return Bengali translations when language is set to bn', () => {
    render(
      <AppProvider>
        <TestComponent language="bn" />
      </AppProvider>
    );

    expect(screen.getByTestId('home-title')).toHaveTextContent('পিকআপের জন্য অর্ডার করুন');
    expect(screen.getByTestId('common-loading')).toHaveTextContent('লোড হচ্ছে...');
    expect(screen.getByTestId('common-currency')).toHaveTextContent('৳');
  });

  it('should update translations when language changes', () => {
    const { rerender } = render(
      <AppProvider>
        <TestComponent language="en" />
      </AppProvider>
    );

    expect(screen.getByTestId('home-title')).toHaveTextContent('Order for Pickup');

    rerender(
      <AppProvider>
        <TestComponent language="bn" />
      </AppProvider>
    );

    expect(screen.getByTestId('home-title')).toHaveTextContent('পিকআপের জন্য অর্ডার করুন');
  });
});

