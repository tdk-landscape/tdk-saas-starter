import { Hono } from 'hono';

const app = new Hono();

app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
    c.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (c.req.method === 'OPTIONS') {
        return c.body(null, 204);
    }
    await next();
});

const plans = [
    { id: 'starter', name: 'Starter', price: 19, interval: 'month', features: ['1 workspace', 'Community support', '5k API calls / mo'] },
    { id: 'growth', name: 'Growth', price: 49, interval: 'month', features: ['5 workspaces', 'Priority support', '100k API calls / mo'] },
    { id: 'scale', name: 'Scale', price: 149, interval: 'month', features: ['Unlimited workspaces', 'Dedicated support', 'Unlimited API calls'] },
];

const subscription = { plan: 'growth', status: 'active', renewsOn: '2026-10-14' };

const sessions = new Map<string, { planId: string; status: string }>();

app.get('/health', (c) => c.json({ status: 'ok', service: 'billing-api', timestamp: new Date().toISOString() }));

app.get('/api/billing-management', (c) => c.json({
    data: {
        service: 'billing-management',
        generatedAt: new Date().toISOString(),
        plans,
        subscription,
    },
}));

app.get('/api/v1/plans', (c) => {
    return c.json({ data: plans, total: plans.length });
});

app.get('/api/v1/subscription', (c) => {
    return c.json({ data: subscription });
});

app.post('/api/v1/checkout-session', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const planId = typeof body.planId === 'string' ? body.planId : 'growth';
    const plan = plans.find((candidate) => candidate.id === planId) ?? plans[1];
    const sessionId = `cs_test_${Math.random().toString(36).slice(2, 12)}`;

    sessions.set(sessionId, { planId: plan.id, status: 'requires_payment_method' });

    return c.json({
        data: {
            sessionId,
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            interval: plan.interval,
            checkoutUrl: `https://billing.tdk-saas-starter.localhost/checkout/${sessionId}`,
            status: 'requires_payment_method',
        },
    });
});

export default {
    port: 4210,
    fetch: app.fetch,
};
