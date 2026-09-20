import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const BILLING_API_URL = 'http://localhost:4210';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface CheckoutResult {
  sessionId: string;
  planName: string;
  amount: number;
  interval: string;
  checkoutUrl: string;
  status: string;
}

const fallbackPlans: Plan[] = [
  { id: 'starter', name: 'Starter', price: 19, interval: 'month', features: ['1 workspace', 'Community support', '5k API calls / mo'] },
  { id: 'growth', name: 'Growth', price: 49, interval: 'month', features: ['5 workspaces', 'Priority support', '100k API calls / mo'] },
  { id: 'scale', name: 'Scale', price: 149, interval: 'month', features: ['Unlimited workspaces', 'Dedicated support', 'Unlimited API calls'] },
];

type CheckoutState = 'idle' | 'loading' | 'success' | 'error';

export function App() {
  const root = useRef<HTMLElement>(null);
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [plansSource, setPlansSource] = useState<'live' | 'sample'>('sample');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${BILLING_API_URL}/api/v1/plans`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((payload) => {
        if (!cancelled && Array.isArray(payload?.data) && payload.data.length > 0) {
          setPlans(payload.data);
          setPlansSource('live');
        }
      })
      .catch(() => {
        if (!cancelled) setPlansSource('sample');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useGSAP(
    () => {
      gsap.from('.hero-copy > *', { y: 42, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' });
      gsap.from('.plan-card', { y: 28, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out', delay: 0.2 });
    },
    { scope: root },
  );

  async function handleSubscribe(planId: string) {
    setActivePlanId(planId);
    setCheckoutState('loading');
    setCheckoutResult(null);

    try {
      const response = await fetch(`${BILLING_API_URL}/api/v1/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) throw new Error(`checkout-session ${response.status}`);

      const payload = await response.json();
      setCheckoutResult(payload.data);
      setCheckoutState('success');
    } catch {
      setCheckoutState('error');
    }
  }

  return (
    <main ref={root} className="page-shell">
      <nav className="nav-shell" aria-label="Checkout example navigation">
        <a href="#top" className="brand">TDK SaaS Starter</a>
        <div className="nav-links">
          <a href="#plans">Plans</a>
          <a href="#manifest">Manifest</a>
        </div>
        <a href="http://localhost:3200" className="nav-action">Open dashboard</a>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">billing stack · checkout-app</p>
          <h1>A payment button that actually calls an API.</h1>
          <p>Pick a plan below. Subscribe posts to billing-api's <code>/api/v1/checkout-session</code> and returns a mock session you can inspect.</p>
        </div>
      </section>

      <section id="plans" className="plans-section">
        <div className="plans-intro">
          <h2>Plans, served from billing-api.</h2>
          <p>{plansSource === 'live' ? 'Live plans pulled from the running billing-api resource.' : 'Sample plans shown until billing-api is running on :4210.'}</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const isActive = activePlanId === plan.id;
            const isLoading = isActive && checkoutState === 'loading';
            return (
              <article className={`plan-card${plan.id === 'growth' ? ' plan-card-featured' : ''}`} key={plan.id}>
                {plan.id === 'growth' && <span className="plan-badge">Most popular</span>}
                <h3>{plan.name}</h3>
                <p className="plan-price"><strong>${plan.price}</strong> / {plan.interval}</p>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="pay-button"
                  disabled={isLoading}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isLoading ? 'Starting checkout…' : `Subscribe to ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>

        <div className="checkout-panel" role="status" aria-live="polite">
          {checkoutState === 'idle' && (
            <p className="checkout-hint">Choose a plan to start a checkout session.</p>
          )}
          {checkoutState === 'error' && (
            <p className="checkout-error">Couldn't reach billing-api. Run <code>bun run dev</code> in services/billing/billing-api and try again.</p>
          )}
          {checkoutState === 'success' && checkoutResult && (
            <div className="checkout-success">
              <span className="checkout-success-badge">requires_payment_method</span>
              <h3>Checkout session created</h3>
              <dl>
                <div>
                  <dt>Session</dt>
                  <dd><code>{checkoutResult.sessionId}</code></dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{checkoutResult.planName} · ${checkoutResult.amount}/{checkoutResult.interval}</dd>
                </div>
                <div>
                  <dt>Checkout URL (mock)</dt>
                  <dd><code>{checkoutResult.checkoutUrl}</code></dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </section>

      <section id="manifest" className="manifest-section">
        <h2>Two resources, one billing stack.</h2>
        <div className="manifest-grid">
          <article className="manifest-card">
            <h3>billing-api</h3>
            <p>Hono / Bun backend on :4210. Serves plans, the current subscription, and issues checkout sessions.</p>
          </article>
          <article className="manifest-card">
            <h3>checkout-app</h3>
            <p>Vite / React frontend on :3210. Renders plans and wires the Subscribe button to billing-api.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
