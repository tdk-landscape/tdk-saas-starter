import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DASHBOARD_API_URL = 'http://localhost:4200';

interface Metrics {
  mrr: number;
  mrrGrowth: number;
  activeAccounts: number;
  trialAccounts: number;
  churnRate: number;
}

const fallbackMetrics: Metrics = {
  mrr: 48260,
  mrrGrowth: 6.4,
  activeAccounts: 527,
  trialAccounts: 39,
  churnRate: 1.8,
};

const images = [
  'https://picsum.photos/seed/saas-dashboard-view/1200/900',
  'https://picsum.photos/seed/saas-team-workspace/1200/900',
  'https://picsum.photos/seed/saas-billing-console/1200/900',
];

export function App() {
  const root = useRef<HTMLElement>(null);
  const pinTitle = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics>(fallbackMetrics);
  const [metricsSource, setMetricsSource] = useState<'live' | 'sample'>('sample');

  useEffect(() => {
    let cancelled = false;

    fetch(`${DASHBOARD_API_URL}/api/v1/metrics`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((payload) => {
        if (!cancelled && payload?.data) {
          setMetrics(payload.data);
          setMetricsSource('live');
        }
      })
      .catch(() => {
        if (!cancelled) setMetricsSource('sample');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useGSAP(
    () => {
      gsap.from('.hero-copy > *', { y: 42, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' });
      gsap.from('.metric-card', { y: 24, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power2.out', delay: 0.2 });

      ScrollTrigger.create({
        trigger: '.service-board',
        start: 'top top+=120',
        end: 'bottom bottom-=180',
        pin: pinTitle.current,
        pinSpacing: false,
      });

      gsap.utils.toArray<HTMLElement>('.motion-image').forEach((image) => {
        gsap.fromTo(
          image,
          { scale: 0.82, opacity: 0.52, filter: 'grayscale(1) contrast(1.2)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'grayscale(0.15) contrast(1.1)',
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <main ref={root} className="page-shell">
      <nav className="nav-shell" aria-label="SaaS starter navigation">
        <a href="#top" className="brand">TDK SaaS Starter</a>
        <div className="nav-links">
          <a href="#metrics">Dashboard</a>
          <a href="#app">App</a>
          <a href="#billing">Billing</a>
        </div>
        <a href="http://localhost:3210" className="nav-action">Open checkout</a>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-art" style={{ backgroundImage: `url(${images[0]})` }} />
        <div className="hero-copy">
          <h1>Ship a SaaS dashboard and billing flow from one clone.</h1>
          <p>Account metrics, usage activity, pricing plans, and a working checkout button become small resources with explicit manifests.</p>
          <div className="hero-actions">
            <a href="#metrics" className="button button-light">View live metrics</a>
            <a href="#app" className="button button-dark">Inspect resources</a>
          </div>
        </div>
      </section>

      <section id="metrics" className="metrics-section">
        <div className="metrics-intro">
          <h2>Account health, straight from dashboard-api.</h2>
          <p>
            {metricsSource === 'live'
              ? 'Live numbers pulled from the running dashboard-api resource.'
              : 'Sample numbers shown until dashboard-api is running on :4200.'}
          </p>
        </div>
        <div className="metrics-grid">
          <article className="metric-card">
            <span className="metric-label">MRR</span>
            <strong className="metric-value">${metrics.mrr.toLocaleString()}</strong>
            <span className="metric-delta metric-delta-up">+{metrics.mrrGrowth}% MoM</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Active accounts</span>
            <strong className="metric-value">{metrics.activeAccounts.toLocaleString()}</strong>
            <span className="metric-delta">across Starter, Growth, Scale</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Trialing</span>
            <strong className="metric-value">{metrics.trialAccounts}</strong>
            <span className="metric-delta">14-day trials in flight</span>
          </article>
          <article className="metric-card">
            <span className="metric-label">Churn</span>
            <strong className="metric-value">{metrics.churnRate}%</strong>
            <span className="metric-delta metric-delta-down">last 30 days</span>
          </article>
        </div>
      </section>

      <section id="app" className="bento-section">
        <div className="bento-intro">
          <h2>One workspace, four runnable resources.</h2>
          <p>Each card maps to a manifest-driven resource that TDK can discover, generate, and run independently.</p>
        </div>
        <div className="bento-grid">
          <article className="bento-card bento-large group-card">
            <div className="card-image" style={{ backgroundImage: `url(${images[1]})` }} />
            <h3>App stack</h3>
            <p>Dashboard API and dashboard app coordinate account metrics, usage activity, and workspace state.</p>
          </article>
          <article className="bento-card group-card">
            <h3>Billing stack</h3>
            <p>Billing API and checkout app handle pricing plans and a working payment button.</p>
          </article>
          <article className="bento-card group-card">
            <h3>PSR manifests</h3>
            <p>Every resource declares its own <code>service.json</code>: type, stack, port, and dependencies.</p>
          </article>
        </div>
      </section>

      <section id="billing" className="service-board">
        <div ref={pinTitle} className="pinned-title">
          <h2>The checkout button actually works.</h2>
          <p>Scroll through the operating surfaces while the core story stays pinned in view.</p>
        </div>
        <div className="service-lane">
          {['Live dashboard metrics', 'Pricing plans API', 'Mock checkout session'].map((title, index) => (
            <article className="service-panel" key={title}>
              <div className="motion-image" style={{ backgroundImage: `url(${images[index]})` }} />
              <h3>{title}</h3>
              <p>
                {[
                  'dashboard-app fetches MRR, growth, and churn straight from dashboard-api on every load.',
                  'billing-api exposes plans, features, and pricing that checkout-app renders as cards.',
                  'Clicking Subscribe posts to /api/v1/checkout-session and returns a mock session id and URL.',
                ][index]}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="accordion-section">
        <h2>SaaS domains expand only when needed.</h2>
        <div className="accordion-row">
          {['App', 'Billing'].map((domain) => (
            <article className="accordion-card" key={domain}>
              <span>{domain}</span>
              <p>{domain === 'App' ? 'Dashboard metrics and activity' : 'Plans, subscriptions, and checkout'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="marquee" aria-hidden="true">
          <span>service.json</span><span>tdk up app</span><span>Hono</span><span>Vite</span><span>Bun</span><span>Tilt</span>
        </div>
        <h2>Clone it before your next launch.</h2>
        <a href="https://github.com/tdk-landscape/tdk-cli" className="button button-light">Install TDK CLI</a>
      </section>
    </main>
  );
}
